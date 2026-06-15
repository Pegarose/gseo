'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  siteId: string;
  domain: string;
}

export default function RunSiteAudit({ siteId, domain }: Props) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleRunAudit = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch(`/api/v1/sites/${siteId}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrl: `https://${domain}`,
          maxPages: 10,
          renderJavascript: false,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus({
          type: 'success',
          message: `Site audit queued. Job ID: ${data.data.crawlJobId}`,
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error?.message || 'Failed to queue site audit.',
        });
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Unexpected error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRunAudit}
        disabled={loading}
        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        Run Site Audit
      </button>

      {status.type === 'success' && (
        <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> {status.message}
        </span>
      )}
      {status.type === 'error' && (
        <span className="inline-flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
          <AlertCircle className="w-3.5 h-3.5" /> {status.message}
        </span>
      )}
    </div>
  );
}
