export interface ScoreUrlPayload {
  siteId: string;
  url: string;
  targetKeyword?: string;
  options?: {
    includeAiVisibility?: boolean;
    renderJavascript?: boolean;
    storeSnapshot?: boolean;
  };
}

export interface SeoSuiteClientConfig {
  apiKey: string;
  baseUrl: string;
}

export class SeoSuiteClient {
  constructor(private config: SeoSuiteClientConfig) {}

  async scoreUrl(payload: ScoreUrlPayload): Promise<any> {
    const res = await fetch(`${this.config.baseUrl}/score/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err.error?.message || `Request failed with ${res.status}`);
    }

    return res.json();
  }
}
