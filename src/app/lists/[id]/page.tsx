'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { getList, updateList } from '@/services/lists';
import { getOrdersByList, deleteOrder } from '@/services/orders';
import { List } from '@/services/lists';
import { Order } from '@/services/orders';
import { formatCurrency, formatDateTime } from '@/utils/formatDate';
import Link from 'next/link';

export default function ListDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const listId = params.id as string;
  const [list, setList] = useState<List | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTextSummary, setShowTextSummary] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const fetchListAndOrders = async () => {
    try {
      setLoading(true);
      const listData = await getList(listId);
      setList(listData);

      const ordersData = await getOrdersByList(listId);
      setOrders(ordersData);

      // Atualizar valor total da lista
      const totalValue = ordersData.reduce((sum, order) => sum + order.totalValue, 0);
      if (listData && listData.totalValue !== totalValue) {
        await updateList(listId, { totalValue });
      }
    } catch (error) {
      console.error('Erro ao carregar lista:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListAndOrders();
  }, [listId]);

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm('Tem certeza que quer deletar este pedido?')) {
      try {
        await deleteOrder(orderId);
        fetchListAndOrders();
      } catch (error) {
        console.error('Erro ao deletar pedido:', error);
        alert('Erro ao deletar pedido');
      }
    }
  };

  const generateWhatsAppMessage = (order: Order) => {
    let message = `🙏 Olá ${order.clientName}!\n\n`;
    message += `*Seu Pedido:*\n\n`;

    order.items.forEach((item) => {
      message += `• ${item.productName}\n`;
      message += `  ${item.quantity}x ${formatCurrency(item.price)} = ${formatCurrency(item.subtotal)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: ${formatCurrency(order.totalValue)}*\n`;
    message += `━━━━━━━━━━━━━━━━\n\n`;
    message += `Favor confirmar o pagamento! 💳\n`;
    message += `Obrigado! 😊`;

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = (order: Order) => {
    if (!order.clientPhone) {
      alert('Este cliente não tem número de telefone registrado.');
      return;
    }

    const phone = order.clientPhone.replace(/\D/g, '');
    const message = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/55${phone}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  // Gerar resumo em texto
  const generateTextSummary = () => {
    let summary = `📋 RESUMO DE PEDIDOS - ${list?.name || 'Lista'}\n`;
    summary += `${'═'.repeat(50)}\n\n`;

    orders.forEach((order, index) => {
      summary += `👤 PEDIDO ${index + 1}: ${order.clientName}\n`;
      if (order.clientPhone) {
        summary += `📞 ${order.clientPhone}\n`;
      }
      summary += `\n📦 Produtos:\n`;

      order.items.forEach((item) => {
        summary += `  • ${item.productName} x${item.quantity} = ${formatCurrency(item.subtotal)}\n`;
      });

      summary += `\n💰 Total Individual: ${formatCurrency(order.totalValue)}\n`;
      summary += `${'─'.repeat(50)}\n\n`;
    });

    summary += `\n${'═'.repeat(50)}\n`;
    summary += `💵 TOTAL GERAL: ${formatCurrency(totalValue)}\n`;
    summary += `👥 Total de Clientes: ${orders.length}\n`;
    summary += `📦 Total de Itens: ${totalItems}\n`;
    summary += `${'═'.repeat(50)}\n`;

    return summary;
  };

  // Copiar resumo para clipboard
  const copyToClipboard = () => {
    const summary = generateTextSummary();
    navigator.clipboard.writeText(summary).then(() => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  // Enviar resumo completo via WhatsApp (sem número = abre chat vazio)
  const handleWhatsAppSummary = () => {
    const summary = generateTextSummary();
    const encoded = encodeURIComponent(summary);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!list) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Lista não encontrada</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const totalValue = orders.reduce((sum, order) => sum + order.totalValue, 0);
  const totalItems = orders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
  const averageOrder = orders.length > 0 ? totalValue / orders.length : 0;

  // Calcula resumo por produto
  const productSummary = orders.reduce((acc, order) => {
    order.items.forEach((item) => {
      if (!acc[item.productId]) {
        acc[item.productId] = {
          productName: item.productName,
          quantity: 0,
          totalValue: 0,
        };
      }
      acc[item.productId].quantity += item.quantity;
      acc[item.productId].totalValue += item.subtotal;
    });
    return acc;
  }, {} as Record<string, any>);

  const isAdm = user?.role === 'adm';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="mb-8">
            <Link
              href={isAdm ? '/admin/lists' : '/dashboard'}
              className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block"
            >
              ← Voltar
            </Link>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{list.name}</h1>
                  <p className="text-blue-100">Gerenciador de Pedidos e Cobrança</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Criado por: {list.createdBy}</p>
                </div>
              </div>

              {/* CARDS DE RESUMO */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">💰 Total Arrecadado</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">📋 Total de Pedidos</p>
                  <p className="text-3xl font-bold text-white">{orders.length}</p>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">📦 Total de Itens</p>
                  <p className="text-3xl font-bold text-white">{totalItems}</p>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-blue-100 text-sm mb-1">📈 Ticket Médio</p>
                  <p className="text-3xl font-bold text-white">{formatCurrency(averageOrder)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RESUMO POR PRODUTO */}
          {Object.keys(productSummary).length > 0 && (
            <div className="mb-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Produtos Vendidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(productSummary).map((product, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="font-semibold text-gray-900">{product.productName}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">{product.quantity}</span> unidades
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-2">
                      {formatCurrency(product.totalValue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTÕES DE AÇÃO */}
          <div className="mb-6 flex gap-3 flex-wrap">
            {!isAdm && (
              <Link
                href={`/lists/${listId}/new-order`}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition inline-block"
              >
                ➕ Novo Pedido
              </Link>
            )}

            {orders.length > 0 && (
              <>
                <button
                  onClick={handleWhatsAppSummary}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  💬 Resumo WhatsApp
                </button>

                <button
                  onClick={() => setShowTextSummary(!showTextSummary)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  📝 {showTextSummary ? 'Ocultar' : 'Ver'} Resumo em Texto
                </button>

                <button
                  onClick={copyToClipboard}
                  className={`font-bold py-3 px-6 rounded-lg transition ${
                    copiedToClipboard
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {copiedToClipboard ? '✓ Copiado!' : '📋 Copiar Resumo'}
                </button>
              </>
            )}
          </div>

          {/* RESUMO EM TEXTO */}
          {showTextSummary && orders.length > 0 && (
            <div className="mb-8 bg-gray-900 rounded-lg p-6 text-gray-100 overflow-auto max-h-96 font-mono text-sm">
              <pre>{generateTextSummary()}</pre>
            </div>
          )}

          {/* LISTA DE PEDIDOS */}
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-md">
              <p className="text-gray-600 text-lg mb-2">Nenhum pedido nesta lista</p>
              {!isAdm && (
                <Link
                  href={`/lists/${listId}/new-order`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                >
                  Criar Primeiro Pedido
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* HEADER DO PEDIDO */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex justify-between items-start">
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        #{index + 1} - {order.clientName}
                      </p>
                      {order.clientPhone && (
                        <p className="text-sm text-gray-600 mt-1">
                          📞{' '}
                          <a href={`tel:${order.clientPhone}`} className="text-blue-600 hover:underline">
                            {order.clientPhone}
                          </a>
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(order.totalValue)}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.items.length} produto(s)</p>
                    </div>
                  </div>

                  {/* ITENS DO PEDIDO */}
                  <div className="px-6 py-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.productName}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity}x {formatCurrency(item.price)} = {formatCurrency(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOOTER DO PEDIDO COM BOTÕES */}
                  <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    {order.clientPhone ? (
                      <button
                        onClick={() => handleWhatsAppClick(order)}
                        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition flex items-center gap-2"
                      >
                        💬 WhatsApp
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm py-2 px-4">Sem contato WhatsApp</span>
                    )}

                    <button
                      onClick={() => handleDeleteOrder(order.id!)}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* RESUMO FINAL */}
          {orders.length > 0 && (
            <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-green-100 text-sm mb-1">💰 Total de Vendas</p>
                  <p className="text-4xl font-bold">{formatCurrency(totalValue)}</p>
                </div>

                <div>
                  <p className="text-green-100 text-sm mb-1">👥 Pedidos Processados</p>
                  <p className="text-4xl font-bold">{orders.length}</p>
                </div>

                <div>
                  <p className="text-green-100 text-sm mb-1">✅ Com Contato WhatsApp</p>
                  <p className="text-4xl font-bold">{orders.filter((o) => o.clientPhone).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}