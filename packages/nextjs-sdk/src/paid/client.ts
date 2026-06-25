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

export interface ScoreContentPayload {
  siteId: string;
  url: string;
  html: string;
  contentId?: string;
  title?: string;
  metaDescription?: string;
  targetKeyword?: string;
  locale?: string;
  platform?: string;
  pageType?: string;
  options?: {
    includeAiVisibility?: boolean;
    storeSnapshot?: boolean;
  };
}

export interface SeoSuiteClientConfig {
  apiKey: string;
  baseUrl: string;
}

export class SeoSuiteClient {
  constructor(private config: SeoSuiteClientConfig) {}

  private async request(path: string, body: unknown): Promise<any> {
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err.error?.message || `Request failed with ${res.status}`);
    }

    return res.json();
  }

  async scoreUrl(payload: ScoreUrlPayload): Promise<any> {
    return this.request('/score/url', payload);
  }

  async scoreContent(payload: ScoreContentPayload): Promise<any> {
    return this.request('/score/content', payload);
  }

  async suggestInternalLinks(payload: {
    siteId: string;
    sourceUrl: string;
    html?: string;
    targetKeyword?: string;
    pageType?: string;
  }): Promise<any> {
    return this.request('/internal-links/suggest', payload);
  }

  async analyzeSemantic(payload: {
    siteId?: string;
    html: string;
    url?: string;
    targetKeyword?: string;
    pageType?: string;
  }): Promise<any> {
    return this.request('/semantic/analyze', payload);
  }

  async getKeywordIntel(payload: {
    keyword: string;
    country?: string;
    mode?: 'research' | 'single';
  }): Promise<any> {
    return this.request('/intel/keywords', payload);
  }
}
