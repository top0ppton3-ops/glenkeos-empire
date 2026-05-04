/**
 * Payment Service
 * CRITICAL: Card, Apple Pay, Cash App only - NO PayPal
 * All payment processing via Stripe
 */

import { supabase } from '../../../../utils/supabase/client';
import type { PaymentMethodType } from '../../types/contracts';

export interface AddCardRequest {
  payment_method_token: string; // From Stripe.js
}

export interface AddCardResponse {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface CreatePaymentIntentRequest {
  order_id: string;
  amount: number; // In cents
  currency: string;
  payment_method_id: string;
}

export interface CreatePaymentIntentResponse {
  payment_id: string;
  status: string;
}

export const paymentsService = {
  /**
   * Add card payment method (tokenized from Stripe.js)
   */
  addCard: async (userId: string, request: AddCardRequest): Promise<AddCardResponse> => {
    const { data, error } = await supabase.rpc('add_payment_method_card', {
      p_user_id: userId,
      p_provider_reference: request.payment_method_token,
    });

    if (error) throw error;
    return data as AddCardResponse;
  },

  /**
   * Create payment intent with saved card
   */
  createPaymentIntent: async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
    const { data, error } = await supabase.rpc('create_payment_intent', {
      p_order_id: request.order_id,
      p_amount: request.amount,
      p_currency: request.currency,
      p_payment_method_id: request.payment_method_id,
    });

    if (error) throw error;
    return { payment_id: data, status: 'pending' };
  },

  /**
   * Get user payment methods
   */
  getUserPaymentMethods: async (userId: string) => {
    const { data, error } = await supabase.rpc('get_user_payment_methods', {
      p_user_id: userId,
    });

    if (error) throw error;
    return data || [];
  },

  /**
   * Set default payment method
   */
  setDefaultPaymentMethod: async (userId: string, methodId: string): Promise<void> => {
    const { error } = await supabase.rpc('set_default_payment_method', {
      p_user_id: userId,
      p_method_id: methodId,
    });

    if (error) throw error;
  },
};
