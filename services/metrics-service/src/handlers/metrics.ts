import { APIGatewayProxyHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';

/**
 * GET /metrics/revenue/daily
 * Get daily revenue metrics
 */
export const getDailyRevenue: APIGatewayProxyHandler = async (event) => {
  try {
    const { date, store_id, brand_id } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT 
        DATE(o.created_at) as date,
        COUNT(DISTINCT o.order_id) as order_count,
        SUM(o.total) as total_revenue,
        SUM(o.subtotal) as subtotal,
        SUM(o.tax) as tax,
        SUM(o.delivery_fee) as delivery_fees,
        AVG(o.total) as average_order_value
      FROM orders o
      LEFT JOIN stores s ON o.store_id = s.store_id
      WHERE o.tenant_id = $1 
      AND o.status = 'COMPLETED'
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (date) {
      query += ` AND DATE(o.created_at) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    } else {
      query += ` AND DATE(o.created_at) >= CURRENT_DATE - INTERVAL '30 days'`;
    }
    
    if (store_id) {
      query += ` AND o.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }
    
    if (brand_id) {
      query += ` AND s.brand_id = $${paramIndex}`;
      params.push(brand_id);
      paramIndex++;
    }
    
    query += ` GROUP BY DATE(o.created_at) ORDER BY date DESC`;
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        metrics: result.rows,
        count: result.rowCount
      })
    };
  } catch (error: any) {
    console.error('Error getting daily revenue:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get revenue metrics', details: error.message })
    };
  }
};

/**
 * GET /metrics/orders/summary
 * Get order summary metrics
 */
