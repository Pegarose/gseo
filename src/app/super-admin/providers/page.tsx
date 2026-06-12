import React from 'react';
import { getProviderHealth } from '../actions';
import { Cpu, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminProvidersPage() {
  const providers = await getProviderHealth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API Sağlayıcıları ve Sağlık Durumu</h1>
        <p className="text-sm text-gray-500 mt-1">Platform genelinde kullanılan master API anahtarlarının ve harici sağlayıcı bağlantılarının güncel durumu.</p>
      </div>

      {/* Health Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => (
          <div key={p.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded inline-block">Provider: {p.id}</p>
                </div>
                <div className="flex-shrink-0">
                  {p.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> Devre Dışı
                    </span>
                  )}
                </div>
              </div>

              {/* Endpoint Detail */}
              <div className="text-sm space-y-1.5 pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-400 font-semibold uppercase">API Bağlantı Adresi</div>
                <code className="block text-xs bg-gray-50 p-2 rounded text-indigo-600 font-mono truncate">{p.endpoint}</code>
              </div>

              {/* Masked Secret Key */}
              <div className="text-sm space-y-1.5">
                <div className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-gray-400" /> Maskeli API Anahtarı
                </div>
                <code className="block text-xs bg-slate-900 text-slate-300 p-2 rounded font-mono select-none">
                  {p.maskedKey}
                </code>
              </div>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-150 text-[10px] text-gray-400 font-mono">
              Son Kontrol: {new Date(p.lastChecked).toLocaleString('tr-TR')}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <strong>Güvenlik Sınırı:</strong> API anahtarlarının plain-text olarak değiştirilmesi veya arayüzde gösterilmesi MVP kapsamında desteklenmemektedir. Anahtarları güncellemek için sunucu ortam değişkenlerindeki (`NEURONWRITER_API_KEY`, `PAGESPEED_API_KEY`) parametreleri güncelleyip Next.js uygulamasını yeniden başlatın.
        </div>
      </div>
    </div>
  );
}
