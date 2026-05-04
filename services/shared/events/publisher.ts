import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const client = new EventBridgeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export interface PublishEventParams {
  eventType: string;
  source: string;
  data: any;
  metadata?: any;
}

export const publishEvent = async ({ 
  eventType, 
  source, 
  data, 
  metadata = {} 
}: PublishEventParams): Promise<void> => {
  const envelope = {
    event_id: uuidv4(),
    event_type: eventType,
    event_version: '1.0',
    timestamp: new Date().toISOString(),
    source,
    data,
    metadata: {
      ...metadata,
      service: process.env.SERVICE_NAME || source,
      stage: process.env.STAGE || 'staging',
      correlation_id: metadata.correlation_id || uuidv4(),
      trace_id: metadata.trace_id || uuidv4()
    }
  };

  const command = new PutEventsCommand({
    Entries: [
      {
        Source: source,
        DetailType: eventType,
        Detail: JSON.stringify(envelope),
        EventBusName: process.env.EVENT_BUS_NAME || 'glenkeos-staging-bus'
      }
    ]
  });

  try {
    const response = await client.send(command);
    console.log('Event published:', {
      event_type: eventType,
      event_id: envelope.event_id,
      correlation_id: envelope.metadata.correlation_id,
      failed: response.FailedEntryCount || 0
    });
    
    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      console.error('Failed to publish event:', response.Entries);
      throw new Error('Event publication failed');
    }
  } catch (error) {
    console.error('Failed to publish event:', error);
    throw error;
  }
};

export const publishBatch = async (events: PublishEventParams[]): Promise<void> => {
  const entries = events.map(({ eventType, source, data, metadata = {} }) => {
    const envelope = {
      event_id: uuidv4(),
      event_type: eventType,
      event_version: '1.0',
      timestamp: new Date().toISOString(),
      source,
      data,
      metadata: {
        ...metadata,
        service: process.env.SERVICE_NAME || source,
        stage: process.env.STAGE || 'staging',
        correlation_id: metadata.correlation_id || uuidv4(),
        trace_id: metadata.trace_id || uuidv4()
      }
    };

    return {
      Source: source,
      DetailType: eventType,
      Detail: JSON.stringify(envelope),
      EventBusName: process.env.EVENT_BUS_NAME || 'glenkeos-staging-bus'
    };
  });

  const command = new PutEventsCommand({ Entries: entries });

  try {
    const response = await client.send(command);
    console.log(`Batch published: ${entries.length} events, ${response.FailedEntryCount || 0} failed`);
    
    if (response.FailedEntryCount && response.FailedEntryCount > 0) {
      console.error('Failed entries:', response.Entries?.filter(e => e.ErrorCode));
      throw new Error(`Batch publication partially failed: ${response.FailedEntryCount} events`);
    }
  } catch (error) {
    console.error('Failed to publish batch:', error);
    throw error;
  }
};
