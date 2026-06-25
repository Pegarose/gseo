import type { SeoSuiteConfig } from '../config';
import { getBootstrapSeoSuiteConfig, getSeoSuiteConfig, setRuntimeSeoSuiteConfig } from '../config';
import { adminSnapshotToSettings } from '../../admin/deserialize-config';
import type { AdminConfigSnapshot } from '../../admin/types';
import { mergeSeoSuiteConfig } from './merge';
import type { PersistableSeoSettings, SettingsAdapter } from './types';

let registeredAdapter: SettingsAdapter | null = null;

export function registerSettingsAdapter(adapter: SettingsAdapter): void {
  registeredAdapter = adapter;
}

export function getSettingsAdapter(): SettingsAdapter | null {
  return registeredAdapter;
}

export async function loadSeoSuiteConfig(): Promise<SeoSuiteConfig> {
  const bootstrap = getBootstrapSeoSuiteConfig();

  if (!registeredAdapter) {
    setRuntimeSeoSuiteConfig(bootstrap);
    return bootstrap;
  }

  const persisted = await registeredAdapter.loadSiteSettings();
  const merged = mergeSeoSuiteConfig(bootstrap, persisted);
  setRuntimeSeoSuiteConfig(merged);
  return merged;
}

export async function saveSeoSuiteSettings(data: PersistableSeoSettings): Promise<SeoSuiteConfig> {
  if (!registeredAdapter) {
    throw new Error(
      '[@seosuite/next] No SettingsAdapter registered. Call registerSettingsAdapter() before saving admin settings.'
    );
  }

  await registeredAdapter.saveSiteSettings(data);
  return loadSeoSuiteConfig();
}

export async function saveAdminSettingsSnapshot(
  snapshot: Partial<AdminConfigSnapshot>
): Promise<SeoSuiteConfig> {
  return saveSeoSuiteSettings(adminSnapshotToSettings(snapshot));
}

/** Load adapter overrides when registered; otherwise return current in-memory config. */
export async function resolveRuntimeSeoConfig(): Promise<SeoSuiteConfig> {
  if (!registeredAdapter) {
    return getSeoSuiteConfig();
  }
  return loadSeoSuiteConfig();
}
