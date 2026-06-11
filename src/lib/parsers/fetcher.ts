import { validateUrlForFetch, validateRedirectTarget } from '@/lib/security/ssrf';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_REDIRECTS = 3;
const USER_AGENT = 'SeoSuiteBot/0.1 (+https://seosuite.app/bot)';

export interface FetchResult {
  ok: boolean;
  statusCode: number;
  headers: Record<string, string>;
  html: string;
  finalUrl: string;
  redirectChain: string[];
  error?: string;
}

/**
 * Fetch a URL with SSRF protection, timeout, size limits, and redirect tracking.
 */
export async function fetchUrl(rawUrl: string): Promise<FetchResult> {
  // 1. SSRF Validation
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

  let currentUrl = rawUrl;
  const redirectChain: string[] = [];

  // 2. Follow redirects manually to validate each hop
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        redirect: 'manual', // Handle redirects manually for SSRF protection
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            ok: false,
            statusCode: response.status,
            headers: headersToRecord(response.headers),
            html: '',
            finalUrl: currentUrl,
            redirectChain,
            error: `Redirect ${response.status} without Location header.`,
          };
        }

        // Resolve relative redirects
        const absoluteLocation = new URL(location, currentUrl).toString();

        // Validate redirect target for SSRF
        const redirectValidation = await validateRedirectTarget(absoluteLocation);
        if (!redirectValidation.safe) {
          return {
            ok: false,
            statusCode: response.status,
            headers: headersToRecord(response.headers),
            html: '',
            finalUrl: currentUrl,
            redirectChain,
            error: `Redirect to unsafe target blocked: ${redirectValidation.reason}`,
          };
        }

        redirectChain.push(currentUrl);
        currentUrl = absoluteLocation;

        if (i === MAX_REDIRECTS) {
          return {
            ok: false,
            statusCode: response.status,
            headers: headersToRecord(response.headers),
            html: '',
            finalUrl: currentUrl,
            redirectChain,
            error: `Too many redirects (max ${MAX_REDIRECTS}).`,
          };
        }

        continue; // Follow the next redirect
      }

      // Non-redirect response — read body with size limit
      const responseHeaders = headersToRecord(response.headers);

      // Check content-length header first
      const contentLength = parseInt(responseHeaders['content-length'] || '0', 10);
      if (contentLength > MAX_RESPONSE_SIZE) {
        return {
          ok: false,
          statusCode: response.status,
          headers: responseHeaders,
          html: '',
          finalUrl: currentUrl,
          redirectChain,
          error: `Response too large: ${contentLength} bytes (max ${MAX_RESPONSE_SIZE}).`,
        };
      }

      // Stream-read body with size limit
      const html = await readBodyWithLimit(response, MAX_RESPONSE_SIZE);

      return {
        ok: response.status >= 200 && response.status < 400,
        statusCode: response.status,
        headers: responseHeaders,
        html,
        finalUrl: currentUrl,
        redirectChain,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        return {
          ok: false,
          statusCode: 0,
          headers: {},
          html: '',
          finalUrl: currentUrl,
          redirectChain,
          error: `Request timed out after ${FETCH_TIMEOUT_MS}ms.`,
        };
      }

      return {
        ok: false,
        statusCode: 0,
        headers: {},
        html: '',
        finalUrl: currentUrl,
        redirectChain,
        error: `Fetch error: ${error.message}`,
      };
    }
  }

  // Should not reach here
  return {
    ok: false,
    statusCode: 0,
    headers: {},
    html: '',
    finalUrl: currentUrl,
    redirectChain,
    error: 'Unexpected fetch loop termination.',
  };
}

/**
 * Read the response body up to a max size limit in bytes.
 */
async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  if (!response.body) {
    return await response.text();
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  const chunks: string[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      reader.cancel();
      throw new Error(`Response body exceeded ${maxBytes} bytes limit.`);
    }

    chunks.push(decoder.decode(value, { stream: true }));
  }

  // Flush remaining
  chunks.push(decoder.decode());

  return chunks.join('');
}

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key.toLowerCase()] = value;
  });
  return record;
}
