import { APIGatewayProxyHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /orders
 * Create a new order
 */
export const createOrder: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      customer_id, 
      store_id, 
      delivery_address,
      items, 
      special_instructions,
      order_type = 'DELIVERY' // DELIVERY, PICKUP, DINE_IN
    } = body;
    
    if (!customer_id || !store_id || !items || items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: customer_id, store_id, items' })
      };
    }

    const db = await getDBClient();
    const orderId = `order_${uuidv4()}`;
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; // 8% tax
    const delivery_fee = order_type === 'DELIVERY' ? 3.99 : 0;
    const total = subtotal + tax + delivery_fee;

    // Create order
    await db.query(
      `INSERT INTO orders (
        order_id, customer_id, store_id, order_type, 
        status, subtotal, tax, delivery_fee, total,
        delivery_address, special_instructions, 
        tenant_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        orderId, customer_id, store_id, order_type,
        'PENDING', subtotal, tax, delivery_fee, total,
        JSON.stringify(delivery_address), special_instructions,
        tenantId
      ]
    );

    // Create order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (
          order_item_id, order_id, menu_item_id, 
          quantity, unit_price, total_price, 
          customizations, tenant_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          uuidv4(),
          orderId,
          item.menu_item_id,
          item.quantity,
          item.price,
          item.price * item.quantity,
          JSON.stringify(item.customizations || {}),
          tenantId
        ]
      );
    }

    // Publish event
    await publishEvent({
      eventType: 'ORDER_CREATED',
      source: 'orders-service',
      data: {
        order_id: orderId,
        customer_id,
        store_id,
        order_type,
        total,
        items: items.length,
        status: 'PENDING'
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
      body: JSON.stringify({
        order_id: orderId,
        status: 'PENDING',
        total,
        created_at: new Date().toISOString()
      })
    };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create order', details: error.message })
    };
  }
};

/**
 * GET /orders
 * List orders with filters
 */
export const getOrders: APIGatewayProxyHandler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { store_id, status, limit = '50', offset = '0' } = queryParams;
    
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT o.*, 
             c.first_name, c.last_name, c.email,
             s.store_name,
             COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN stores s ON o.store_id = s.store_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (store_id) {
      query += ` AND o.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ` GROUP BY o.order_id, c.customer_id, s.store_id`;
    query += ` ORDER BY o.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        orders: result.rows,
        count: result.rowCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    };
  } catch (error: any) {
    console.error('Error getting orders:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get orders', details: error.message })
    };
  }
};

/**
 * GET /orders/{orderId}
 * Get single order with items
 */
export const getOrder: APIGatewayProxyHandler = async (event) => {
  try {
    const orderId = event.pathParameters?.orderId;
    
    if (!orderId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing orderId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Get order
    const orderResult = await db.query(
      `SELECT o.*, 
              c.first_name, c.last_name, c.email, c.phone,
              s.store_name, s.address_line1, s.city, s.state
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.customer_id
       LEFT JOIN stores s ON o.store_id = s.store_id
       WHERE o.order_id = $1 AND o.tenant_id = $2`,
      [orderId, tenantId]
    );
    
    if (orderResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Order not found' })
      };
    }
    
    // Get order items
    const itemsResult = await db.query(
      `SELECT oi.*, m.name, m.description, m.image_url
       FROM order_items oi
       LEFT JOIN menu_items m ON oi.menu_item_id = m.menu_item_id
       WHERE oi.order_id = $1`,
      [orderId]
    );
    
    // Get status history
    const historyResult = await db.query(
      `SELECT * FROM order_status_history 
       WHERE order_id = $1 
       ORDER BY created_at DESC`,
      [orderId]
    );

    const order = {
      ...orderResult.rows[0],
      items: itemsResult.rows,
      status_history: historyResult.rows
    };

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(order)
    };
  } catch (error: any) {
    console.error('Error getting order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get order', details: error.message })
    };
  }
};

/**
 * PUT /orders/{orderId}
 * Update order details
 */
export const updateOrder: APIGatewayProxyHandler = async (event) => {
  try {
    const orderId = event.pathParameters?.orderId;
    const body = JSON.parse(event.body || '{}');
    
    if (!orderId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing orderId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const allowedFields = ['delivery_address', 'special_instructions', 'estimated_completion'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    }
    
    if (updates.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'No valid fields to update' })
      };
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(orderId, tenantId);
    
    await db.query(
      `UPDATE orders SET ${updates.join(', ')} 
       WHERE order_id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
      values
    );

    // Publish event
    await publishEvent({
      eventType: 'ORDER_UPDATED',
      source: 'orders-service',
      data: {
        order_id: orderId,
        changes: Object.keys(body)
      },
      metadata: {
        tenant_id: tenantId,
        user_id: event.requestContext.authorizer?.claims?.sub
      }
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        order_id: orderId, 
        updated: true 
      })
    };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to update order', details: error.message })
    };
  }
};

