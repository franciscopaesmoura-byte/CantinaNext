'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'adm') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center px-4">
      {/* Decoração de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 inline-block">🌟</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Cantina
          </h1>
          <p className="text-emerald-600 font-medium mt-2">Organização Inteligente de Pedidos</p>
        </div>

        {/* Descrição */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-8 border border-emerald-200">
          <p className="text-gray-700 text-center text-sm leading-relaxed">
            Sistema profissional para gerenciar pedidos, estoque e cobranças com integração WhatsApp
          </p>
        </div>

        {/* Botões */}
        <div className="space-y-3 mb-6">
          <Link
            href="/login"
            className="block w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            🔑 Entrar
          </Link>
          <Link
            href="/register"
            className="block w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg"
          >
            ✨ Cadastro
          </Link>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-emerald-600 font-medium">Acesso ADM</span>
          </div>
        </div>

        {/* Credenciais ADM */}
        <details className="group">
          <summary className="cursor-pointer font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
            <span>👤 Credenciais de Administrador</span>
            <span className="text-emerald-400 group-open:rotate-180 transition">▼</span>
          </summary>
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div className="bg-white p-3 rounded border border-emerald-100">
              <p className="text-xs text-gray-600 mb-1">Email:</p>
              <p className="font-mono text-sm text-emerald-700 font-semibold break-all">
                {process.env.NEXT_PUBLIC_ADM_EMAIL}
              </p>
            </div>
            <div className="bg-white p-3 rounded border border-emerald-100">
              <p className="text-xs text-gray-600 mb-1">Senha:</p>
              <p className="font-mono text-sm text-emerald-700 font-semibold break-all">
                {process.env.NEXT_PUBLIC_ADM_PASSWORD}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 flex gap-2">
              <span className="text-lg">⚠️</span>
              <p className="text-xs text-amber-800">
                <strong>Importante:</strong> Use apenas para testes. Nunca compartilhe essas credenciais.
              </p>
            </div>
          </div>
        </details>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-emerald-200">
          <p className="text-center text-xs text-gray-500">
            Feito com <span className="text-emerald-500">💚</span> para organizar sua cantina
          </p>
        </div>
      </div>
    </div>
  );
}


