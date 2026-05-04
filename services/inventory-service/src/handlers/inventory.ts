import { APIGatewayProxyHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';
import { v4 as uuidv4 } from 'uuid';

export const createItem: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { 
      store_id, 
      menu_item_id,
      quantity, 
      threshold_low = 10,
      threshold_critical = 5
    } = body;
    
    if (!store_id || !menu_item_id || quantity === undefined) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    const db = await getDBClient();
    const itemId = `inv_${uuidv4()}`;
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    await db.query(
      `INSERT INTO inventory_items (
        item_id, store_id, menu_item_id, quantity,
        threshold_low, threshold_critical, tenant_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [itemId, store_id, menu_item_id, quantity, threshold_low, threshold_critical, tenantId]
    );

    await publishEvent({
      eventType: 'ITEM_CREATED',
      source: 'inventory-service',
      data: { item_id: itemId, store_id, menu_item_id, quantity },
      metadata: { tenant_id: tenantId }
    });

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ item_id: itemId })
    };
  } catch (error: any) {
    console.error('Error creating item:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create item', details: error.message })
    };
  }
};

export const getItems: APIGatewayProxyHandler = async (event) => {
  try {
    const { store_id, limit = '100', offset = '0' } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT i.*, m.name, m.description, m.category
      FROM inventory_items i
      LEFT JOIN menu_items m ON i.menu_item_id = m.menu_item_id
      WHERE i.tenant_id = $1
    `;
    const params: any[] = [tenantId];
    
    if (store_id) {
      query += ' AND i.store_id = $2 LIMIT $3 OFFSET $4';
      params.push(store_id, parseInt(limit), parseInt(offset));
    } else {
      query += ' LIMIT $2 OFFSET $3';
      params.push(parseInt(limit), parseInt(offset));
    }
    
    const result = await db.query(query, params);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ items: result.rows, count: result.rowCount })
    };
  } catch (error: any) {
    console.error('Error getting items:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get items', details: error.message })
    };
  }
};

export const getItem: APIGatewayProxyHandler = async (event) => {
  try {
    const itemId = event.pathParameters?.itemId;
    if (!itemId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing itemId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const result = await db.query(
      `SELECT i.*, m.name, m.description, m.category, m.price
       FROM inventory_items i
       LEFT JOIN menu_items m ON i.menu_item_id = m.menu_item_id
       WHERE i.item_id = $1 AND i.tenant_id = $2`,
      [itemId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error: any) {
    console.error('Error getting item:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get item', details: error.message })
    };
  }
};

export const updateItem: APIGatewayProxyHandler = async (event) => {
  try {
    const itemId = event.pathParameters?.itemId;
    const body = JSON.parse(event.body || '{}');
    
    if (!itemId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing itemId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const allowedFields = ['quantity', 'threshold_low', 'threshold_critical'];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
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
    values.push(itemId, tenantId);
    
    await db.query(
      `UPDATE inventory_items SET ${updates.join(', ')} 
       WHERE item_id = $${paramIndex} AND tenant_id = $${paramIndex + 1}`,
      values
    );

    await publishEvent({
      eventType: 'ITEM_UPDATED',
      source: 'inventory-service',
      data: { item_id: itemId, changes: Object.keys(body) },
      metadata: { tenant_id: tenantId }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ item_id: itemId, updated: true })
    };
  } catch (error: any) {
    console.error('Error updating item:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to update item', details: error.message })
    };
  }
};

export const adjustStock: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { item_id, adjustment, reason } = body;
    
    if (!item_id || adjustment === undefined) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing item_id or adjustment' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Update quantity
    const result = await db.query(
      `UPDATE inventory_items 
       SET quantity = quantity + $1, updated_at = NOW()
       WHERE item_id = $2 AND tenant_id = $3
       RETURNING quantity, threshold_low, threshold_critical, store_id, menu_item_id`,
      [adjustment, item_id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Item not found' })
      };
    }
    
    const item = result.rows[0];
    
    // Publish appropriate event
    if (item.quantity <= item.threshold_critical) {
      await publishEvent({
        eventType: 'STOCK_CRITICAL',
        source: 'inventory-service',
        data: { 
          item_id, 
          quantity: item.quantity, 
          threshold: item.threshold_critical,
          store_id: item.store_id,
          menu_item_id: item.menu_item_id
        },
        metadata: { tenant_id: tenantId, priority: 'high' }
      });
    } else if (item.quantity <= item.threshold_low) {
      await publishEvent({
        eventType: 'STOCK_LOW',
        source: 'inventory-service',
        data: { 
          item_id, 
          quantity: item.quantity, 
          threshold: item.threshold_low,
          store_id: item.store_id,
          menu_item_id: item.menu_item_id
        },
        metadata: { tenant_id: tenantId, priority: 'medium' }
      });
    }
    
    await publishEvent({
      eventType: 'STOCK_ADJUSTED',
      source: 'inventory-service',
      data: { item_id, adjustment, new_quantity: item.quantity, reason },
      metadata: { tenant_id: tenantId }
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        item_id, 
        quantity: item.quantity,
        adjustment 
      })
    };
  } catch (error: any) {
    console.error('Error adjusting stock:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to adjust stock', details: error.message })
    };
  }
};

export const getStoreInventory: APIGatewayProxyHandler = async (event) => {
  try {
    const storeId = event.pathParameters?.storeId;
    
    if (!storeId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing storeId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const result = await db.query(
      `SELECT i.*, m.name, m.description, m.category, m.price,
              CASE 
                WHEN i.quantity <= i.threshold_critical THEN 'CRITICAL'
                WHEN i.quantity <= i.threshold_low THEN 'LOW'
                ELSE 'OK'
              END as stock_status
       FROM inventory_items i
       LEFT JOIN menu_items m ON i.menu_item_id = m.menu_item_id
       WHERE i.store_id = $1 AND i.tenant_id = $2
       ORDER BY 
         CASE 
           WHEN i.quantity <= i.threshold_critical THEN 1
           WHEN i.quantity <= i.threshold_low THEN 2
           ELSE 3
         END,
         m.category, m.name`,
      [storeId, tenantId]
    );

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        store_id: storeId,
        items: result.rows,
        total_items: result.rowCount,
        critical_items: result.rows.filter((r: any) => r.stock_status === 'CRITICAL').length,
        low_items: result.rows.filter((r: any) => r.stock_status === 'LOW').length
      })
    };
  } catch (error: any) {
    console.error('Error getting store inventory:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get store inventory', details: error.message })
    };
  }
};
