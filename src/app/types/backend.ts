/**
 * GlenKeos Backend Type Definitions
 * Generated from backend JSON schemas
 * Version: 1.0.0
 */

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "IN_PREP"
  | "READY"
  | "ASSIGNED"
  | "PICKED_UP"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED";

export type DeliveryMode = "DRIVER" | "ROBOT" | "PICKUP";

export interface OrderModifier {
  modifier_id: string;
  name: string;
  price_delta: number;
}

export interface OrderItem {
  item_id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers: OrderModifier[];
}

export interface OrderPricing {
  subtotal: number;
  tax: number;
  fees: number;
  total: number;
  currency: string;
}

export interface OrderDelivery {
  mode: DeliveryMode;
  address: string;
  eta: string;
}

export interface OrderRisk {
  score: number;
  flags: string[];
}

export interface OrderCompliance {
  flags: string[];
}

export interface OrderTimestamps {
  created_at: string;
  updated_at: string;
  sla_at: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  store_id: string;
  status: OrderStatus;
  items: OrderItem[];
  pricing: OrderPricing;
  delivery: OrderDelivery;
  risk: OrderRisk;
  compliance: OrderCompliance;
  timestamps: OrderTimestamps;
}

// ============================================================================
// DRIVER TYPES
// ============================================================================

export type DriverType = "HUMAN" | "ROBOT";

export type DriverStatus =
  | "OFFLINE"
  | "ONLINE"
  | "ASSIGNED"
  | "EN_ROUTE"
  | "AT_PICKUP"
  | "AT_DROPOFF";

export type VehicleType = "CAR" | "BIKE" | "ROBOT_GEN1" | "ROBOT_GEN2";

export interface DriverLocation {
  lat: number;
  lng: number;
  updated_at: string;
}

export interface DriverVehicle {
  type: VehicleType;
  plate: string;
}

export interface DriverPerformance {
  on_time_rate: number;
  completion_rate: number;
}

export interface Driver {
  driver_id: string;
  type: DriverType;
  name: string;
  status: DriverStatus;
  rating: number;
  risk_score: number;
  location: DriverLocation;
  vehicle: DriverVehicle;
  performance: DriverPerformance;
}

// ============================================================================
// POLICY TYPES (GOVERNANCE VAULT)
// ============================================================================

export type PolicyJurisdiction = "US" | "EU" | "STATE" | "REGION";
export type PolicyScope = "MENU" | "ORDERS" | "DRIVERS" | "DATA";
export type PolicyStatus = "DRAFT" | "APPROVED" | "DEPRECATED";

export interface PolicyRule {
  rule_id: string;
  description: string;
  condition: string;
  requirement: string;
}

export interface PolicyContent {
  summary: string;
  details: string;
  references: string[];
}

export interface PolicyVersion {
  version_id: string;
  version: number;
  content: PolicyContent;
  rules: PolicyRule[];
  approved_by?: string;
  approved_at?: string;
}

export interface Policy {
  policy_id: string;
  title: string;
  jurisdiction: PolicyJurisdiction;
  scope: PolicyScope[];
  status: PolicyStatus;
  current_version_id: string;
  versions: PolicyVersion[];
}

// ============================================================================
// RISK TYPES
// ============================================================================

export type RiskEntityType = "ORDER" | "DRIVER" | "STORE" | "CUSTOMER";
export type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RiskEventStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export interface RiskScoreHistory {
  score: number;
  reason: string;
  at: string;
}

export interface RiskEvent {
  risk_event_id: string;
  severity: RiskSeverity;
  status: RiskEventStatus;
  created_at: string;
}

