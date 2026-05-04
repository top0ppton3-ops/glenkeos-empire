# GlenKeos PostgreSQL Database (Hybrid Deployment)

This Terraform configuration provisions an RDS PostgreSQL database for the GlenKeos platform, integrated with existing Amplify infrastructure.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ EXISTING AMPLIFY INFRASTRUCTURE                         │
│ ├─ Amplify App (d262l1qtvcxnk9)                         │
│ ├─ Cognito User Pool (us-east-2_7YexJPzib)              │
│ └─ DynamoDB Tables (2)                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ NEW: RDS POSTGRESQL (THIS MODULE)                       │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ PostgreSQL 15.8                                     │ │
│ │ ├─ Row-Level Security (RLS) enabled                │ │
│ │ ├─ 14 tables (from master spec)                    │ │
│ │ ├─ 79 indexes                                       │ │
│ │ ├─ 16 triggers (immutability enforcement)          │ │
│ │ ├─ Multi-AZ (configurable)                         │ │
│ │ ├─ PITR (7-day retention)                          │ │
│ │ ├─ Encrypted at rest (KMS)                         │ │
│ │ └─ CloudWatch monitoring                           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Features

- **Row-Level Security (RLS):** Tenant isolation at database level
- **Point-in-Time Recovery:** 7-day backup retention
- **Multi-AZ:** High availability (configurable)
- **Encryption:** At rest using KMS
- **Monitoring:** CloudWatch alarms for CPU and storage
- **Secrets Management:** Credentials stored in AWS Secrets Manager
- **Performance Insights:** Query performance monitoring

## Prerequisites

1. AWS credentials configured (already done via ~/.aws/credentials)
2. Terraform >= 1.5.0
3. Existing VPC (or use default VPC)

## Deployment

### 1. Initialize Terraform

```bash
cd terraform/hybrid-deployment/database
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
- 1 RDS PostgreSQL instance
- 1 DB subnet group
- 1 DB parameter group
- 1 Security group
- 1 Secrets Manager secret
- 2 CloudWatch alarms

**Estimated time:** 10-15 minutes

### 4. Apply Database Schema

After RDS is provisioned, apply the GlenKeos schema:

```bash
# Get database endpoint
DB_ENDPOINT=$(terraform output -raw db_instance_address)

# Get credentials from Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id glenkeos/staging/database/master-password \
  --query SecretString --output text | jq -r '.password')

# Apply schema from master spec
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_ENDPOINT \
  -U glenkeos_admin \
  -d glenkeos \
  -f ../../../generated/database/001_generated_schema.sql

# Verify schema
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_ENDPOINT \
  -U glenkeos_admin \
  -d glenkeos \
  -c "\dt"  # Should show 14 tables
```

## Outputs

| Output | Description |
|--------|-------------|
| `db_instance_endpoint` | Full endpoint (host:port) |
| `db_instance_address` | Host address only |
| `db_instance_port` | Port number (5432) |
| `db_instance_name` | Database name (glenkeos) |
| `db_secret_arn` | ARN of credentials secret |
| `db_security_group_id` | Security group for access |

## Cost Estimate

**Staging (db.t3.medium, single-AZ):**
- RDS instance: ~$70/month
- Storage (100 GB): ~$11.50/month
- Backup storage (7 days): ~$2/month
- **Total: ~$85/month**

**Production (db.t3.large, multi-AZ):**
- RDS instance: ~$280/month
- Storage (100 GB): ~$23/month
- Backup storage (30 days): ~$8/month
- **Total: ~$310/month**

## Security

- ✅ No public access
- ✅ VPC-only access
- ✅ Encrypted at rest (AES-256)
- ✅ Encrypted in transit (SSL/TLS)
- ✅ Credentials in Secrets Manager
- ✅ CloudWatch logging enabled
- ✅ RLS enabled for tenant isolation

## Monitoring

CloudWatch alarms created:
- **CPU Utilization:** Triggers if >80% for 10 minutes
- **Free Storage:** Triggers if <10 GB remaining

View metrics:
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=glenkeos-staging \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

## Troubleshooting

### Cannot connect to database

1. Check security group allows your IP:
```bash
aws ec2 describe-security-groups \
  --group-ids $(terraform output -raw db_security_group_id)
```

2. Verify VPC networking:
```bash
aws rds describe-db-instances \
  --db-instance-identifier glenkeos-staging \
  --query 'DBInstances[0].DBSubnetGroup'
```

### Schema application fails

1. Verify database is available:
```bash
pg_isready -h $(terraform output -raw db_instance_address)
```

2. Check credentials:
```bash
aws secretsmanager get-secret-value \
  --secret-id glenkeos/staging/database/master-password
```

## Next Steps

After database is provisioned:

1. ✅ Apply database schema (001_generated_schema.sql)
2. ⏭ Deploy EventBridge (event bus)
3. ⏭ Deploy Lambda functions (9 microservices)
4. ⏭ Deploy API Gateway (38 endpoints)
5. ⏭ Wire to Cognito authentication

## Cleanup

To destroy resources:

```bash
terraform destroy
```

⚠️ **Warning:** This will delete the database and all data. Final snapshot will be created unless `skip_final_snapshot = true`.
