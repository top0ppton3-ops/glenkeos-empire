/**
 * GLENKEOS STORES SERVICE - Domain Logic
 *
 * Business logic for store management
 */

import { query } from '../db/client';

export interface Store {
  id: string;
  tenant_id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStoreInput {
  name: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  tenantId: string;
}

export interface UpdateStoreInput {
  name?: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  active?: boolean;
}

/**
 * Create a new store
 */
export async function createStore(input: CreateStoreInput): Promise<Store> {
  const result = await query(
    `INSERT INTO stores (tenant_id, name, address, phone, email)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.tenantId, input.name, input.address, input.phone, input.email]
  );

  return result.rows[0];
}

/**
 * Get store by ID
 */
export async function getStore(storeId: string, tenantId: string): Promise<Store | null> {
  const result = await query(
    `SELECT * FROM stores
     WHERE id = $1 AND tenant_id = $2`,
    [storeId, tenantId]
  );

  return result.rows[0] || null;
}

/**
 * List stores for a tenant
 */
export async function listStores(
  tenantId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Store[]> {
  const result = await query(
    `SELECT * FROM stores
     WHERE tenant_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [tenantId, limit, offset]
  );

  return result.rows;
}

/**
 * Update store
 */
export async function updateStore(
  storeId: string,
  tenantId: string,
  updates: UpdateStoreInput
): Promise<Store | null> {
  // Build dynamic UPDATE query
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }

  if (updates.address !== undefined) {
    fields.push(`address = $${paramIndex++}`);
    values.push(updates.address);
  }

  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramIndex++}`);
    values.push(updates.phone);
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }

  if (updates.active !== undefined) {
    fields.push(`active = $${paramIndex++}`);
    values.push(updates.active);
  }

  if (fields.length === 0) {
    // No updates provided, just return existing store
    return getStore(storeId, tenantId);
  }

  // Add updated_at
  fields.push(`updated_at = NOW()`);

  // Add WHERE clause parameters
  values.push(storeId);
  values.push(tenantId);

  const result = await query(
    `UPDATE stores
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}
