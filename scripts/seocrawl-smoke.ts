/**
 * SEOCrawl REST smoke test — credit-aware.
 *
 * Usage:
 *   npm run seocrawl:smoke              # health + properties (~1 credit)
 *   npm run seocrawl:smoke:gsc          # + GSC summary + top keywords (~9 credits)
 *
 * Env: SEOCRAWL_API_KEY, optional SEOCRAWL_TEST_PROPERTY_ID, SEOCRAWL_ENABLED=false
 */

import {
  checkSeoCrawlHealth,
  estimateSeoCrawlCredits,
  findPropertyByHost,
  getGscSummary,
  getTopKeywords,
  getTopPages,
  listProperties,
  listTasks,
  SEOCRAWL_ENDPOINTS,
} from '../src/lib/providers/seocrawl';

const mode = process.argv.includes('--gsc') ? 'gsc' : 'basic';
const testDomain = process.env.SEOCRAWL_TEST_DOMAIN || 'efesusstone.com';
const propertyIdOverride = process.env.SEOCRAWL_TEST_PROPERTY_ID;

function log(ok: boolean, label: string, detail?: string) {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  console.log('\n=== SEOCrawl REST Smoke Test ===\n');
  console.log(`Mode: ${mode}`);
  console.log(`Base: https://api.seocrawl.ai/v1/\n`);

  if (!process.env.SEOCRAWL_API_KEY) {
    console.error('SEOCRAWL_API_KEY is not set. Add it to .env and retry.');
    process.exit(1);
  }

  if (process.env.SEOCRAWL_ENABLED === 'false') {
    console.error('SEOCRAWL_ENABLED=false — provider disabled.');
    process.exit(1);
  }

  console.log('--- Verified endpoints (est. MCP credits) ---');
  for (const ep of SEOCRAWL_ENDPOINTS.filter((e) => e.verified)) {
    console.log(`  ${ep.credits} cr  ${ep.id.padEnd(20)} ${ep.name}`);
  }
  console.log('');

  let estimated = 0;

  const health = await checkSeoCrawlHealth();
  estimated += estimateSeoCrawlCredits('list_properties');
  log(health.status === 'operational', 'Health check', `${health.latencyMs}ms`);
  if (health.propertyCount != null) {
    console.log(`   Properties: ${health.propertyCount}`);
  }
  if (health.errorMessage) {
    console.log(`   Error: ${health.errorMessage}`);
    process.exit(1);
  }

  const props = await listProperties();
  if (props.ok && props.data?.data?.length) {
    console.log('   Sample projects:');
    for (const p of props.data.data.slice(0, 5)) {
      console.log(`     • ${p.url} (${p.id.slice(0, 8)}…)`);
    }
  }

  if (mode === 'basic') {
    console.log(`\n--- Done (est. ~${estimated} MCP credits) ---\n`);
    process.exit(0);
  }

  let propertyId = propertyIdOverride;
  if (!propertyId) {
    const { property, result } = await findPropertyByHost(testDomain);
    if (!property) {
      log(false, 'Resolve property', result.errorMessage ?? `No project for ${testDomain}`);
      process.exit(1);
    }
    propertyId = property.id;
    log(true, 'Resolve property', `${testDomain} → ${propertyId}`);
  }

  estimated += estimateSeoCrawlCredits('gsc_summary');
  const summary = await getGscSummary(propertyId);
  log(summary.ok, 'GSC summary', summary.ok ? `${summary.durationMs}ms` : summary.errorMessage);
  if (summary.ok && summary.data?.data?.metrics) {
    const m = summary.data.data.metrics;
    console.log(
      `   Clicks ${m.clicks ?? '—'}, impressions ${m.impressions ?? '—'}, position ${m.position ?? '—'}`
    );
  }

  estimated += estimateSeoCrawlCredits('gsc_top_keywords');
  const keywords = await getTopKeywords(propertyId, undefined, 5);
  log(
    keywords.ok,
    'Top keywords',
    keywords.ok ? `${keywords.data?.data?.length ?? 0} rows` : keywords.errorMessage
  );
  if (keywords.ok && keywords.data?.data?.[0]) {
    const top = keywords.data.data[0];
    console.log(`   #1 "${top.keyword}" — ${top.metrics.clicks.value} clicks`);
  }

  estimated += estimateSeoCrawlCredits('gsc_top_pages');
  const pages = await getTopPages(propertyId, undefined, 3);
  log(pages.ok, 'Top pages', pages.ok ? `${pages.data?.data?.length ?? 0} rows` : pages.errorMessage);

  estimated += estimateSeoCrawlCredits('list_tasks');
  const tasks = await listTasks(propertyId, 3);
  log(tasks.ok, 'Tasks', tasks.ok ? `${tasks.data?.data?.length ?? 0} rows` : tasks.errorMessage);

  console.log(`\n--- Done (est. ~${estimated} MCP credits) ---\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
