'use client';

import { Product } from '@/services/products';
import { formatCurrency } from '@/utils/formatDate';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <button
      type='button'
      onClick={() => onSelect(product)}
      className="bg-white border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition text-left"
    >
      <h4 className="font-semibold text-gray-800">{product.name}</h4>
      <p className="text-blue-600 font-bold text-lg">{formatCurrency(product.price)}</p>
      <p className="text-xs text-gray-500">
        Em estoque: <span className="font-semibold">{product.currentQuantity}</span>
      </p>
    </button>
  );
}