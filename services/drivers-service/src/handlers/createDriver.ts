import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.requestContext.requestId;

  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, phone, driverType, vehicleInfo } = body;

    if (!name || !email || !driverType) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: name, email, driverType' })
      };
    }

    if (!['STANDARD_DRIVER', 'CART_DRIVER', 'DORM_RUNNER'].includes(driverType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid driverType' })
      };
    }

    const driverId = uuidv4();
    const tenantId = event.requestContext.authorizer?.claims['custom:tenant_id'];
    const db = await getDbClient();

    const result = await db.query(
      `INSERT INTO drivers (
        driver_id, tenant_id, name, email, phone, driver_type,
        vehicle_info, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [driverId, tenantId, name, email, phone, driverType, JSON.stringify(vehicleInfo || {}), 'OFFLINE']
    );

    const driver = result.rows[0];

    await publishEvent({
      eventType: 'DRIVER_CREATED',
      source: 'drivers-service',
      data: {
        driverId: driver.driver_id,
        tenantId: driver.tenant_id,
        driverType: driver.driver_type,
        status: driver.status
      },
      correlationId
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        driverId: driver.driver_id,
        name: driver.name,
        email: driver.email,
        driverType: driver.driver_type,
        status: driver.status,
        createdAt: driver.created_at
      })
    };

  } catch (error: any) {
    console.error('Error creating driver:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
