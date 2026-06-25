import { createFileSettingsAdapter, registerSettingsAdapter } from '@seosuite/next';

const adapter = createFileSettingsAdapter({ directory: '.seosuite' });

registerSettingsAdapter(adapter);

export const SEO_SETTINGS_API = '/api/seo/settings';
export const SEO_PERSIST_LABEL = adapter.label;
