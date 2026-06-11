import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api/v1';

// We need a helper to generate the API key like we do in auth/keys.ts
function generateApiKey(prefix: 'sk_live_' | 'sk_test_') {
  const bytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `gseo_${prefix.includes('test') ? 'test' : 'live'}_${bytes}`;
  
  // Hash it using simple SHA-256 as in keys.ts
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    
  return { rawKey, hashedKey };
}

async function runTests() {
  console.log('--- Phase 0 Handoff Tests ---');
  
  // 1. Create Dev Tenant and API Key
  console.log('\n[1] Creating Dev Tenant and API Key...');
  const tenantId = 'tenant_test_' + Date.now();
  
  const tenant = await prisma.tenant.create({
    data: {
      id: tenantId,
      name: 'Test Tenant',
      slug: 'test-tenant-' + Date.now(),
      plan: 'free'
    }
  });
  
  const { rawKey, hashedKey } = generateApiKey('sk_test_');
  
  await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      name: 'Test Key',
      keyPrefix: rawKey.substring(0, 12),
      keyHash: hashedKey,
      scopes: ['score:read', 'score:write', 'site:read', 'site:write', 'quota:read']
    }
  });
  
  console.log('Tenant Created:', tenant.id);
  console.log('Raw API Key (Plain Text, only shown once):', rawKey);
  console.log('DB Stored Prefix:', rawKey.substring(0, 12));
  console.log('DB Stored Hash:', hashedKey);

  // Helper for requests
  async function request(endpoint: string, method = 'GET', body?: any, token = rawKey) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
  }

  // 2. Auth tests
  console.log('\n[2] Auth & Endpoint Smoke Tests...');
  const healthRes = await request('/health');
  console.log('GET /health:', JSON.stringify(healthRes, null, 2));

  const authMeRes = await request('/auth/me');
  console.log('GET /auth/me:', JSON.stringify(authMeRes, null, 2));

  const revokedRes = await request('/auth/me', 'GET', undefined, 'sk_test_invalid1234567890');
  console.log('GET /auth/me (Invalid Key):', JSON.stringify(revokedRes, null, 2));

  // 3. Sites
  const createSiteRes = await request('/sites', 'POST', {
    name: 'Test Site',
    baseUrl: 'https://testsite.com',
    platform: 'custom',
    defaultLocale: 'tr-TR'
  });
  console.log('POST /sites:', JSON.stringify(createSiteRes, null, 2));
  const siteId = createSiteRes.data?.siteId;

  const getSitesRes = await request('/sites');
  console.log('GET /sites:', JSON.stringify(getSitesRes, null, 2));

  // 4. Quota
  const quotaRes = await request('/quota');
  console.log('GET /quota:', JSON.stringify(quotaRes, null, 2));

  // 5. Score Content (since we don't have a real target for fetch right now)
  const scoreContentRes = await request('/score/content', 'POST', {
    siteId,
    url: 'https://testsite.com/draft/123',
    html: '<html><head><title>Test</title></head><body><h1>Hello World</h1><p>Test content.</p></body></html>'
  });
  console.log('POST /score/content:', JSON.stringify(scoreContentRes, null, 2));
  
  const getScoresRes = await request(`/sites/${siteId}/scores`);
  console.log(`GET /sites/${siteId}/scores:`, JSON.stringify(getScoresRes, null, 2));
  // 5.1 Invalid Site ID (Tenant Isolation)
  const getOtherSiteScoresRes = await request(`/sites/invalid-uuid-1234/scores`);
  console.log(`GET /sites/invalid-uuid-1234/scores (Tenant Isolation):`, JSON.stringify(getOtherSiteScoresRes, null, 2));

  // 5.2 Score Content Size Limit
  const largeHtml = '<html><body>' + 'A'.repeat(3 * 1024 * 1024) + '</body></html>'; // 3MB
  const largeContentRes = await request('/score/content', 'POST', {
    siteId,
    url: 'https://testsite.com/draft/large',
    html: largeHtml
  });
  console.log('POST /score/content (Size Limit):', JSON.stringify(largeContentRes, null, 2));
  // 6. SSRF Tests
  console.log('\n[3] SSRF Security Tests on /score/url...');
  const ssrfTargets = [
    'http://localhost',
    'http://127.0.0.1',
    'http://0.0.0.0',
    'http://10.0.0.1',
    'http://172.16.0.1',
    'http://192.168.1.1',
    'http://169.254.169.254',
    'file:///etc/passwd',
    'ftp://example.com',
    'http://[::1]',
    'http://[fc00::1]',
    'http://[fe80::1]'
  ];

  for (const target of ssrfTargets) {
    const res = await request('/score/url', 'POST', { siteId, url: target });
    console.log(`SSRF Test [${target}]:`, res.success ? 'FAIL (Allowed)' : `PASS (Blocked: ${res.error?.message || res.error?.code})`);
  }

  // 7. Scoring Persistence & Weights
  console.log('\n[4] DB Persistence & Scoring Weights...');
  const snapshots = await prisma.scoreSnapshot.findMany({
    where: { siteId },
    include: { moduleResults: true, auditIssues: true }
  });
  console.log(`Snapshots in DB: ${snapshots.length}`);
  if (snapshots.length > 0) {
    const snap = snapshots[0];
    console.log(`Snapshot ID: ${snap.id}, Score: ${snap.finalScore}`);
    
    let totalWeight = 0;
    const weights: Record<string, number> = {};
    for (const mod of snap.moduleResults) {
      weights[mod.moduleKey] = mod.maxScore;
      totalWeight += mod.maxScore;
    }
    console.log('Module Weights:', weights);
    console.log('Total Max Weight:', totalWeight);
    
    const quotaUsage = await prisma.quotaUsage.findMany({ where: { siteId } });
    console.log(`Quota Usage Records: ${quotaUsage.length}`);
  }

  console.log('\nAll tests complete.');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
