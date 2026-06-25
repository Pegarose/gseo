'use client';

import React from 'react';

export function SerpPreview({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-400">Google preview</p>
      <p className="mt-2 text-lg text-indigo-700 hover:underline">{title}</p>
      <p className="text-sm text-emerald-700">{url}</p>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}
