'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AdminConfigProvider, useAdminConfig } from './context';
import { SaveBar } from './components/save-bar';
import { getAdminNavItems, NavIcon } from './nav';
import type { AdminConfigSnapshot } from './types';

export interface SeoAdminLayoutProps {
  config: AdminConfigSnapshot;
  basePath?: string;
  /** When set, admin forms can persist via PUT to this URL. */
  saveUrl?: string;
  /** Shown in SaveBar — e.g. ".seosuite/settings.json" */
  persistLabel?: string;
  children: React.ReactNode;
}

function AdminSaveBarInner() {
  const { persist } = useAdminConfig();
  if (!persist) return null;

  return (
    <SaveBar
      isDirty={persist.isDirty}
      saving={persist.saving}
      error={persist.error}
      persistLabel={persist.label}
      onSave={persist.save}
      onReset={persist.reset}
    />
  );
}

export function SeoAdminLayout({
  config,
  basePath = '/admin/seo',
  saveUrl,
  persistLabel,
  children,
}: SeoAdminLayoutProps) {
  const pathname = usePathname();
  const navItems = getAdminNavItems(basePath);

  return (
    <AdminConfigProvider
      config={config}
      basePath={basePath}
      saveUrl={saveUrl}
      persistLabel={persistLabel}
    >
      <div className="min-h-screen bg-gray-50">
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                G
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">GSeoSuite</p>
                <p className="text-xs text-gray-500">{config.siteName}</p>
              </div>
            </div>
            <a
              href={config.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View site →
            </a>
          </div>
        </header>

        <nav className="border-b border-gray-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== basePath && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <aside className="hidden w-56 shrink-0 lg:block">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== basePath && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? 'bg-indigo-50 font-medium text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <NavIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0 flex-1 space-y-6">
            {children}
            <AdminSaveBarInner />
          </main>
        </div>
      </div>
    </AdminConfigProvider>
  );
}