export interface RiskProfile {
  entity_type: RiskEntityType;
  entity_id: string;
  current_score: number;
  score_history: RiskScoreHistory[];
  open_risk_events: RiskEvent[];
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

export type ComplianceEntityType = "ORDER" | "DRIVER" | "STORE" | "SYSTEM";
export type ComplianceSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplianceStatus = "OPEN" | "IN_REVIEW" | "RESOLVED";

export interface ComplianceHistoryEntry {
  status: string;
  note: string;
  actor_id: string;
  at: string;
}

export interface ComplianceEvent {
  compliance_event_id: string;
  policy_id: string;
  entity_type: ComplianceEntityType;
  entity_id: string;
  severity: ComplianceSeverity;
  status: ComplianceStatus;
  history: ComplianceHistoryEntry[];
}

// ============================================================================
// INVENTORY TYPES
// ============================================================================

export type InventoryAdjustmentType = "USAGE" | "SPOILAGE" | "CORRECTION";

export interface InventoryAdjustment {
  adjustment_type: InventoryAdjustmentType;
  quantity_delta: number;
  reason_code: string;
  actor_id: string;
  at: string;
}

export interface InventoryItem {
  item_id: string;
  store_id: string;
  sku: string;
  name: string;
  quantity: number;
  threshold_low: number;
  threshold_critical: number;
  last_adjustment: InventoryAdjustment;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface ActorInfo {
  actor_id: string;
  actor_type: "staff" | "system" | "driver" | "customer";
  role?: string;
}

export interface OrderStatusChangedEvent {
  event_type: "ORDER_STATUS_CHANGED";
  event_id: string;
  occurred_at: string;
  order: {
    order_id: string;
    store_id: string;
    previous_status: OrderStatus;
    new_status: OrderStatus;
    sla_at: string;
  };
  actor: ActorInfo;
  metadata: Record<string, any>;
}

export interface DriverStatusChangedEvent {
  event_type: "DRIVER_STATUS_CHANGED";
  event_id: string;
  occurred_at: string;
  driver: {
    driver_id: string;
    previous_status: DriverStatus;
    new_status: DriverStatus;
  };
  metadata: {
    location?: {
      lat: number;
      lng: number;
    };
    app_version?: string;
  };
}

export interface InventoryThresholdReachedEvent {
  event_type: "INVENTORY_THRESHOLD_REACHED";
  event_id: string;
  occurred_at: string;
  item: {
    item_id: string;
    store_id: string;
    sku: string;
    name: string;
    current_quantity: number;
    threshold_type: "LOW" | "CRITICAL";
    threshold_value: number;
  };
}

export interface ComplianceViolationDetectedEvent {
  event_type: "COMPLIANCE_VIOLATION_DETECTED";
  event_id: string;
  occurred_at: string;
  violation: {
    compliance_event_id: string;
    policy_id: string;
    rule_id: string;
    severity: ComplianceSeverity;
  };
  entity: {
    entity_type: ComplianceEntityType;
    entity_id: string;
  };
  detected_by: {
    source: string;
    service: string;
  };
}

export interface RiskScoreUpdatedEvent {
  event_type: "RISK_SCORE_UPDATED";
  event_id: string;
  occurred_at: string;
  entity: {
    entity_type: RiskEntityType;
    entity_id: string;
  };
  score: {
    previous_score: number;
    new_score: number;
    reason: string;
    model_version: string;
  };
}

export interface RiskThresholdCrossedEvent {
  event_type: "RISK_THRESHOLD_CROSSED";
  event_id: string;
  occurred_at: string;
  entity: {
    entity_type: RiskEntityType;
    entity_id: string;
  };
  threshold: {
    threshold_type: string;
    threshold_value: number;
  };
  score: {
    current_score: number;
  };
  action: {
    auto_action: string;
    created_risk_event_id: string;
  };
}

export type GlenKeosEvent =
  | OrderStatusChangedEvent
  | DriverStatusChangedEvent
  | InventoryThresholdReachedEvent
  | ComplianceViolationDetectedEvent
  | RiskScoreUpdatedEvent
  | RiskThresholdCrossedEvent;

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface UpdateOrderStatusRequest {
  new_status: OrderStatus;
  reason_code: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrderStatusResponse {
  order_id: string;
  store_id: string;
  status: OrderStatus;
  previous_status: OrderStatus;
  updated_at: string;
  sla_at: string;
  driver_id?: string;
  risk_score: number;
  compliance_flags: string[];
  events: Array<{
    type: string;
    from: OrderStatus;
    to: OrderStatus;
    at: string;
    actor_id: string;
    actor_type: string;
  }>;
}

export interface AssignDriverRequest {
  driver_id: string;
  assignment_reason: string;
  override?: boolean;
}

export interface AssignDriverResponse {
  order_id: string;
  store_id: string;
  status: OrderStatus;
  driver_id: string;
  assigned_at: string;
  previous_driver_id?: string;
  risk_score: number;
  driver_profile: {
    driver_id: string;
    name: string;
    rating: number;
    risk_score: number;
    status: DriverStatus;
  };
}

export interface CreatePolicyRequest {
  title: string;
  jurisdiction: PolicyJurisdiction;
  scope: PolicyScope[];
  content: PolicyContent;
  rules: Omit<PolicyRule, "rule_id">[];
}

export interface CreatePolicyResponse {
  policy_id: string;
  status: PolicyStatus;
  current_version_id: string;
  jurisdiction: PolicyJurisdiction;
  scope: PolicyScope[];
  created_by: string;
  created_at: string;
}

export interface ApprovePolicyRequest {
  version_id: string;
  approval_note: string;
  effective_from: string;
}

export interface ApprovePolicyResponse {
  policy_id: string;
  version_id: string;
  status: PolicyStatus;
  effective_from: string;
  approved_by: string;
  approved_at: string;
}

export interface AdjustInventoryRequest {
  store_id: string;
  adjustment_type: InventoryAdjustmentType;
  quantity_delta: number;
  reason_code: string;
  metadata?: Record<string, any>;
}

export interface AdjustInventoryResponse {
  item_id: string;
  store_id: string;
  sku: string;
  name: string;
  new_quantity: number;
  threshold_low: number;
  threshold_critical: number;
  last_adjustment: InventoryAdjustment;
}

export interface UpdateComplianceEventRequest {
  new_status: ComplianceStatus;
  assigned_to?: string;
  note: string;
}

export interface UpdateComplianceEventResponse {
  event_id: string;
  policy_id: string;
  entity_type: ComplianceEntityType;
  entity_id: string;
  severity: ComplianceSeverity;
  status: ComplianceStatus;
  assigned_to?: string;
  updated_at: string;
  history: ComplianceHistoryEntry[];
}

// ============================================================================
// API ERROR TYPES
// ============================================================================

export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
  request_id: string;
}
