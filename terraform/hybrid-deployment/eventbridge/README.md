# GlenKeos EventBridge Event Bus (Hybrid Deployment)

This Terraform configuration provisions AWS EventBridge as the event bus for the GlenKeos platform, integrated with existing Amplify infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ EVENT PRODUCERS (Lambda Functions)                      │
│ ├─ stores-service                                       │
│ ├─ orders-service                                       │
│ ├─ inventory-service                                    │
│ ├─ drivers-service                                      │
│ ├─ staff-service                                        │
│ ├─ policies-service                                     │
│ ├─ risk-service                                         │
│ ├─ compliance-service                                   │
│ └─ metrics-service                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ PutEvents
                          ▼
┌─────────────────────────────────────────────────────────┐
│ EVENTBRIDGE CUSTOM BUS                                  │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ glenkeos-staging Event Bus                          │ │
│ │                                                     │ │
│ │ 29 Event Rules:                                     │ │
│ │ ├─ STORE_CREATED                                    │ │
│ │ ├─ STORE_UPDATED                                    │ │
│ │ ├─ ORDER_CREATED                                    │ │
│ │ ├─ ORDER_STATUS_CHANGED                             │ │
│ │ ├─ ORDER_ASSIGNED                                   │ │
│ │ ├─ ORDER_CANCELLED                                  │ │
│ │ ├─ ... (23 more events)                             │ │
│ │                                                     │ │
│ │ Features:                                           │ │
│ │ ├─ Event archive (7-day retention, replay support) │ │
│ │ ├─ DLQ for failed deliveries                        │ │
│ │ ├─ CloudWatch logging for debugging                 │ │
│ │ └─ CloudWatch alarms for monitoring                 │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Route to consumers
                          ▼
┌─────────────────────────────────────────────────────────┐
│ EVENT CONSUMERS (Lambda Functions)                      │
│ ├─ inventory-service (consumes ORDER_CREATED)           │
│ ├─ compliance-service (consumes all events)             │
│ ├─ metrics-service (consumes all events)                │
│ └─ ... (consumer mappings from event catalog)           │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Custom Event Bus:** Isolated from default EventBridge bus
- **29 Event Rules:** One per event type (from master spec)
- **Event Archive:** 7-day retention with replay capability
- **Dead Letter Queue:** SQS queue for failed event deliveries
- **CloudWatch Logging:** All events logged for debugging
- **Monitoring:** Alarms for failed invocations and DLQ messages
- **Multi-tenant:** Events scoped by tenantId in event detail

## Event Envelope Structure

All events follow the universal envelope pattern from the master spec:

```json
{
  "version": "0",
  "id": "unique-event-id",
  "detail-type": "ORDER_CREATED",
  "source": "glenkeos",
  "account": "aws-account-id",
  "time": "2026-04-16T10:30:00Z",
  "region": "us-east-2",
  "resources": [],
  "detail": {
    "eventId": "evt_...",
    "eventType": "ORDER_CREATED",
    "eventVersion": "1.0",
    "timestamp": "2026-04-16T10:30:00Z",
    "tenantId": "tenant_abc123",
    "regionId": "us-east-2",
    "storeId": "store_xyz789",
    "correlationId": "corr_...",
    "causationId": "cause_...",
    "actorId": "user_...",
    "actorType": "CASHIER",
    "source": "orders",
    "payload": {
      "orderId": "ord_...",
      "customerId": "cust_...",
      "total": 45.99,
      "items": [...]
    },
    "metadata": {
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0..."
    }
  }
}
```

## Prerequisites

1. AWS credentials configured
2. Terraform >= 1.5.0
3. Event catalog JSON at `generated/eventbus/topic-map.json`

## Deployment

### 1. Initialize Terraform

```bash
cd terraform/hybrid-deployment/eventbridge
terraform init
```

### 2. Review Plan

```bash
terraform plan
```

### 3. Apply Configuration

```bash
terraform apply
```

**Expected resources created:**
- 1 Custom EventBridge bus
- 29 Event rules (one per event type)
- 1 Event archive (for replay)
- 1 SQS DLQ
- 1 CloudWatch log group
- 2 CloudWatch alarms
- IAM roles and policies

**Estimated time:** 2-3 minutes

## Testing

### Publish Test Event

```bash
# Publish a test ORDER_CREATED event
aws events put-events \
  --entries '[
    {
      "Source": "glenkeos",
      "DetailType": "ORDER_CREATED",
      "Detail": "{\"tenantId\":\"tenant_test\",\"orderId\":\"ord_123\",\"total\":45.99}",
      "EventBusName": "glenkeos-staging"
    }
  ]'
```

