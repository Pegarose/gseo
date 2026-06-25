import { createDatabaseSettingsAdapter } from './database-adapter';
import type { PersistableSeoSettings, SettingsAdapter } from './types';

export interface PrismaSeoSettingsRecord {
  id: number | string;
  data: unknown;
}

export interface PrismaSettingsAdapterOptions<TRecord extends PrismaSeoSettingsRecord> {
  label?: string;
  find: () => Promise<TRecord | null>;
  upsert: (data: Record<string, unknown>) => Promise<void>;
  parse?: (row: TRecord) => Record<string, unknown>;
}

/** Prisma helper for headless CMS site-wide SEO settings (EfesusStone pattern). */
export function createPrismaSettingsAdapter<TRecord extends PrismaSeoSettingsRecord>(
  options: PrismaSettingsAdapterOptions<TRecord>
): SettingsAdapter {
  return createDatabaseSettingsAdapter({
    label: options.label ?? 'PostgreSQL (Prisma)',
    loadSiteSettings: async (): Promise<PersistableSeoSettings> => {
      const row = await options.find();
      if (!row) return {};
      return (options.parse ? options.parse(row) : row.data) as PersistableSeoSettings;
    },
    saveSiteSettings: async (data) => {
      await options.upsert(data as Record<string, unknown>);
    },
  });
}
