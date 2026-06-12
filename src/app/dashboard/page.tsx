import { getOverviewMetrics, getTopIssues } from './actions';
import Link from 'next/link';
import { 
  AlertCircle, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  Brain, 
  Zap, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles,
  Clock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardOverviewPage() {
  const metrics = await getOverviewMetrics();
  const topIssues = await getTopIssues();

  // AI Credits calculations
  const aiCredits = metrics.aiCredits;
  const limit = aiCredits?.limit;
  const used = aiCredits?.used ?? 0;

  let limitDisplay = '';
  let percentage = 0;
  let hasLimit = false;

  if (!aiCredits || aiCredits.used === undefined) {
    limitDisplay = 'Kota bilgisi yok';
    percentage = 0;
  } else if (limit === undefined || limit === null) {
    limitDisplay = 'Kota tanımlanmadı';
    percentage = 0;
  } else if (limit === -1 || limit === 999999) { // representation for unlimited
    limitDisplay = 'Sınırsız';
    percentage = 0;
  } else if (limit === 0) {
    limitDisplay = 'Sınırsız';
    percentage = 0;
  } else {
    limitDisplay = limit.toString();
    percentage = Math.round((used / limit) * 100);
    hasLimit = true;
  }

  // Status evaluation for credits progress bar
  let creditStatus = 'normal'; // 'normal', 'warning', 'critical'
  if (hasLimit) {
    if (percentage >= 100) {
      creditStatus = 'critical';
    } else if (percentage >= 80) {
      creditStatus = 'warning';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Genel Bakış</h1>
          <p className="text-sm text-gray-500 mt-1">Sitelerinizin güncel durumu ve yapay zeka analiz raporları.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg w-fit">
          <Clock className="w-3.5 h-3.5" />
          <span>Son güncelleme: {new Date().toLocaleString('tr-TR')}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Riskli Siteler */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${metrics.sitesAtRisk > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">Riskli Siteler</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.sitesAtRisk}</p>
              <p className="text-xs text-gray-400 mt-1">Skoru 60 altı veya kritik hata barındıranlar</p>
            </div>
          </div>
        </div>

        {/* Kritik Hatalar */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${metrics.totalCriticalIssues > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'}`}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">Kritik Hatalar</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCriticalIssues}</p>
              <p className="text-xs text-gray-400 mt-1">Acil çözüm gerektiren kritik SEO sorunları</p>
            </div>
          </div>
        </div>

        {/* AI Readiness Düşük */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5 flex items-start">
            <div className={`flex-shrink-0 p-3 rounded-lg ${metrics.lowAiReadinessCount > 0 ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-400'}`}>
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-500 truncate">AI Readiness Düşük</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.lowAiReadinessCount}</p>
              <p className="text-xs text-gray-400 mt-1">Skoru 50 altı olan yapay zeka hazır sayfaları</p>
            </div>
          </div>
        </div>

        {/* Aylık AI Analiz Kredisi */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
          <div className="p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-500 truncate">Aylık AI Analiz Kredisi</span>
                <div className="relative group inline-block">
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-pointer align-middle" />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-xs rounded p-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 text-left leading-relaxed">
                    Bu kredi semantic içerik analizi, AI readiness ve provider destekli öneriler için kullanılır.
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
              <Brain className={`h-5 w-5 ${
                creditStatus === 'critical' ? 'text-red-500' : 
                creditStatus === 'warning' ? 'text-amber-500' : 'text-indigo-500'
              }`} />
            </div>
            
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-2xl font-bold ${
                creditStatus === 'critical' ? 'text-red-600' : 
                creditStatus === 'warning' ? 'text-amber-600' : 'text-gray-900'
              }`}>
                {used} <span className="text-sm font-normal text-gray-400">/ {limitDisplay}</span>
              </span>
              {hasLimit && (
                <span className="text-xs text-gray-400 font-medium">{percentage}% kullanıldı</span>
              )}
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  creditStatus === 'critical' ? 'bg-red-600' : 
                  creditStatus === 'warning' ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${hasLimit ? Math.min(percentage, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Actions and Audits */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Müdahale Bekleyen Siteler */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Müdahale Bekleyen Siteler
              </h2>
            </div>
            <div className="p-5 flex-1">
              {metrics.sitesNeedingAttention.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8 flex flex-col items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                  <p className="font-medium text-gray-900">Harika! Müdahale bekleyen riskli site bulunmuyor.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 px-2">Site Adı</th>
                        <th className="pb-3 px-2 text-center">En Son Skor</th>
                        <th className="pb-3 px-2 text-center">Kritik Hatalar</th>
                        <th className="pb-3 px-2"></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {metrics.sitesNeedingAttention.map((site) => (
                        <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="text-sm font-semibold text-gray-900">{site.name}</div>
                            <div className="text-xs text-gray-500">{site.domain}</div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              site.latestScore < 60 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {site.latestScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-sm font-bold text-red-600">
                              {site.criticalIssueCount} Kritik
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Link 
                              href={`/dashboard/sites/${site.id}`} 
                              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-0.5"
                            >
                              Detaylar <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Hızlı Kazanımlar (Quick Wins) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Hızlı Kazanımlar (Quick Wins)
              </h2>
            </div>
            <div className="p-5 flex-1">
              {metrics.quickWins.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">
                  Şu an için hızlı kazanım önerisi bulunmuyor.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 space-y-1">
                  {metrics.quickWins.map((win) => (
                    <li key={win.id} className="py-3 hover:bg-gray-50 transition-colors px-2 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{win.title}</p>
                          <p className="text-xs text-gray-500 truncate" title={win.scoreSnapshot?.url}>
                            {win.scoreSnapshot?.url}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {win.scoreSnapshot?.site?.domain}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            Düşük Efor
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            win.estimatedImpact === 'high' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {win.estimatedImpact === 'high' ? 'Yüksek Etki' : 'Orta Etki'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Son Denetimler (Recent Audits) */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Son Denetimler</h2>
              <Link href="/dashboard/sites" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                Tümünü gör <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">URL / Sayfa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Site</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Skor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.recentAudits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                        Denetim kaydı bulunamadı. Lütfen yeni bir test başlatın.
                      </td>
                    </tr>
                  ) : (
                    metrics.recentAudits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 max-w-[200px] truncate" title={audit.url}>{audit.url}</div>
                          <div className="text-xs text-gray-500 capitalize">{audit.pageType} • {audit.platform}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {audit.site?.domain || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${audit.scoreBand === 'excellent' ? 'bg-green-100 text-green-800' : 
                              audit.scoreBand === 'good' ? 'bg-blue-100 text-blue-800' : 
                              audit.scoreBand === 'needs_improvement' ? 'bg-yellow-100 text-yellow-800' : 
                              audit.scoreBand === 'poor' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'}`}
                          >
                            {audit.finalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(audit.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Aggregate Issues */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                En Sık Yaşanan Kritik Hatalar
              </h2>
            </div>
            <div className="p-5 flex-1">
              {topIssues.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-8">
                  Kritik hata tespit edilmedi. Harika!
                </div>
              ) : (
                <ul className="space-y-4">
                  {topIssues.map((issue) => (
                    <li key={issue.code} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${issue.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`} />
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 leading-tight">{issue.title}</p>
                        <div className="flex items-center mt-1.5 text-xs text-gray-500">
                          <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px] mr-2 text-gray-600">{issue.code}</span>
                          <span>{issue.count} sayfayı etkiliyor</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
