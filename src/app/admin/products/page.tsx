'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from '@/services/products';
import { formatCurrency } from '@/utils/formatDate';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    initialQuantity: 0,
  });

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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleResetForm = () => {
    setFormData({ name: '', price: 0, initialQuantity: 0 });
    setEditingId(null);
    setShowForm(false);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Se estiver vazio, deixar como string vazia, senão converter para number
    const numValue = value === '' ? '' : parseFloat(value);
    setFormData({ 
      ...formData, 
      price: typeof numValue === 'number' ? numValue : 0
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Se estiver vazio, deixar como string vazia, senão converter para number
    const numValue = value === '' ? '' : parseInt(value);
    setFormData({ 
      ...formData, 
      initialQuantity: typeof numValue === 'number' ? numValue : 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Por favor, insira o nome do produto');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      alert('Por favor, insira um preço válido e maior que 0');
      return;
    }

    if (formData.initialQuantity < 0) {
      alert('Por favor, insira uma quantidade válida');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        await updateProduct(editingId, {
          name: formData.name,
          price: formData.price as number,
          initialQuantity: formData.initialQuantity as number,
          currentQuantity: formData.initialQuantity as number,
        });
      } else {
        await createProduct({
          name: formData.name,
          price: formData.price as number,
          initialQuantity: formData.initialQuantity as number,
          currentQuantity: formData.initialQuantity as number,
        });
      }

      handleResetForm();
      fetchProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price,
      initialQuantity: product.initialQuantity,
    });
    setEditingId(product.id!);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Tem certeza que quer deletar este produto?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        alert('Erro ao deletar produto');
      }
    }
  };

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

          <h1 className="text-4xl font-bold text-gray-900 mb-8">📦 Produtos</h1>

          <div className="mb-6">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                ➕ Novo Produto
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Editar Produto' : 'Novo Produto'}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Salgado"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price === 0 ? '' : formData.price}
                      onChange={handlePriceChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.initialQuantity === 0 ? '' : formData.initialQuantity}
                      onChange={handleQuantityChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-600 text-lg">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Produto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Preço</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qtd. Inicial</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Qtd. Atual</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-300 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.initialQuantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.currentQuantity}</td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id!)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}