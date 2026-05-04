/**
 * Risk Service API Client
 */

import { apiClient } from "./client";
import type { RiskProfile, RiskEntityType } from "../../types/backend";

export const riskService = {
  async getRiskProfile(
    entityType: RiskEntityType,
    entityId: string
  ): Promise<RiskProfile> {
    return apiClient.get(`/internal/api/v1/risk/entities/${entityType}/${entityId}`);
  }
};
