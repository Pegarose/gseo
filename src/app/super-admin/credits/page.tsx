import { Coins } from 'lucide-react';
import { getCreditPricingAdminData } from './actions';
import CreditPricingEditor from './CreditPricingEditor';

export const dynamic = 'force-dynamic';

export default async function SuperAdminCreditsPage() {
  const { global, features } = await getCreditPricingAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Coins className="w-6 h-6 text-amber-500" />
          Kredi Fiyatlandırma
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Sağlayıcı maliyetlerini müşteri kredisine çevirin — varsayılan ×{global.defaultMarkupMultiplier} markup.
        </p>
      </div>

      <CreditPricingEditor
        initialMarkup={global.defaultMarkupMultiplier}
        initialFeatures={features}
      />
    </div>
  );
}
