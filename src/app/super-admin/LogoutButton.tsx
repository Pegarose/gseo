'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const handleLogout = () => {
    document.cookie = "super_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.reload();
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors w-full text-left"
    >
      <LogOut className="w-4 h-4" />
      Oturumu Kapat
    </button>
  );
}
