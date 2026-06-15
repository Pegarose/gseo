import React from 'react';
import { getSystemOverview } from '../actions';
import { ShieldAlert, Info, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminSystemPage() {
  const stats = await getSystemOverview();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-600" />
          Sistem Durumu ve Limit Aşım Logları
        </h1>
        <p className="text-sm text-gray-500 mt-1">Platform genelinde engellenen aşırı yük istekleri (429) ve müşteri istemci versiyonu dağılımları.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Rate Limit Hits */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">En Son Limit Aşım Logları (Rate Limit Hits)</h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tenant ID</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Uç Nokta</th>
                  <th scope="col" className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Aşım Sayısı</th>
                  <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Son Aşım Zamanı</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.rateLimitHits.map((hit, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{hit.tenantId}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600 font-semibold">{hit.endpoint}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                        {hit.count} Engelleme
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs font-mono">
                      {new Date(hit.lastHitAt).toLocaleString('tr-TR')}
                    </td>
                  </tr>
                ))}
                {stats.rateLimitHits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-gray-400">
                      Son 24 saatte kaydedilmiş limit aşımı bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Plugin versions */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Info className="w-5 h-5 text-indigo-600" />
            <h2 className="text-md font-bold text-gray-900">CMS Eklenti Dağılımı</h2>
          </div>
          <p className="text-xs text-gray-500">Müşterilerin sitelerine kurduğu GSeoSuite WordPress eklentileri ve Next.js SDK versiyon dağılım oranları.</p>

          <ul className="space-y-4 pt-2">
            {stats.pluginVersions.map((plug, index) => {
              const total = stats.pluginVersions.reduce((sum, p) => sum + p.count, 0);
              const percentage = total > 0 ? Math.round((plug.count / total) * 100) : 0;
              return (
                <li key={index} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-gray-700">
                    <span>{plug.version}</span>
                    <span className="font-bold">{plug.count} Site ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {stats.pluginVersions.length === 0 && (
              <li className="text-sm text-gray-400">Henüz kaydedilmiş eklenti versiyonu yok.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
