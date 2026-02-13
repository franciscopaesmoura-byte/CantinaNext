'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getProducts, Product } from '@/services/products';
import { getAllOrders, Order } from '@/services/orders';
import { formatCurrency } from '@/utils/formatDate';
import Link from 'next/link';

interface ProductAnalysis {
  product: Product;
  totalSold: number;
  totalRevenue: number;
  remainingStock: number;
  potentialRevenue: number;
}

export default function InventoryAnalysisPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analysis, setAnalysis] = useState<ProductAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        const ordersData = await getAllOrders();

        setProducts(productsData);
        setOrders(ordersData);

        // Calcula análise de cada produto
        const analysisData: ProductAnalysis[] = productsData.map((product) => {
          let totalSold = 0;
          let totalRevenue = 0;

          ordersData.forEach((order) => {
            order.items.forEach((item) => {
              if (item.productId === product.id) {
                totalSold += item.quantity;
                totalRevenue += item.subtotal;
              }
            });
          });

          const potentialRevenue = product.initialQuantity * product.price;

          return {
            product,
            totalSold,
            totalRevenue,
            remainingStock: product.currentQuantity,
            potentialRevenue,
          };
        });

        setAnalysis(analysisData.sort((a, b) => b.totalRevenue - a.totalRevenue));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalInitialStock = analysis.reduce((sum, a) => sum + a.product.initialQuantity, 0);
  const totalSoldItems = analysis.reduce((sum, a) => sum + a.totalSold, 0);
  const totalRemainingStock = analysis.reduce((sum, a) => sum + a.remainingStock, 0);
  const totalRevenue = analysis.reduce((sum, a) => sum + a.totalRevenue, 0);
  const totalPotentialRevenue = analysis.reduce((sum, a) => sum + a.potentialRevenue, 0);

  if (loading) {
    return (
      <ProtectedRoute requiredRole="adm">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando análise...</p>
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
            ← Voltar
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">📊 Análise de Estoque e Vendas</h1>

          {/* CARDS DE RESUMO GERAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">📦 Estoque Inicial</p>
              <p className="text-3xl font-bold text-blue-600">{totalInitialStock}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">📤 Vendido</p>
              <p className="text-3xl font-bold text-green-600">{totalSoldItems}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">📦 Em Estoque</p>
              <p className="text-3xl font-bold text-orange-600">{totalRemainingStock}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">💰 Receita Realizada</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <p className="text-gray-600 text-sm mb-2">💵 Receita Potencial</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPotentialRevenue)}</p>
            </div>
          </div>

          {/* PRODUTOS */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">Detalhamento por Produto</h2>
            </div>

            {analysis.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p>Nenhum produto cadastrado ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço Unit.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estoque Inicial</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vendido</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Restante</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Receita Realizada</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Receita Potencial</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">% Vendido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.map((item) => {
                      const percentSold =
                        item.product.initialQuantity > 0
                          ? (item.totalSold / item.product.initialQuantity) * 100
                          : 0;

                      return (
                        <tr key={item.product.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatCurrency(item.product.price)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {item.product.initialQuantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-green-600">
                            {item.totalSold}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <span
                              className={`px-2 py-1 rounded ${
                                item.remainingStock === 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {item.remainingStock}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600">
                            {formatCurrency(item.totalRevenue)}
                          </td>
                          <td className="px-6 py-4 text-sm text-purple-600">
                            {formatCurrency(item.potentialRevenue)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${Math.min(percentSold, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-gray-600 text-xs whitespace-nowrap">
                                {percentSold.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">TOTAL</td>
                      <td className="px-6 py-4 text-sm text-gray-600">-</td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">{totalInitialStock}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">{totalSoldItems}</td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">{totalRemainingStock}</td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-600">
                        {formatCurrency(totalPotentialRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-600">
                        {totalInitialStock > 0 ? ((totalSoldItems / totalInitialStock) * 100).toFixed(0) : 0}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* INSIGHTS */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-blue-900 font-semibold mb-2">📉 Estoque Não Vendido</p>
              <p className="text-2xl font-bold text-blue-600">{totalRemainingStock} unidades</p>
              <p className="text-sm text-blue-700 mt-2">
                Valor potencial: {formatCurrency(totalRemainingStock > 0 ? totalPotentialRevenue - totalRevenue : 0)}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-green-900 font-semibold mb-2">✅ Taxa de Venda</p>
              <p className="text-2xl font-bold text-green-600">
                {totalInitialStock > 0 ? ((totalSoldItems / totalInitialStock) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-green-700 mt-2">
                De {totalInitialStock} produtos, {totalSoldItems} foram vendidos
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <p className="text-purple-900 font-semibold mb-2">💰 Receita Realizada</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-purple-700 mt-2">
                De um potencial de {formatCurrency(totalPotentialRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}