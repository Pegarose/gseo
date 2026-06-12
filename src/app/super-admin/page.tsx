import React from 'react';
import { getSuperAdminMetrics } from './actions';
import Link from 'next/link';
import { 
  Users, 
  Globe, 
  Activity, 
  AlertCircle, 
  Brain, 
  Cpu, 
  BarChart3, 
  ShieldAlert, 
  ArrowRight 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SuperAdminOverviewPage() {
  const metrics = await getSuperAdminMetrics();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Super Admin Paneli</h1>
        <p className="text-sm text-gray-500 mt-1">GSeoSuite genel sistem durumunu ve kiracıları buradan kontrol edebilirsiniz.</p>
      </div>

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        
        {/* Toplam Kiracı */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kiracı Sayısı</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalTenants}</p>
          </div>
        </div>

        {/* Toplam Site */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
          <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
            <Globe className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toplam Site</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalSites}</p>
          </div>
        </div>

        {/* Toplam Denetim */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <Activity className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toplam Denetim</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalSnapshots}</p>
          </div>
        </div>

        {/* Kritik Hatalar */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
          <div className="bg-red-50 p-3 rounded-lg text-red-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kritik Hatalar</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalCriticalIssues}</p>
          </div>
        </div>

        {/* Toplam Tüketilen AI Kredisi */}
        <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm p-5 flex items-center">
          <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
            <Brain className="w-6 h-6" />
          </div>
          <div className="ml-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toplam AI Kredisi</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.totalAiCreditsUsed}</p>
          </div>
        </div>
      </div>

      {/* Navigation Shortcuts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Yonetim Kisimları */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Yönetim Araçları</h2>
          <p className="text-sm text-gray-500">Müşteri kotalarını belirleyin, entegrasyon durumunu gözlemleyin veya sistem limitlerini denetleyin.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Link 
              href="/super-admin/tenants" 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-sm text-gray-900">Kiracı Yönetimi</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/super-admin/providers" 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-red-500 hover:bg-red-50/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-sm text-gray-900">Sağlayıcı Sağlığı</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/super-admin/usage" 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-sm text-gray-900">Kullanım İstatistikleri</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              href="/super-admin/system" 
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-sm text-gray-900">Sistem Durumu</span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Bilgilendirme Kutusu */}
        <div className="bg-slate-900 text-slate-100 rounded-xl p-6 flex flex-col justify-between shadow-md">
          <div className="space-y-3">
            <span className="text-red-500 text-[10px] font-bold tracking-widest uppercase bg-red-950/40 border border-red-900/60 px-2 py-1 rounded">Sistem Güvenlik Bildirgesi</span>
            <h3 className="text-lg font-bold text-white leading-snug">Super Admin Paneli ve Veri İzolasyon Sınırları</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Super admin panelinden yapılan tüm işlemler global yetki düzeyindedir. Güvenlik kuralları gereği harici API anahtarları maskelenmiştir ve veritabanı işlemlerinin kiracılar arasında veri sızıntısı yapmaması için izole metotlar kullanılmaktadır.
            </p>
          </div>
          <div className="text-xs text-slate-500 border-t border-slate-800 pt-4 mt-6">
            GSeoSuite Platform Management Server (v1.0.0-MVP)
          </div>
        </div>
      </div>
    </div>
  );
}
