import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { getDbClient } from '../../../shared/db/client';
import { publishEvent } from '../../../shared/events/publisher';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const correlationId = event.requestContext.requestId;

  try {
    const { staffId } = event.pathParameters || {};
    const tenantId = event.requestContext.authorizer?.claims['custom:tenant_id'];

    const shiftId = uuidv4();
    const db = await getDbClient();

    const staffCheck = await db.query(
      'SELECT * FROM staff WHERE staff_id = $1 AND tenant_id = $2',
      [staffId, tenantId]
    );

    if (staffCheck.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Staff member not found' })
      };
    }

    const activeShift = await db.query(
      'SELECT * FROM shifts WHERE staff_id = $1 AND shift_end IS NULL',
      [staffId]
    );

    if (activeShift.rows.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Staff member already has an active shift' })
      };
    }

    const result = await db.query(
      `INSERT INTO shifts (shift_id, staff_id, tenant_id, shift_start, created_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [shiftId, staffId, tenantId]
    );

    await db.query(
      'UPDATE staff SET shift_status = $1, updated_at = NOW() WHERE staff_id = $2',
      ['ON_SHIFT', staffId]
    );

    const shift = result.rows[0];

    await publishEvent({
      eventType: 'SHIFT_STARTED',
      source: 'staff-service',
      data: {
        shiftId: shift.shift_id,
        staffId: shift.staff_id,
        tenantId: shift.tenant_id,
        shiftStart: shift.shift_start
      },
      correlationId
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        shiftId: shift.shift_id,
        staffId: shift.staff_id,
        shiftStart: shift.shift_start
      })
    };

  } catch (error: any) {
    console.error('Error starting shift:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
