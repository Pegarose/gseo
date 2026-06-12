import React from 'react';
import { getSuperAdminTenantDetail } from '../../actions';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Building2, 
  Users as UsersIcon, 
  Globe, 
  Key, 
  Puzzle, 
  ExternalLink 
} from 'lucide-react';
import TenantQuotaForm from './TenantQuotaForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SuperAdminTenantDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tenant = await getSuperAdminTenantDetail(id);

  if (!tenant) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          Kiracı bulunamadı. Lütfen geçerli bir kiracı ID girdiğinizden emin olun.
        </div>
        <Link href="/super-admin/tenants" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link 
            href="/super-admin/tenants" 
            className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{tenant.name}</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {tenant.id}</p>
          </div>
        </div>

        {/* Impersonation Placeholder Button */}
        <Link 
          href={`/dashboard`} 
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2 px-3 border border-gray-300 rounded-lg transition-colors"
          title="Tenant yetkileriyle müşteri panelini salt-okunur modda simüle eder."
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Müşteri Panelini Gör (Read-Only Preview)
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: General Profile and Quota Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-6">
            <h3 className="font-bold text-gray-900 text-md pb-2 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              Organizasyon Profili
            </h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mt-4 text-sm">
              <div>
                <dt className="text-gray-500 font-medium">Kiracı Adı</dt>
                <dd className="text-gray-900 font-semibold mt-0.5">{tenant.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Slug Adresi</dt>
                <dd className="text-gray-900 font-mono mt-0.5">{tenant.slug}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Kayıt Tarihi</dt>
                <dd className="text-gray-900 mt-0.5">{new Date(tenant.createdAt).toLocaleString('tr-TR')}</dd>
              </div>
              <div>
                <dt className="text-gray-500 font-medium">Son Güncelleme</dt>
                <dd className="text-gray-900 mt-0.5">{new Date(tenant.updatedAt).toLocaleString('tr-TR')}</dd>
              </div>
            </dl>
          </div>

          {/* Quota Edit Form */}
          <TenantQuotaForm 
            tenantId={tenant.id}
            initialPlan={tenant.plan}
            initialCreditLimit={tenant.aiCreditLimit}
            initialSupportNotes={tenant.supportNotes}
          />

          {/* Associated Sites */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-md">İzlenen Siteler</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                    <th className="px-5 py-3">Site Adı</th>
                    <th className="px-5 py-3">Domain</th>
                    <th className="px-5 py-3 text-center">Platform</th>
                    <th className="px-5 py-3 text-center">Son Skor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {tenant.sites.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-4 text-center text-gray-500">Kayıtlı site bulunmuyor.</td>
                    </tr>
                  ) : (
                    tenant.sites.map((site) => (
                      <tr key={site.id}>
                        <td className="px-5 py-3 font-semibold text-gray-900">{site.name}</td>
                        <td className="px-5 py-3 text-gray-600 font-mono text-xs">{site.domain}</td>
                        <td className="px-5 py-3 text-center capitalize text-xs text-gray-500">{site.platform}</td>
                        <td className="px-5 py-3 text-center">
                          {site.snapshots[0] ? (
                            <span className="font-bold text-indigo-600">{site.snapshots[0].finalScore}/100</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Associated Users, API Keys, Integrations */}
        <div className="space-y-6">
          
          {/* Tenant Users */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-md">Üyeler</h3>
            </div>
            <ul className="divide-y divide-gray-100 p-4 space-y-3">
              {tenant.users.length === 0 ? (
                <li className="text-sm text-gray-500 text-center py-2">Kayıtlı üye bulunmuyor.</li>
              ) : (
                tenant.users.map((user) => (
                  <li key={user.id} className="text-xs">
                    <div className="font-semibold text-gray-900">{user.name}</div>
                    <div className="text-gray-500 font-mono mt-0.5">{user.email}</div>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium capitalize text-[9px]">
                        {user.role}
                      </span>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Active API Keys */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-md">API Anahtarları</h3>
            </div>
            <ul className="divide-y divide-gray-100 p-4 space-y-3">
              {tenant.apiKeys.length === 0 ? (
                <li className="text-sm text-gray-500 text-center py-2">Aktif API anahtarı bulunmuyor.</li>
              ) : (
                tenant.apiKeys.map((key) => (
                  <li key={key.id} className="text-xs flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-900">{key.name}</div>
                      <div className="text-gray-400 font-mono mt-0.5">{key.keyPrefix}••••••</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      key.revokedAt ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}>
                      {key.revokedAt ? 'İptal' : 'Aktif'}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Integrations */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-2">
              <Puzzle className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-gray-900 text-md">CMS Bağlantıları</h3>
            </div>
            <ul className="divide-y divide-gray-100 p-4 space-y-3">
              {tenant.integrations.length === 0 ? (
                <li className="text-sm text-gray-500 text-center py-2">Entegrasyon bulunmuyor.</li>
              ) : (
                tenant.integrations.map((integ) => (
                  <li key={integ.id} className="text-xs flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 capitalize">{integ.provider}</div>
                      <div className="text-gray-400 font-mono mt-0.5">Tarih: {new Date(integ.createdAt).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      integ.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {integ.status}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
