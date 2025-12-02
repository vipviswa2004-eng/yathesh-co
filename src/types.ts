
export enum Shape {
  RECTANGLE = 'Rectangle',
  SQUARE = 'Square',
  ROUND = 'Round',
  HEART = 'Heart',
  OTHER = 'Other',
  CUSTOM = 'Custom'
}

export interface VariationOption {
  id: string;
  label: string;
  description?: string;
  priceAdjustment: number;
  image?: string;
}

export interface Variation {
  id: string;
  name: string;
  options: VariationOption[];
}

export type ProductStatus = 'Active' | 'Inactive' | 'Draft';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  sku?: string;
  description: string;
  base_price: number;
  gst_price?: number;
  pdfPrice: number; // Alias for base_price for backwards compatibility
  shape: Shape | string;
  customShapeName?: string;
  customShapeCost?: number;
  custom_shape_cost?: number;
  image: string; // Primary image (first from images array)
  images?: string[];
  size?: string;
  discount?: number;
  allowsExtraHeads?: boolean;
  allows_extra_heads?: boolean;
  variations?: Variation[];
  stock?: number;
  status?: ProductStatus;
  is_personalized?: boolean;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  cartId: string;
  customName: string;
  customImage?: string | null;
  calculatedPrice: number;
  originalPrice: number;
  quantity: number;
  extraHeads?: number;
  selectedVariations?: Record<string, VariationOption>;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned' | 'Refunded';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Refunded';
  itemsCount: number;
  trackingNumber?: string;
  courier?: string;
  returnReason?: string;
  shippingAddress?: string;
}

export type AdminRole = 'Super Admin' | 'Product Manager' | 'Order Manager' | 'Inventory Operator' | 'Finance Manager' | 'Customer Support' | 'Support Agent';

export interface User {
  id: string;
  email: string;
  name: string;
  display_name?: string;
  image?: string;
  isAdmin?: boolean;
  role?: AdminRole;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
  address?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'Approved' | 'Pending' | 'Rejected' | 'Flagged';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  status: 'Active' | 'Expired';
}

export interface Seller {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  status: 'Active' | 'Pending' | 'Suspended';
  rating: number;
  balance: number;
  returnRate?: number;
}

export interface Shipment {
    id: string;
    orderId: string;
    courier: string;
    trackingId: string;
    status: 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Exception';
    estimatedDelivery: string;
}

export interface Transaction {
    id: string;
    orderId: string;
    amount: number;
    type: 'Credit' | 'Debit' | 'Payout';
    status: 'Success' | 'Pending' | 'Failed';
    date: string;
    method: string;
}

export interface ReturnRequest {
    id: string;
    orderId: string;
    customerName: string;
    productName: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    amount: number;
}

export const ADMIN_EMAILS = [
  "signgalaxy31@gmail.com",
  "viswakumar2004@gmail.com"
];

export const WHATSAPP_NUMBERS = [
  "9342310194",
  "6380016798"
];
