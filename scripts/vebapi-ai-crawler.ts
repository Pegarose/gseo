import { vebApiGet, stripWebsiteParam, getCreditBalance } from '../src/lib/providers/vebapi';

async function main() {
  const b = await getCreditBalance();
  console.log('credits before:', b.data);
  const r = await vebApiGet('ai_seo_crawler', '/seo/aiseochecker', {
    website: stripWebsiteParam('gmedya.com'),
  });
  console.log(r.ok ? '✅ AI crawler' : '❌', JSON.stringify(r.data, null, 2)?.slice(0, 800));
  const a = await getCreditBalance();
  console.log('credits after:', a.data);
}
main();
