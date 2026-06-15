import React from 'react';
import { getAuditLogs } from './actions';
import { ScrollText, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const logs = await getAuditLogs(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-indigo-600" />
          Audit Logları
        </h1>
        <p className="text-sm text-gray-500 mt-1">Super admin ve API anahtarları tarafından gerçekleştirilen tüm kritik işlemlerin kayıtları.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Zaman</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aksiyon</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aktör</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tenant / Kaynak</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">IP Adresi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-500">
                    Henüz audit kaydı bulunmuyor.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-xs text-gray-500 font-mono">
                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700">
                      {log.actorType === 'api_key' ? 'API Key' : 'User'}: <span className="font-mono text-gray-500">{log.actorId}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-700">
                      {log.tenantId ? <span className="font-mono text-gray-500">{log.tenantId}</span> : '-'}
                      {log.resource && log.resource !== log.tenantId && (
                        <span className="block text-[10px] text-gray-400 mt-0.5">Resource: {log.resource}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">{log.ipAddress || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong>Not:</strong> Audit logları yalnızca yönetimsel işlemleri kapsar. Skorlama istekleri gibi yüksek hacimli operasyonlar QuotaUsage tablosunda izlenir.
        </div>
      </div>
    </div>
  );
}
