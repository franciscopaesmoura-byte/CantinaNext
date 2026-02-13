import { OrderItem } from '@/services/orders';

export const calculateOrderTotal = (items: OrderItem[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

export const calculateItemSubtotal = (price: number, quantity: number): number => {
  return parseFloat((price * quantity).toFixed(2));
};