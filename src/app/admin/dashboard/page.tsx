import React from 'react';
import Link from 'next/link';
import { Activity, Shield, Code, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">GSeoSuite Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Select an administration panel below.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/super-admin" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all">
            <Shield className="w-6 h-6 text-indigo-600" />
            <div>
              <div className="font-semibold text-gray-900">Super Admin</div>
              <div className="text-xs text-gray-500">Tenant & system management</div>
            </div>
          </Link>

          <Link href="/super-admin/system/metrics" className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/20 transition-all">
            <Activity className="w-6 h-6 text-green-600" />
            <div>
              <div className="font-semibold text-gray-900">Performance Metrics</div>
              <div className="text-xs text-gray-500">Latency & error rates</div>
            </div>
          </Link>
        </div>

        <div className="border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          GSeoSuite v1.0 — <Link href="/docs/API_SCOPES.md" className="text-indigo-600 hover:underline">API Scopes</Link>
        </div>
      </div>
    </div>
  );
}
