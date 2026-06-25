export { serializeAdminConfig } from './serialize-config';
export { adminSnapshotToSettings } from './deserialize-config';
export { createSeoSettingsRouteHandlers } from './settings-route';
export { AdminConfigProvider, useAdminConfig, useAdminPersist } from './context';
export { SeoAdminLayout } from './shell';
export type { SeoAdminLayoutProps } from './shell';
export { SaveBar } from './components/save-bar';
export { SettingsLayout } from './components/settings-layout';
export { ModuleCard } from './components/module-card';
export { VariableInserter } from './components/variable-inserter';
export { SerpPreview } from './components/serp-preview';
export { SeoPageEditor } from './components/seo-page-editor';
export type { SeoPageEditorProps, SeoPageEditorValue } from './components/seo-page-editor';
export { getAdminNavItems } from './nav';

export { SeoAdminDashboard } from './pages/dashboard';
export { SeoAdminModules } from './pages/modules';
export { SeoAdminGeneralSettings } from './pages/general';
export { SeoAdminTitlesMeta } from './pages/titles';
export { SeoAdminSitemap } from './pages/sitemap';
export { SeoAdminRedirects } from './pages/redirects';
export { SeoAdminSchema } from './pages/schema';
export { SeoAdminAnalysis } from './pages/analysis';
export { SeoAdminIndexing } from './pages/indexing';
export { SeoAdminTools } from './pages/tools';

export type { AdminConfigSnapshot, AdminNavItem, RedirectRule } from './types';
export { SCHEMA_TYPE_OPTIONS, VENDOR_SCHEMA_TYPES } from './types';
