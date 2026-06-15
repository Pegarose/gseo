import { getSiteDetail } from '../../actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Globe, ArrowLeft, Settings2, BarChart2 } from 'lucide-react';
import RunSiteAudit from './RunSiteAudit';

export const dynamic = 'force-dynamic';

export default async function SiteDetailPage({ params }: { params: { id: string } }) {
  // Await the params object before using its properties in Next.js 15+
  const resolvedParams = await params;
  const site = await getSiteDetail(resolvedParams.id);

  if (!site) {
    return notFound();
  }

  const latestSnapshot = site.snapshots[0];
  const avgScore = site.snapshots.length > 0 
    ? Math.round(site.snapshots.reduce((acc, curr) => acc + curr.finalScore, 0) / site.snapshots.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
        <Link href="/dashboard/sites" className="hover:text-gray-900 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Sites
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Globe className="w-6 h-6 text-indigo-600" />
            {site.name}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <a href={`https://${site.domain}`} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">
              {site.domain}
            </a>
            <span>•</span>
            <span className="capitalize">{site.platform}</span>
            <span>•</span>
            <span>Locale: {site.defaultLocale}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Settings2 className="w-4 h-4" />
            Configure
          </button>
          
          <RunSiteAudit siteId={site.id} domain={site.domain} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Latest Score</dt>
          <dd className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{latestSnapshot ? latestSnapshot.finalScore : '-'}</span>
            {latestSnapshot && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
                ${latestSnapshot.scoreBand === 'excellent' ? 'bg-green-100 text-green-800' : 
                  latestSnapshot.scoreBand === 'good' ? 'bg-blue-100 text-blue-800' : 
                  latestSnapshot.scoreBand === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' : 
                  latestSnapshot.scoreBand === 'poor' ? 'bg-orange-100 text-orange-800' : 
                  'bg-red-100 text-red-800'}`}
              >
                {latestSnapshot.scoreBand.replace('_', ' ')}
              </span>
            )}
          </dd>
        </div>
        
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Historical Average</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">{avgScore || '-'}</dd>
        </div>

        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5">
          <dt className="text-sm font-medium text-gray-500 truncate">Pages Audited</dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">{site.snapshots.length}</dd>
        </div>
      </div>

      {/* Recent Snapshots Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            Audit History
          </h2>
        </div>
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page / URL</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {site.snapshots.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No audits found for this site.
                  </td>
                </tr>
              ) : (
                site.snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-[300px] truncate" title={snapshot.url}>{snapshot.url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 capitalize">{snapshot.pageType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${snapshot.scoreBand === 'excellent' ? 'bg-green-100 text-green-800' : 
                          snapshot.scoreBand === 'good' ? 'bg-blue-100 text-blue-800' : 
                          snapshot.scoreBand === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' : 
                          snapshot.scoreBand === 'poor' ? 'bg-orange-100 text-orange-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {snapshot.finalScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{snapshot.source === 'live_url' ? 'Live URL' : 'Draft Content'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {snapshot.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
