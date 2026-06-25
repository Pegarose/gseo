'use client';

import React from 'react';
import { AdminButton } from './ui';

export interface SaveBarProps {
  isDirty: boolean;
  saving: boolean;
  error: string | null;
  persistLabel?: string;
  onSave: () => void;
  onReset: () => void;
}

export function SaveBar({
  isDirty,
  saving,
  error,
  persistLabel,
  onSave,
  onReset,
}: SaveBarProps) {
  if (!isDirty && !error && !saving) {
    return null;
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-4 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            <>
              Unsaved changes
              {persistLabel ? (
                <>
                  {' '}
                  — saves to <code className="rounded bg-gray-100 px-1 text-xs">{persistLabel}</code>
                </>
              ) : null}
            </>
          )}
        </div>
        <div className="flex gap-2">
          <AdminButton variant="secondary" onClick={onReset} disabled={saving || !isDirty}>
            Reset
          </AdminButton>
          <AdminButton onClick={onSave} disabled={saving || !isDirty}>
            {saving ? 'Saving…' : 'Save changes'}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
