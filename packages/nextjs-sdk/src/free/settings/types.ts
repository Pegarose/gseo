import type { SeoSuiteConfigInput } from '../config';

export type SettingsAdapterKind = 'file' | 'database' | 'cloud';

/** Partial site-wide settings persisted outside bootstrap config. */
export type PersistableSeoSettings = Partial<SeoSuiteConfigInput>;

export interface SettingsAdapter {
  kind: SettingsAdapterKind;
  /** Human-readable label shown in admin (e.g. ".seosuite/settings.json"). */
  label: string;
  loadSiteSettings(): Promise<PersistableSeoSettings>;
  saveSiteSettings(data: PersistableSeoSettings): Promise<void>;
}

export interface FileSettingsAdapterOptions {
  /** Directory relative to process.cwd() or absolute. Default: `.seosuite` */
  directory?: string;
  settingsFilename?: string;
  redirectsFilename?: string;
}

export interface DatabaseSettingsAdapterOptions {
  label?: string;
  loadSiteSettings: () => Promise<PersistableSeoSettings>;
  saveSiteSettings: (data: PersistableSeoSettings) => Promise<void>;
}
