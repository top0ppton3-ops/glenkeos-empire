/**
 * Compliance Service API Client
 */

import { apiClient } from "./client";
import type {
  ComplianceEvent,
  UpdateComplianceEventRequest,
  UpdateComplianceEventResponse
} from "../../types/backend";

export const complianceService = {
  async getComplianceEvents(params?: {
    status?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: ComplianceEvent[]; total: number }> {
    return apiClient.get("/internal/api/v1/compliance/events", {
      params: params as Record<string, string>
    });
  },

  async getComplianceEvent(eventId: string): Promise<ComplianceEvent> {
    return apiClient.get(`/internal/api/v1/compliance/events/${eventId}`);
  },

  async updateComplianceEventStatus(
    eventId: string,
    data: UpdateComplianceEventRequest
  ): Promise<UpdateComplianceEventResponse> {
    return apiClient.post(
      `/internal/api/v1/compliance/events/${eventId}/update_status`,
      data
    );
  }
};
