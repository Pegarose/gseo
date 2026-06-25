'use client';

import { useMemo, useState } from 'react';
import { SeoAssistant } from '@seosuite/next/client';
import { Globe, ScanSearch } from 'lucide-react';

interface Props {
  siteId: string;
  domain: string;
}

export default function PageAnalyzer({ siteId, domain }: Props) {
  const [url, setUrl] = useState(`https://${domain}/`);
  const [targetKeyword, setTargetKeyword] = useState(domain.split('.')[0]);

  const scoring = useMemo(
    () => ({
      siteId,
      url,
      targetKeyword,
      pageType: 'generic' as const,
      scoreMode: 'url' as const,
    }),
    [siteId, url, targetKeyword]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ScanSearch className="w-5 h-5 text-indigo-500" />
          Page Analyzer
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Canlı URL taraması — on-page skor, internal link ve içerik önerileri (siteye özel).
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Page URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={`https://${domain}/`}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:w-48">
            <label className="text-xs font-medium text-gray-500 uppercase">Target keyword</label>
            <input
              type="text"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <SeoAssistant
          scoring={scoring}
          apiPath="/api/dashboard/seo/score-url"
          pro={{
            enableInternalLinks: true,
            enableContentAi: true,
            enableKeywords: false,
            linksApiPath: '/api/dashboard/seo/links',
            contentAiApiPath: '/api/dashboard/seo/content-ai',
          }}
        />
      </div>
    </div>
  );
}
