import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.requestContext.requestId;

  try {
    const body = JSON.parse(event.body || '{}');
    const { title, description, severity, category, likelihood, impact } = body;

    if (!title || !severity || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: title, severity, category' })
      };
    }

    if (!['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid severity. Must be LOW, MEDIUM, HIGH, or CRITICAL' })
      };
    }

    const riskId = uuidv4();
    const tenantId = event.requestContext.authorizer?.claims['custom:tenant_id'];
    const identifiedBy = event.requestContext.authorizer?.claims.sub;

    const db = await getDbClient();

    const result = await db.query(
      `INSERT INTO risks (
        risk_id, tenant_id, title, description, severity, category,
        likelihood, impact, status, identified_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [riskId, tenantId, title, description, severity, category, likelihood, impact, 'IDENTIFIED', identifiedBy]
    );

    const risk = result.rows[0];

    await publishEvent({
      eventType: 'RISK_CREATED',
      source: 'grc-service',
      data: {
        riskId: risk.risk_id,
        tenantId: risk.tenant_id,
        title: risk.title,
        severity: risk.severity,
        category: risk.category,
        status: risk.status,
        identifiedBy: risk.identified_by
      },
      correlationId
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        riskId: risk.risk_id,
        title: risk.title,
        description: risk.description,
        severity: risk.severity,
        category: risk.category,
        status: risk.status,
        createdAt: risk.created_at
      })
    };

  } catch (error: any) {
    console.error('Error creating risk:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
