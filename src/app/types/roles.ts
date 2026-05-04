/**
 * GlenKeos Enterprise RBAC (Role-Based Access Control) System
 * 5-tier corporate hierarchy + governance + executive access
 */

// ============================================================================
// ROLE DEFINITIONS - 13 Total Roles
// ============================================================================

export enum UserRole {
  // Customer roles (2)
  CUSTOMER = 'CUSTOMER',
  VIP_CUSTOMER = 'VIP_CUSTOMER',

  // Corporate hierarchy - 5 tiers
  EMPLOYEE = 'EMPLOYEE',                    // Tier 5: Front-line staff
  MANAGER = 'MANAGER',                      // Tier 4: Location managers
  SUPERVISOR = 'SUPERVISOR',                // Tier 3: Multi-location
  AUTHORIZED_REPRESENTATIVE = 'AUTH_REP',   // Tier 2: Brand-level
  OWNER = 'OWNER',                          // Tier 1: Corporate ownership

  // Governance roles (3) - External/Compliance
  AUDITOR = 'AUDITOR',
  IRS_AGENT = 'IRS_AGENT',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',

  // Executive roles (3) - C-level/Security
  EXECUTIVE = 'EXECUTIVE',
  SECURITY_ADMIN = 'SECURITY_ADMIN',
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
}

// For backward compatibility
export type UserRoleType = UserRole;

// ============================================================================
// PORTAL DEFINITIONS - 7 Portals
// ============================================================================

export enum Portal {
  CUSTOMER = 'CUSTOMER',       // Public shopping/booking
  EMPLOYEE = 'EMPLOYEE',       // Task management
  MANAGER = 'MANAGER',         // Location operations
  CORPORATE = 'CORPORATE',     // HQ operations
  GOVERNANCE = 'GOVERNANCE',   // Auditor/IRS only
  EXECUTIVE = 'EXECUTIVE',     // C-level IAM
  ADMIN = 'ADMIN',             // System administration
}

export type PortalType = Portal;

// ============================================================================
// BRAND DEFINITIONS
// ============================================================================

export type Brand =
  | 'ghetto-eats'
  | 'goldkey'
  | 'chic-on-chain';

// ============================================================================
// USER INTERFACES
// ============================================================================

export interface User {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  profile: UserProfile;
  mfa_enabled?: boolean;
  last_login?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  title?: string;
  department?: string;
}

// ============================================================================
// 5-TIER CORPORATE HIERARCHY
// ============================================================================

export const CORPORATE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.OWNER]: 1,
  [UserRole.AUTHORIZED_REPRESENTATIVE]: 2,
  [UserRole.SUPERVISOR]: 3,
  [UserRole.MANAGER]: 4,
  [UserRole.EMPLOYEE]: 5,

  // Non-corporate roles
  [UserRole.CUSTOMER]: 0,
  [UserRole.VIP_CUSTOMER]: 0,
  [UserRole.AUDITOR]: 0,
  [UserRole.IRS_AGENT]: 0,
  [UserRole.COMPLIANCE_OFFICER]: 0,
  [UserRole.EXECUTIVE]: 0,
  [UserRole.SECURITY_ADMIN]: 0,
  [UserRole.SYSTEM_ADMIN]: 0,
};

export function hasHigherAuthority(roleA: UserRole, roleB: UserRole): boolean {
  const levelA = CORPORATE_HIERARCHY[roleA];
  const levelB = CORPORATE_HIERARCHY[roleB];
  return levelA > 0 && levelB > 0 && levelA < levelB;
}

// ============================================================================
// PORTAL ACCESS MATRIX
// ============================================================================

