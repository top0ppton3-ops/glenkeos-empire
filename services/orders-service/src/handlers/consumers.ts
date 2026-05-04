import { EventBridgeHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';

/**
 * Handle PAYMENT_COMPLETED event
 * Mark order as paid and accepted
 */
export const handlePaymentCompleted: EventBridgeHandler<string, any, void> = async (event) => {
  try {
    const { order_id, payment_id } = event.detail;
    
    console.log('Payment completed for order:', order_id);
    
    const db = await getDBClient();
    
    // Update order payment status and move to ACCEPTED
    await db.query(
      `UPDATE orders 
       SET payment_id = $1, 
           status = 'ACCEPTED',
           updated_at = NOW()
       WHERE order_id = $2`,
      [payment_id, order_id]
    );
    
    // Publish ORDER_ACCEPTED event
    await publishEvent({
      eventType: 'ORDER_ACCEPTED',
      source: 'orders-service',
      data: {
        order_id,
        payment_id,
        status: 'ACCEPTED'
      },
      metadata: {
        tenant_id: event.detail.metadata?.tenant_id || 'default',
        correlation_id: event.id
      }
    });
    
    console.log('Order accepted:', order_id);
  } catch (error: any) {
    console.error('Error handling payment completed:', error);
    throw error;
  }
};

/**
 * Handle ITEM_UNAVAILABLE event
 * Cancel order if item is unavailable
 */
export const handleInventoryUpdated: EventBridgeHandler<string, any, void> = async (event) => {
  try {
    const { item_id, store_id } = event.detail;
    
    console.log('Item unavailable:', item_id, 'at store:', store_id);
    
    const db = await getDBClient();
    
    // Find pending orders with this item
    const result = await db.query(
      `SELECT DISTINCT o.order_id
       FROM orders o
       JOIN order_items oi ON o.order_id = oi.order_id
       WHERE oi.menu_item_id = $1 
       AND o.store_id = $2 
       AND o.status IN ('PENDING', 'ACCEPTED')`,
      [item_id, store_id]
    );
    
    // Cancel affected orders
    for (const row of result.rows) {
      await db.query(
        `UPDATE orders 
         SET status = 'CANCELLED', updated_at = NOW()
         WHERE order_id = $1`,
        [row.order_id]
      );
      
      await publishEvent({
        eventType: 'ORDER_CANCELLED',
        source: 'orders-service',
        data: {
          order_id: row.order_id,
          reason: 'ITEM_UNAVAILABLE',
          unavailable_item_id: item_id
        },
        metadata: {
          correlation_id: event.id
        }
      });
    }
    
    console.log(`Cancelled ${result.rowCount} orders due to unavailable item`);
  } catch (error: any) {
    console.error('Error handling inventory update:', error);
    throw error;
  }
};
