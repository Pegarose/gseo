'use client';

import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

const PLANS = [
  { key: 'starter', name: 'Starter', price: '$29/mo' },
  { key: 'professional', name: 'Professional', price: '$99/mo' },
  { key: 'agency', name: 'Agency', price: '$299/mo' },
];

interface Props {
  currentPlan: string;
}

export default function PlanUpgrade({ currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        alert(data.error?.message || 'Checkout failed');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleTopUp = async () => {
    setLoading('topup');
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topUpCredits: 100 }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        alert(data.error?.message || 'Top-up failed');
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Plan & Billing
        </h3>
        <span className="text-xs text-gray-500 capitalize">Current: {currentPlan}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => (
          <button
            key={plan.key}
            onClick={() => handleUpgrade(plan.key)}
            disabled={loading !== null || currentPlan === plan.key}
            className={`border rounded-lg p-3 text-left transition-colors ${
              currentPlan === plan.key
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20'
            }`}
          >
            <div className="font-semibold text-sm text-gray-900">{plan.name}</div>
            <div className="text-xs text-gray-500 mt-1">{plan.price}</div>
            {currentPlan === plan.key && (
              <div className="text-[10px] text-indigo-700 font-semibold mt-2 uppercase">Current</div>
            )}
          </button>
        ))}
      </div>

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-600">Need more AI credits without changing plan?</span>
        <button
          onClick={handleTopUp}
          disabled={loading === 'topup'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-2 rounded-lg transition-colors"
        >
          {loading === 'topup' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Buy 100 Credits ($10)
        </button>
      </div>
    </div>
  );
}