export const ROLE_PORTAL_ACCESS: Record<UserRole, Portal[]> = {
  // Customers
  [UserRole.CUSTOMER]: [Portal.CUSTOMER],
  [UserRole.VIP_CUSTOMER]: [Portal.CUSTOMER],

  // Corporate hierarchy
  [UserRole.EMPLOYEE]: [Portal.EMPLOYEE],
  [UserRole.MANAGER]: [Portal.EMPLOYEE, Portal.MANAGER],
  [UserRole.SUPERVISOR]: [Portal.EMPLOYEE, Portal.MANAGER, Portal.CORPORATE],
  [UserRole.AUTHORIZED_REPRESENTATIVE]: [Portal.MANAGER, Portal.CORPORATE],
  [UserRole.OWNER]: [Portal.CORPORATE, Portal.EXECUTIVE],

  // Governance
  [UserRole.AUDITOR]: [Portal.GOVERNANCE],
  [UserRole.IRS_AGENT]: [Portal.GOVERNANCE],
  [UserRole.COMPLIANCE_OFFICER]: [Portal.GOVERNANCE, Portal.CORPORATE],

  // Executive
  [UserRole.EXECUTIVE]: [Portal.EXECUTIVE, Portal.CORPORATE],
  [UserRole.SECURITY_ADMIN]: [Portal.EXECUTIVE, Portal.ADMIN],
  [UserRole.SYSTEM_ADMIN]: [Portal.ADMIN, Portal.EXECUTIVE, Portal.CORPORATE],
};

// Legacy support
export const PORTAL_ACCESS = ROLE_PORTAL_ACCESS;

export function canAccessPortal(role: UserRole, portal: Portal): boolean {
  const allowedPortals = ROLE_PORTAL_ACCESS[role] || [];
  return allowedPortals.includes(portal);
}

export function getDefaultPortal(role: UserRole): Portal {
  return ROLE_PORTAL_ACCESS[role]?.[0] || Portal.CUSTOMER;
}

// ============================================================================
// PERMISSIONS
// ============================================================================

export enum Permission {
  // Customer
  BROWSE_MENU = 'BROWSE_MENU',
  PLACE_ORDER = 'PLACE_ORDER',
  VIEW_OWN_ORDERS = 'VIEW_OWN_ORDERS',
  USE_LOYALTY = 'USE_LOYALTY',
  BOOK_GOLDKEY = 'BOOK_GOLDKEY',

  // Employee
  VIEW_ASSIGNED_TASKS = 'VIEW_ASSIGNED_TASKS',
  UPDATE_TASK_STATUS = 'UPDATE_TASK_STATUS',
  UPDATE_LOCATION = 'UPDATE_LOCATION',

  // Manager
  VIEW_LOCATION_ORDERS = 'VIEW_LOCATION_ORDERS',
  ASSIGN_STAFF = 'ASSIGN_STAFF',
  EDIT_MENU = 'EDIT_MENU',
  APPROVE_REFUNDS_SMALL = 'APPROVE_REFUNDS_SMALL', // <$100

  // Supervisor
  VIEW_MULTI_LOCATION = 'VIEW_MULTI_LOCATION',
  MANAGE_MANAGERS = 'MANAGE_MANAGERS',
  APPROVE_REFUNDS_MEDIUM = 'APPROVE_REFUNDS_MEDIUM', // <$500

  // Authorized Rep
  CONFIGURE_PRICING = 'CONFIGURE_PRICING',
  APPROVE_REFUNDS_LARGE = 'APPROVE_REFUNDS_LARGE', // <$2000

  // Owner
  VIEW_ALL_ANALYTICS = 'VIEW_ALL_ANALYTICS',
  MANAGE_ALL_STAFF = 'MANAGE_ALL_STAFF',
  APPROVE_REFUNDS_UNLIMITED = 'APPROVE_REFUNDS_UNLIMITED',

  // Governance
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  VIEW_FINANCIAL_REPORTS = 'VIEW_FINANCIAL_REPORTS',
  EXPORT_TAX_DATA = 'EXPORT_TAX_DATA',

  // Executive
  MANAGE_IAM = 'MANAGE_IAM',
  APPROVE_HIGH_RISK = 'APPROVE_HIGH_RISK',
  VIEW_SECURITY_LOGS = 'VIEW_SECURITY_LOGS',

