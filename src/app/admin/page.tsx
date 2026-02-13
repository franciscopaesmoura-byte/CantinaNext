'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getProducts } from '@/services/products';
import { getAllOrders } from '@/services/orders';
import { Product } from '@/services/products';
import { Order } from '@/services/orders';
import { formatCurrency } from '@/utils/formatDate';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsData = await getProducts();
        const ordersData = await getAllOrders();

        setProducts(productsData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSold = orders.reduce((sum, order) => sum + order.totalValue, 0);
  const totalOrders = orders.length;
  const totalProducts = products.reduce((sum, product) => sum + product.currentQuantity, 0);
  const productsWithoutStock = products.filter((p) => p.currentQuantity === 0).length;

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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">🛠️ Dashboard do Administrador</h1>

          {/* CARDS DE RESUMO RÁPIDO */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-green-100 text-sm mb-2">💰 Total Vendido</p>
              <p className="text-3xl font-bold">{formatCurrency(totalSold)}</p>
              <p className="text-xs text-green-100 mt-2">{totalOrders} pedidos processados</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-blue-100 text-sm mb-2">📦 Produtos em Estoque</p>
              <p className="text-3xl font-bold">{totalProducts}</p>
              <p className="text-xs text-blue-100 mt-2">{products.length} produtos cadastrados</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-orange-100 text-sm mb-2">⚠️ Fora de Estoque</p>
              <p className="text-3xl font-bold">{productsWithoutStock}</p>
              <p className="text-xs text-orange-100 mt-2">Produtos para reabastecer</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
              <p className="text-purple-100 text-sm mb-2">📊 Ticket Médio</p>
              <p className="text-3xl font-bold">
                {totalOrders > 0 ? formatCurrency(totalSold / totalOrders) : 'R$ 0,00'}
              </p>
              <p className="text-xs text-purple-100 mt-2">Por pedido</p>
            </div>
          </div>

          {/* GRID DE FUNCIONALIDADES */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* PRODUTOS */}
            <Link href="/admin/products">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 border-l-4 border-blue-600">
                <p className="text-4xl mb-2">📦</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Produtos</h3>
                <p className="text-gray-600 text-sm mb-4">Gerenciar e criar produtos da cantina</p>
                <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-xs font-medium">
                  {products.length} produtos
                </div>
              </div>
            </Link>

            {/* ANÁLISE DE ESTOQUE */}
            <Link href="/admin/inventory-analysis">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 border-l-4 border-green-600">
                <p className="text-4xl mb-2">📊</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Análise de Estoque</h3>
                <p className="text-gray-600 text-sm mb-4">Estoque, vendas e receita por produto</p>
                <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-medium">
                  {totalProducts} unidades
                </div>
              </div>
            </Link>

            {/* CALCULADORA DE LUCRO */}
            <Link href="/admin/profit-calculator">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 border-l-4 border-purple-600">
                <p className="text-4xl mb-2">💰</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Calculadora de Lucro</h3>
                <p className="text-gray-600 text-sm mb-4">Custo x Venda = Lucro Líquido</p>
                <div className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-lg text-xs font-medium">
                  Análise Completa
                </div>
              </div>
            </Link>

            {/* RELATÓRIOS */}
            <Link href="/admin/reports">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 border-l-4 border-orange-600">
                <p className="text-4xl mb-2">📈</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Relatórios</h3>
                <p className="text-gray-600 text-sm mb-4">Vendas, produtos e controle geral</p>
                <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-lg text-xs font-medium">
                  {totalOrders} pedidos
                </div>
              </div>
            </Link>

            {/* LISTAS */}
            <Link href="/admin/lists">
              <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 border-l-4 border-indigo-600">
                <p className="text-4xl mb-2">📋</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Listas de Pedidos</h3>
                <p className="text-gray-600 text-sm mb-4">Acessar todas as listas criadas</p>
                <div className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-xs font-medium">
                  Dashboard Completo
                </div>
              </div>
            </Link>

            {/* ATALHO RÁPIDO */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md hover:shadow-xl transition cursor-pointer p-6 text-white">
              <p className="text-4xl mb-2">⚡</p>
              <h3 className="text-xl font-bold mb-2">Dica Rápida</h3>
              <p className="text-blue-100 text-sm mb-4">Clique em qualquer lista para ver o dashboard de cobrança com WhatsApp integrado</p>
              <div className="inline-block bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-xs font-medium">
                Produtividade +
              </div>
            </div>
          </div>

          {/* AVISOS E ALERTAS */}
          {productsWithoutStock > 0 && (
            <div className="mb-8 bg-orange-50 border-l-4 border-orange-600 rounded-lg p-6">
              <p className="text-orange-900 font-bold text-lg mb-2">⚠️ Produtos Fora de Estoque</p>
              <p className="text-orange-800 mb-4">
                {productsWithoutStock} produto(s) com quantidade = 0. Edite-os para adicionar mais ao estoque.
              </p>
              <Link href="/admin/products">
                <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition">
                  Gerenciar Produtos
                </button>
              </Link>
            </div>
          )}

          {/* CARDS DE INFORMAÇÃO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FLUXO DE TRABALHO */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Fluxo de Trabalho</h3>
              <ol className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Cadastre produtos em <strong>Gerenciar Produtos</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Defina o custo de cada produto em <strong>Calculadora de Lucro</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Acompanhe vendas em <strong>Análise de Estoque</strong></span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>Controle a cobrança clicando em uma <strong>Lista de Pedidos</strong></span>
                </li>
              </ol>
            </div>

            {/* ESTATÍSTICAS RÁPIDAS */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estatísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total de Vendas:</span>
                  <span className="font-bold text-green-600">{formatCurrency(totalSold)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pedidos Processados:</span>
                  <span className="font-bold text-blue-600">{totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Produtos Cadastrados:</span>
                  <span className="font-bold text-purple-600">{products.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estoque Total:</span>
                  <span className="font-bold text-orange-600">{totalProducts} un.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}