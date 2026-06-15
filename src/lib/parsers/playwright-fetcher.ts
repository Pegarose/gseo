import { chromium, Browser, BrowserContext } from 'playwright';
import { validateUrlForFetch } from '@/lib/security/ssrf';
import { FetchResult } from './fetcher';

const FETCH_TIMEOUT_MS = 20_000;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

export async function fetchUrlWithPlaywright(rawUrl: string): Promise<FetchResult> {
  const validation = await validateUrlForFetch(rawUrl);
  if (!validation.safe) {
    return {
      ok: false,
      statusCode: 0,
      headers: {},
      html: '',
      finalUrl: rawUrl,
      redirectChain: [],
      error: `SSRF blocked: ${validation.reason}`,
    };
  }

  let context: BrowserContext | null = null;
  let finalUrl = rawUrl;
  const redirectChain: string[] = [];

  try {
    const browser = await getBrowser();
    context = await browser.newContext({
      userAgent: 'SeoSuiteBot/0.1 (+https://seosuite.app/bot)',
    });

    const page = await context.newPage();

    page.on('response', async (response) => {
      const status = response.status();
      if ([301, 302, 303, 307, 308].includes(status)) {
        const location = response.headers()['location'];
        if (location) {
          redirectChain.push(response.url());
        }
      }
    });

    const response = await page.goto(rawUrl, {
      waitUntil: 'networkidle',
      timeout: FETCH_TIMEOUT_MS,
    });

    finalUrl = page.url();
    const statusCode = response?.status() ?? 0;
    const headers: Record<string, string> = response?.headers() ?? {};

    const html = await page.content();

    await context.close();

    if (html.length > MAX_RESPONSE_SIZE) {
      return {
        ok: false,
        statusCode,
        headers,
        html: '',
        finalUrl,
        redirectChain,
        error: `Response too large: ${html.length} bytes (max ${MAX_RESPONSE_SIZE}).`,
      };
    }

    return {
      ok: statusCode >= 200 && statusCode < 400,
      statusCode,
      headers,
      html,
      finalUrl,
      redirectChain,
    };
  } catch (error: any) {
    if (context) await context.close().catch(() => {});

    return {
      ok: false,
      statusCode: 0,
      headers: {},
      html: '',
      finalUrl,
      redirectChain,
      error: `Playwright fetch error: ${error.message}`,
    };
  }
}
