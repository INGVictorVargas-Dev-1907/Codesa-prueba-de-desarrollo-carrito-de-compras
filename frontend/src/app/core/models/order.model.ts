export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

export interface CustomerData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'CARD' | 'CASH';
  couponCode: string | null;
}

export interface OrderRequest {
  customer: CustomerData;
  items: OrderItemRequest[];
}

export interface OrderLine {
  productId: number;
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
}

export interface Order {
  id: number;
  number: string;
  createdAt: string;
  status: string;
  customer: Omit<CustomerData, 'couponCode'>;
  couponCode: string | null;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export interface ApiError {
  error: string;
  message: string;
}




