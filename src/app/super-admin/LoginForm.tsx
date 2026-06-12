'use client';

import React, { useState } from 'react';
import { Key } from 'lucide-react';

export default function SuperAdminLoginForm() {
  const [tokenInput, setTokenInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setError('Lütfen bir yetkilendirme anahtarı girin.');
      return;
    }

    // Set cookie and reload page
    document.cookie = `super_admin_token=${tokenInput.trim()}; path=/; max-age=86400; SameSite=Strict`;
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-700 block">
          Yetkilendirme Anahtarı (SUPER_ADMIN_TOKEN)
        </label>
        <div className="relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value);
              setError('');
            }}
            placeholder="••••••••••••••••"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm placeholder-gray-400"
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition-colors shadow focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Giriş Yap
      </button>
    </form>
  );
}
