/**
 * VebAPI quality evaluation — spends ~4 credits (skips SERP).
 * npx tsx --env-file=.env scripts/vebapi-eval.ts
 */

import {
  getCreditBalance,
  getKeywordResearch,
  getPageAnalysis,
  getTopSearchKeywords,
  vebApiGet,
  stripWebsiteParam,
} from '../src/lib/providers/vebapi';

const DOMAIN = process.env.VEBAPI_TEST_DOMAIN || 'gmedya.com';
const KEYWORD = process.env.VEBAPI_TEST_KEYWORD || 'seo araclari';
const COUNTRY = process.env.VEBAPI_TEST_COUNTRY || 'tr';

async function main() {
  console.log('\n=== VebAPI Quality Eval ===\n');

  const start = await getCreditBalance();
  const startCr = start.data?.credits ?? '?';
  console.log(`Starting credits: ${startCr}\n`);

  // 1. Top organic keywords (SEOCrawl/GSC overlap candidate)
  const top = await getTopSearchKeywords(DOMAIN);
  console.log(top.ok ? '✅' : '❌', 'Top search keywords', `(${top.durationMs}ms)`);
  if (top.data?.keywords?.length) {
    console.log('   Top 5:');
    top.data.keywords.slice(0, 5).forEach((k) => {
      console.log(`   - "${k.keyword}" rank ${k.rank}, vol ${k.searchVolume}, diff ${k.rankingDifficulty}`);
    });
  } else {
    console.log('   ', top.errorMessage || 'no keywords');
  }

  // 2. Related keywords (editor / NeuronWriter overlap)
  const related = await getKeywordResearch(KEYWORD, COUNTRY);
  console.log(related.ok ? '✅' : '❌', 'Keyword research', `(${related.durationMs}ms)`);
  if (related.data) {
    const preview = JSON.stringify(related.data).slice(0, 400);
    console.log('   Sample:', preview);
  } else {
    console.log('   ', related.errorMessage);
  }

  // 3. On-page audit (compare with @seosuite/next score)
  const page = await getPageAnalysis(DOMAIN);
  console.log(page.ok ? '✅' : '❌', 'Page analysis', `(${page.durationMs}ms)`);
  if (page.data && typeof page.data === 'object') {
    const d = page.data as Record<string, unknown>;
    const title = (d.webtitle as { title?: string; suggestion?: string })?.title;
    const meta = (d.metadescription as { length?: number; suggestion?: string })?.suggestion;
    const h1 = (d.headings as { h1?: { count?: number } })?.h1?.count;
    console.log(`   Title: ${title}`);
    console.log(`   Meta: ${meta}`);
    console.log(`   H1 count: ${h1}`);
  } else {
    console.log('   ', page.errorMessage);
  }

  // 4. AI crawler / robots (GEO — overlaps SEOCrawl + our robots)
  const crawler = await vebApiGet(
    'ai_seo_crawler',
    '/seo/aiseochecker',
    { website: stripWebsiteParam(DOMAIN) }
  );
  console.log(crawler.ok ? '✅' : '❌', 'AI SEO crawler check', `(${crawler.durationMs}ms)`);
  if (crawler.data) {
    console.log('   ', JSON.stringify(crawler.data).slice(0, 350));
  } else {
    console.log('   ', crawler.errorMessage);
  }

  const end = await getCreditBalance();
  const endCr = end.data?.credits ?? '?';
  console.log(`\nCredits: ${startCr} → ${endCr} (spent ~${Number(startCr) - Number(endCr)})\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
