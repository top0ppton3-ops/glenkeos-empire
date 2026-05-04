# GlenKeos PostgreSQL Database Configuration
# Environment: Staging (Hybrid Deployment)

aws_region  = "us-east-2"
environment = "staging"

# Use default VPC for initial deployment
use_default_vpc = true

# Database Configuration
instance_class      = "db.t3.medium"  # 2 vCPU, 4 GB RAM - good for staging
allocated_storage   = 100              # 100 GB storage
database_name       = "glenkeos"
master_username     = "glenkeos_admin"

# High Availability (disable for cost savings in staging)
multi_az = false
availability_zone = "us-east-2a"

# Backup & Retention
backup_retention_days = 7

# Protection (enable for production)
deletion_protection = false  # Set to true for production
skip_final_snapshot = false  # Always take final snapshot

# Monitoring
# alarm_sns_topic_arn = "arn:aws:sns:us-east-2:ACCOUNT_ID:glenkeos-alerts"
