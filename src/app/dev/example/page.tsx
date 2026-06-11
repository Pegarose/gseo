'use client';

import { useState } from 'react';
import { scoreUrlAction } from './actions';

export default function DevExamplePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const res = await scoreUrlAction(url);
    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.error || 'Failed to score URL');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SeoSuite SDK Demo</h1>
          <p className="mt-2 text-sm text-gray-600 bg-yellow-100 p-2 rounded-md border border-yellow-200">
            <strong>Notice:</strong> This route (`/dev/example`) is for internal dogfooding and demonstration purposes only. The API key is securely injected via Server Actions and never exposed to the client bundle.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">URL to Score</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="url"
                  name="url"
                  id="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Scoring...' : 'Score URL'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-md">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Score: {result.finalScore} / 100 ({result.scoreBand})
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Top Issues</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {result.topIssues.length > 0 ? (
                    result.topIssues.map((issue: any, idx: number) => (
                      <li key={idx}><span className="font-semibold">{issue.code}:</span> {issue.title}</li>
                    ))
                  ) : (
                    <li>No critical/high issues found!</li>
                  )}
                </ul>
              </div>
              
              {result.aiVisibility && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">AI Visibility Readiness</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {result.aiVisibility.platformReadiness.map((p: any, idx: number) => (
                      <li key={idx}><strong>{p.platform}:</strong> {p.score}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
