import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api/v1';

async function request(endpoint: string, method = 'GET', body?: any, token?: string) {
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

async function runTests() {
  console.log('--- Phase 1 Step 3/4 Tests ---');

  const rawKey = `gseo_test_${crypto.randomBytes(24).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  const tenant = await prisma.tenant.create({ data: { id: 'tenant_s34_' + Date.now(), name: 'T34', slug: 't34-' + Date.now(), plan: 'free' } });
  await prisma.apiKey.create({ data: { tenantId: tenant.id, name: 'K34', keyPrefix: rawKey.substring(0, 12), keyHash: hashedKey, scopes: ['score:write', 'score:read', 'site:write', 'semantic:read'] } });
  const siteRes = await request('/sites', 'POST', { name: 'Step 34 Site', baseUrl: 'https://testsite.com' }, rawKey);
  const siteId = siteRes.data.siteId;

  // Set mock neuronwriter key for site
  await prisma.integration.create({
    data: {
      tenantId: tenant.id,
      siteId,
      provider: 'neuronwriter',
      status: 'active',
      encryptedCreds: 'local_test_neuronwriter_fallback_key',
    }
  });

  console.log('\n[1] NW Enrich Endpoint (Mock Success)');
  const nwRes1 = await request('/nw/enrich', 'POST', { siteId, targetKeyword: 'seo audit' }, rawKey);
  console.log('Provider Status:', nwRes1.data?.providerStatus);
  console.log('Source Type:', nwRes1.data?.sourceType);
  console.log('Competitor Gaps:', nwRes1.data?.competitorGaps);

  console.log('\n[2] Semantic Analysis (targetKeyword provided)');
  const htmlWithKeyword = `
    <html>
      <head>
        <title>How to do an SEO Audit</title>
        <meta name="description" content="SEO audit guide." />
      </head>
      <body>
        <h1>Ultimate SEO Audit Tutorial</h1>
        <p>An seo audit is important.</p>
        <h2>Why an SEO Audit?</h2>
        <p>Because reasons. ${'word '.repeat(200)}</p>
      </body>
    </html>
  `;
  const scoreRes1 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/seo', html: htmlWithKeyword, targetKeyword: 'seo audit', options: { includeNeuronWriter: true } }, rawKey);
  console.log('Provider Enrichments:', scoreRes1.data?.providerEnrichments?.map((p: any) => p.provider));
  console.log('Semantic Analysis:', JSON.stringify(scoreRes1.data?.semanticAnalysis, null, 2));

  console.log('\n[3] Semantic Inference (NO targetKeyword)');
  const scoreRes2 = await request('/score/content', 'POST', { siteId, url: 'https://testsite.com/no-kw', html: htmlWithKeyword, options: { includeNeuronWriter: true } }, rawKey);
  console.log('Inferred Primary Topic:', scoreRes2.data?.semanticAnalysis?.inferredPrimaryTopic);

  console.log('\n[4] AI Visibility (No FAQ/Outbound)');
  console.log('AI Visibility:', JSON.stringify(scoreRes1.data?.aiVisibility?.platformReadiness, null, 2));

  console.log('\n[5] DB Persistence Verification');
  const snapshot = await prisma.scoreSnapshot.findFirst({
    where: { id: scoreRes1.data?.snapshotId },
    include: { providerEnrichments: true }
  });
  console.log('Provider Enrichment DB Count:', snapshot?.providerEnrichments.length);
  if (snapshot?.providerEnrichments[0]) {
    console.log('DB Provider:', snapshot.providerEnrichments[0].provider);
    console.log('DB Status:', snapshot.providerEnrichments[0].status);
  }

  console.log('\nDone.');
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
