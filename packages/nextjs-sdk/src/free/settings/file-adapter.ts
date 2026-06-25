import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { PersistableSeoSettings, SettingsAdapter } from './types';
import type { FileSettingsAdapterOptions } from './types';

interface StoredSettingsFile {
  version: 1;
  settings: PersistableSeoSettings;
}

const DEFAULT_DIR = '.seosuite';
const DEFAULT_SETTINGS = 'settings.json';
const DEFAULT_REDIRECTS = 'redirects.json';

async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/** Server-only file adapter for OSS quickstart and self-hosted Node.js. */
export function createFileSettingsAdapter(
  options: FileSettingsAdapterOptions = {}
): SettingsAdapter {
  const directory = options.directory ?? DEFAULT_DIR;
  const settingsFilename = options.settingsFilename ?? DEFAULT_SETTINGS;
  const redirectsFilename = options.redirectsFilename ?? DEFAULT_REDIRECTS;
  const settingsPath = path.isAbsolute(directory)
    ? path.join(directory, settingsFilename)
    : path.join(process.cwd(), directory, settingsFilename);
  const redirectsPath = path.isAbsolute(directory)
    ? path.join(directory, redirectsFilename)
    : path.join(process.cwd(), directory, redirectsFilename);
  const label = path.isAbsolute(directory)
    ? settingsPath
    : `${directory}/${settingsFilename}`;

  return {
    kind: 'file',
    label,

    async loadSiteSettings(): Promise<PersistableSeoSettings> {
      const stored = await readJsonFile<StoredSettingsFile>(settingsPath);
      const settings = stored?.settings ?? {};

      const redirectsRaw = await readJsonFile<unknown>(redirectsPath);
      if (Array.isArray(redirectsRaw)) {
        settings.redirects = redirectsRaw as PersistableSeoSettings['redirects'];
      }

      return settings;
    },

    async saveSiteSettings(data: PersistableSeoSettings): Promise<void> {
      await ensureDir(path.dirname(settingsPath));

      const { redirects, ...rest } = data;
      const payload: StoredSettingsFile = {
        version: 1,
        settings: rest,
      };

      await writeFile(settingsPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

      if (redirects !== undefined) {
        await writeFile(redirectsPath, `${JSON.stringify(redirects, null, 2)}\n`, 'utf8');
      }
    },
  };
}
