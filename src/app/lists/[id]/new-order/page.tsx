'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import OrderForm from '@/components/OrderForm';
import { createOrder, OrderItem } from '@/services/orders';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function NewOrderPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmitOrder = async (clientName: string, clientPhone: string, items: OrderItem[]) => {
    setError('');
    setIsSubmitting(true);

    try {
      const totalValue = items.reduce((sum, item) => sum + item.subtotal, 0);

      await createOrder({
        listId,
        clientName,
        clientPhone: clientPhone || undefined,
        items,
        totalValue,
        createdBy: user?.email || 'Desconhecido',
      });

      router.push(`/lists/${listId}`);
    } catch (err: any) {
      setError('Erro ao criar pedido. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="jovem">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href={`/lists/${listId}`} className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block">
            ← Voltar
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Novo Pedido</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <OrderForm onSubmit={handleSubmitOrder} isLoading={isSubmitting} />
        </div>
      </div>
    </ProtectedRoute>
  );
}