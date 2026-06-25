import type { DatabaseSettingsAdapterOptions, SettingsAdapter } from './types';

/** Connect GSeoSuite to your CMS PostgreSQL (Prisma or raw SQL). */
export function createDatabaseSettingsAdapter(
  options: DatabaseSettingsAdapterOptions
): SettingsAdapter {
  return {
    kind: 'database',
    label: options.label ?? 'PostgreSQL (site database)',
    loadSiteSettings: options.loadSiteSettings,
    saveSiteSettings: options.saveSiteSettings,
  };
}
