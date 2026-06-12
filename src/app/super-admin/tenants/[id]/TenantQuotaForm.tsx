'use client';

import React, { useState } from 'react';
import { updateTenantQuota } from '../../actions';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FormProps {
  tenantId: string;
  initialPlan: string;
  initialCreditLimit: number;
  initialSupportNotes: string | null;
}

export default function TenantQuotaForm({ 
  tenantId, 
  initialPlan, 
  initialCreditLimit, 
  initialSupportNotes 
}: FormProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [creditLimit, setCreditLimit] = useState(initialCreditLimit);
  const [supportNotes, setSupportNotes] = useState(initialSupportNotes || '');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      await updateTenantQuota(tenantId, {
        plan,
        aiCreditLimit: Number(creditLimit),
        supportNotes: supportNotes.trim() || undefined
      });
      setStatus({
        type: 'success',
        message: 'Kiracı limitleri ve planı başarıyla güncellendi. Değişiklikler anında yansıdı.'
      });
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Limitler güncellenirken hata oluştu.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6 space-y-4">
      <h3 className="font-bold text-gray-900 text-md pb-2 border-b border-gray-100">Kotalar ve Destek Günlüğü</h3>

      {/* Success/Error Alerts */}
      {status.type === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3.5 flex gap-2.5 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span>{status.message}</span>
        </div>
      )}
      {status.type === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex gap-2.5 text-sm text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Plan Select */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Abonelik Paketi (Plan)</label>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="agency">Agency</option>
          </select>
        </div>

        {/* AI Credit Limit Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Aylık AI Kredi Limiti</label>
          <input
            type="number"
            value={creditLimit}
            onChange={(e) => setCreditLimit(Number(e.target.value))}
            min={0}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          />
          <p className="text-[10px] text-gray-400">Not: 0 değeri "Sınırsız" kredi paketi olarak değerlendirilir.</p>
        </div>
      </div>

      {/* Support Notes Textarea */}
      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-semibold text-gray-700">Destek Notları / Log Günlüğü</label>
        <textarea
          rows={3}
          value={supportNotes}
          onChange={(e) => setSupportNotes(e.target.value)}
          placeholder="Müşteriye özel kota değişiklikleri veya destek notları girin..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-lg transition-colors shadow focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Kaydediliyor...' : 'Limitleri Kaydet'}
        </button>
      </div>
    </form>
  );
}
