'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Eye } from 'lucide-react';

interface Props {
  tenantId: string;
}

export default function ImpersonateButton({ tenantId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impersonatedTenantId: tenantId }),
      });

      if (res.ok) {
        document.cookie = `impersonated_tenant_id=${tenantId}; path=/; max-age=3600; SameSite=Lax`;
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Impersonation failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleImpersonate}
      disabled={loading}
      className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-semibold text-xs py-2 px-3 border border-gray-300 rounded-lg transition-colors"
      title="Tenant yetkileriyle müşteri panelini salt-okunur modda görüntüle"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Eye className="w-3.5 h-3.5" />}
      Salt-Okunur Görüntüle
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}
