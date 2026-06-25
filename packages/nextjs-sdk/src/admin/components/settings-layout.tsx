'use client';

import React, { useState } from 'react';

export interface SettingsTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

export function SettingsLayout({ tabs, defaultTab }: { tabs: SettingsTab[]; defaultTab?: string }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`shrink-0 border-b-2 px-1 pb-3 text-sm font-medium transition-colors ${
                active === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
