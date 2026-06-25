/**
 * Path discovery for SEOCrawl REST (remove when official docs land).
 * npx tsx --env-file=.env scripts/seocrawl-probe.ts
 */
const key = process.env.SEOCRAWL_API_KEY;
if (!key) {
  console.error('SEOCRAWL_API_KEY missing');
  process.exit(1);
}

const base = 'https://api.seocrawl.ai';
const propertyId =
  process.env.SEOCRAWL_TEST_PROPERTY_ID ?? 'c3869d17-0787-443c-a49f-7464547db140';
const range = 'from=2026-05-19&to=2026-06-16';

const paths = [
  '/v1/properties',
  `/v1/properties/${propertyId}/gsc/summary?${range}`,
  `/v1/properties/${propertyId}/gsc/top-keywords?${range}`,
  `/v1/properties/${propertyId}/gsc/top-pages?${range}`,
  `/v1/properties/${propertyId}/gsc/compare?${range}`,
  `/v1/properties/${propertyId}/ga4/summary?${range}`,
  `/v1/properties/${propertyId}/audit/pages?limit=5`,
  `/v1/properties/${propertyId}/tasks?limit=5`,
  `/v1/properties/${propertyId}/prompts?${range}`,
];

async function go(path: string) {
  const r = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  const text = await r.text();
  console.log(`${r.status} ${path.split('?')[0]}`);
  console.log(`  ${text.slice(0, 180).replace(/\n/g, ' ')}\n`);
}

async function main() {
  for (const p of paths) {
    await go(p);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
