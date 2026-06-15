import React from 'react';
import { getPerformanceMetrics } from './actions';
import { Activity, Timer, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PerformanceMetricsPage() {
  const metrics = await getPerformanceMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600" />
          Performans Metrikleri
        </h1>
        <p className="text-sm text-gray-500 mt-1">Sunucu yanıt süreleri ve hata oranları.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600"><Timer className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Ortalama Latency</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.averageLatencyMs)} ms</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-lg text-red-600"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Hata Oranı</p>
            <p className="text-2xl font-bold text-gray-900">{Math.round(metrics.errorRate * 100)}%</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Son İstek</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.recent.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Endpoint</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Süre (ms)</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Zaman</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {metrics.recent.map((m, i) => (
              <tr key={i}>
                <td className="px-5 py-3 font-mono text-xs text-gray-600">{m.endpoint}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${m.statusCode >= 500 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {m.statusCode}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-gray-700">{m.durationMs} ms</td>
                <td className="px-5 py-3 text-right text-xs text-gray-400">{new Date(m.timestamp).toLocaleTimeString('tr-TR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
