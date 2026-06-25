import { getAiVisibilityOverview } from '../actions';
import { listTenantSitesForIntel } from '../vebapi-actions';
import AiCrawlerPanel from './AiCrawlerPanel';
import { isVebApiConfigured } from '@/lib/providers/vebapi/service';
import { Sparkles, Info, AlertTriangle, FileText, HelpCircle, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AiVisibilityPage() {
  const data = await getAiVisibilityOverview();
  const sites = await listTenantSitesForIntel();
  const vebApiEnabled = isVebApiConfigured();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          AI Visibility Readiness
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Track how prepared your content is for LLM-based search engines using semantic and structural signals.
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 shadow-sm">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          AI Visibility metrics are readiness indicators based on content structure, entity clarity and citation-friendly formatting. They do not guarantee visibility or citations in AI platforms.
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Missing Answer Blocks */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${data.missingAnswerBlocks > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <HelpCircle className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-gray-500 truncate">Missing Answer Blocks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.missingAnswerBlocks}</p>
              <p className="text-xs text-gray-400 mt-1">Lacking direct Q&A / FAQ sections</p>
            </div>
          </div>
        </div>

        {/* Weak Citation Readiness */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${data.weakCitationReadiness > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <Info className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-gray-500 truncate">Weak Citation Readiness</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.weakCitationReadiness}</p>
              <p className="text-xs text-gray-400 mt-1">Lacking structured citation styles</p>
            </div>
          </div>
        </div>

        {/* Entity Clarity Issues */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${data.entityClarityIssues > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-gray-500 truncate">Entity Clarity Issues</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.entityClarityIssues}</p>
              <p className="text-xs text-gray-400 mt-1">Ambiguous or undefined semantic entities</p>
            </div>
          </div>
        </div>

        {/* Low AI Readiness Pages */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${data.lowAiReadinessPages > 0 ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-semibold text-gray-500 truncate">Low AI Readiness Pages</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.lowAiReadinessPages}</p>
              <p className="text-xs text-gray-400 mt-1">Pages with overall AI readiness &lt; 50</p>
            </div>
          </div>
        </div>
      </div>

      <AiCrawlerPanel sites={sites} vebApiEnabled={vebApiEnabled} />

      {/* Pages Needing AI Readiness Work */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Pages Needing AI Readiness Work
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">URL</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Weakness</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Suggested action</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Experimental</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last analyzed</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.pagesNeedingWork.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                      <span className="font-medium text-gray-900">Good news! No pages need urgent AI readiness work.</span>
                      <span>All of your scanned pages score 50 or higher in AI readiness.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.pagesNeedingWork.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 max-w-[240px] truncate" title={page.url}>
                        {page.url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                        {page.aiScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {page.mainWeakness}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {page.suggestedAction}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        Experimental
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {new Date(page.lastAnalyzed).toLocaleDateString('en-US')}
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
