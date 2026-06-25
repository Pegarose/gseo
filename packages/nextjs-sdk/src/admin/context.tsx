'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminConfigSnapshot } from './types';

export interface AdminPersistState {
  label: string;
  isDirty: boolean;
  saving: boolean;
  error: string | null;
  save: () => Promise<void>;
  reset: () => void;
  update: (patch: Partial<AdminConfigSnapshot>) => void;
}

interface AdminContextValue {
  config: AdminConfigSnapshot;
  basePath: string;
  persist: AdminPersistState | null;
}

const AdminContext = createContext<AdminContextValue | null>(null);

function snapshotsEqual(a: AdminConfigSnapshot, b: AdminConfigSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface AdminConfigProviderProps {
  config: AdminConfigSnapshot;
  basePath?: string;
  saveUrl?: string;
  persistLabel?: string;
  children: React.ReactNode;
}

export function AdminConfigProvider({
  config: initialConfig,
  basePath = '/admin/seo',
  saveUrl,
  persistLabel,
  children,
}: AdminConfigProviderProps) {
  const router = useRouter();
  const [config, setConfig] = useState(initialConfig);
  const [savedConfig, setSavedConfig] = useState(initialConfig);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = !snapshotsEqual(config, savedConfig);

  const update = useCallback((patch: Partial<AdminConfigSnapshot>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setConfig(savedConfig);
    setError(null);
  }, [savedConfig]);

  const save = useCallback(async () => {
    if (!saveUrl) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(saveUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? `Save failed (${response.status})`);
      }

      const payload = (await response.json()) as { config: AdminConfigSnapshot };
      setConfig(payload.config);
      setSavedConfig(payload.config);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [config, saveUrl, router]);

  const persist = useMemo<AdminPersistState | null>(() => {
    if (!saveUrl) return null;

    return {
      label: persistLabel ?? saveUrl,
      isDirty,
      saving,
      error,
      save,
      reset,
      update,
    };
  }, [saveUrl, persistLabel, isDirty, saving, error, save, reset, update]);

  const value = useMemo(
    () => ({
      config,
      basePath,
      persist,
    }),
    [config, basePath, persist]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminConfig(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error('[@seosuite/next/admin] useAdminConfig must be used within SeoAdminLayout');
  }
  return ctx;
}

export function useAdminPersist(): AdminPersistState {
  const { persist } = useAdminConfig();
  if (!persist) {
    throw new Error(
      '[@seosuite/next/admin] Persistence is disabled. Pass saveUrl to SeoAdminLayout to enable Save.'
    );
  }
  return persist;
}
