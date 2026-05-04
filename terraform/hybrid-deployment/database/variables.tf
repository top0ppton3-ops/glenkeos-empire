variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
}

variable "use_default_vpc" {
  description = "Use default VPC"
  type        = bool
  default     = true
}

variable "vpc_name" {
  description = "Name of existing VPC (if not using default)"
  type        = string
  default     = ""
}

variable "lambda_cidr_blocks" {
  description = "CIDR blocks for Lambda functions"
  type        = list(string)
  default     = []
}

variable "instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium" # 2 vCPU, 4 GB RAM
}

variable "allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 100
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "glenkeos"
}

variable "master_username" {
  description = "Master username"
  type        = string
  default     = "glenkeos_admin"
}

variable "multi_az" {
  description = "Enable multi-AZ deployment"
  type        = bool
  default     = true
}

variable "availability_zone" {
  description = "Availability zone (if not multi-AZ)"
  type        = string
  default     = "us-east-2a"
}

variable "backup_retention_days" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot on deletion"
  type        = bool
  default     = false
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (leave empty for default)"
  type        = string
  default     = ""
}

variable "alarm_sns_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms"
  type        = string
  default     = ""
}
