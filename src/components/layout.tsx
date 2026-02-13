import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cantina - Organização de Pedidos',
  description: 'Plataforma para organização de pedidos da cantina',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          <main className="max-w-7xl mx-auto">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}