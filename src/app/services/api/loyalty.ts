/**
 * Loyalty API Service
 */

import { apiClient } from './client';

export interface LoyaltyAccount {
  customer_id: string;
  points_balance: number;
  lifetime_points: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  created_at: string;
  updated_at: string;
}

export interface LoyaltyTransaction {
  customer_id: string;
  order_id?: string;
  points_change: number;
  reason: string;
  balance_after: number;
  created_at: string;
}

export const loyaltyService = {
  /**
   * Get loyalty account for a customer
   */
  async getAccount(customerId: string): Promise<LoyaltyAccount> {
    const response = await apiClient.get<{ account: LoyaltyAccount }>('get-loyalty-account', {
      customer_id: customerId
    });
    return response.account;
  },

  /**
   * Update loyalty points (earn or redeem)
   */
  async updatePoints(data: {
    customer_id: string;
    order_id?: string;
    amount: number;
    action: 'EARN' | 'REDEEM';
  }): Promise<{ account: LoyaltyAccount; transaction: LoyaltyTransaction }> {
    return apiClient.post('update-loyalty', data);
  },

  /**
   * Get loyalty transaction history
   */
  async getTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    const response = await apiClient.get<{ transactions: LoyaltyTransaction[] }>('get-loyalty-transactions', {
      customer_id: customerId
    });
    return response.transactions || [];
  }
};
