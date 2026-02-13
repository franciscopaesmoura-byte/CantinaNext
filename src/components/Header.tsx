'use client';

import { useAuth } from '@/contexts/AuthContext';
import { logoutUser } from '@/services/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🍕 Cantina
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.email}</span>
            <span className="text-xs bg-blue-700 px-2 py-1 rounded">
              {user.role === 'adm' ? 'ADM' : 'Jovem'}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm transition"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}