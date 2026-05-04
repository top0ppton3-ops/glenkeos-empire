/**
 * API Services - Central export
 */

// Import the legacy supabaseAPI
import supabaseAPI from './supabaseAPI';

// Export individual services
export { apiClient } from './client';
export { ordersService } from './orders';
export { driversService } from './drivers';
export { metricsService } from './metrics';
export { loyaltyService } from './loyalty';
export { goldkeyService } from './goldkey';
export * from './client';

// Export supabaseAPI as both default and named export 'api'
export { supabaseAPI as api };
export default supabaseAPI;

// Also export other existing services that might be imported
export { inventoryService } from './inventory';
export { paymentsService } from './payments';
export { autoAssignAllReadyOrders } from './autoAssignment';

// Mock mode flag (for development/testing)
export const USE_MOCK = false;
