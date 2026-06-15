import React from 'react';
import { getGlobalUsageStats } from '../actions';
import { BarChart3, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminUsagePage() {
  const usageStats = await getGlobalUsageStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kullanım Analitiği (Usage Stats)</h1>
        <p className="text-sm text-gray-500 mt-1">Platform geneli yapılan isteklerin ve kredi tüketim birimlerinin uç nokta (endpoint) dağılımı.</p>
      </div>

      {/* Global Quota Usage Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
          <Database className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Uç Nokta Bazlı Tüketim Logları</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Uç Nokta (API Endpoint)</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Toplam İstek Sayısı</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Harcanan Toplam Birim (Quota Units)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usageStats.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                    Henüz hiçbir API kullanım kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                usageStats.map((stat, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-indigo-600 font-semibold">
                      {stat.endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 font-semibold">
                      {stat.requestCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-900 font-semibold">
                      {stat.totalUnits}
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
