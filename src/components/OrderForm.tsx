'use client';

import { useState, useEffect } from 'react';
import { Product, getProducts } from '@/services/products';
import { OrderItem } from '@/services/orders';
import ProductCard from './ProductCard';
import { calculateItemSubtotal, calculateOrderTotal } from '@/utils/calculateTotal';
import { formatCurrency } from '@/utils/formatDate';

interface OrderFormProps {
  onSubmit: (clientName: string, clientPhone: string, items: OrderItem[]) => void;
  isLoading: boolean;
}

export default function OrderForm({ onSubmit, isLoading }: OrderFormProps) {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = (product: Product) => {
    // Verifica se o produto tem estoque
    if (product.currentQuantity <= 0) {
      alert(`O produto "${product.name}" está fora de estoque!`);
      return;
    }

    const existingItem = selectedItems.find((item) => item.productId === product.id);

    if (existingItem) {
      // Verifica se ainda tem estoque para adicionar mais
      const totalQuantityNeeded = existingItem.quantity + 1;
      if (totalQuantityNeeded > product.currentQuantity) {
        alert(`Apenas ${product.currentQuantity} unidades de "${product.name}" disponíveis no estoque!`);
        return;
      }

      const newQuantity = existingItem.quantity + 1;
      const newSubtotal = calculateItemSubtotal(product.price, newQuantity);

      setSelectedItems(
        selectedItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQuantity, subtotal: newSubtotal } : item
        )
      );
    } else {
      const subtotal = calculateItemSubtotal(product.price, 1);
      setSelectedItems([
        ...selectedItems,
        {
          productId: product.id!,
          productName: product.name,
          quantity: 1,
          price: product.price,
          subtotal: subtotal,
        },
      ]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }

    // Verifica estoque disponível
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.currentQuantity) {
      alert(`Apenas ${product.currentQuantity} unidades disponíveis no estoque!`);
      return;
    }

    setSelectedItems(
      selectedItems.map((item) => {
        if (item.productId === productId) {
          const newSubtotal = calculateItemSubtotal(item.price, quantity);
          return { ...item, quantity, subtotal: newSubtotal };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      alert('Por favor, insira o nome do cliente');
      return;
    }

    if (selectedItems.length === 0) {
      alert('Por favor, selecione pelo menos um produto');
      return;
    }

    onSubmit(clientName, clientPhone, selectedItems);
  };

  const totalValue = calculateOrderTotal(selectedItems);

  if (loading) {
    return <div className="text-center py-8">Carregando produtos...</div>;
  }

  const productsWithStock = products.filter((p) => p.currentQuantity > 0);
  const productsOutOfStock = products.filter((p) => p.currentQuantity <= 0);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente *</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: João Silva"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (Opcional)</label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: (81) 99999-9999"
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📦 Produtos Disponíveis</h3>
        {productsWithStock.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {productsWithStock.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleAddProduct} />
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p>Nenhum produto disponível em estoque no momento.</p>
          </div>
        )}
      </div>

      {productsOutOfStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium mb-2">❌ Produtos Fora de Estoque:</p>
          <ul className="text-sm text-red-700 space-y-1">
            {productsOutOfStock.map((product) => (
              <li key={product.id}>• {product.name}</li>
            ))}
          </ul>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Itens do Pedido</h3>
          <div className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.productId} className="bg-white border border-gray-200 rounded p-3 flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.productName}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} x
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
                      className="w-16 ml-2 border border-gray-300 rounded px-2 py-1 text-center"
                      disabled={isLoading}
                    />
                    = <span className="font-semibold text-blue-600">{formatCurrency(item.subtotal)}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.productId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition"
                  disabled={isLoading}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center text-xl">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="font-bold text-green-600">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || selectedItems.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
      >
        {isLoading ? 'Salvando...' : 'Criar Pedido'}
      </button>
    </form>
  );
}