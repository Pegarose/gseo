'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Globe, Sparkles, BarChart3 } from 'lucide-react';

const groups = [
  {
    label: 'Search Console',
    icon: BarChart3,
    items: [{ name: 'GSC Dashboard', href: '/dashboard/intelligence/gsc' }],
  },
  {
    label: 'Keywords',
    icon: Search,
    items: [
      { name: 'Keyword Explorer', href: '/dashboard/intelligence/keywords' },
      { name: 'Rank Tracking', href: '/dashboard/intelligence/rank-tracking', soon: true },
    ],
  },
  {
    label: 'Domain',
    icon: Globe,
    items: [
      { name: 'Domain Overview', href: '/dashboard/intelligence/domain', soon: true },
      { name: 'Backlinks', href: '/dashboard/intelligence/backlinks', soon: true },
    ],
  },
  {
    label: 'AI Visibility',
    icon: Sparkles,
    items: [{ name: 'Brand Lookup', href: '/dashboard/intelligence/brand', soon: true }],
  },
] as const;

type Props = {
  showSeoCrawlGsc?: boolean;
};

export default function IntelligenceNav({ showSeoCrawlGsc = false }: Props) {
  const pathname = usePathname();

  const visibleGroups = groups.filter((group) => {
    if (group.label === 'Search Console') return showSeoCrawlGsc;
    return true;
  });

  return (
    <div className="space-y-6 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Intelligence</h1>
        <p className="mt-1 text-sm text-gray-500">
          OpenSEO / Semrush tarzı platform araştırması — site yönetiminden ayrı (Faz 2).
        </p>
      </div>

      <nav className="flex flex-wrap gap-x-4 gap-y-2 border-b border-gray-200 pb-3">
        {visibleGroups.map((group) => (
          <div key={group.label} className="flex flex-wrap items-center gap-1">
            <group.icon className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
              {group.label}
            </span>
            {group.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const soon = 'soon' in item && item.soon;
              if (soon) {
                return (
                  <span
                    key={item.href}
                    className="px-2 py-1 rounded-lg text-sm text-gray-400 cursor-not-allowed"
                  >
                    {item.name}
                  </span>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-2 py-1 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
