import { BookOpen } from 'lucide-react';
import { getCreditLedgerAdminData } from './actions';
import CreditLedgerReport from './CreditLedgerReport';

export const dynamic = 'force-dynamic';

export default async function CreditLedgerPage() {
  const data = await getCreditLedgerAdminData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-600" />
          Kredi Ledger & Provider Maliyet Raporu
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Hangi özellikten ne kadar kazanıldı, sağlayıcıya ne kadar ödendi, kar marjı nedir?
        </p>
      </div>

      <CreditLedgerReport data={data} />
    </div>
  );
}
