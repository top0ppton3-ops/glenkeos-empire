/**
 * ================================================================
 * GLENKEOS API CONTRACTS - Fortune 500 JSON Specifications
 * ================================================================
 * Complete TypeScript contracts for all API requests/responses
 */

// ================================================================
// BRAND TYPES
// ================================================================

export type BrandId = 'chic-on-chain' | 'ghetto-eats' | 'goldkey';
export type BrandTier = 'B1' | 'B2' | 'B3';

export interface Brand {
  brand_id: BrandId;
  brand_name: string;
  brand_tier: BrandTier;
  description: string;
  logo_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// ================================================================
// STORE TYPES
// ================================================================

export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'CLOSED';

export interface Store {
  store_id: string;
  brand_id: BrandId;
  store_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  status: StoreStatus;
  hours?: Record<string, { open: string; close: string }>;
  features?: string[];
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// ================================================================
// PRODUCT/MENU TYPES
// ================================================================

export interface Product {
  product_id: string;
  brand_id: BrandId;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url?: string;
  available: boolean;
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  allergens?: string[];
  customization_options?: CustomizationOption[];
  created_at: string;
  updated_at: string;
}

export interface CustomizationOption {
  option_id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices: {
    choice_id: string;
    name: string;
    price_modifier: number;
  }[];
}

// ================================================================
// ORDER TYPES
// ================================================================

export type OrderStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'IN_PREP' 
  | 'READY' 
  | 'OUT_FOR_DELIVERY' 
  | 'COMPLETED' 
  | 'CANCELLED';

export interface Order {
  order_id: string;
  customer_id: string;
  store_id: string;
  brand_id: BrandId;
  status: OrderStatus;
  order_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  tip: number;
  total: number;
  payment_id?: string;
  delivery_address?: Address;
  special_instructions?: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  driver_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  customizations?: {
    option_id: string;
    option_name: string;
    choice_id: string;
    choice_name: string;
    price_modifier: number;
  }[];
  subtotal: number;
  special_instructions?: string;
}

export interface Address {
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  delivery_instructions?: string;
}

// ================================================================
// PAYMENT TYPES
// ================================================================

export type PaymentStatus = 
  | 'PENDING' 
  | 'AUTHORIZED' 
  | 'COMPLETED' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod = 'PAYPAL' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH' | 'APPLE_PAY' | 'GOOGLE_PAY';

export interface Payment {
  payment_id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  processor: 'PAYPAL' | 'STRIPE';
  processor_response?: any;
  failure_reason?: string;
  refund_amount?: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// ================================================================
// DRIVER TYPES
// ================================================================

export type DriverStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERING' | 'OFFLINE';

export interface Driver {
  driver_id: string;
  cognito_sub: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  vehicle_type: string;
  vehicle_plate: string;
  license_number: string;
  status: DriverStatus;
  current_location?: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  active_order_id?: string;
  rating?: number;
  total_deliveries?: number;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// ================================================================
// CUSTOMER TYPES
// ================================================================

export interface Customer {
  customer_id: string;
  cognito_sub: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  preferences?: {
    favorite_stores?: string[];
    dietary_restrictions?: string[];
    default_payment_method?: PaymentMethod;
  };
  marketing_opt_in: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  address_id: string;
  customer_id: string;
  label: string;
  is_default: boolean;
  address: Address;
  created_at: string;
  updated_at: string;
}

// ================================================================
// LOYALTY TYPES
// ================================================================

export interface LoyaltyAccount {
  loyalty_id: string;
  customer_id: string;
  brand_id: BrandId;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  lifetime_spend: number;
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  transaction_id: string;
  loyalty_id: string;
  order_id?: string;
  points_change: number;
  transaction_type: 'EARN' | 'REDEEM' | 'EXPIRE' | 'ADJUST';
  description: string;
  created_at: string;
}

// ================================================================
// NOTIFICATION TYPES
// ================================================================

export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH';
export type NotificationStatus = 'PENDING' | 'SENT' | 'FAILED' | 'DELIVERED';

export interface Notification {
  notification_id: string;
  recipient_id: string;
  channel: NotificationChannel;
  template_id: string;
  subject?: string;
  message: string;
  status: NotificationStatus;
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

// ================================================================
// INVENTORY TYPES
// ================================================================

export interface InventoryItem {
  inventory_id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  last_restock_date?: string;
  expiry_date?: string;
  supplier?: string;
  cost_per_unit?: number;
  updated_at: string;
}

// ================================================================
// STAFF TYPES
// ================================================================

export type StaffRole = 'COOK' | 'CASHIER' | 'MANAGER' | 'DRIVER' | 'ADMIN';
export type ShiftStatus = 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Staff {
  staff_id: string;
  cognito_sub: string;
  store_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: StaffRole;
  active: boolean;
  hourly_rate?: number;
  hire_date: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  shift_id: string;
  staff_id: string;
  store_id: string;
  start_time: string;
  end_time: string;
  status: ShiftStatus;
  break_duration_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ================================================================
// METRICS TYPES
// ================================================================

export interface Metric {
  metric_id: string;
  metric_name: string;
  metric_type: 'SALES' | 'OPERATIONAL' | 'COMPLIANCE' | 'CUSTOMER';
  entity_type: 'STORE' | 'BRAND' | 'DRIVER' | 'PRODUCT';
  entity_id: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: any;
  tenant_id: string;
}

// ================================================================
// API REQUEST/RESPONSE TYPES
// ================================================================

// Order Creation
export interface CreateOrderRequest {
  brand_id: BrandId;
  store_id: string;
  customer_id: string;
  order_type: 'DELIVERY' | 'PICKUP' | 'DINE_IN';
  items: {
    product_id: string;
    quantity: number;
    customizations?: {
      option_id: string;
      choice_id: string;
    }[];
    special_instructions?: string;
  }[];
  delivery_address?: Address;
  special_instructions?: string;
  tip?: number;
}

export interface CreateOrderResponse {
  success: boolean;
  order: Order;
  payment_required: boolean;
  estimated_ready_time: string;
}

// Payment Processing
export interface ProcessPaymentRequest {
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  payment_details?: {
    paypal_order_id?: string;
    card_token?: string;
  };
}

export interface ProcessPaymentResponse {
  success: boolean;
  payment_id: string;
  transaction_id: string;
  status: PaymentStatus;
  receipt_url?: string;
}

// Driver Assignment
export interface AssignDriverRequest {
  order_id: string;
  driver_id?: string; // If not provided, auto-assign
}

export interface AssignDriverResponse {
  success: boolean;
  driver: Driver;
  estimated_delivery_time: string;
}

// Location Tracking
export interface UpdateLocationRequest {
  driver_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export interface GetDriverLocationResponse {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
    updated_at: string;
  };
  eta_minutes?: number;
}

// Loyalty Operations
export interface UpdateLoyaltyRequest {
  customer_id: string;
  brand_id: BrandId;
  order_id: string;
  amount_spent: number;
}

export interface UpdateLoyaltyResponse {
  success: boolean;
  points_earned: number;
  new_balance: number;
  tier: string;
}

// Analytics Query
export interface AnalyticsRequest {
  brand_id?: BrandId;
  store_id?: string;
  metric_type?: string;
  start_date: string;
  end_date: string;
  group_by?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    timestamp: string;
    value: number;
    metadata?: any;
  }[];
  summary: {
    total: number;
    average: number;
    min: number;
    max: number;
  };
}

// ================================================================
// ERROR TYPES
// ================================================================

export interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// ================================================================
// COMMON RESPONSE WRAPPER
// ================================================================

export type APIResponse<T> = 
  | ({ success: true } & T)
  | APIError;
