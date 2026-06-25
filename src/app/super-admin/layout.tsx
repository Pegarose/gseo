import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  ShieldAlert,
  Users,
  Activity,
  BarChart3,
  Cpu,
  ArrowLeft,
  ScrollText,
  Coins,
} from 'lucide-react';
import SuperAdminLoginForm from './LoginForm';
import LogoutButton from './LogoutButton';

export const dynamic = 'force-dynamic';

const navigation = [
  { name: 'Genel Bakış', href: '/super-admin', icon: Activity },
  { name: 'Kiracılar', href: '/super-admin/tenants', icon: Users },
  { name: 'Audit Logları', href: '/super-admin/audit-logs', icon: ScrollText },
  { name: 'Kredi Fiyatları', href: '/super-admin/credits', icon: Coins },
  { name: 'Sağlayıcılar', href: '/super-admin/providers', icon: Cpu },
  { name: 'Kullanım Analitiği', href: '/super-admin/usage', icon: BarChart3 },
  { name: 'Sistem Durumu', href: '/super-admin/system', icon: ShieldAlert },
];

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Fallback token cookie check for legacy/demo mode
  const cookieStore = await cookies();
  const token = cookieStore.get('super_admin_token')?.value;
  const validToken = process.env.SUPER_ADMIN_TOKEN;
  const isProduction = process.env.NODE_ENV === 'production';

  let tokenAuthenticated = false;
  if (validToken) {
    tokenAuthenticated = token === validToken;
  } else if (!isProduction) {
    tokenAuthenticated = token === 'gseo_admin_secret_token';
  }

  const isAuthenticated = session?.user?.role === 'super_admin' || tokenAuthenticated;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GSeoSuite Super Admin</h1>
            <p className="text-sm text-gray-500">Sistem Yönetim Paneli Yetkilendirmesi</p>
          </div>

          <SuperAdminLoginForm />

          <div className="text-center pt-2">
            <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-500 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Müşteri Paneline Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="flex items-center gap-2.5 h-16 px-6 border-b border-slate-800 bg-slate-950">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">GSeoSuite</span>
            <span className="block text-[10px] text-red-400 font-mono tracking-wider uppercase font-semibold">Super Admin</span>
          </div>
        </div>

        <div className="px-4 py-6 flex-1 flex flex-col justify-between">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4 text-slate-400" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Müşteri Paneline Dön
            </Link>

            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg">
            <ShieldAlert className="w-4 h-4" />
            <span>Sistem Yönetici Yetkisi Aktif</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>Yönetici Oturumu</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-xs">
              SA
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
