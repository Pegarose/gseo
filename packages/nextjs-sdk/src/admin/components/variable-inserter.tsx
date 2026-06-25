'use client';

import React from 'react';

const TOKENS = [
  '%title%',
  '%sep%',
  '%sitename%',
  '%excerpt%',
  '%date%',
  '%category%',
  '%tag%',
  '%author%',
  '%page%',
  '%currentyear%',
];

export function VariableInserter({ onInsert }: { onInsert: (token: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TOKENS.map((token) => (
        <button
          key={token}
          type="button"
          onClick={() => onInsert(token)}
          className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        >
          {token}
        </button>
      ))}
    </div>
  );
}
