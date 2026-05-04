# GlenKeos Payments Service

PayPal Expanded Checkout integration with 3D Secure support.

## Features

- PayPal Orders API v2 integration
- 3D Secure (SCA_WHEN_REQUIRED)
- Webhook handling (capture completed/denied/refunded)
- Immutable payment records
- Event-driven architecture

## Environment Variables

```bash
PAYPAL_CLIENT_ID=<your-client-id>
PAYPAL_CLIENT_SECRET=<your-client-secret>
PAYPAL_MODE=sandbox # or production
DATABASE_URL=<postgres-connection-string>
EVENT_BUS_NAME=glenkeos-bus
```

## Endpoints

### POST /payments/create-order
Creates a PayPal order with 3DS support.

**Request:**
```json
{
  "amount": "49.99",
  "currency": "USD",
  "order_id": "ord_abc123",
  "customer_id": "cust_xyz789"
}
```

**Response:**
```json
{
  "payment_id": "pay_123",
  "paypal_order_id": "8X123456789012345",
  "status": "CREATED",
  "approval_url": "https://paypal.com/checkoutnow?token=..."
}
```

### POST /payments/capture-order
Captures a PayPal order.

**Request:**
```json
{
  "paypal_order_id": "8X123456789012345"
}
```

**Response:**
```json
{
  "payment_id": "pay_123",
  "status": "COMPLETED",
  "capture_id": "9X987654321098765"
}
```

### POST /payments/webhook
Handles PayPal webhooks.

## Events Published

- `PAYMENT_AUTHORIZED`
- `PAYMENT_COMPLETED`
- `PAYMENT_FAILED`
- `REFUND_ISSUED`

## Deployment

```bash
npm install
serverless deploy --stage staging
```
