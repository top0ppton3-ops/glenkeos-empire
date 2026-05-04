import { APIGatewayProxyHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /customers
 * Create a new customer
 */
export const createCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, phone, first_name, last_name, cognito_sub, referral_code } = body;
    
    if (!email || !phone || !first_name || !last_name) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Missing required fields: email, phone, first_name, last_name' 
        })
      };
    }

    const db = await getDBClient();
    const customerId = uuidv4();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Check if customer already exists
    const existingCustomer = await db.query(
      'SELECT id FROM customers WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );

    if (existingCustomer.rows.length > 0) {
      return {
        statusCode: 409,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          error: 'Customer with this email already exists',
          customer_id: existingCustomer.rows[0].id
        })
      };
    }

    // Create customer
    const result = await db.query(
      `INSERT INTO customers (
        id, tenant_id, cognito_sub, email, phone, 
        first_name, last_name, reward_points, reward_tier, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
      [
        customerId,
        tenantId,
        cognito_sub,
        email,
        phone,
        first_name,
        last_name,
        0, // Initial reward points
        'BRONZE' // Initial tier
      ]
    );

    const customer = result.rows[0];

    // Handle referral if provided
    if (referral_code) {
      await db.query(
        `INSERT INTO referrals (
          id, tenant_id, referrer_id, referred_id, 
          referral_code, status, created_at
        ) VALUES (
          $1, $2, 
          (SELECT id FROM customers WHERE tenant_id = $2 AND referral_code = $3),
          $4, $5, $6, NOW()
        )`,
        [uuidv4(), tenantId, referral_code, customerId, referral_code, 'PENDING']
      );
    }

    // Publish event
    await publishEvent({
      eventType: 'CUSTOMER_CREATED',
      source: 'customers-service',
      data: {
        customer_id: customerId,
        email,
        phone,
        first_name,
        last_name,
        referral_code
      },
      metadata: {
        tenant_id: tenantId,
        user_id: event.requestContext.authorizer?.claims?.sub
      }
    });

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(customer)
    };
  } catch (error: any) {
    console.error('Error creating customer:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Failed to create customer', 
        details: error.message 
      })
    };
  }
};

/**
 * GET /customers/{customerId}
 * Get customer by ID
 */
export const getCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const customerId = event.pathParameters?.customerId;
    
    if (!customerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing customerId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const result = await db.query(
      'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
      [customerId, tenantId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Customer not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error: any) {
    console.error('Error getting customer:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get customer', details: error.message })
    };
  }
};

/**
 * GET /customers
 * List customers with filters
 */
export const listCustomers: APIGatewayProxyHandler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { search, tier, limit = '50', offset = '0' } = queryParams;
    
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = 'SELECT * FROM customers WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (search) {
      query += ` AND (email ILIKE $${paramIndex} OR first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (tier) {
      query += ` AND reward_tier = $${paramIndex}`;
      params.push(tier);
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        customers: result.rows,
        count: result.rowCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    };
  } catch (error: any) {
    console.error('Error listing customers:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to list customers', details: error.message })
    };
  }
};

/**
 * PUT /customers/{customerId}
 * Update customer
 */
export const updateCustomer: APIGatewayProxyHandler = async (event) => {
  try {
    const customerId = event.pathParameters?.customerId;
    const body = JSON.parse(event.body || '{}');
    
    if (!customerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing customerId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = ['phone', 'first_name', 'last_name', 'preferences'];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(body[field]);
        paramIndex++;
      }
    });
    
    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No valid fields to update' })
      };
    }
    
    params.push(customerId, tenantId);
    
    const result = await db.query(
      `UPDATE customers 
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex} AND tenant_id = $${paramIndex + 1}
       RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Customer not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to update customer', details: error.message })
    };
  }
};
