'use client';

import Link from 'next/link';
import { List } from '@/services/lists';
import { formatDate, formatCurrency } from '@/utils/formatDate';

interface ListCardProps {
  list: List;
}

export default function ListCard({ list }: ListCardProps) {
  return (
    <Link href={`/lists/${list.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-800">{list.name}</h3>
        <p className="text-sm text-gray-600">Data: {formatDate(list.date as any)}</p>
        <p className="text-sm text-gray-600">
          Valor total: <span className="font-semibold text-green-600">{formatCurrency(list.totalValue)}</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">Criado por: {list.createdBy}</p>
      </div>
    </Link>
  );
}