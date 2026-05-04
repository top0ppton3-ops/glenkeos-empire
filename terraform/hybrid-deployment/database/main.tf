/**
 * GLENKEOS - RDS PostgreSQL Database (Hybrid Deployment)
 *
 * Provisions PostgreSQL with:
 * - Row-Level Security (RLS) enabled
 * - Point-in-Time Recovery (PITR)
 * - Multi-AZ for high availability
 * - Automated backups
 * - Encryption at rest
 * - VPC isolation
 *
 * Integrates with existing Amplify infrastructure
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source: Get existing Amplify app VPC (or default VPC)
data "aws_vpc" "existing" {
  default = var.use_default_vpc

  tags = var.use_default_vpc ? {} : {
    Name = var.vpc_name
  }
}

data "aws_subnets" "database" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.existing.id]
  }
}

# Security Group for PostgreSQL
resource "aws_security_group" "postgresql" {
  name        = "glenkeos-postgresql-${var.environment}"
  description = "Security group for GlenKeos PostgreSQL database"
  vpc_id      = data.aws_vpc.existing.id

  # Allow PostgreSQL from within VPC
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.existing.cidr_block]
    description = "PostgreSQL from VPC"
  }

  # Allow Lambda functions (if needed)
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.lambda_cidr_blocks
    description = "PostgreSQL from Lambda"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name        = "glenkeos-postgresql-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "postgresql" {
  name       = "glenkeos-postgresql-${var.environment}"
  subnet_ids = data.aws_subnets.database.ids

  tags = {
    Name        = "glenkeos-postgresql-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

# Parameter Group (PostgreSQL 15 with RLS enabled)
resource "aws_db_parameter_group" "postgresql" {
  name   = "glenkeos-postgresql-${var.environment}"
  family = "postgres15"

  # Enable logical replication for multi-region
  parameter {
    name  = "rds.logical_replication"
    value = "1"
  }

  # WAL level for PITR
  parameter {
    name  = "wal_level"
    value = "logical"
  }

  # Row-Level Security enforcement
  parameter {
    name  = "row_security"
    value = "on"
  }

  # Performance tuning
  parameter {
    name  = "shared_buffers"
    value = "{DBInstanceClassMemory/4096}"
  }

  parameter {
    name  = "max_connections"
    value = "200"
  }

  tags = {
    Name        = "glenkeos-postgresql-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

# Random password for master user
resource "random_password" "master" {
  length  = 32
  special = true
}

# Store password in Secrets Manager
resource "aws_secretsmanager_secret" "db_master_password" {
  name        = "glenkeos/${var.environment}/database/master-password"
  description = "GlenKeos PostgreSQL master password"

  tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

resource "aws_secretsmanager_secret_version" "db_master_password" {
  secret_id     = aws_secretsmanager_secret.db_master_password.id
  secret_string = jsonencode({
    username = var.master_username
    password = random_password.master.result
    engine   = "postgres"
    host     = aws_db_instance.postgresql.address
    port     = aws_db_instance.postgresql.port
    dbname   = var.database_name
  })
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "postgresql" {
  identifier = "glenkeos-${var.environment}"

  # Engine
  engine               = "postgres"
  engine_version       = "15.8"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  storage_type         = "gp3"
  storage_encrypted    = true
  kms_key_id           = var.kms_key_id

  # Database
  db_name  = var.database_name
  username = var.master_username
  password = random_password.master.result

  # Networking
  db_subnet_group_name   = aws_db_subnet_group.postgresql.name
  vpc_security_group_ids = [aws_security_group.postgresql.id]
  publicly_accessible    = false
  port                   = 5432

  # High Availability
  multi_az               = var.multi_az
  availability_zone      = var.multi_az ? null : var.availability_zone

  # Backup & Maintenance
  backup_retention_period   = var.backup_retention_days
  backup_window             = "03:00-04:00"
  maintenance_window        = "mon:04:00-mon:05:00"
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]

  # Performance Insights
  performance_insights_enabled    = true
  performance_insights_retention_period = 7

  # Parameter & Option Groups
  parameter_group_name = aws_db_parameter_group.postgresql.name

  # Deletion Protection
  deletion_protection = var.deletion_protection
  skip_final_snapshot = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "glenkeos-${var.environment}-final-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Auto minor version upgrade
  auto_minor_version_upgrade = true

  # Copy tags to snapshots
  copy_tags_to_snapshot = true

  tags = {
    Name        = "glenkeos-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
    Schema      = "master-spec-v1"
  }
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "glenkeos-${var.environment}-db-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Database CPU utilization is too high"
  alarm_actions       = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

resource "aws_cloudwatch_metric_alarm" "database_storage" {
  alarm_name          = "glenkeos-${var.environment}-db-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 10737418240 # 10 GB
  alarm_description   = "Database free storage space is low"
  alarm_actions       = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.postgresql.id
  }

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

# Outputs
output "db_instance_endpoint" {
  description = "PostgreSQL instance endpoint"
  value       = aws_db_instance.postgresql.endpoint
}

output "db_instance_address" {
  description = "PostgreSQL instance address"
  value       = aws_db_instance.postgresql.address
}

output "db_instance_port" {
  description = "PostgreSQL instance port"
  value       = aws_db_instance.postgresql.port
}

output "db_instance_name" {
  description = "Database name"
  value       = aws_db_instance.postgresql.db_name
}

output "db_master_username" {
  description = "Master username"
  value       = aws_db_instance.postgresql.username
  sensitive   = true
}

output "db_secret_arn" {
  description = "ARN of the secret containing database credentials"
  value       = aws_secretsmanager_secret.db_master_password.arn
}

output "db_security_group_id" {
  description = "Security group ID for database access"
  value       = aws_security_group.postgresql.id
}
