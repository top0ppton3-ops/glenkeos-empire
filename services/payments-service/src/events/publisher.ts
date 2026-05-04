import { EventBridge } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const eventBridge = new EventBridge();
const EVENT_BUS_NAME = process.env.EVENTBUS_NAME || 'glenkeos-staging-bus';

export interface EventPayload {
  eventType: string;
  source: string;
  data: any;
  metadata?: {
    tenant_id?: string;
    user_id?: string;
    correlation_id?: string;
    [key: string]: any;
  };
}

export async function publishEvent(payload: EventPayload): Promise<void> {
  const eventId = uuidv4();
  const timestamp = new Date().toISOString();

  const entry = {
    Source: payload.source,
    DetailType: payload.eventType,
    Detail: JSON.stringify({
      event_id: eventId,
      event_type: payload.eventType,
      timestamp,
      version: '1.0',
      data: payload.data,
      metadata: {
        ...payload.metadata,
        correlation_id: payload.metadata?.correlation_id || eventId
      }
    }),
    EventBusName: EVENT_BUS_NAME,
    Time: new Date()
  };

  try {
    await eventBridge.putEvents({ Entries: [entry] }).promise();
    console.log(`Event published: ${payload.eventType}`, { event_id: eventId });
  } catch (error) {
    console.error('Failed to publish event:', error);
    throw error;
  }
}
