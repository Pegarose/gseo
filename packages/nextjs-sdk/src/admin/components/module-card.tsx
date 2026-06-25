'use client';

import React from 'react';
import { AdminBadge, AdminButton } from './ui';

export interface ModuleCardProps {
  title: string;
  description: string;
  enabled?: boolean;
  tier?: 'free' | 'pro';
  locked?: boolean;
  onToggle?: (enabled: boolean) => void;
  href?: string;
}

export function ModuleCard({
  title,
  description,
  enabled = false,
  tier = 'free',
  locked = false,
  onToggle,
  href,
}: ModuleCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <AdminBadge tone={tier === 'pro' ? 'info' : 'success'}>{tier === 'pro' ? 'Pro' : 'Free'}</AdminBadge>
          </div>
          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>
        {onToggle && !locked ? (
          <label className="inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </label>
        ) : locked ? (
          <AdminBadge tone="warning">Locked</AdminBadge>
        ) : null}
      </div>
      {locked && (
        <p className="mt-3 text-xs text-amber-700">
          Connect <code className="rounded bg-amber-50 px-1">GSEO_API_KEY</code> and an active Pro plan to unlock.
        </p>
      )}
      {href && (
        <div className="mt-4">
          <AdminButton variant="secondary" onClick={() => window.location.assign(href)}>
            Configure
          </AdminButton>
        </div>
      )}
    </div>
  );
}
