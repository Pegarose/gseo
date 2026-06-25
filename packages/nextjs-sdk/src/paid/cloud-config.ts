import { SeoSuiteClient, SeoSuiteClientConfig } from './client';

export interface CloudConfig {
  apiKey: string;
  baseUrl: string;
  siteId: string;
}

export interface CloudConfigInput {
  apiKey?: string;
  baseUrl?: string;
  siteId?: string;
}

export function getCloudConfig(overrides: CloudConfigInput = {}): CloudConfig {
  const apiKey =
    overrides.apiKey ??
    process.env.GSEO_API_KEY ??
    process.env.SEOSUITE_API_KEY;

  const baseUrl =
    overrides.baseUrl ??
    process.env.GSEO_API_BASE_URL ??
    process.env.SEOSUITE_API_BASE_URL ??
    'http://localhost:3001/api/v1';

  const siteId =
    overrides.siteId ??
    process.env.GSEO_SITE_ID ??
    process.env.SEOSUITE_SITE_ID;

  if (!apiKey) {
    throw new Error(
      '[@seosuite/next] Missing API key. Set GSEO_API_KEY in your environment.'
    );
  }

  if (!siteId) {
    throw new Error(
      '[@seosuite/next] Missing site ID. Set GSEO_SITE_ID in your environment.'
    );
  }

  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ''), siteId };
}

export function createSeoSuiteClient(config?: CloudConfigInput): SeoSuiteClient {
  const resolved = getCloudConfig(config);
  const clientConfig: SeoSuiteClientConfig = {
    apiKey: resolved.apiKey,
    baseUrl: resolved.baseUrl,
  };
  return new SeoSuiteClient(clientConfig);
}

export function getDefaultSiteId(config?: CloudConfigInput): string {
  return getCloudConfig(config).siteId;
}
