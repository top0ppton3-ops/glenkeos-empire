# **GLENKEOS — HYBRID DEPLOYMENT GUIDE**

**Date:** 2026-04-16  
**Status:** ✅ CODE GENERATION COMPLETE — READY FOR DEPLOYMENT  
**Architecture:** Hybrid (Amplify + Custom Backend)  

---

## **🎯 WHAT'S BEEN BUILT**

### ✅ **Infrastructure Code (Terraform)**

**1. PostgreSQL Database**
- Location: `terraform/hybrid-deployment/database/`
- Features:
  - PostgreSQL 15.8 with RLS
  - Multi-AZ, 100 GB storage
  - Automated backups (7-day retention)
  - Encryption at rest
  - Secrets Manager integration
  - CloudWatch alarms
- Cost: ~$85/month (staging)

**2. EventBridge Event Bus**
- Location: `terraform/hybrid-deployment/eventbridge/`
- Features:
  - Custom event bus with 29 event rules
  - Event archive (7-day retention, replay support)
  - Dead Letter Queue (SQS)
  - CloudWatch logging
  - CloudWatch alarms
- Cost: ~$2/month

### ✅ **Stores Service (PILOT)**

**Location:** `services/stores-service/`

**Complete Production-Ready Service:**
- ✅ Lambda handlers (create, get, list, update)
- ✅ Domain logic (business rules)
- ✅ Database client (PostgreSQL with RLS)
- ✅ Event publisher (EventBridge with universal envelope)
- ✅ Serverless Framework configuration
- ✅ TypeScript with strict typing
- ✅ CORS configuration
- ✅ JWT authentication (Cognito)
- ✅ Comprehensive README

**Endpoints:**
- POST /v1/stores
- GET /v1/stores
- GET /v1/stores/{id}
- PUT /v1/stores/{id}

**Events:**
- STORE_CREATED
- STORE_UPDATED

**Cost:** ~$2/month (100K requests)

---

## **🚀 DEPLOYMENT STEPS**

### **STEP 1: Deploy PostgreSQL Database**

```bash
cd terraform/hybrid-deployment/database

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Deploy (takes ~15 minutes)
terraform apply

# Save the outputs
terraform output > ../../../deployment-outputs.txt
```

**Outputs:**
- `db_instance_endpoint` — Database connection string
- `db_secret_arn` — Secrets Manager ARN for credentials

---

### **STEP 2: Apply Database Schema**

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

---

### **STEP 3: Deploy EventBridge**

```bash
cd ../eventbridge

# Initialize Terraform
terraform init

# Review what will be created
terraform plan

# Deploy (takes ~3 minutes)
terraform apply

# Save the outputs
terraform output >> ../../../deployment-outputs.txt
```

**Outputs:**
- `event_bus_name` — EventBridge bus name
- `event_bus_arn` — EventBridge bus ARN

---

### **STEP 4: Deploy Stores Service**

```bash
cd ../../../services/stores-service

# Install dependencies
npm install

# Install Serverless Framework globally (if not already installed)
npm install -g serverless

# Deploy to AWS (takes ~5 minutes)
serverless deploy --stage staging --region us-east-2

# Save API URL
serverless info --stage staging >> ../../deployment-outputs.txt
```

**Outputs:**
- API Gateway URL
- Lambda function ARNs
- Cognito User Pool ID

---

### **STEP 5: Test End-to-End**

#### **5.1 Get Cognito Token**

```bash
# Using AWS Cognito (requires user in pool)
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_CLIENT_ID \
  --auth-parameters USERNAME=test@example.com,PASSWORD=YourPassword123!

# Save the IdToken
export JWT_TOKEN="eyJraWQ..."
```

#### **5.2 Create a Store**

```bash
# Get API URL from deployment
API_URL=$(cat deployment-outputs.txt | grep "https://" | head -1)

# Create store
curl -X POST $API_URL/v1/stores \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Store #1",
    "address": "123 Main Street, Anytown, USA",
    "phone": "555-0100",
    "email": "store1@glenkeos.com"
  }'

# Should return 201 Created with store object
```

#### **5.3 Verify in Database**

```bash
PGPASSWORD=$DB_PASSWORD psql \
  -h $DB_ENDPOINT \
  -U glenkeos_admin \
  -d glenkeos \
  -c "SELECT * FROM stores ORDER BY created_at DESC LIMIT 5;"
```

#### **5.4 Verify Event Published**

```bash
# Check EventBridge logs
aws logs tail /aws/events/glenkeos-staging --follow

# Should see STORE_CREATED event
```

#### **5.5 Check Lambda Logs**

```bash
# View recent logs
aws logs tail /aws/lambda/glenkeos-stores-service-staging-createStore --follow
```

---

## **✅ VERIFICATION CHECKLIST**

After deployment, verify:

