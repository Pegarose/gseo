import { isVebApiConfigured } from '@/lib/providers/vebapi/service';
import KeywordExplorer from './KeywordExplorer';

export const dynamic = 'force-dynamic';

export default function KeywordExplorerPage() {
  const vebApiEnabled = isVebApiConfigured();

  if (!vebApiEnabled) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
        VebAPI yapılandırılmamış. <code className="text-xs bg-white px-1 rounded">VEBAPI_API_KEY</code> ekleyin.
      </div>
    );
  }

  return <KeywordExplorer />;
}
