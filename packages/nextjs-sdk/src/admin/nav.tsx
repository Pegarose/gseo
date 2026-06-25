'use client';

import React from 'react';
import type { AdminNavIcon } from './types';

export function getAdminNavItems(basePath: string) {
  return [
    { href: basePath, label: 'Dashboard', description: 'SEO overview and quick links', icon: 'dashboard' as AdminNavIcon },
    { href: `${basePath}/modules`, label: 'Modules', description: 'Enable SEO feature modules', icon: 'modules' as AdminNavIcon },
    { href: `${basePath}/general`, label: 'General', description: 'Site identity and global defaults', icon: 'general' as AdminNavIcon },
    { href: `${basePath}/titles`, label: 'Titles & Meta', description: 'Title and description templates', icon: 'titles' as AdminNavIcon },
    { href: `${basePath}/sitemap`, label: 'Sitemap', description: 'Sitemap rules and preview', icon: 'sitemap' as AdminNavIcon },
    { href: `${basePath}/redirects`, label: 'Redirections', description: 'Manage URL redirects', icon: 'redirects' as AdminNavIcon },
    { href: `${basePath}/schema`, label: 'Schema', description: 'Structured data types and preview', icon: 'schema' as AdminNavIcon },
    { href: `${basePath}/analysis`, label: 'SEO Analysis', description: 'Local technical checklist', icon: 'analysis' as AdminNavIcon },
    { href: `${basePath}/indexing`, label: 'Instant Indexing', description: 'IndexNow submissions', icon: 'indexing' as AdminNavIcon },
    { href: `${basePath}/tools`, label: 'Tools', description: 'Import/export and status', icon: 'tools' as AdminNavIcon },
  ];
}

export function NavIcon({ icon }: { icon: AdminNavIcon }) {
  const paths: Record<AdminNavIcon, React.ReactNode> = {
    dashboard: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
    ),
    modules: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    ),
    general: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
    titles: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-6 4h10M5 6a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6z" />
    ),
    sitemap: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    ),
    redirects: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    ),
    schema: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm8 3v6m-3-3h6" />
    ),
    analysis: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6m4 6V7m4 10v-4M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
    ),
    tools: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4h2v3h3v2h-3v3h-2v-3H8V7h3V4zM5 20h14a1 1 0 001-1v-5h-2v4H6v-4H4v5a1 1 0 001 1z" />
    ),
    indexing: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  };

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {paths[icon]}
    </svg>
  );
}