/**
 * PATCH /orders/{orderId}/status
 * Update order status
 */
export const updateOrderStatus: APIGatewayProxyHandler = async (event) => {
  try {
    const orderId = event.pathParameters?.orderId;
    const body = JSON.parse(event.body || '{}');
    const { new_status, reason_code } = body;
    
    if (!orderId || !new_status) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing orderId or new_status' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Get current status
    const currentResult = await db.query(
      'SELECT status FROM orders WHERE order_id = $1 AND tenant_id = $2',
      [orderId, tenantId]
    );
    
    if (currentResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Order not found' })
      };
    }
    
    const oldStatus = currentResult.rows[0].status;
    
    // Update order status
    await db.query(
      `UPDATE orders 
       SET status = $1, updated_at = NOW() 
       WHERE order_id = $2 AND tenant_id = $3`,
      [new_status, orderId, tenantId]
    );
    
    // Record status change in history
    await db.query(
      `INSERT INTO order_status_history (
        history_id, order_id, from_status, to_status, 
        reason_code, changed_by, tenant_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        uuidv4(),
        orderId,
        oldStatus,
        new_status,
        reason_code || 'MANUAL_UPDATE',
        event.requestContext.authorizer?.claims?.sub,
        tenantId
      ]
    );

    // Publish event based on status
    const eventType = new_status === 'ACCEPTED' ? 'ORDER_ACCEPTED' :
                      new_status === 'IN_PREP' ? 'ORDER_IN_PREP' :
                      new_status === 'READY' ? 'ORDER_READY' :
                      new_status === 'OUT_FOR_DELIVERY' ? 'ORDER_OUT_FOR_DELIVERY' :
                      new_status === 'COMPLETED' ? 'ORDER_COMPLETED' :
                      new_status === 'CANCELLED' ? 'ORDER_CANCELLED' :
                      'ORDER_STATUS_CHANGED';
                      
    await publishEvent({
      eventType,
      source: 'orders-service',
      data: {
        order_id: orderId,
        from_status: oldStatus,
        to_status: new_status,
        reason_code
      },
      metadata: {
        tenant_id: tenantId,
        user_id: event.requestContext.authorizer?.claims?.sub
      }
    });

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        order_id: orderId, 
        status: new_status,
        previous_status: oldStatus
      })
    };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to update status', details: error.message })
    };
  }
};

/**
 * GET /customers/{customerId}/orders
 * Get orders for a specific customer
 */
export const getCustomerOrders: APIGatewayProxyHandler = async (event) => {
  try {
    const customerId = event.pathParameters?.customerId;
    const queryParams = event.queryStringParameters || {};
    const { status, limit = '20', offset = '0' } = queryParams;
    
    if (!customerId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing customerId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT o.*, s.store_name, s.address_line1, s.city
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.store_id
      WHERE o.customer_id = $1 AND o.tenant_id = $2
    `;
    const params: any[] = [customerId, tenantId];
    
    if (status) {
      query += ' AND o.status = $3';
      params.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        customer_id: customerId,
        orders: result.rows,
        count: result.rowCount
      })
    };
  } catch (error: any) {
    console.error('Error getting customer orders:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get customer orders', details: error.message })
    };
  }
};
