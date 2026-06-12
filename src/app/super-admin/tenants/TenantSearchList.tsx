'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight, User, Globe, Brain } from 'lucide-react';

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  aiCreditLimit: number;
  aiCreditUsed: number;
  createdAt: Date;
  _count: {
    users: number;
    sites: number;
  };
}

export default function TenantSearchList({ tenants }: { tenants: TenantItem[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch = 
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = planFilter === 'all' || tenant.plan === planFilter;

    return matchesSearch && matchesPlan;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Kiracı adı veya slug ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="all">Tüm Planlar</option>
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="professional">Professional</option>
            <option value="agency">Agency</option>
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kiracı Bilgileri</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Kredisi Tüketimi</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Özet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                    Arama kriterlerine uygun kiracı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const creditPercentage = tenant.aiCreditLimit > 0 
                    ? Math.round((tenant.aiCreditUsed / tenant.aiCreditLimit) * 100)
                    : 0;

                  return (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{tenant.name}</div>
                        <div className="text-xs text-gray-500 font-mono">{tenant.slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          tenant.plan === 'agency' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          tenant.plan === 'professional' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          tenant.plan === 'starter' ? 'bg-green-50 text-green-700 border-green-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center min-w-[150px]">
                          <div className="flex justify-between w-full text-xs text-gray-500 mb-1">
                            <span className="font-semibold text-slate-800">{tenant.aiCreditUsed}</span>
                            <span>/ {tenant.aiCreditLimit} Kredi</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                creditPercentage >= 100 ? 'bg-red-600' :
                                creditPercentage >= 80 ? 'bg-amber-500' :
                                'bg-indigo-600'
                              }`}
                              style={{ width: `${Math.min(creditPercentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1" title="Siteniz / Siteleriniz">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            {tenant._count.sites} Site
                          </span>
                          <span className="flex items-center gap-1" title="Kullanıcılar">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            {tenant._count.users} Üye
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {new Date(tenant.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link 
                          href={`/super-admin/tenants/${tenant.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          Düzenle <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
