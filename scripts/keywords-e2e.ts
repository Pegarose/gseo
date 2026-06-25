/**
 * E2E: Keywords proxy chain + VebAPI credit counter
 * npx tsx --env-file=.env scripts/keywords-e2e.ts
 */

const API_KEY = process.env.GSEO_TEST_API_KEY || 'gseo_live_s2test7aaa14a5efd76c53083f87d3';
const VEBAPI_KEY = process.env.VEBAPI_API_KEY;

async function getCredits() {
  const res = await fetch('https://vebapi.com/api/creditbalance', {
    headers: { 'X-API-KEY': VEBAPI_KEY!, Accept: 'application/json' },
  });
  const data = (await res.json()) as { credits: number };
  return data.credits;
}

async function main() {
  if (!VEBAPI_KEY) {
    console.error('VEBAPI_API_KEY missing in .env');
    process.exit(1);
  }

  console.log('\n=== Keywords E2E ===\n');

  const before = await getCredits();
  console.log(`VebAPI credits BEFORE: ${before}`);

  const cloudRes = await fetch('http://localhost:3001/api/v1/intel/keywords', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ keyword: 'nextjs seo', country: 'tr', mode: 'research' }),
  });
  const cloudJson = await cloudRes.json();
  console.log(`Cloud /intel/keywords: ${cloudRes.status} ${cloudJson.success ? 'OK' : 'FAIL'}`);
  if (!cloudJson.success) {
    console.log('  Error:', cloudJson.error?.message);
    process.exit(1);
  }
  const s0 = cloudJson.data?.suggestions?.[0];
  if (s0) console.log(`  → "${s0.term}" vol=${s0.volume} cpc=${s0.cpc}`);

  const starterRes = await fetch('http://localhost:3002/api/seo/keywords', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword: 'nextjs seo', country: 'tr' }),
  });
  const starterJson = await starterRes.json();
  console.log(`Starter /api/seo/keywords: ${starterRes.status} ${starterJson.success ? 'OK' : 'FAIL'}`);
  if (!starterJson.success) {
    console.log('  Error:', starterJson.error?.message);
    process.exit(1);
  }
  console.log(`  Cached: ${starterJson.data?.cached ?? false}`);

  const after = await getCredits();
  console.log(`VebAPI credits AFTER:  ${after}`);
  console.log(`Spent this run:        ${before - after} (starter hit should be cached = 0 extra)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
