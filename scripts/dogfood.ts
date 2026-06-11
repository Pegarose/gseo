import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api/v1';

async function setupTestTenant() {
  const rawKey = `gseo_dogfood_${crypto.randomBytes(16).toString('hex')}`;
  const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant_df_' + Date.now(),
      name: 'Dogfood Tenant',
      slug: 'dogfood-' + Date.now(),
      plan: 'pro'
    }
  });

  await prisma.apiKey.create({
    data: {
      tenantId: tenant.id,
      name: 'Dogfood Key',
      keyPrefix: rawKey.substring(0, 12),
      keyHash: hashedKey,
      scopes: ['score:write', 'score:read', 'site:write', 'semantic:read']
    }
  });

  const siteRes = await fetch(`${API_URL}/sites`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${rawKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Dogfood Site', baseUrl: 'https://example.com' })
  }).then(r => r.json());

  // Add mock NW key for realistic enrichment
  await prisma.integration.create({
    data: {
      tenantId: tenant.id,
      siteId: siteRes.data.siteId,
      provider: 'neuronwriter',
      status: 'active',
      encryptedCreds: 'local_test_neuronwriter_fallback_key',
    }
  });

  return { rawKey, siteId: siteRes.data.siteId };
}

async function run() {
  console.log('--- Starting Dogfood Batch ---');
  
  let items: any[] = [];
  try {
    const configPath = path.join(process.cwd(), 'dogfood-urls.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      items = config.urls || [];
    }
  } catch (e) {
    console.warn('Could not read dogfood-urls.json', e);
  }

  if (process.env.DOGFOOD_URLS) {
    // If string from env, map to basic object
    items = process.env.DOGFOOD_URLS.split(',').map(s => ({ url: s.trim() }));
  }

  if (items.length === 0) {
    items = [{ url: 'https://example.com', pageType: 'generic' }];
  }

  console.log(`Loaded ${items.length} URLs to score.`);

  const { rawKey, siteId } = await setupTestTenant();
  console.log('Test Tenant & Key created.');

  const results: any[] = [];
  const mdLines: string[] = [
    '# Dogfood Summary Report',
    '',
    '| URL | Final Score | Score Band | Top Issues | Provider Enrichment | AI Readiness | Caps Triggered | Comments |',
    '|---|---|---|---|---|---|---|---|'
  ];

  for (const item of items) {
    const { url, pageType, platform, targetKeyword } = item;
    console.log(`\nScoring: ${url} (Type: ${pageType || 'generic'})`);
    try {
      const res = await fetch(`${API_URL}/score/url`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${rawKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId,
          url,
          targetKeyword,
          pageType,
          platform,
          options: { includeNeuronWriter: true }
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error(`Failed to score ${url}:`, data);
        results.push({ url, status: 'failed', error: data });
        mdLines.push(`| ${url} | FAILED | - | ${data.error?.message || 'HTTP Error'} | - | - | - | Check logs |`);
        continue;
      }

      const scoreOutput = data.data;
      results.push({ url, status: 'success', data: scoreOutput });

      // Format for Markdown
      const topIssues = (scoreOutput.topIssues || []).slice(0, 3).map((i: any) => i.code).join('<br>');
      const caps = (scoreOutput.modules || []).flatMap((m: any) => (m.issues || []).filter((i: any) => i.severity === 'critical')).map((i: any) => i.code).join('<br>') || 'None';
      const aiReady = scoreOutput.aiVisibility?.platformReadiness?.map((p: any) => `${p.platform}:${p.score}`).join('<br>') || 'N/A';
      const enrichment = scoreOutput.providerEnrichments?.[0]?.providerStatus || 'None';

      mdLines.push(`| ${url} | **${scoreOutput.finalScore}** | ${scoreOutput.scoreBand} | ${topIssues || 'None'} | ${enrichment} | ${aiReady} | ${caps} | |`);

      console.log(`  -> Success. Score: ${scoreOutput.finalScore}`);
    } catch (err: any) {
      console.error(`Crash on ${url}:`, err.message);
      results.push({ url, status: 'crashed', error: err.message });
      mdLines.push(`| ${url} | CRASHED | - | ${err.message} | - | - | - | Code error |`);
    }
  }

  fs.writeFileSync('dogfood-report.json', JSON.stringify({ summary: results }, null, 2));
  fs.writeFileSync('dogfood-summary.md', mdLines.join('\n'));

  console.log('\n--- Batch Complete ---');
  console.log('Results written to dogfood-report.json and dogfood-summary.md');
}

run().catch(console.error).finally(() => prisma.$disconnect());
