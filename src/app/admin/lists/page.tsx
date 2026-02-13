'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getLists, List } from '@/services/lists';
import { getOrdersByList } from '@/services/orders';
import { formatCurrency, formatDate } from '@/utils/formatDate';
import Link from 'next/link';

export default function AdminListsPage() {
  const [lists, setLists] = useState<List[]>([]);
  const [listDetails, setListDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const listsData = await getLists();
        setLists(listsData);

        // Carregar dados de cada lista
        const details: Record<string, any> = {};
        for (const list of listsData) {
          const orders = await getOrdersByList(list.id!);
          details[list.id!] = {
            totalOrders: orders.length,
            totalValue: orders.reduce((sum, o) => sum + o.totalValue, 0),
            totalItems: orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
          };
        }
        setListDetails(details);
      } catch (error) {
        console.error('Erro ao carregar listas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute requiredRole="adm">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando listas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="adm">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block">
            ← Voltar para Dashboard
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">📋 Listas de Pedidos</h1>

          {lists.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <p className="text-gray-600 text-lg mb-2">Nenhuma lista criada ainda</p>
              <p className="text-gray-500">As listas aparecerão aqui assim que forem criadas pelos jovens</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list) => {
                const detail = listDetails[list.id!] || {
                  totalOrders: 0,
                  totalValue: 0,
                  totalItems: 0,
                };

                return (
                  <Link key={list.id} href={`/lists/${list.id}`}>
                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden border-l-4 border-blue-600">
                      {/* HEADER */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                        <h3 className="text-xl font-bold mb-2">{list.name}</h3>
                        <p className="text-blue-100 text-sm">Criado por: {list.createdBy}</p>
                      </div>

                      {/* CONTEÚDO */}
                      <div className="p-6">
                        {/* RESUMO */}
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Pedidos:</span>
                            <span className="text-2xl font-bold text-blue-600">{detail.totalOrders}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Itens Vendidos:</span>
                            <span className="text-2xl font-bold text-green-600">{detail.totalItems}</span>
                          </div>

                          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Total:</span>
                            <span className="text-3xl font-bold text-green-600">
                              {formatCurrency(detail.totalValue)}
                            </span>
                          </div>
                        </div>

                        {/* BOTÃO */}
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-blue-600 font-semibold text-sm">
                            Clique para ver detalhes e cobrança
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* RESUMO GERAL */}
          {lists.length > 0 && (
            <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">📊 Resumo Geral</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-green-100 text-sm mb-2">Total de Listas</p>
                  <p className="text-4xl font-bold">{lists.length}</p>
                </div>

                <div>
                  <p className="text-green-100 text-sm mb-2">Total de Pedidos</p>
                  <p className="text-4xl font-bold">
                    {Object.values(listDetails).reduce((sum: number, d: any) => sum + d.totalOrders, 0)}
                  </p>
                </div>

                <div>
                  <p className="text-green-100 text-sm mb-2">Total de Itens</p>
                  <p className="text-4xl font-bold">
                    {Object.values(listDetails).reduce((sum: number, d: any) => sum + d.totalItems, 0)}
                  </p>
                </div>

                <div>
                  <p className="text-green-100 text-sm mb-2">Arrecadação Total</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(
                      Object.values(listDetails).reduce((sum: number, d: any) => sum + d.totalValue, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}