'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getProducts, Product } from '@/services/products';
import { getAllOrders, Order } from '@/services/orders';
import { setProductCost, getProductCost, ProductCost } from '@/services/costs';
import { formatCurrency } from '@/utils/formatDate';
import Link from 'next/link';

interface ProductProfit {
  product: Product;
  cost?: ProductCost;
  costPrice: number;
  salePrice: number;
  totalSold: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  margin: number;
}

export default function ProfitCalculatorPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profits, setProfits] = useState<ProductProfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        const ordersData = await getAllOrders();

        setProducts(productsData);
        setOrders(ordersData);

        // Calcula lucro de cada produto
        const profitData: ProductProfit[] = [];

        for (const product of productsData) {
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

          const costData = await getProductCost(product.id!);
          const costPrice = costData?.costPrice || 0;
          const totalCost = costPrice * totalSold;
          const netProfit = totalRevenue - totalCost;
          const margin = product.price > 0 ? ((product.price - costPrice) / product.price) * 100 : 0;

          profitData.push({
            product,
            cost: costData || undefined,
            costPrice,
            salePrice: product.price,
            totalSold,
            totalRevenue,
            totalCost,
            netProfit,
            margin,
          });
        }

        setProfits(profitData.sort((a, b) => b.netProfit - a.netProfit));
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditCost = (productId: string, currentCost: number) => {
    setEditingId(productId);
    setEditCost(currentCost);
  };

  const handleSaveCost = async (productId: string) => {
    if (editCost < 0) {
      alert('O custo não pode ser negativo');
      return;
    }

    setIsSubmitting(true);

    try {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      await setProductCost(productId, editCost, product.price);

      // Atualiza a lista de lucros
      const newProfits = profits.map((p) => {
        if (p.product.id === productId) {
          const totalCost = editCost * p.totalSold;
          const netProfit = p.totalRevenue - totalCost;
          const margin = product.price > 0 ? ((product.price - editCost) / product.price) * 100 : 0;

          return {
            ...p,
            costPrice: editCost,
            totalCost,
            netProfit,
            margin,
          };
        }
        return p;
      });

      setProfits(newProfits.sort((a, b) => b.netProfit - a.netProfit));
      setEditingId(null);
      setEditCost(0);
    } catch (error) {
      console.error('Erro ao salvar custo:', error);
      alert('Erro ao salvar custo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalRevenue = profits.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalCosts = profits.reduce((sum, p) => sum + p.totalCost, 0);
  const totalNetProfit = profits.reduce((sum, p) => sum + p.netProfit, 0);
  const averageMargin = profits.length > 0 ? profits.reduce((sum, p) => sum + p.margin, 0) / profits.length : 0;

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
        <div className="max-w-7xl mx-auto">
          <Link href="/admin" className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block">
            ← Voltar
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">💰 Calculadora de Lucro</h1>

          {/* CARDS DE RESUMO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-600">
              <p className="text-gray-600 text-sm mb-2">📊 Receita Total</p>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-orange-600">
              <p className="text-gray-600 text-sm mb-2">💸 Custo Total</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalCosts)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-600">
              <p className="text-gray-600 text-sm mb-2">💎 Lucro Líquido</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalNetProfit)}</p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-600">
              <p className="text-gray-600 text-sm mb-2">📈 Margem Média</p>
              <p className="text-3xl font-bold text-purple-600">{averageMargin.toFixed(1)}%</p>
            </div>
          </div>

          {/* TABELA DE PRODUTOS */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">Análise de Lucro por Produto</h2>
            </div>

            {profits.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <p>Nenhum produto cadastrado ainda</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Custo Unit.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Venda Unit.</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Margem</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vendido</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Receita</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Custo Total</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Lucro Líquido</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profits.map((item) => (
                      <tr key={item.product.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product.name}</td>
                        <td className="px-6 py-4 text-sm">
                          {editingId === item.product.id ? (
                            <input
                              type="number"
                              step="0.01"
                              value={editCost}
                              onChange={(e) => setEditCost(parseFloat(e.target.value) || 0)}
                              className="w-24 border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              disabled={isSubmitting}
                              autoFocus
                            />
                          ) : (
                            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg">
                              {formatCurrency(item.costPrice)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(item.salePrice)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-lg font-semibold ${
                              item.margin >= 50
                                ? 'bg-green-100 text-green-800'
                                : item.margin >= 30
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {item.margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                          {item.totalSold} un.
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">
                          {formatCurrency(item.totalRevenue)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-orange-600">
                          {formatCurrency(item.totalCost)}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold">
                          <span className={item.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(item.netProfit)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {editingId === item.product.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveCost(item.product.id!)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                                disabled={isSubmitting}
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded text-xs font-medium transition"
                                disabled={isSubmitting}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditCost(item.product.id!, item.costPrice)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                            >
                              Editar Custo
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2 border-gray-300">
                    <tr>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900" colSpan={5}>
                        TOTAL
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        {formatCurrency(totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-orange-600">
                        {formatCurrency(totalCosts)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {formatCurrency(totalNetProfit)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* INSIGHTS */}
          {profits.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <p className="text-green-900 font-semibold mb-3">🎯 Melhor Produto</p>
                {profits.length > 0 && (
                  <>
                    <p className="text-lg font-bold text-green-600">{profits[0].product.name}</p>
                    <p className="text-sm text-green-700 mt-2">
                      Lucro: {formatCurrency(profits[0].netProfit)}
                    </p>
                    <p className="text-sm text-green-700">
                      Margem: {profits[0].margin.toFixed(1)}%
                    </p>
                  </>
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <p className="text-blue-900 font-semibold mb-3">📊 Rentabilidade Geral</p>
                <p className="text-lg font-bold text-blue-600">
                  {((totalNetProfit / totalRevenue) * 100).toFixed(1)}%
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  De cada R$ 100 de venda, {((totalNetProfit / totalRevenue) * 100).toFixed(0)} são lucro
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                <p className="text-purple-900 font-semibold mb-3">⚡ Produtos sem Custo</p>
                <p className="text-lg font-bold text-purple-600">
                  {profits.filter((p) => p.costPrice === 0).length}
                </p>
                <p className="text-sm text-purple-700 mt-2">
                  Configure o custo de {profits.filter((p) => p.costPrice === 0).length} produto(s)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}