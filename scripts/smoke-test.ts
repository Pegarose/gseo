import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const p = new PrismaClient();
const API = process.env.DOGFOOD_API_URL || 'http://localhost:3001/api/v1';

async function ensureTestKey() {
  const tenant = await p.tenant.findUnique({ where: { slug: 'gmedya' } });
  if (!tenant) throw new Error('Seed tenant not found');

  const existing = await p.apiKey.findFirst({
    where: { tenantId: tenant.id, name: 'Smoke Test Key', revokedAt: null },
  });

  if (existing) {
    console.log('NOTE: Using pre-created smoke key from env or creating fresh one');
  }

  const rawKey = 'gseo_smoke_' + crypto.randomBytes(12).toString('hex');
  const hashed = crypto.createHash('sha256').update(rawKey).digest('hex');

  await p.apiKey.create({
    data: {
      tenantId: tenant.id,
      name: 'Smoke Test Key',
      keyPrefix: rawKey.substring(0, 12),
      keyHash: hashed,
      scopes: [
        'score:read', 'site:read', 'site:write', 'quota:read',
        'semantic:read', 'ai:read', 'links:read', 'webhook:write',
      ],
    },
  });

  const site = await p.site.findFirst({ where: { tenantId: tenant.id } });
  return { rawKey, tenantId: tenant.id, siteId: site?.id };
}

async function test(name: string, fn: () => Promise<{ ok: boolean; status?: number; detail?: string }>) {
  try {
    const r = await fn();
    console.log(r.ok ? `✅ ${name}` : `❌ ${name} (${r.status}) ${r.detail || ''}`);
    return r.ok;
  } catch (e: any) {
    console.log(`❌ ${name} — ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n=== GSeoSuite Smoke Test ===\n');
  const { rawKey, tenantId, siteId } = await ensureTestKey();
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${rawKey}` };

  let passed = 0;
  let total = 0;

  const run = async (name: string, fn: () => Promise<{ ok: boolean; status?: number; detail?: string }>) => {
    total++;
    if (await test(name, fn)) passed++;
  };

  await run('Health', async () => {
    const r = await fetch(`${API}/health`);
    return { ok: r.ok, status: r.status };
  });

  await run('Auth /me', async () => {
    const r = await fetch(`${API}/auth/me`, { headers });
    const j = await r.json();
    return { ok: r.ok && j.success, status: r.status };
  });

  await run('Quota', async () => {
    const r = await fetch(`${API}/quota`, { headers });
    return { ok: r.ok, status: r.status };
  });

  await run('Sites list', async () => {
    const r = await fetch(`${API}/sites`, { headers });
    return { ok: r.ok, status: r.status };
  });

  await run('Score URL', async () => {
    const r = await fetch(`${API}/score/url`, {
      method: 'POST', headers,
      body: JSON.stringify({
        siteId,
        url: 'https://example.com',
        options: { storeSnapshot: true, includeAiVisibility: true },
      }),
    });
    const j = await r.json();
    return { ok: r.ok && j.success, status: r.status, detail: j.error?.message };
  });

  await run('AI Visibility check', async () => {
    const r = await fetch(`${API}/ai-visibility/check`, {
      method: 'POST', headers,
      body: JSON.stringify({ html: '<h1>Test</h1><p>FAQ about SEO?</p><ul><li>Item</li></ul>' }),
    });
    return { ok: r.ok, status: r.status };
  });

  await run('Internal links suggest', async () => {
    const r = await fetch(`${API}/internal-links/suggest`, {
      method: 'POST', headers,
      body: JSON.stringify({ sourceUrl: 'https://example.com/page', siteId }),
    });
    return { ok: r.ok, status: r.status };
  });

  await run('Webhooks register', async () => {
    const r = await fetch(`${API}/webhooks`, {
      method: 'POST', headers,
      body: JSON.stringify({ url: 'https://webhook.site/test', events: ['score.completed'] }),
    });
    return { ok: r.ok, status: r.status };
  });

  await run('Login page', async () => {
    const r = await fetch('http://localhost:3001/login');
    return { ok: r.ok, status: r.status };
  });

  await run('Dashboard (demo)', async () => {
    const r = await fetch('http://localhost:3001/dashboard');
    return { ok: r.ok, status: r.status };
  });

  console.log(`\n--- Result: ${passed}/${total} passed ---`);
  console.log(`\nCredentials for manual testing:`);
  console.log(`  API Key: ${rawKey}`);
  console.log(`  Tenant:  ${tenantId}`);
  console.log(`  Site:    ${siteId}`);
  console.log(`  Login:   seo@gmedya.com / GSeoSuite2026!`);
  console.log(`  Admin:   admin@gmedya.com / GSeoSuite2026!`);
  console.log(`  URL:     http://localhost:3001\n`);

  await p.$disconnect();
  process.exit(passed === total ? 0 : 1);
}

main();
