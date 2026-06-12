'use client';

import React, { useState } from 'react';
import { syncTenantCredits } from '../../actions';
import { RefreshCw, CheckCircle2, AlertCircle, Brain } from 'lucide-react';

interface Props {
  tenantId: string;
  initialUsed: number;
  limit: number;
}

export default function TenantCreditSync({ tenantId, initialUsed, limit }: Props) {
  const [used, setUsed] = useState(initialUsed);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const handleSync = async () => {
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const result = await syncTenantCredits(tenantId);
      if (result.success) {
        setUsed(result.aiCreditUsed);
        setStatus({
          type: 'success',
          message: `Kredi kullanımı güncel QuotaUsage kayıtlarına göre yeniden hesaplandı: ${result.aiCreditUsed} kredi kullanıldı.`,
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Krediler eşitlenirken bir hata oluştu.',
      });
    } finally {
      setLoading(false);
    }
  };

  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isOverLimit = limit > 0 && used >= limit;
  const isNearLimit = limit > 0 && used >= limit * 0.8;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
      <h3 className="font-bold text-gray-900 text-md pb-2 border-b border-gray-100 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" />
        AI Kredi Durumu & Eşitleme
      </h3>

      {status.type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>{status.message}</span>
        </div>
      )}
      {status.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex gap-2.5 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">Bu Ay Tüketilen Kredi</span>
          <span className="font-bold text-gray-900">
            {used} / {limit === 0 ? 'Sınırsız' : `${limit} Kredi`}
          </span>
        </div>

        {limit > 0 && (
          <div className="space-y-1">
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isOverLimit ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>%0</span>
              <span>%{percentage}</span>
              <span>%100</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-between items-center gap-4">
          <p className="text-xs text-gray-400 leading-normal">
            Kullanım miktarı her denetimde (score/url, score/content) otomatik artar. Veritabanındaki QuotaUsage detaylarıyla eşitsizlik varsa yeniden hesaplatabilirsiniz.
          </p>
          <button
            onClick={handleSync}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-300 shadow-sm font-semibold text-xs py-2 px-3.5 rounded-lg transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            {loading ? 'Hesaplanıyor...' : 'Kredileri Sync Et'}
          </button>
        </div>
      </div>
    </div>
  );
}
