import { APIGatewayProxyHandler } from 'aws-lambda';
import paypal from '@paypal/checkout-server-sdk';
import { getPayPalClient, buildOrderRequest } from '../paypal/client';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /payments/create-order
 * Creates a PayPal order
 */
export const createOrder: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { amount, currency = 'USD', order_id, customer_id, items } = body;
    
    if (!amount || !order_id || !customer_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields: amount, order_id, customer_id' })
      };
    }

    // Create PayPal order
    const client = getPayPalClient();
    const orderRequest = buildOrderRequest({
      amount: amount.toString(),
      currency,
      orderId: order_id,
      customerId: customer_id,
      items
    });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody(orderRequest);

    const response = await client.execute(request);
    const paypalOrder = response.result;

    // Store payment record in database
    const db = await getDBClient();
    const paymentId = uuidv4();
    
    await db.query(
      `INSERT INTO payments (
        id, order_id, customer_id, paypal_order_id, 
        amount, currency, status, created_at, tenant_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)`,
      [
        paymentId,
        order_id,
        customer_id,
        paypalOrder.id,
        amount,
        currency,
        'CREATED',
        event.requestContext.authorizer?.claims?.tenant_id || 'default'
      ]
    );

    // Publish event
    await publishEvent({
      eventType: 'PAYMENT_CREATED',
      source: 'payments-service',
      data: {
        payment_id: paymentId,
        order_id,
        customer_id,
        paypal_order_id: paypalOrder.id,
        amount,
        currency
      },
      metadata: {
        tenant_id: event.requestContext.authorizer?.claims?.tenant_id || 'default',
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
        payment_id: paymentId,
        paypal_order_id: paypalOrder.id,
        status: paypalOrder.status,
        links: paypalOrder.links
      })
    };
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to create payment', details: error.message })
    };
  }
};

/**
 * POST /payments/capture-order
 * Captures a PayPal order
 */
export const captureOrder: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { paypal_order_id } = body;
    
    if (!paypal_order_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing paypal_order_id' })
      };
    }

    // Capture the order
    const client = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(paypal_order_id);
    request.requestBody({});

    const response = await client.execute(request);
    const captureResult = response.result;

    // Update payment in database
    const db = await getDBClient();
    
    await db.query(
      `UPDATE payments 
       SET status = $1, 
           paypal_capture_id = $2, 
           captured_at = NOW(),
           updated_at = NOW()
       WHERE paypal_order_id = $3`,
      ['COMPLETED', captureResult.purchase_units[0]?.payments?.captures[0]?.id, paypal_order_id]
    );

    // Get payment details
    const paymentResult = await db.query(
      'SELECT * FROM payments WHERE paypal_order_id = $1',
      [paypal_order_id]
    );
    const payment = paymentResult.rows[0];

    // Publish event
    await publishEvent({
      eventType: 'PAYMENT_COMPLETED',
      source: 'payments-service',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        customer_id: payment.customer_id,
        paypal_order_id: paypal_order_id,
        paypal_capture_id: captureResult.purchase_units[0]?.payments?.captures[0]?.id,
        amount: payment.amount,
        currency: payment.currency,
        status: captureResult.status
      },
      metadata: {
        tenant_id: payment.tenant_id,
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
        payment_id: payment.id,
        status: 'COMPLETED',
        capture: captureResult
      })
    };
  } catch (error: any) {
    console.error('Error capturing PayPal order:', error);
    
    // Publish failure event
    await publishEvent({
      eventType: 'PAYMENT_FAILED',
      source: 'payments-service',
      data: {
        paypal_order_id: JSON.parse(event.body || '{}').paypal_order_id,
        error: error.message
      },
      metadata: {
        tenant_id: event.requestContext.authorizer?.claims?.tenant_id || 'default',
        user_id: event.requestContext.authorizer?.claims?.sub
      }
    });

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to capture payment', details: error.message })
    };
  }
};

/**
 * GET /payments/orders/{orderId}
 * Get PayPal order details
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

    const client = getPayPalClient();
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const response = await client.execute(request);

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response.result)
    };
  } catch (error: any) {
    console.error('Error getting PayPal order:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get order', details: error.message })
    };
  }
};

/**
 * POST /payments/refund
 * Refund a captured payment
 */
export const refundPayment: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { capture_id, amount, currency = 'USD', reason } = body;
    
    if (!capture_id) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing capture_id' })
      };
    }

    const client = getPayPalClient();
    const request = new paypal.payments.CapturesRefundRequest(capture_id);
    
    const refundBody: any = {};
    if (amount) {
      refundBody.amount = { value: amount.toString(), currency_code: currency };
    }
    if (reason) {
      refundBody.note_to_payer = reason;
    }
    
    request.requestBody(refundBody);

    const response = await client.execute(request);
    const refundResult = response.result;

    // Store refund in database
    const db = await getDBClient();
    const refundId = uuidv4();
    
    await db.query(
      `INSERT INTO refunds (
        id, payment_id, paypal_refund_id, amount, 
        currency, reason, status, created_at, tenant_id
      ) VALUES (
        $1, 
        (SELECT id FROM payments WHERE paypal_capture_id = $2),
        $3, $4, $5, $6, $7, NOW(), $8
      )`,
      [
        refundId,
        capture_id,
        refundResult.id,
        amount || refundResult.amount.value,
        currency,
        reason,
        refundResult.status,
        event.requestContext.authorizer?.claims?.tenant_id || 'default'
      ]
    );

    // Publish event
    await publishEvent({
      eventType: 'REFUND_ISSUED',
      source: 'payments-service',
      data: {
        refund_id: refundId,
        paypal_refund_id: refundResult.id,
        capture_id,
        amount: refundResult.amount.value,
        currency: refundResult.amount.currency_code,
        status: refundResult.status
      },
      metadata: {
        tenant_id: event.requestContext.authorizer?.claims?.tenant_id || 'default',
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
        refund_id: refundId,
        paypal_refund_id: refundResult.id,
        status: refundResult.status,
        amount: refundResult.amount
      })
    };
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to refund payment', details: error.message })
    };
  }
};

/**
 * GET /payments
 * List payments with filters
 */
export const listPayments: APIGatewayProxyHandler = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { order_id, customer_id, status, limit = '50', offset = '0' } = queryParams;
    
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = 'SELECT * FROM payments WHERE tenant_id = $1';
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (order_id) {
      query += ` AND order_id = $${paramIndex}`;
      params.push(order_id);
      paramIndex++;
    }
    
    if (customer_id) {
      query += ` AND customer_id = $${paramIndex}`;
      params.push(customer_id);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
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
        payments: result.rows,
        count: result.rowCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    };
  } catch (error: any) {
    console.error('Error listing payments:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to list payments', details: error.message })
    };
  }
};
