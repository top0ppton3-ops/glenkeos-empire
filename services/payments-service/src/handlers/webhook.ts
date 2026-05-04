import { APIGatewayProxyHandler } from 'aws-lambda';
import { verifyWebhookSignature } from '../paypal/client';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';

/**
 * POST /payments/webhook
 * Handle PayPal webhook events
 */
export const handleWebhook: APIGatewayProxyHandler = async (event) => {
  try {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId) {
      console.error('PAYPAL_WEBHOOK_ID not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Webhook not configured' })
      };
    }

    // Verify webhook signature
    const body = JSON.parse(event.body || '{}');
    const isValid = await verifyWebhookSignature(
      webhookId,
      event.headers,
      body
    );

    if (!isValid) {
      console.error('Invalid webhook signature');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid signature' })
      };
    }

    // Process webhook event
    const eventType = body.event_type;
    const resource = body.resource;

    console.log('Processing webhook event:', eventType);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleCaptureCompleted(resource);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
        await handleCaptureDenied(resource);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleCaptureRefunded(resource);
        break;
      
      case 'PAYMENT.CAPTURE.REVERSED':
        await handleCaptureReversed(resource);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(resource);
        break;
      
      case 'CHECKOUT.ORDER.COMPLETED':
        await handleOrderCompleted(resource);
        break;
      
      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process webhook', details: error.message })
    };
  }
};

async function handleCaptureCompleted(resource: any) {
  const db = await getDBClient();
  
  // Update payment status
  await db.query(
    `UPDATE payments 
     SET status = 'COMPLETED',
         paypal_capture_id = $1,
         captured_at = NOW(),
         updated_at = NOW()
     WHERE paypal_order_id = $2`,
    [resource.id, resource.supplementary_data?.related_ids?.order_id]
  );

  // Get payment details
  const result = await db.query(
    'SELECT * FROM payments WHERE paypal_order_id = $1',
    [resource.supplementary_data?.related_ids?.order_id]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    // Publish event
    await publishEvent({
      eventType: 'PAYMENT_CAPTURE_COMPLETED',
      source: 'payments-service.webhook',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        customer_id: payment.customer_id,
        paypal_capture_id: resource.id,
        amount: resource.amount.value,
        currency: resource.amount.currency_code
      },
      metadata: {
        tenant_id: payment.tenant_id,
        webhook_event_id: resource.id
      }
    });
  }
}

async function handleCaptureDenied(resource: any) {
  const db = await getDBClient();
  
  await db.query(
    `UPDATE payments 
     SET status = 'DENIED',
         updated_at = NOW()
     WHERE paypal_order_id = $1`,
    [resource.supplementary_data?.related_ids?.order_id]
  );

  const result = await db.query(
    'SELECT * FROM payments WHERE paypal_order_id = $1',
    [resource.supplementary_data?.related_ids?.order_id]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    await publishEvent({
      eventType: 'PAYMENT_CAPTURE_DENIED',
      source: 'payments-service.webhook',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        customer_id: payment.customer_id,
        reason: resource.status_details?.reason
      },
      metadata: {
        tenant_id: payment.tenant_id,
        webhook_event_id: resource.id
      }
    });
  }
}

async function handleCaptureRefunded(resource: any) {
  const db = await getDBClient();
  
  // Check if refund already exists
  const existingRefund = await db.query(
    'SELECT id FROM refunds WHERE paypal_refund_id = $1',
    [resource.id]
  );
  
  if (existingRefund.rows.length === 0) {
    // Get payment
    const paymentResult = await db.query(
      'SELECT * FROM payments WHERE paypal_capture_id = $1',
      [resource.supplementary_data?.related_ids?.capture_id]
    );
    
    if (paymentResult.rows.length > 0) {
      const payment = paymentResult.rows[0];
      
      // Create refund record
      await db.query(
        `INSERT INTO refunds (
          id, payment_id, paypal_refund_id, amount,
          currency, status, created_at, tenant_id
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), $6
        )`,
        [
          payment.id,
          resource.id,
          resource.amount.value,
          resource.amount.currency_code,
          resource.status,
          payment.tenant_id
        ]
      );
      
      await publishEvent({
        eventType: 'PAYMENT_REFUNDED',
        source: 'payments-service.webhook',
        data: {
          payment_id: payment.id,
          order_id: payment.order_id,
          refund_id: resource.id,
          amount: resource.amount.value,
          currency: resource.amount.currency_code
        },
        metadata: {
          tenant_id: payment.tenant_id,
          webhook_event_id: resource.id
        }
      });
    }
  }
}

async function handleCaptureReversed(resource: any) {
  const db = await getDBClient();
  
  await db.query(
    `UPDATE payments 
     SET status = 'REVERSED',
         updated_at = NOW()
     WHERE paypal_capture_id = $1`,
    [resource.id]
  );

  const result = await db.query(
    'SELECT * FROM payments WHERE paypal_capture_id = $1',
    [resource.id]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    await publishEvent({
      eventType: 'PAYMENT_REVERSED',
      source: 'payments-service.webhook',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        reason: resource.status_details?.reason
      },
      metadata: {
        tenant_id: payment.tenant_id,
        webhook_event_id: resource.id
      }
    });
  }
}

async function handleOrderApproved(resource: any) {
  const db = await getDBClient();
  
  await db.query(
    `UPDATE payments 
     SET status = 'APPROVED',
         updated_at = NOW()
     WHERE paypal_order_id = $1`,
    [resource.id]
  );

  const result = await db.query(
    'SELECT * FROM payments WHERE paypal_order_id = $1',
    [resource.id]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    await publishEvent({
      eventType: 'PAYMENT_APPROVED',
      source: 'payments-service.webhook',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        paypal_order_id: resource.id
      },
      metadata: {
        tenant_id: payment.tenant_id,
        webhook_event_id: resource.id
      }
    });
  }
}

async function handleOrderCompleted(resource: any) {
  const db = await getDBClient();
  
  const result = await db.query(
    'SELECT * FROM payments WHERE paypal_order_id = $1',
    [resource.id]
  );
  
  if (result.rows.length > 0) {
    const payment = result.rows[0];
    
    await publishEvent({
      eventType: 'PAYMENT_ORDER_COMPLETED',
      source: 'payments-service.webhook',
      data: {
        payment_id: payment.id,
        order_id: payment.order_id,
        paypal_order_id: resource.id
      },
      metadata: {
        tenant_id: payment.tenant_id,
        webhook_event_id: resource.id
      }
    });
  }
}
