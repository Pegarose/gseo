'use client';

import { useState, useTransition } from 'react';
import { Coins, RefreshCw, Save, Info, TrendingUp, DollarSign } from 'lucide-react';
import {
  saveCreditMarkupMultiplier,
  saveCreditFeaturePricing,
  resetAllCreditPricing,
} from './actions';

type FeatureRow = {
  id: string;
  featureKey: string;
  label: string;
  category: string;
  provider: string;
  providerCostCredits: number;
  sellCredits: number;
  useAutoMarkup: boolean;
  enabled: boolean;
  description: string | null;
};

interface Props {
  initialMarkup: number;
  initialFeatures: FeatureRow[];
}

export default function CreditPricingEditor({ initialMarkup, initialFeatures }: Props) {
  const [markup, setMarkup] = useState(initialMarkup);
  const [features, setFeatures] = useState(initialFeatures);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const saveMarkup = () => {
    startTransition(async () => {
      setMessage(null);
      try {
        await saveCreditMarkupMultiplier(markup);
        setMessage('Markup güncellendi; otomatik fiyatlı özellikler yeniden hesaplandı.');
        window.location.reload();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Markup kaydedilemedi.');
      }
    });
  };

  const saveFeature = (featureKey: string, patch: Partial<FeatureRow>) => {
    startTransition(async () => {
      setMessage(null);
      try {
        const updated = await saveCreditFeaturePricing(featureKey, {
          providerCostCredits: patch.providerCostCredits,
          sellCredits: patch.sellCredits,
          useAutoMarkup: patch.useAutoMarkup,
          enabled: patch.enabled,
        });
        setFeatures((prev) =>
          prev.map((f) => (f.featureKey === featureKey ? { ...f, ...updated } : f))
        );
        setMessage(`${updated.label} kaydedildi.`);
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Kayıt başarısız.');
      }
    });
  };

  const resetDefaults = () => {
    if (!confirm('Tüm fiyatları varsayılana döndürmek istediğinize emin misiniz?')) return;
    startTransition(async () => {
      await resetAllCreditPricing();
      window.location.reload();
    });
  };

  const execution = features.filter((f) => f.category === 'execution');
  const intelligence = features.filter((f) => f.category === 'intelligence');

  const totalCost = features.reduce((s, f) => s + f.providerCostCredits, 0);
  const totalSell = features.reduce((s, f) => s + f.sellCredits, 0);
  const effectiveMargin = totalCost > 0 ? totalSell / totalCost : 0;

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-900">
        <Info className="w-5 h-5 flex-shrink-0" />
        <div>
          <strong>Fiyatlandırma modeli:</strong> Sağlayıcı maliyeti (VebAPI, DomainDetailer vb.) × markup
          = müşteriye yansıyan kredi. Varsayılan markup <strong>×{markup}</strong>. Önbellek hit → 0 kredi.
          Super admin hem sağlayıcı maliyetini hem satış kredisini hem de otomatik markup’ı tek tek ayarlayabilir.
        </div>
      </div>

      {message && (
        <p className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Toplam Sağlayıcı Maliyeti"
          value={`${totalCost} kredi`}
          color="text-red-600"
        />
        <KpiCard
          icon={Coins}
          label="Toplam Satış Fiyatı"
          value={`${totalSell} kredi`}
          color="text-green-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="Etkin Kar Marjı"
          value={totalCost > 0 ? `×${effectiveMargin.toFixed(1)}` : '—'}
          color="text-indigo-600"
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
            Global Markup Çarpanı
          </label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={markup}
            onChange={(e) => setMarkup(parseFloat(e.target.value) || 10)}
            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={saveMarkup}
          disabled={pending}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          Markup Kaydet
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          disabled={pending}
          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Varsayılana Dön
        </button>
      </div>

      <FeatureTable
        title="Site İçi (Execution)"
        rows={execution}
        markup={markup}
        pending={pending}
        onSave={saveFeature}
      />
      <FeatureTable
        title="Platform Intelligence"
        rows={intelligence}
        markup={markup}
        pending={pending}
        onSave={saveFeature}
      />
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

function FeatureTable({
  title,
  rows,
  markup,
  pending,
  onSave,
}: {
  title: string;
  rows: FeatureRow[];
  markup: number;
  pending: boolean;
  onSave: (key: string, patch: Partial<FeatureRow>) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
        <Coins className="w-4 h-4 text-indigo-500" />
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2 text-left">Özellik</th>
              <th className="px-4 py-2 text-left">Sağlayıcı</th>
              <th className="px-4 py-2 text-right">Maliyet</th>
              <th className="px-4 py-2 text-center">×10</th>
              <th className="px-4 py-2 text-right">Satış</th>
              <th className="px-4 py-2 text-right">Kar Marjı</th>
              <th className="px-4 py-2 text-center">Aktif</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <FeatureRowEditor
                key={row.featureKey}
                row={row}
                markup={markup}
                pending={pending}
                onSave={onSave}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureRowEditor({
  row,
  markup,
  pending,
  onSave,
}: {
  row: FeatureRow;
  markup: number;
  pending: boolean;
  onSave: (key: string, patch: Partial<FeatureRow>) => void;
}) {
  const [cost, setCost] = useState(row.providerCostCredits);
  const [sell, setSell] = useState(row.sellCredits);
  const [auto, setAuto] = useState(row.useAutoMarkup);
  const [enabled, setEnabled] = useState(row.enabled);

  const preview = auto && cost > 0 ? Math.max(1, Math.ceil(cost * markup)) : sell;
  const margin = cost > 0 ? preview / cost : 0;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2">
        <div className="font-medium text-gray-900">{row.label}</div>
        <div className="text-[10px] text-gray-400 font-mono">{row.featureKey}</div>
      </td>
      <td className="px-4 py-2 capitalize text-gray-600">{row.provider}</td>
      <td className="px-4 py-2 text-right">
        <input
          type="number"
          min={0}
          value={cost}
          onChange={(e) => setCost(parseInt(e.target.value, 10) || 0)}
          className="w-16 text-right rounded border border-gray-200 px-2 py-1 text-xs"
        />
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={auto}
          onChange={(e) => setAuto(e.target.checked)}
          title="Otomatik markup"
        />
      </td>
      <td className="px-4 py-2 text-right">
        {auto ? (
          <span className="font-semibold text-indigo-600">{preview}</span>
        ) : (
          <input
            type="number"
            min={0}
            value={sell}
            onChange={(e) => setSell(parseInt(e.target.value, 10) || 0)}
            className="w-16 text-right rounded border border-gray-200 px-2 py-1 text-xs"
          />
        )}
      </td>
      <td className="px-4 py-2 text-right text-xs text-gray-600">
        {cost > 0 ? (
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> ×{margin.toFixed(1)}
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
      </td>
      <td className="px-4 py-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            onSave(row.featureKey, {
              providerCostCredits: cost,
              sellCredits: auto ? preview : sell,
              useAutoMarkup: auto,
              enabled,
            })
          }
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
        >
          Kaydet
        </button>
      </td>
    </tr>
  );
}
