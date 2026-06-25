'use client';

import { Coins, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

type LedgerEntry = {
  id: string;
  tenantId: string;
  featureKey: string;
  provider: string | null;
  providerCost: number;
  sellCredits: number;
  cached: boolean;
  createdAt: Date;
  tenant: { name: string; slug: string };
};

type PricingRow = {
  featureKey: string;
  label: string;
  category: string;
  provider: string;
  providerCostCredits: number;
  sellCredits: number;
};

type TenantTotal = {
  id: string;
  name: string;
  slug: string;
  aiCreditUsed: number;
  aiCreditLimit: number;
};

interface Props {
  data: {
    entries: LedgerEntry[];
    byFeature: Array<{
      featureKey: string;
      _sum: { sellCredits: number | null; providerCost: number | null };
      _count: number;
    }>;
    totalSell: number;
    totalCost: number;
    providerCostTotal: number;
    revenueTotal: number;
    pricing: PricingRow[];
    tenantTotals: TenantTotal[];
  };
}

export default function CreditLedgerReport({ data }: Props) {
  const { entries, byFeature, providerCostTotal, revenueTotal, pricing, tenantTotals } = data;
  const margin = providerCostTotal > 0 ? revenueTotal / providerCostTotal : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard icon={DollarSign} label="Sağlayıcı Maliyeti" value={`${providerCostTotal}`} color="text-red-600" />
        <KpiCard icon={Coins} label="Müşteri Geliri (kredi)" value={`${revenueTotal}`} color="text-green-600" />
        <KpiCard
          icon={TrendingUp}
          label="Ortalama Kar Marjı"
          value={providerCostTotal > 0 ? `×${margin.toFixed(1)}` : '—'}
          color="text-indigo-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-500" />
          Özellik Bazında Kazanç
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Özellik</th>
                <th className="px-4 py-2 text-left">Sağlayıcı</th>
                <th className="px-4 py-2 text-right">Kullanım</th>
                <th className="px-4 py-2 text-right">Maliyet</th>
                <th className="px-4 py-2 text-right">Gelir</th>
                <th className="px-4 py-2 text-right">Marj</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {byFeature.map((row) => {
                const price = pricing.find((p) => p.featureKey === row.featureKey);
                const cost = row._sum.providerCost ?? 0;
                const rev = row._sum.sellCredits ?? 0;
                const m = cost > 0 ? rev / cost : 0;
                return (
                  <tr key={row.featureKey} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {price?.label ?? row.featureKey}
                    </td>
                    <td className="px-4 py-2 capitalize text-gray-600">{price?.provider ?? '—'}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{row._count}</td>
                    <td className="px-4 py-2 text-right text-red-600">{cost}</td>
                    <td className="px-4 py-2 text-right text-green-600">{rev}</td>
                    <td className="px-4 py-2 text-right text-indigo-600">
                      {cost > 0 ? `×${m.toFixed(1)}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">Kiracı Bakiyeleri</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 text-left">Kiracı</th>
                <th className="px-4 py-2 text-right">Kullanılan</th>
                <th className="px-4 py-2 text-right">Limit</th>
                <th className="px-4 py-2 text-right">Kalan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenantTotals.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{t.aiCreditUsed}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{t.aiCreditLimit || '∞'}</td>
                  <td className="px-4 py-2 text-right text-gray-900">
                    {t.aiCreditLimit > 0 ? t.aiCreditLimit - t.aiCreditUsed : '∞'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900">Son İşlemler</div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Tarih</th>
                <th className="px-4 py-2 text-left">Kiracı</th>
                <th className="px-4 py-2 text-left">Özellik</th>
                <th className="px-4 py-2 text-right">Maliyet</th>
                <th className="px-4 py-2 text-right">Tahsilat</th>
                <th className="px-4 py-2 text-center">Cache</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-500 text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{e.tenant.name}</td>
                  <td className="px-4 py-2 text-gray-600">{e.featureKey}</td>
                  <td className="px-4 py-2 text-right text-red-600">{e.providerCost}</td>
                  <td className="px-4 py-2 text-right text-green-600">{e.sellCredits}</td>
                  <td className="px-4 py-2 text-center text-xs text-gray-400">{e.cached ? 'Evet' : 'Hayır'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg bg-gray-50 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs font-semibold text-gray-500 uppercase">{label}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
