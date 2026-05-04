import { EventBridgeEvent } from 'aws-lambda';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

interface OrderEventDetail {
  orderId: string;
  customerId: string;
  orderType: string;
  metadata?: {
    correlationId: string;
  };
}

export const handler = async (event: EventBridgeEvent<string, OrderEventDetail>) => {
  const { detail, 'detail-type': eventType } = event;
  const correlationId = detail.metadata?.correlationId;

  console.log('Processing order event for notifications', { eventType, orderId: detail.orderId });

  try {
    const db = await getDbClient();

    const customerResult = await db.query(
      'SELECT email, phone, name FROM customers WHERE customer_id = $1',
      [detail.customerId]
    );

    if (customerResult.rows.length === 0) {
      console.warn('Customer not found', { customerId: detail.customerId });
      return;
    }

    const customer = customerResult.rows[0];
    let message: string;
    let subject: string;

    switch (eventType) {
      case 'ORDER_CREATED':
        subject = 'Order Confirmed';
        message = `Hi ${customer.name}, your order #${detail.orderId} has been confirmed!`;
        break;
      case 'ORDER_OUT_FOR_DELIVERY':
        subject = 'Order Out for Delivery';
        message = `Hi ${customer.name}, your order #${detail.orderId} is on its way!`;
        break;
      case 'ORDER_COMPLETED':
        subject = 'Order Delivered';
        message = `Hi ${customer.name}, your order #${detail.orderId} has been delivered. Enjoy!`;
        break;
      default:
        return;
    }

    console.log('Sending notification', { customerId: detail.customerId, eventType });

    await publishEvent({
      eventType: 'NOTIFICATION_SENT',
      source: 'notifications-service',
      data: {
        orderId: detail.orderId,
        customerId: detail.customerId,
        channels: ['EMAIL', customer.phone ? 'SMS' : null].filter(Boolean),
        notificationType: eventType
      },
      correlationId
    });

  } catch (error: any) {
    console.error('Error sending notification:', error);

    await publishEvent({
      eventType: 'NOTIFICATION_FAILED',
      source: 'notifications-service',
      data: {
        orderId: detail.orderId,
        error: error.message
      },
      correlationId
    });
  }
};
