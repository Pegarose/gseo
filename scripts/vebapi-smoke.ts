/**
 * VebAPI smoke test — budget-aware (free tier: 50 req/mo).
 *
 * Usage:
 *   npx tsx scripts/vebapi-smoke.ts              # credits only (0 spent)
 *   npx tsx scripts/vebapi-smoke.ts --basic      # credits + keyword + backlink (~2 credits)
 *   npx tsx scripts/vebapi-smoke.ts --all        # runs full safe suite (~5 credits)
 *
 * Env: VEBAPI_API_KEY, optional VEBAPI_ENABLED=false to skip
 */

import {
  checkVebApiHealth,
  estimateCredits,
  getBacklinkData,
  getCreditBalance,
  getSingleKeyword,
  getTopSearchKeywords,
  VEBAPI_ENDPOINTS,
} from '../src/lib/providers/vebapi';

const args = new Set(process.argv.slice(2));
const mode = args.has('--all') ? 'all' : args.has('--basic') ? 'basic' : 'credits';

const TEST_KEYWORD = process.env.VEBAPI_TEST_KEYWORD || 'seo araclari';
const TEST_DOMAIN = process.env.VEBAPI_TEST_DOMAIN || 'gmedya.com';
const TEST_COUNTRY = process.env.VEBAPI_TEST_COUNTRY || 'tr';

function log(ok: boolean, label: string, detail?: string) {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  console.log('\n=== VebAPI Smoke Test ===\n');
  console.log(`Mode: ${mode}`);
  console.log(`Docs: https://vebapi.com/apis\n`);

  if (!process.env.VEBAPI_API_KEY) {
    console.error('VEBAPI_API_KEY is not set. Add it to .env and retry.');
    process.exit(1);
  }

  if (process.env.VEBAPI_ENABLED === 'false') {
    console.error('VEBAPI_ENABLED=false — provider disabled.');
    process.exit(1);
  }

  console.log('--- Endpoint catalog (credit costs) ---');
  for (const ep of VEBAPI_ENDPOINTS) {
    const note = ep.creditNote ? ` (${ep.creditNote})` : '';
    console.log(`  ${ep.credits} cr  ${ep.id.padEnd(20)} ${ep.name}${note}`);
  }
  console.log('');

  let spent = 0;

  const health = await checkVebApiHealth();
  log(health.status === 'operational', 'Health check', `${health.latencyMs}ms`);
  if (health.creditsRemaining != null) {
    console.log(`   Remaining credits: ${health.creditsRemaining}`);
  }
  if (health.errorMessage) {
    console.log(`   Error: ${health.errorMessage}`);
    process.exit(1);
  }

  if (mode === 'credits') {
    console.log('\n--- Done (0 credits spent beyond health ping) ---\n');
    process.exit(0);
  }

  const before = await getCreditBalance();
  const beforeCredits =
    before.ok && before.data ? (before.data as { credits: number }).credits : null;

  if (mode === 'basic' || mode === 'all') {
    spent += estimateCredits('singlekeyword');
    const kw = await getSingleKeyword(TEST_KEYWORD, TEST_COUNTRY);
    log(kw.ok, 'Single keyword', kw.ok ? `${TEST_KEYWORD} (${kw.durationMs}ms)` : kw.errorMessage);
    if (kw.data) {
      console.log('   Sample:', JSON.stringify(kw.data).slice(0, 240));
    }

    spent += estimateCredits('backlinkdata');
    const bl = await getBacklinkData(TEST_DOMAIN);
    log(bl.ok, 'Backlink data', bl.ok ? TEST_DOMAIN : bl.errorMessage);
    if (bl.data && typeof bl.data === 'object' && 'counts' in bl.data) {
      const counts = (bl.data as { counts: unknown }).counts;
      console.log('   Counts:', JSON.stringify(counts).slice(0, 200));
    }
  }

  if (mode === 'all') {
    spent += estimateCredits('topsearchkeywords');
    const top = await getTopSearchKeywords(TEST_DOMAIN);
    log(top.ok, 'Top search keywords', top.ok ? TEST_DOMAIN : top.errorMessage);
    if (top.data?.keywords?.length) {
      const first = top.data.keywords[0];
      console.log(`   Top: "${first.keyword}" rank ${first.rank}, vol ${first.searchVolume}`);
    }
  }

  const after = await getCreditBalance();
  const afterCredits =
    after.ok && after.data ? (after.data as { credits: number }).credits : null;

  console.log('\n--- Summary ---');
  console.log(`Estimated spent this run: ~${spent} credits`);
  if (beforeCredits != null && afterCredits != null) {
    console.log(`Balance: ${beforeCredits} → ${afterCredits} (${beforeCredits - afterCredits} used)`);
  }
  console.log('');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
