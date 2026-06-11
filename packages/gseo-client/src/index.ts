export interface GseoClientConfig {
  apiKey: string;
  baseUrl?: string; // Defaults to https://api.seosuite.app/v1
  siteId?: string;
}

export interface ScoreUrlOptions {
  url: string;
  siteId?: string;
  targetKeyword?: string;
  locale?: string;
  pageType?: 'generic' | 'article' | 'product' | 'category' | 'landing_page';
  platform?: 'custom' | 'wordpress' | 'nextjs' | 'shopify';
  options?: {
    includeNeuronWriter?: boolean;
    includePerformance?: boolean;
    includeAiVisibility?: boolean;
    storeSnapshot?: boolean;
  };
}

export interface ScoreContentOptions extends Omit<ScoreUrlOptions, 'url'> {
  html: string;
  url?: string;
  contentId?: string;
  title?: string;
  metaDescription?: string;
}

export class GseoClient {
  private apiKey: string;
  private baseUrl: string;
  private siteId?: string;

  constructor(config: GseoClientConfig) {
    if (!config.apiKey) {
      throw new Error('GseoClient: apiKey is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || 'https://api.seosuite.app/v1').replace(/\/$/, '');
    this.siteId = config.siteId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    return data.data as T;
  }

  // --- Core API ---

  async scoreUrl(options: ScoreUrlOptions) {
    return this.request<any>('/score/url', {
      method: 'POST',
      body: JSON.stringify({
        ...options,
        siteId: options.siteId || this.siteId,
      }),
    });
  }

  async scoreContent(options: ScoreContentOptions) {
    return this.request<any>('/score/content', {
      method: 'POST',
      body: JSON.stringify({
        ...options,
        siteId: options.siteId || this.siteId,
      }),
    });
  }

  // --- Auth API ---

  async getMe() {
    return this.request<any>('/auth/me', { method: 'GET' });
  }

  // --- Sites API ---

  async createSite(data: { name: string; baseUrl: string; platform?: string; defaultLocale?: string }) {
    return this.request<any>('/sites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async listSites() {
    return this.request<any>('/sites', { method: 'GET' });
  }

  async getSiteScores(siteId: string, params?: { limit?: number; cursor?: string; pageType?: string }) {
    const query = new URLSearchParams();
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.pageType) query.set('pageType', params.pageType);
    
    const qs = query.toString();
    return this.request<any>(`/sites/${siteId}/scores${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  // --- Quota API ---

  async getQuota() {
    return this.request<any>('/quota', { method: 'GET' });
  }
}

export function createClient(config: GseoClientConfig): GseoClient {
  return new GseoClient(config);
}
