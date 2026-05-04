import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.requestContext.requestId;

  try {
    const { driverId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { orderId } = body;
    const tenantId = event.requestContext.authorizer?.claims['custom:tenant_id'];

    if (!orderId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required field: orderId' })
      };
    }

    const assignmentId = uuidv4();
    const db = await getDbClient();

    const driverCheck = await db.query(
      'SELECT * FROM drivers WHERE driver_id = $1 AND tenant_id = $2',
      [driverId, tenantId]
    );

    if (driverCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Driver not found' })
      };
    }

    const driver = driverCheck.rows[0];

    if (driver.status !== 'AVAILABLE') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Driver is not available' })
      };
    }

    const result = await db.query(
      `INSERT INTO driver_assignments (
        assignment_id, driver_id, order_id, tenant_id,
        status, assigned_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [assignmentId, driverId, orderId, tenantId, 'ASSIGNED']
    );

    await db.query(
      'UPDATE drivers SET status = $1, updated_at = NOW() WHERE driver_id = $2',
      ['BUSY', driverId]
    );

    const assignment = result.rows[0];

    await publishEvent({
      eventType: 'DRIVER_ASSIGNED',
      source: 'drivers-service',
      data: {
        assignmentId: assignment.assignment_id,
        driverId: assignment.driver_id,
        orderId: assignment.order_id,
        tenantId: assignment.tenant_id,
        driverType: driver.driver_type
      },
      correlationId
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        assignmentId: assignment.assignment_id,
        driverId: assignment.driver_id,
        orderId: assignment.order_id,
        status: assignment.status,
        assignedAt: assignment.assigned_at
      })
    };

  } catch (error: any) {
    console.error('Error assigning driver:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
