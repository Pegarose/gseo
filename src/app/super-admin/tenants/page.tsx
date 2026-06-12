import React from 'react';
import { getSuperAdminTenants } from '../actions';
import TenantSearchList from './TenantSearchList';

export const dynamic = 'force-dynamic';

export default async function SuperAdminTenantsPage() {
  const tenants = await getSuperAdminTenants();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kiracı Yönetimi (Tenants)</h1>
        <p className="text-sm text-gray-500 mt-1">Platformdaki tüm kiracıların paketlerini, kota durumlarını ve site/kullanıcı sayılarını inceleyin.</p>
      </div>

      <TenantSearchList tenants={tenants} />
    </div>
  );
}
