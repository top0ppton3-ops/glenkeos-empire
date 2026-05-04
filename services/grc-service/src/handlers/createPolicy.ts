import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.requestContext.requestId;

  try {
    const body = JSON.parse(event.body || '{}');
    const { title, description, category, content } = body;

    if (!title || !category) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: title, category' })
      };
    }

    const policyId = uuidv4();
    const tenantId = event.requestContext.authorizer?.claims['custom:tenant_id'];
    const createdBy = event.requestContext.authorizer?.claims.sub;

    const db = await getDbClient();

    const result = await db.query(
      `INSERT INTO policies (
        policy_id, tenant_id, title, description, category,
        content, status, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [policyId, tenantId, title, description, category, JSON.stringify(content || {}), 'DRAFT', createdBy]
    );

    const policy = result.rows[0];

    await publishEvent({
      eventType: 'POLICY_CREATED',
      source: 'grc-service',
      data: {
        policyId: policy.policy_id,
        tenantId: policy.tenant_id,
        title: policy.title,
        category: policy.category,
        status: policy.status,
        createdBy: policy.created_by
      },
      correlationId
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        policyId: policy.policy_id,
        title: policy.title,
        description: policy.description,
        category: policy.category,
        status: policy.status,
        createdAt: policy.created_at
      })
    };

  } catch (error: any) {
    console.error('Error creating policy:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
