'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getAllOrders, Order } from '@/services/orders';
import { getProducts, Product } from '@/services/products';
import { getLists, List } from '@/services/lists';
import { formatCurrency, formatDate } from '@/utils/formatDate';
import Link from 'next/link';

interface ProductSales {
  productName: string;
  quantity: number;
  totalValue: number;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await getAllOrders();
        const productsData = await getProducts();
        const listsData = await getLists();

        setOrders(ordersData);
        setProducts(productsData);
        setLists(listsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateProductSales = (): ProductSales[] => {
    const salesMap: { [key: string]: ProductSales } = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!salesMap[item.productId]) {
          salesMap[item.productId] = {
            productName: item.productName,
            quantity: 0,
            totalValue: 0,
          };
        }
        salesMap[item.productId].quantity += item.quantity;
        salesMap[item.productId].totalValue += item.subtotal;
      });
    });

    return Object.values(salesMap).sort((a, b) => b.totalValue - a.totalValue);
  };

  const totalSold = orders.reduce((sum, order) => sum + order.totalValue, 0);
  const productSales = calculateProductSales();
  const averageOrderValue = orders.length > 0 ? totalSold / orders.length : 0;

  if (loading) {
    return (
      <ProtectedRoute requiredRole="adm">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="adm">
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block">
            ← Voltar
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">📈 Relatórios</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">Total Vendido</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSold)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">Total de Pedidos</p>
              <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">Ticket Médio</p>
              <p className="text-3xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Produtos Mais Vendidos</h2>
              {productSales.length === 0 ? (
                <p className="text-gray-600">Nenhuma venda registrada</p>
              ) : (
                <div className="space-y-3">
                  {productSales.map((sale, index) => (
                    <div key={sale.productName} className="border-b border-gray-200 pb-3">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-gray-900">
                          {index + 1}. {sale.productName}
                        </p>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Qtd: {sale.quantity}
                        </span>
                      </div>
                      <p className="text-green-600 font-semibold">{formatCurrency(sale.totalValue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Controle de Estoque</h2>
              {products.length === 0 ? (
                <p className="text-gray-600">Nenhum produto cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => {
                    const sold = product.initialQuantity - product.currentQuantity;
                    const percentage = product.initialQuantity > 0 ? (sold / product.initialQuantity) * 100 : 0;

                    return (
                      <div key={product.id} className="border-b border-gray-200 pb-3">
                        <p className="font-medium text-gray-900 mb-1">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${100 - percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-600 whitespace-nowrap">
                            {product.currentQuantity}/{product.initialQuantity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Vendido: {sold} ({percentage.toFixed(0)}%)
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {orders.length > 0 && (
            <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Todas as Listas</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold text-gray-900">Lista</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-900">Total</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-900">Pedidos</th>
                      <th className="px-4 py-2 text-left font-semibold text-gray-900">Criado em</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lists.map((list) => {
                      const listOrders = orders.filter((o) => o.listId === list.id);
                      const listTotal = listOrders.reduce((sum, order) => sum + order.totalValue, 0);

                      return (
                        <tr key={list.id} className="border-b border-gray-300 hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-900">{list.name}</td>
                          <td className="px-4 py-2 font-semibold text-green-600">
                            {formatCurrency(listTotal)}
                          </td>
                          <td className="px-4 py-2 text-gray-900">{listOrders.length}</td>
                          <td className="px-4 py-2 text-gray-600">{formatDate(list.date as any)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}