export const getOrdersSummary: APIGatewayProxyHandler = async (event) => {
  try {
    const { store_id, date_from, date_to } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT 
        o.status,
        COUNT(*) as count,
        SUM(o.total) as revenue,
        AVG(EXTRACT(EPOCH FROM (o.updated_at - o.created_at))/60) as avg_time_minutes
      FROM orders o
      WHERE o.tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (store_id) {
      query += ` AND o.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }
    
    if (date_from) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    
    if (date_to) {
      query += ` AND o.created_at <= $${paramIndex}`;
      params.push(date_to);
      paramIndex++;
    } else {
      query += ` AND o.created_at >= CURRENT_DATE`;
    }
    
    query += ` GROUP BY o.status ORDER BY count DESC`;
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        summary: result.rows,
        total_orders: result.rows.reduce((sum: number, row: any) => sum + parseInt(row.count), 0)
      })
    };
  } catch (error: any) {
    console.error('Error getting orders summary:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get orders summary', details: error.message })
    };
  }
};

/**
 * GET /metrics/operations/summary
 * Get operational metrics
 */
export const getOperationsSummary: APIGatewayProxyHandler = async (event) => {
  try {
    const { store_id } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Active orders
    const activeOrdersQuery = `
      SELECT COUNT(*) as active_orders
      FROM orders
      WHERE tenant_id = $1 
      AND status IN ('PENDING', 'ACCEPTED', 'IN_PREP', 'READY', 'OUT_FOR_DELIVERY')
      ${store_id ? 'AND store_id = $2' : ''}
    `;
    const activeParams = store_id ? [tenantId, store_id] : [tenantId];
    const activeResult = await db.query(activeOrdersQuery, activeParams);
    
    // Avg prep time (today)
    const prepTimeQuery = `
      SELECT AVG(EXTRACT(EPOCH FROM (
        (SELECT created_at FROM order_status_history 
         WHERE order_id = o.order_id AND to_status = 'READY' LIMIT 1)
        - o.created_at
      ))/60) as avg_prep_time_minutes
      FROM orders o
      WHERE o.tenant_id = $1 
      AND o.created_at >= CURRENT_DATE
      AND o.status IN ('READY', 'OUT_FOR_DELIVERY', 'COMPLETED')
      ${store_id ? 'AND o.store_id = $2' : ''}
    `;
    const prepTimeResult = await db.query(prepTimeQuery, activeParams);
    
    // Today's revenue
    const revenueQuery = `
      SELECT 
        COUNT(*) as completed_orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE tenant_id = $1 
      AND created_at >= CURRENT_DATE
      AND status = 'COMPLETED'
      ${store_id ? 'AND store_id = $2' : ''}
    `;
    const revenueResult = await db.query(revenueQuery, activeParams);
    
    // Low inventory items
    const inventoryQuery = `
      SELECT COUNT(*) as low_inventory_items
      FROM inventory_items
      WHERE tenant_id = $1 
      AND quantity <= threshold_low
      ${store_id ? 'AND store_id = $2' : ''}
    `;
    const inventoryResult = await db.query(inventoryQuery, activeParams);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        active_orders: parseInt(activeResult.rows[0]?.active_orders || '0'),
        avg_prep_time_minutes: parseFloat(prepTimeResult.rows[0]?.avg_prep_time_minutes || '0').toFixed(1),
        todays_revenue: parseFloat(revenueResult.rows[0]?.revenue || '0').toFixed(2),
        completed_orders_today: parseInt(revenueResult.rows[0]?.completed_orders || '0'),
        low_inventory_items: parseInt(inventoryResult.rows[0]?.low_inventory_items || '0'),
        store_id: store_id || 'all'
      })
    };
  } catch (error: any) {
    console.error('Error getting operations summary:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get operations summary', details: error.message })
    };
  }
};

/**
 * GET /metrics/customers/summary
 * Get customer metrics
 */
export const getCustomersSummary: APIGatewayProxyHandler = async (event) => {
  try {
    const { date_from, date_to } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // New customers
    const newCustomersQuery = `
      SELECT COUNT(*) as new_customers
      FROM customers
      WHERE tenant_id = $1
      ${date_from ? 'AND created_at >= $2' : 'AND created_at >= CURRENT_DATE - INTERVAL \'30 days\''}
      ${date_to ? 'AND created_at <= $3' : ''}
    `;
    const params: any[] = [tenantId];
    if (date_from) params.push(date_from);
    if (date_to) params.push(date_to);
    
    const customersResult = await db.query(newCustomersQuery, params);
    
    // Repeat customers (30 days)
    const repeatQuery = `
      SELECT COUNT(DISTINCT customer_id) as repeat_customers
      FROM orders
      WHERE tenant_id = $1
      AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      AND customer_id IN (
        SELECT customer_id 
        FROM orders 
        WHERE tenant_id = $1
        GROUP BY customer_id 
        HAVING COUNT(*) > 1
      )
    `;
    const repeatResult = await db.query(repeatQuery, [tenantId]);
    
    // Lifetime value
    const lifetimeQuery = `
      SELECT 
        AVG(customer_value) as avg_lifetime_value
      FROM (
        SELECT customer_id, SUM(total) as customer_value
        FROM orders
        WHERE tenant_id = $1 AND status = 'COMPLETED'
        GROUP BY customer_id
      ) as customer_totals
    `;
    const lifetimeResult = await db.query(lifetimeQuery, [tenantId]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        new_customers: parseInt(customersResult.rows[0]?.new_customers || '0'),
        repeat_customers: parseInt(repeatResult.rows[0]?.repeat_customers || '0'),
        avg_lifetime_value: parseFloat(lifetimeResult.rows[0]?.avg_lifetime_value || '0').toFixed(2)
      })
    };
  } catch (error: any) {
    console.error('Error getting customers summary:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get customers summary', details: error.message })
    };
  }
};

/**
 * GET /metrics/top-items
 * Get top selling menu items
 */
export const getTopItems: APIGatewayProxyHandler = async (event) => {
  try {
    const { store_id, limit = '10', date_from } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT 
        m.menu_item_id,
        m.name,
        m.category,
        COUNT(*) as order_count,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.total_price) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.order_id
      JOIN menu_items m ON oi.menu_item_id = m.menu_item_id
      WHERE o.tenant_id = $1 
      AND o.status = 'COMPLETED'
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (date_from) {
      query += ` AND o.created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    } else {
      query += ` AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    }
    
    if (store_id) {
      query += ` AND o.store_id = $${paramIndex}`;
      params.push(store_id);
      paramIndex++;
    }
    
    query += ` GROUP BY m.menu_item_id, m.name, m.category`;
    query += ` ORDER BY total_quantity DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        top_items: result.rows
      })
    };
  } catch (error: any) {
    console.error('Error getting top items:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get top items', details: error.message })
    };
  }
};