  // Admin
  MANAGE_FEATURE_FLAGS = 'MANAGE_FEATURE_FLAGS',
  EMERGENCY_OVERRIDE = 'EMERGENCY_OVERRIDE',
}

// ============================================================================
// SECURITY REQUIREMENTS
// ============================================================================

export const REQUIRES_MFA: UserRole[] = [
  UserRole.OWNER,
  UserRole.AUTHORIZED_REPRESENTATIVE,
  UserRole.SUPERVISOR,
  UserRole.AUDITOR,
  UserRole.IRS_AGENT,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.EXECUTIVE,
  UserRole.SECURITY_ADMIN,
  UserRole.SYSTEM_ADMIN,
];

export const INVITE_ONLY: UserRole[] = [
  UserRole.EMPLOYEE,
  UserRole.MANAGER,
  UserRole.SUPERVISOR,
  UserRole.AUTHORIZED_REPRESENTATIVE,
  UserRole.OWNER,
  UserRole.AUDITOR,
  UserRole.IRS_AGENT,
  UserRole.COMPLIANCE_OFFICER,
  UserRole.EXECUTIVE,
  UserRole.SECURITY_ADMIN,
  UserRole.SYSTEM_ADMIN,
];

export function requiresMFA(role: UserRole): boolean {
  return REQUIRES_MFA.includes(role);
}

export function isInviteOnly(role: UserRole): boolean {
  return INVITE_ONLY.includes(role);
}

// ============================================================================
// ROLE METADATA
// ============================================================================

export interface RoleMetadata {
  name: string;
  description: string;
  tier?: number;
  category: 'customer' | 'corporate' | 'governance' | 'executive' | 'admin';
  requiresMFA: boolean;
  inviteOnly: boolean;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  [UserRole.CUSTOMER]: {
    name: 'Customer',
    description: 'Standard customer',
    category: 'customer',
    requiresMFA: false,
    inviteOnly: false,
  },
  [UserRole.VIP_CUSTOMER]: {
    name: 'VIP Customer',
    description: 'Premium customer',
    category: 'customer',
    requiresMFA: false,
    inviteOnly: false,
  },
  [UserRole.EMPLOYEE]: {
    name: 'Employee',
    description: 'Front-line staff',
    tier: 5,
    category: 'corporate',
    requiresMFA: false,
    inviteOnly: true,
  },
  [UserRole.MANAGER]: {
    name: 'Manager',
    description: 'Location manager',
    tier: 4,
    category: 'corporate',
    requiresMFA: false,
    inviteOnly: true,
  },
  [UserRole.SUPERVISOR]: {
    name: 'Supervisor',
    description: 'Multi-location supervisor',
    tier: 3,
    category: 'corporate',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.AUTHORIZED_REPRESENTATIVE]: {
    name: 'Authorized Representative',
    description: 'Brand-level authority',
    tier: 2,
    category: 'corporate',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.OWNER]: {
    name: 'Owner',
    description: 'Corporate ownership',
    tier: 1,
    category: 'corporate',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.AUDITOR]: {
    name: 'Auditor',
    description: 'External auditor',
    category: 'governance',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.IRS_AGENT]: {
    name: 'IRS Agent',
    description: 'IRS access',
    category: 'governance',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.COMPLIANCE_OFFICER]: {
    name: 'Compliance Officer',
    description: 'Internal compliance',
    category: 'governance',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.EXECUTIVE]: {
    name: 'Executive',
    description: 'C-level executive',
    category: 'executive',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.SECURITY_ADMIN]: {
    name: 'Security Administrator',
    description: 'Security operations',
    category: 'executive',
    requiresMFA: true,
    inviteOnly: true,
  },
  [UserRole.SYSTEM_ADMIN]: {
    name: 'System Administrator',
    description: 'Technical superuser',
    category: 'admin',
    requiresMFA: true,
    inviteOnly: true,
  },
};

export function getRoleMetadata(role: UserRole): RoleMetadata {
  return ROLE_METADATA[role];
}
