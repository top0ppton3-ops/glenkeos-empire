/**
 * GLENKEOS STORES SERVICE - Lambda Handler
 *
 * Pilot microservice for hybrid deployment
 * Implements: POST/GET/PUT /v1/stores
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createStore, getStore, listStores, updateStore } from '../domain/stores';
import { publishEvent } from '../events/publisher';

/**
 * CORS headers for all responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json'
};

/**
 * Error response helper
 */
function errorResponse(statusCode: number, message: string): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message })
  };
}

/**
 * Success response helper
 */
function successResponse(statusCode: number, data: any): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data)
  };
}

/**
 * Extract tenant ID from Cognito authorizer context
 */
function getTenantId(event: APIGatewayProxyEvent): string {
  return event.requestContext.authorizer?.claims?.['custom:tenantId'] || 'default';
}

/**
 * Extract user ID from Cognito authorizer context
 */
function getUserId(event: APIGatewayProxyEvent): string {
  return event.requestContext.authorizer?.claims?.sub || 'anonymous';
}

/**
 * POST /v1/stores - Create new store
 */
export async function create(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    console.log('Creating store', { body: event.body });

    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const body = JSON.parse(event.body);
    const { name, address, phone, email } = body;

    // Validate required fields
    if (!name || !address) {
      return errorResponse(400, 'Name and address are required');
    }

    const tenantId = getTenantId(event);
    const userId = getUserId(event);

    // Create store in database
    const store = await createStore({
      name,
      address,
      phone: phone || null,
      email: email || null,
      tenantId
    });

    // Publish STORE_CREATED event
    await publishEvent({
      eventType: 'STORE_CREATED',
      tenantId,
      actorId: userId,
      payload: {
        storeId: store.id,
        name: store.name,
        address: store.address
      }
    });

    console.log('Store created successfully', { storeId: store.id });

    return successResponse(201, store);

  } catch (error: any) {
    console.error('Error creating store:', error);
    return errorResponse(500, error.message || 'Internal server error');
  }
}

/**
 * GET /v1/stores/{id} - Get store by ID
 */
export async function get(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const storeId = event.pathParameters?.id;

    if (!storeId) {
      return errorResponse(400, 'Store ID is required');
    }

    const tenantId = getTenantId(event);

    const store = await getStore(storeId, tenantId);

    if (!store) {
      return errorResponse(404, 'Store not found');
    }

    return successResponse(200, store);

  } catch (error: any) {
    console.error('Error getting store:', error);
    return errorResponse(500, error.message || 'Internal server error');
  }
}

/**
 * GET /v1/stores - List all stores
 */
export async function list(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const tenantId = getTenantId(event);

    // Parse pagination parameters
    const limit = parseInt(event.queryStringParameters?.limit || '50');
    const offset = parseInt(event.queryStringParameters?.offset || '0');

    const stores = await listStores(tenantId, limit, offset);

    return successResponse(200, {
      items: stores,
      pagination: {
        limit,
        offset,
        total: stores.length
      }
    });

  } catch (error: any) {
    console.error('Error listing stores:', error);
    return errorResponse(500, error.message || 'Internal server error');
  }
}

/**
 * PUT /v1/stores/{id} - Update store
 */
export async function update(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const storeId = event.pathParameters?.id;

    if (!storeId) {
      return errorResponse(400, 'Store ID is required');
    }

    if (!event.body) {
      return errorResponse(400, 'Request body is required');
    }

    const body = JSON.parse(event.body);
    const tenantId = getTenantId(event);
    const userId = getUserId(event);

    // Update store in database
    const store = await updateStore(storeId, tenantId, body);

    if (!store) {
      return errorResponse(404, 'Store not found');
    }

    // Publish STORE_UPDATED event
    await publishEvent({
      eventType: 'STORE_UPDATED',
      tenantId,
      actorId: userId,
      payload: {
        storeId: store.id,
        changes: body
      }
    });

    console.log('Store updated successfully', { storeId: store.id });

    return successResponse(200, store);

  } catch (error: any) {
    console.error('Error updating store:', error);
    return errorResponse(500, error.message || 'Internal server error');
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function options(): Promise<APIGatewayProxyResult> {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: ''
  };
}