### View Event Logs

```bash
# View recent events in CloudWatch Logs
aws logs tail /aws/events/glenkeos-staging --follow
```

### Check DLQ for Failed Deliveries

```bash
# Check if any events in DLQ
aws sqs get-queue-attributes \
  --queue-url $(terraform output -raw event_dlq_url) \
  --attribute-names ApproximateNumberOfMessages
```

### Replay Events from Archive

```bash
# Replay events from last hour
aws events start-replay \
  --replay-name test-replay-$(date +%s) \
  --event-source-arn $(terraform output -raw event_archive_arn) \
  --event-start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --event-end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --destination '{
    "Arn": "'"$(terraform output -raw event_bus_arn)"'",
    "FilterArn": ""
  }'
```

## Event Catalog Summary

| Event | Producer | Consumers |
|-------|----------|-----------|
| STORE_CREATED | stores | - |
| STORE_UPDATED | stores | - |
| ORDER_CREATED | orders | inventory, compliance, metrics |
| ORDER_STATUS_CHANGED | orders | compliance, metrics |
| ORDER_ASSIGNED | orders | drivers, compliance |
| ORDER_CANCELLED | orders | inventory, compliance, metrics |
| ORDER_DELIVERED | orders | metrics, compliance |
| INVENTORY_UPDATED | inventory | orders, metrics |
| INVENTORY_LOW_STOCK | inventory | stores, compliance |
| INVENTORY_REORDER_TRIGGERED | inventory | stores, metrics |
| INVENTORY_RECEIVED | inventory | metrics |
| DRIVER_ASSIGNED | drivers | orders, compliance |
| DRIVER_STATUS_CHANGED | drivers | metrics |
| DRIVER_LOCATION_UPDATED | drivers | metrics |
| DRIVER_RATING_UPDATED | drivers | metrics |
| STAFF_CREATED | staff | compliance |
| STAFF_ROLE_CHANGED | staff | policies, risk, compliance |
| STAFF_SESSION_STARTED | staff | compliance |
| STAFF_SESSION_ENDED | staff | compliance |
| STAFF_DELETED | staff | compliance |
| POLICY_CREATED | policies | staff, compliance |
| POLICY_UPDATED | policies | staff, compliance |
| POLICY_ACKNOWLEDGED | policies | compliance |
| RISK_EVENT_CREATED | risk | compliance, metrics |
| RISK_EVENT_ESCALATED | risk | compliance |
| RISK_EVENT_MITIGATED | risk | compliance |
| RISK_EVENT_CLOSED | risk | compliance |
| COMPLIANCE_VIOLATION_DETECTED | compliance | risk, metrics |
| COMPLIANCE_REPORT_GENERATED | compliance | - |
| DATA_EXPORT_REQUESTED | compliance | risk |
| ACCESS_DENIED | compliance | risk |

**Total:** 31 events, 9 producers, multiple consumers

## Cost Estimate

**EventBridge Pricing:**
- Events ingested: $1.00 per million events
- Event archive storage: $0.10 per GB-month
- Event replay: $0.10 per GB replayed

**Estimated Monthly Cost (10K events/day):**
- Events: ~300K/month = $0.30
- Archive storage (7 days): ~0.1 GB = $0.01
- SQS DLQ: Minimal (only failed events)
- CloudWatch Logs: ~$0.50/GB

**Total: ~$1-2/month** (very low cost)

## Monitoring

### CloudWatch Alarms

1. **Failed Invocations:** Triggers if >10 failures in 10 minutes
2. **DLQ Messages:** Triggers if any messages in DLQ

### View Metrics

```bash
# Event bus metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Events \
  --metric-name Invocations \
  --dimensions Name=EventBusName,Value=glenkeos-staging \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum
```

## Integration with Lambda

Lambda functions will be configured as targets for event rules in the next phase.

Example Lambda target configuration:
```hcl
resource "aws_cloudwatch_event_target" "lambda" {
  rule           = aws_cloudwatch_event_rule.events["ORDER_CREATED"].name
  event_bus_name = aws_cloudwatch_event_bus.glenkeos.name
  target_id      = "inventory-service"
  arn            = aws_lambda_function.inventory.arn

  dead_letter_config {
    arn = aws_sqs_queue.event_dlq.arn
  }
}
```

## Cleanup

```bash
terraform destroy
```

## Next Steps

After EventBridge is deployed:

1. ✅ RDS PostgreSQL deployed
2. ✅ EventBridge deployed
3. ⏭ Deploy Lambda functions (9 microservices)
4. ⏭ Configure Lambda as event targets
5. ⏭ Deploy API Gateway
6. ⏭ Wire to Cognito authentication
