import { APIGatewayProxyHandler, EventBridgeHandler } from 'aws-lambda';
import { getDBClient } from '../db/client';
import { publishEvent } from '../events/publisher';
import { v4 as uuidv4 } from 'uuid';

/**
 * GET /compliance/events
 * Query compliance and audit events
 */
export const getComplianceEvents: APIGatewayProxyHandler = async (event) => {
  try {
    const {
      event_type,
      entity_type,
      entity_id,
      severity,
      date_from,
      date_to,
      limit = '100',
      offset = '0'
    } = event.queryStringParameters || {};
    
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    let query = `
      SELECT 
        event_id,
        event_type,
        source,
        entity_type,
        entity_id,
        severity,
        event_data,
        metadata,
        created_at
      FROM events
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];
    let paramIndex = 2;
    
    if (event_type) {
      query += ` AND event_type = $${paramIndex}`;
      params.push(event_type);
      paramIndex++;
    }
    
    if (entity_type) {
      query += ` AND entity_type = $${paramIndex}`;
      params.push(entity_type);
      paramIndex++;
    }
    
    if (entity_id) {
      query += ` AND entity_id = $${paramIndex}`;
      params.push(entity_id);
      paramIndex++;
    }
    
    if (severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(severity);
      paramIndex++;
    }
    
    if (date_from) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(date_from);
      paramIndex++;
    }
    
    if (date_to) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(date_to);
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
        events: result.rows,
        count: result.rowCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })
    };
  } catch (error: any) {
    console.error('Error getting compliance events:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get compliance events', details: error.message })
    };
  }
};

/**
 * GET /compliance/events/{eventId}
 * Get single compliance event
 */
export const getComplianceEvent: APIGatewayProxyHandler = async (event) => {
  try {
    const eventId = event.pathParameters?.eventId;
    
    if (!eventId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing eventId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const result = await db.query(
      `SELECT * FROM events WHERE event_id = $1 AND tenant_id = $2`,
      [eventId, tenantId]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Event not found' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error: any) {
    console.error('Error getting compliance event:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get event', details: error.message })
    };
  }
};

/**
 * GET /compliance/entity/{entityType}/{entityId}
 * Get all events for a specific entity
 */
export const getEntityCompliance: APIGatewayProxyHandler = async (event) => {
  try {
    const entityType = event.pathParameters?.entityType;
    const entityId = event.pathParameters?.entityId;
    
    if (!entityType || !entityId) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing entityType or entityId' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Get all events for entity
    const eventsResult = await db.query(
      `SELECT * FROM events 
       WHERE entity_type = $1 AND entity_id = $2 AND tenant_id = $3
       ORDER BY created_at DESC`,
      [entityType, entityId, tenantId]
    );
    
    // Get audit logs for entity
    const auditResult = await db.query(
      `SELECT * FROM audit_logs
       WHERE entity_type = $1 AND entity_id = $2 AND tenant_id = $3
       ORDER BY created_at DESC`,
      [entityType, entityId, tenantId]
    );
    
    // Get compliance events for entity
    const complianceResult = await db.query(
      `SELECT * FROM compliance_events
       WHERE entity_type = $1 AND entity_id = $2 AND tenant_id = $3
       ORDER BY created_at DESC`,
      [entityType, entityId, tenantId]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        events: eventsResult.rows,
        audit_logs: auditResult.rows,
        compliance_events: complianceResult.rows,
        total_events: eventsResult.rowCount + auditResult.rowCount + complianceResult.rowCount
      })
    };
  } catch (error: any) {
    console.error('Error getting entity compliance:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get entity compliance', details: error.message })
    };
  }
};

/**
 * GET /compliance/export
 * Export compliance data
 */
export const exportCompliance: APIGatewayProxyHandler = async (event) => {
  try {
    const { date_from, date_to, format = 'json' } = event.queryStringParameters || {};
    
    if (!date_from || !date_to) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing date_from or date_to' })
      };
    }

    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    // Get all compliance data
    const eventsResult = await db.query(
      `SELECT * FROM events 
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       ORDER BY created_at ASC`,
      [tenantId, date_from, date_to]
    );
    
    const auditResult = await db.query(
      `SELECT * FROM audit_logs
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       ORDER BY created_at ASC`,
      [tenantId, date_from, date_to]
    );
    
    const complianceResult = await db.query(
      `SELECT * FROM compliance_events
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       ORDER BY created_at ASC`,
      [tenantId, date_from, date_to]
    );
    
    const exportData = {
      export_id: uuidv4(),
      tenant_id: tenantId,
      date_from,
      date_to,
      generated_at: new Date().toISOString(),
      events: eventsResult.rows,
      audit_logs: auditResult.rows,
      compliance_events: complianceResult.rows,
      summary: {
        total_events: eventsResult.rowCount,
        total_audit_logs: auditResult.rowCount,
        total_compliance_events: complianceResult.rowCount
      }
    };
    
    // Publish export event
    await publishEvent({
      eventType: 'COMPLIANCE_EXPORT_REQUESTED',
      source: 'compliance-service',
      data: {
        export_id: exportData.export_id,
        date_from,
        date_to,
        record_count: exportData.summary.total_events + 
                     exportData.summary.total_audit_logs + 
                     exportData.summary.total_compliance_events
      },
      metadata: {
        tenant_id: tenantId,
        user_id: event.requestContext.authorizer?.claims?.sub
      }
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': `attachment; filename="compliance-export-${date_from}-to-${date_to}.${format}"`
      },
      body: format === 'csv' ? convertToCSV(exportData) : JSON.stringify(exportData, null, 2)
    };
  } catch (error: any) {
    console.error('Error exporting compliance data:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to export compliance data', details: error.message })
    };
  }
};

/**
 * GET /compliance/dashboard
 * Get compliance dashboard metrics
 */
export const getComplianceDashboard: APIGatewayProxyHandler = async (event) => {
  try {
    const { date_from, date_to } = event.queryStringParameters || {};
    const db = await getDBClient();
    const tenantId = event.requestContext.authorizer?.claims?.tenant_id || 'default';
    
    const defaultDateFrom = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const defaultDateTo = date_to || new Date().toISOString();
    
    // Count events by type
    const eventsByTypeResult = await db.query(
      `SELECT event_type, COUNT(*) as count
       FROM events
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       GROUP BY event_type
       ORDER BY count DESC`,
      [tenantId, defaultDateFrom, defaultDateTo]
    );
    
    // Count events by severity
    const eventsBySeverityResult = await db.query(
      `SELECT severity, COUNT(*) as count
       FROM events
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       GROUP BY severity`,
      [tenantId, defaultDateFrom, defaultDateTo]
    );
    
    // Recent critical events
    const criticalEventsResult = await db.query(
      `SELECT *
       FROM events
       WHERE tenant_id = $1 
       AND severity IN ('HIGH', 'CRITICAL')
       AND created_at >= $2
       ORDER BY created_at DESC
       LIMIT 20`,
      [tenantId, defaultDateFrom]
    );
    
    // Compliance alerts
    const alertsResult = await db.query(
      `SELECT event_type, COUNT(*) as count
       FROM compliance_events
       WHERE tenant_id = $1 
       AND created_at >= $2 
       AND created_at <= $3
       AND resolution_status IN ('OPEN', 'IN_PROGRESS')
       GROUP BY event_type`,
      [tenantId, defaultDateFrom, defaultDateTo]
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        date_from: defaultDateFrom,
        date_to: defaultDateTo,
        events_by_type: eventsByTypeResult.rows,
        events_by_severity: eventsBySeverityResult.rows,
        critical_events: criticalEventsResult.rows,
        open_alerts: alertsResult.rows,
        total_events: eventsByTypeResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0)
      })
    };
  } catch (error: any) {
    console.error('Error getting compliance dashboard:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to get dashboard', details: error.message })
    };
  }
};

// Helper function to convert to CSV
function convertToCSV(data: any): string {
  const allEvents = [
    ...data.events.map((e: any) => ({ ...e, type: 'EVENT' })),
    ...data.audit_logs.map((e: any) => ({ ...e, type: 'AUDIT' })),
    ...data.compliance_events.map((e: any) => ({ ...e, type: 'COMPLIANCE' }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  if (allEvents.length === 0) return 'No data';
  
  const headers = Object.keys(allEvents[0]);
  const rows = allEvents.map(row => 
    headers.map(header => JSON.stringify(row[header] || '')).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Universal event consumer
 * Captures all events for compliance tracking
 */
export const captureEvent: EventBridgeHandler<string, any, void> = async (eventBridgeEvent) => {
  try {
    const db = await getDBClient();
    const eventId = uuidv4();
    
    const detail = eventBridgeEvent.detail;
    const source = eventBridgeEvent.source;
    const eventType = eventBridgeEvent['detail-type'];
    
    // Extract entity info from event data
    const entityType = extractEntityType(detail.data);
    const entityId = extractEntityId(detail.data);
    const severity = determineSeverity(eventType, detail.data);
    
    // Store event
    await db.query(
      `INSERT INTO events (
        event_id, event_type, source, entity_type, entity_id,
        severity, event_data, metadata, tenant_id, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
      [
        eventId,
        eventType,
        source,
        entityType,
        entityId,
        severity,
        JSON.stringify(detail.data),
        JSON.stringify(detail.metadata || {}),
        detail.metadata?.tenant_id || 'default'
      ]
    );
    
    console.log('Event captured for compliance:', eventId, eventType);
    
    // If high severity, create compliance alert
    if (severity === 'HIGH' || severity === 'CRITICAL') {
      await publishEvent({
        eventType: 'COMPLIANCE_ALERT_RAISED',
        source: 'compliance-service',
        data: {
          alert_id: uuidv4(),
          original_event_id: eventId,
          event_type: eventType,
          severity,
          entity_type: entityType,
          entity_id: entityId
        },
        metadata: {
          tenant_id: detail.metadata?.tenant_id || 'default',
          correlation_id: eventBridgeEvent.id
        }
      });
    }
  } catch (error: any) {
    console.error('Error capturing event:', error);
    throw error;
  }
};

function extractEntityType(data: any): string {
  if (data.order_id) return 'order';
  if (data.customer_id && !data.order_id) return 'customer';
  if (data.store_id && !data.order_id) return 'store';
  if (data.payment_id) return 'payment';
  if (data.driver_id) return 'driver';
  if (data.staff_id) return 'staff';
  return 'unknown';
}

function extractEntityId(data: any): string {
  return data.order_id || data.customer_id || data.store_id || 
         data.payment_id || data.driver_id || data.staff_id || 'unknown';
}

function determineSeverity(eventType: string, data: any): string {
  const criticalEvents = ['PAYMENT_FAILED', 'ORDER_CANCELLED', 'STOCK_CRITICAL', 'COMPLIANCE_ALERT_RAISED'];
  const highEvents = ['REFUND_ISSUED', 'STOCK_LOW', 'DELIVERY_DELAYED'];
  
  if (criticalEvents.includes(eventType)) return 'CRITICAL';
  if (highEvents.includes(eventType)) return 'HIGH';
  if (eventType.includes('FAILED') || eventType.includes('ERROR')) return 'HIGH';
  if (eventType.includes('CREATED') || eventType.includes('COMPLETED')) return 'LOW';
  return 'MEDIUM';
}
