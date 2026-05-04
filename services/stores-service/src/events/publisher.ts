/**
 * GLENKEOS STORES SERVICE - Event Publisher
 *
 * Publishes events to EventBridge with universal envelope pattern
 */

import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const eventBridge = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-2' });

const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME || 'glenkeos-staging';

export interface PublishEventInput {
  eventType: string;
  tenantId: string;
  actorId: string;
  payload: any;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Publish event to EventBridge
 *
 * Follows universal event envelope pattern from master spec
 */
export async function publishEvent(input: PublishEventInput): Promise<void> {
  const eventId = uuidv4();
  const timestamp = new Date().toISOString();

  // Build universal event envelope
  const eventDetail = {
    eventId,
    eventType: input.eventType,
    eventVersion: '1.0',
    timestamp,
    tenantId: input.tenantId,
    regionId: process.env.AWS_REGION || 'us-east-2',
    correlationId: input.correlationId || eventId,
    causationId: input.causationId || eventId,
    actorId: input.actorId,
    actorType: 'USER', // Could be extracted from claims
    source: 'stores',
    payload: input.payload,
    metadata: input.metadata || {}
  };

  try {
    const response = await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            Source: 'glenkeos',
            DetailType: input.eventType,
            Detail: JSON.stringify(eventDetail),
            EventBusName: EVENT_BUS_NAME
          }
        ]
      })
    );

    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      console.error('Failed to publish event:', response.Entries);
      throw new Error('Event publication failed');
    }

    console.log('Event published successfully', {
      eventId,
      eventType: input.eventType,
      tenantId: input.tenantId
    });

  } catch (error: any) {
    console.error('Error publishing event:', error);
    throw error;
  }
}
