/**
 * Policies Service API Client (Governance Vault)
 */

import { apiClient } from "./client";
import type {
  Policy,
  CreatePolicyRequest,
  CreatePolicyResponse,
  ApprovePolicyRequest,
  ApprovePolicyResponse
} from "../../types/backend";

export const policiesService = {
  async getPolicies(params?: {
    jurisdiction?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ policies: Policy[]; total: number }> {
    return apiClient.get("/internal/api/v1/policies", {
      params: params as Record<string, string>
    });
  },

  async getPolicy(policyId: string): Promise<Policy> {
    return apiClient.get(`/internal/api/v1/policies/${policyId}`);
  },

  async createPolicy(data: CreatePolicyRequest): Promise<CreatePolicyResponse> {
    return apiClient.post("/internal/api/v1/policies", data);
  },

  async approvePolicy(
    policyId: string,
    data: ApprovePolicyRequest
  ): Promise<ApprovePolicyResponse> {
    return apiClient.post(`/internal/api/v1/policies/${policyId}/approve`, data);
  }
};
