import { getSeoSuiteConfig, loadSeoSuiteConfig, submitIndexNow } from '@seosuite/next';
import '../../../seosuite.config';
import '../../../lib/seo-settings';

export async function POST(request: Request) {
  await loadSeoSuiteConfig();
  const config = getSeoSuiteConfig();
  const key = config.modules.instantIndexing.indexNowKey;

  if (!key) {
    return Response.json({ error: 'IndexNow key not configured in admin' }, { status: 501 });
  }

  const body = (await request.json()) as { urls?: string[] };
  const host = new URL(config.siteUrl).host;
  const urlList = body.urls?.length ? body.urls : [config.siteUrl];

  const results = await submitIndexNow({
    host,
    key,
    urlList,
  });

  return Response.json({ results });
}
