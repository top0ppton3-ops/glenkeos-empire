# GlenKeos Stores Service

**Pilot microservice for hybrid deployment**

## Overview

The stores-service is the **first production microservice** in the GlenKeos hybrid backend platform. It implements store management functionality with full enterprise features:

- ✅ PostgreSQL with RLS (multi-tenant isolation)
- ✅ EventBridge event publishing
- ✅ Cognito JWT authentication
- ✅ CloudWatch logging
- ✅ Serverless Framework deployment

## Architecture

```
API Gateway → Lambda Handler → Domain Logic → Database (PostgreSQL)
           ↓
           → Event Publisher → EventBridge
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /v1/stores | Create a new store |
| GET | /v1/stores | List all stores (paginated) |
| GET | /v1/stores/{id} | Get store by ID |
| PUT | /v1/stores/{id} | Update store |
| OPTIONS | /v1/stores | CORS preflight |

## Events Published

- `STORE_CREATED` — When a new store is created
- `STORE_UPDATED` — When a store is updated

## Prerequisites

1. **AWS Account** with credentials configured
2. **PostgreSQL Database** deployed (see `/terraform/hybrid-deployment/database`)
3. **EventBridge Bus** deployed (see `/terraform/hybrid-deployment/eventbridge`)
4. **Cognito User Pool** (existing: `us-east-2_7YexJPzib`)

## Installation

```bash
cd services/stores-service
npm install
```

## Configuration

Set environment variables (or use `.env`):

```bash
# Local development
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=glenkeos
export DB_USER=glenkeos_admin
export DB_PASSWORD=your-password

# AWS deployment (uses Secrets Manager)
export DB_SECRET_NAME=glenkeos/staging/database/master-password
export EVENT_BUS_NAME=glenkeos-staging
```

## Development

### Run Tests

```bash
npm test
```

### Local Development

```bash
# Start local API
npm run local

# Test locally
curl -X POST http://localhost:3000/v1/stores \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Store","address":"123 Main St"}'
```

## Deployment

### Deploy to AWS

```bash
# Deploy to staging
npm run deploy

# Deploy to production
npm run deploy -- --stage production
```

### Deploy Output

After deployment, note the API URL:

```
API Gateway endpoint URL: https://xxx.execute-api.us-east-2.amazonaws.com
```

## Testing

### Create a Store

```bash
# Get JWT token from Cognito
TOKEN="your-jwt-token"

# Create store
curl -X POST https://your-api-url/v1/stores \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Downtown Store",
    "address": "123 Main Street",
    "phone": "555-0100",
    "email": "store@example.com"
  }'
```

### Get Store

```bash
curl -X GET https://your-api-url/v1/stores/{store-id} \
  -H "Authorization: Bearer $TOKEN"
```

### List Stores

```bash
curl -X GET https://your-api-url/v1/stores?limit=10&offset=0 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Store

```bash
curl -X PUT https://your-api-url/v1/stores/{store-id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Store Name",
    "active": true
  }'
```

## Verification

### Check Database

```bash
psql -h your-db-host -U glenkeos_admin -d glenkeos -c "SELECT * FROM stores;"
```

### Check Events in EventBridge

```bash
aws logs tail /aws/events/glenkeos-staging --follow
```

### Check Lambda Logs

```bash
aws logs tail /aws/lambda/glenkeos-stores-service-staging-createStore --follow
```

## Database Schema

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stores_tenant ON stores(tenant_id);
CREATE INDEX idx_stores_active ON stores(active) WHERE active = true;
```

## Event Schema

### STORE_CREATED

```json
{
  "eventId": "evt_123...",
  "eventType": "STORE_CREATED",
  "eventVersion": "1.0",
  "timestamp": "2026-04-16T10:30:00Z",
  "tenantId": "tenant_abc123",
  "regionId": "us-east-2",
  "correlationId": "corr_...",
  "causationId": "cause_...",
  "actorId": "user_...",
  "actorType": "USER",
  "source": "stores",
  "payload": {
    "storeId": "store_xyz789",
    "name": "Downtown Store",
    "address": "123 Main Street"
  },
  "metadata": {}
}
```

## Troubleshooting

### Database Connection Failed

1. Check database is running and accessible
2. Verify Secrets Manager has correct credentials
3. Check security group allows Lambda access
4. Verify Lambda is in correct VPC/subnet

### Events Not Publishing

1. Check EventBridge bus exists (`glenkeos-staging`)
2. Verify IAM role has `events:PutEvents` permission
3. Check CloudWatch logs for errors

### Authentication Failed

1. Verify Cognito User Pool ID is correct
2. Check JWT token is valid and not expired
3. Verify API Gateway authorizer configuration

## Cost Estimate

**Monthly cost (assuming 100K requests/month):**

- Lambda invocations: ~$0.20
- Lambda duration: ~$1.00
- API Gateway: ~$0.35
- CloudWatch logs: ~$0.50

**Total: ~$2/month** (very low cost for pilot)

## Next Steps

After stores-service is validated:

1. ✅ Replicate pattern for orders-service
2. ✅ Replicate for inventory-service
3. ✅ Continue for remaining 6 services
4. ✅ Add integration tests
5. ✅ Add load tests
6. ✅ Deploy to production

## Support

- **Platform Team:** GlenKeos Engineering
- **Slack:** #glenkeos-backend
- **Documentation:** /docs/services/stores-service