- [ ] PostgreSQL accessible from Lambda
- [ ] Database has 14 tables, 79 indexes, 16 triggers
- [ ] EventBridge bus exists with 29 rules
- [ ] Stores-service Lambda functions deployed (5 functions)
- [ ] API Gateway accessible
- [ ] Can create store via API (POST /v1/stores)
- [ ] Store appears in database
- [ ] STORE_CREATED event published to EventBridge
- [ ] CloudWatch logs show successful execution
- [ ] No errors in DLQ

---

## **📊 WHAT'S NEXT**

Once stores-service is validated, replicate the pattern for remaining 8 services:

1. **orders-service** (highest priority)
   - Endpoints: POST/GET/PUT /v1/orders
   - Events: ORDER_CREATED, ORDER_STATUS_CHANGED, ORDER_ASSIGNED, ORDER_CANCELLED, ORDER_DELIVERED
   - Tables: orders, order_items

2. **inventory-service**
   - Endpoints: POST/GET/PUT /v1/inventory
   - Events: INVENTORY_UPDATED, INVENTORY_LOW_STOCK, INVENTORY_REORDER_TRIGGERED
   - Tables: inventory

3. **drivers-service**
   - Endpoints: POST/GET/PUT /v1/drivers
   - Events: DRIVER_ASSIGNED, DRIVER_STATUS_CHANGED, DRIVER_LOCATION_UPDATED
   - Tables: drivers

4. **staff-service**
   - Endpoints: POST/GET/PUT/DELETE /v1/staff
   - Events: STAFF_CREATED, STAFF_ROLE_CHANGED, STAFF_SESSION_STARTED
   - Tables: staff, sessions, roles, store_assignments

5. **policies-service**
   - Endpoints: POST/GET/PUT /v1/policies
   - Events: POLICY_CREATED, POLICY_UPDATED, POLICY_ACKNOWLEDGED
   - Tables: policies, policy_acknowledgments

6. **risk-service**
   - Endpoints: POST/GET/PUT /v1/risks
   - Events: RISK_EVENT_CREATED, RISK_EVENT_ESCALATED, RISK_EVENT_MITIGATED
   - Tables: risk_events

7. **compliance-service**
   - Endpoints: GET /v1/compliance/events, GET /v1/compliance/reports
   - Events: COMPLIANCE_VIOLATION_DETECTED, COMPLIANCE_REPORT_GENERATED
   - Tables: compliance_events

8. **metrics-service**
   - Endpoints: POST/GET /v1/metrics
   - Events: METRIC_RECORDED
   - Tables: metrics

---

## **💰 TOTAL COST ESTIMATE**

### **Staging Environment (Per Month)**

| Resource | Cost |
|----------|------|
| PostgreSQL (db.t3.medium) | $85 |
| EventBridge | $2 |
| Stores Service (Lambda + API Gateway) | $2 |
| CloudWatch Logs | $1 |
| **TOTAL** | **~$90/month** |

### **When All 9 Services Deployed**

| Resource | Cost |
|----------|------|
| PostgreSQL | $85 |
| EventBridge | $5 |
| 9 Lambda Services | $18 |
| API Gateway | $10 |
| CloudWatch | $5 |
| **TOTAL** | **~$125/month** |

**Production:** ~$600/month (with larger RDS, multi-AZ, higher traffic)

---

## **🛟 TROUBLESHOOTING**

### **Terraform Not Installed**

Option 1: Install Terraform
```bash
# macOS
brew install terraform

# Linux
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/
```

Option 2: Use AWS Console
- Manually create RDS PostgreSQL instance
- Manually create EventBridge event bus
- Update environment variables in serverless.yml

### **Database Connection Failed**

1. Check Lambda is in correct VPC/subnet
2. Verify security group allows traffic from Lambda
3. Check Secrets Manager has correct credentials
4. Verify RDS is in "Available" state

### **Event Not Publishing**

1. Check EventBridge bus exists
2. Verify IAM role has `events:PutEvents` permission
3. Check Lambda environment variable `EVENT_BUS_NAME`
4. View CloudWatch logs for errors

### **API Returns 403 Forbidden**

1. Verify JWT token is valid and not expired
2. Check Cognito User Pool ID in serverless.yml
3. Verify API Gateway authorizer configuration
4. Check user has correct permissions

---

## **📞 SUPPORT**

**If you need help:**

1. Check CloudWatch logs first
2. Review troubleshooting section above
3. Consult the playbook: `hybrid-deployment-playbook.md`
4. Reach out to platform team

---

## **🎉 SUCCESS CRITERIA**

**You've successfully deployed when:**

✅ API call to POST /v1/stores returns 201 Created  
✅ Store appears in PostgreSQL database  
✅ STORE_CREATED event visible in EventBridge logs  
✅ No errors in CloudWatch logs  
✅ DLQ is empty (no failed events)  

**When this works, you've validated the entire hybrid architecture pattern.**

**Next: Replicate for 8 more services using the same pattern.**

---

**READY TO DEPLOY. LET'S GET THIS SHIT DONE.**
