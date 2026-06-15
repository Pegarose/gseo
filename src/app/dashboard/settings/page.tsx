import { getDashboardSettings } from './actions';
import { Settings, Key, Building2, Download, AlertTriangle, CreditCard, Zap } from 'lucide-react';
import PlanUpgrade from './PlanUpgrade';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { tenant, limits } = await getDashboardSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-gray-700" />
            Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account, API keys, plan, and integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">Organization Profile</h2>
            </div>
            <div className="p-5">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Organization Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-semibold">{tenant.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono text-xs bg-gray-100 p-1 rounded inline-block">{tenant.id}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Current Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900 capitalize font-semibold">{tenant.plan}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">AI Credits</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tenant.aiCreditUsed} / {tenant.aiCreditLimit}</dd>
                </div>
              </dl>
            </div>
          </div>

          <PlanUpgrade currentPlan={tenant.plan} />

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              </div>
              <button disabled className="bg-indigo-50 text-indigo-400 px-3 py-1.5 rounded text-sm font-medium cursor-not-allowed">
                Generate New Key
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-500 mb-4">
                Use these keys to authenticate your API requests from WordPress, Next.js, or custom integrations.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  API key management UI is coming soon. Contact support to rotate or create new keys.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Plan Limits
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between"><span>Monthly Scores</span><span className="font-semibold">{limits.monthlyScoreLimit}</span></li>
              <li className="flex justify-between"><span>AI Credits</span><span className="font-semibold">{limits.monthlyAiCreditLimit}</span></li>
              <li className="flex justify-between"><span>Max Sites</span><span className="font-semibold">{limits.maxSites}</span></li>
              <li className="flex justify-between"><span>Max Users</span><span className="font-semibold">{limits.maxUsers}</span></li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-5">
            <h3 className="font-semibold text-gray-900 mb-2">Integrations</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm text-gray-900">WordPress Plugin</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">V1.0 Ready</span>
                </div>
                <p className="text-xs text-gray-500">Official plugin for WordPress integration.</p>
                <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 mt-1">
                  <Download className="w-4 h-4" /> Download Plugin
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-3 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-sm text-gray-900">Next.js SDK</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">App Router</span>
                </div>
                <p className="text-xs text-gray-500">NPM package for React/Next.js projects.</p>
                <code className="text-[10px] bg-gray-100 px-2 py-1 rounded w-full">npm install @seosuite/next</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
