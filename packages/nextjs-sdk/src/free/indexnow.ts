export interface IndexNowSubmission {
  url: string;
  submittedAt: string;
  status: 'sent' | 'failed';
  detail?: string;
}

export interface SubmitIndexNowOptions {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

/** Submit URLs to IndexNow (Bing/Yandex). */
export async function submitIndexNow(options: SubmitIndexNowOptions): Promise<IndexNowSubmission[]> {
  const endpoint = 'https://api.indexnow.org/indexnow';
  const keyLocation =
    options.keyLocation ?? `https://${options.host.replace(/^https?:\/\//, '')}/${options.key}.txt`;

  const results: IndexNowSubmission[] = [];
  const submittedAt = new Date().toISOString();

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: options.host.replace(/^https?:\/\//, ''),
        key: options.key,
        keyLocation,
        urlList: options.urlList,
      }),
    });

    const status = response.ok ? 'sent' : 'failed';
    for (const url of options.urlList) {
      results.push({
        url,
        submittedAt,
        status,
        detail: response.ok ? undefined : `HTTP ${response.status}`,
      });
    }
  } catch (error) {
    for (const url of options.urlList) {
      results.push({
        url,
        submittedAt,
        status: 'failed',
        detail: error instanceof Error ? error.message : 'Request failed',
      });
    }
  }

  return results;
}

export function createIndexNowRouteHandlers(getOptions: () => SubmitIndexNowOptions | null) {
  return {
    async POST(request: Request) {
      const body = (await request.json()) as { urls?: string[] };
      const options = getOptions();
      if (!options) {
        return Response.json({ error: 'IndexNow is not configured' }, { status: 501 });
      }

      const urlList = body.urls?.length ? body.urls : options.urlList;
      const results = await submitIndexNow({ ...options, urlList });
      return Response.json({ results });
    },
  };
}
