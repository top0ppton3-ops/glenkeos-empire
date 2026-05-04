import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const client = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

interface PublishEventParams {
  eventType: string;
  source: string;
  data: any;
  metadata?: any;
}

export const publishEvent = async ({ eventType, source, data, metadata = {} }: PublishEventParams): Promise<void> => {
  const envelope = {
    event_id: uuidv4(),
    event_type: eventType,
    event_version: '1.0',
    timestamp: new Date().toISOString(),
    source,
    data,
    metadata: {
      ...metadata,
      service: process.env.SERVICE_NAME || 'orders-service',
      stage: process.env.STAGE || 'staging',
      correlation_id: metadata.correlation_id || uuidv4()
    }
  };

  const command = new PutEventsCommand({
    Entries: [
      {
        Source: source,
        DetailType: eventType,
        Detail: JSON.stringify(envelope),
        EventBusName: process.env.EVENT_BUS_NAME
      }
    ]
  });

  try {
    await client.send(command);
    console.log('Event published:', eventType, envelope.event_id);
  } catch (error) {
    console.error('Failed to publish event:', error);
    throw error;
  }
};
