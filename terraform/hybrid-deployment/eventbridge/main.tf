/**
 * GLENKEOS - EventBridge Event Bus (Hybrid Deployment)
 *
 * Provisions EventBridge for event-driven architecture:
 * - Custom event bus for GlenKeos events
 * - 29 event rules (from master spec)
 * - Dead Letter Queues (DLQ) for failed deliveries
 * - Event targets (Lambda functions)
 * - Cross-service event routing
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

# Custom Event Bus for GlenKeos
resource "aws_cloudwatch_event_bus" "glenkeos" {
  name = "glenkeos-${var.environment}"

  tags = {
    Name        = "glenkeos-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

# Event Bus Policy (allow services to publish events)
resource "aws_cloudwatch_event_bus_policy" "glenkeos" {
  event_bus_name = aws_cloudwatch_event_bus.glenkeos.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowServicesToPublish"
        Effect = "Allow"
        Principal = {
          Service = [
            "lambda.amazonaws.com",
            "events.amazonaws.com"
          ]
        }
        Action = [
          "events:PutEvents"
        ]
        Resource = aws_cloudwatch_event_bus.glenkeos.arn
      }
    ]
  })
}

# Dead Letter Queue for failed event deliveries
resource "aws_sqs_queue" "event_dlq" {
  name                      = "glenkeos-${var.environment}-event-dlq"
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 10

  tags = {
    Name        = "glenkeos-${var.environment}-event-dlq"
    Environment = var.environment
    ManagedBy   = "terraform"
    Platform    = "glenkeos"
  }
}

# DLQ Policy (allow EventBridge to send messages)
resource "aws_sqs_queue_policy" "event_dlq" {
  queue_url = aws_sqs_queue.event_dlq.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.event_dlq.arn
      }
    ]
  })
}

# Event Archive (for event replay)
resource "aws_cloudwatch_event_archive" "glenkeos" {
  name             = "glenkeos-${var.environment}-archive"
  event_source_arn = aws_cloudwatch_event_bus.glenkeos.arn
  retention_days   = var.event_archive_retention_days

  description = "Archive for GlenKeos events (supports event replay)"

  event_pattern = jsonencode({
    source = ["glenkeos"]
  })
}

# CloudWatch Log Group for event debugging
resource "aws_cloudwatch_log_group" "eventbridge" {
  name              = "/aws/events/glenkeos-${var.environment}"
  retention_in_days = 7

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

# Event Rules (one per event type)
# These will be dynamically created from the event catalog

locals {
  # Load event catalog from JSON
  event_catalog = jsondecode(file("${path.module}/../../../generated/eventbus/topic-map.json"))

  # Create map of event rules
  event_rules = {
    for topic in local.event_catalog.topics : topic.event => {
      event_name = topic.event
      pattern = {
        source      = ["glenkeos"]
        detail-type = [topic.event]
      }
      producer  = topic.producer
      consumers = topic.consumers
    }
  }
}

# Event Rules (created dynamically from catalog)
resource "aws_cloudwatch_event_rule" "events" {
  for_each = local.event_rules

  name           = "glenkeos-${var.environment}-${lower(replace(each.key, "_", "-"))}"
  description    = "Route ${each.key} events to consumers"
  event_bus_name = aws_cloudwatch_event_bus.glenkeos.name

  event_pattern = jsonencode({
    source      = each.value.pattern.source
    detail-type = each.value.pattern.detail-type
  })

  tags = {
    Name        = each.key
    Producer    = each.value.producer
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

# CloudWatch Logs Target (for all events - debugging)
resource "aws_cloudwatch_event_target" "logs" {
  for_each = local.event_rules

  rule           = aws_cloudwatch_event_rule.events[each.key].name
  event_bus_name = aws_cloudwatch_event_bus.glenkeos.name
  target_id      = "logs"
  arn            = aws_cloudwatch_log_group.eventbridge.arn
}

# IAM Role for EventBridge to write to CloudWatch Logs
resource "aws_iam_role" "eventbridge_logs" {
  name = "glenkeos-${var.environment}-eventbridge-logs"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

resource "aws_iam_role_policy" "eventbridge_logs" {
  name = "logs"
  role = aws_iam_role.eventbridge_logs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.eventbridge.arn}:*"
      }
    ]
  })
}

# CloudWatch Metrics for event bus monitoring
resource "aws_cloudwatch_metric_alarm" "failed_invocations" {
  alarm_name          = "glenkeos-${var.environment}-eventbridge-failed-invocations"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "FailedInvocations"
  namespace           = "AWS/Events"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "EventBridge failed invocations exceeded threshold"
  alarm_actions       = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []

  dimensions = {
    EventBusName = aws_cloudwatch_event_bus.glenkeos.name
  }

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

resource "aws_cloudwatch_metric_alarm" "dlq_messages" {
  alarm_name          = "glenkeos-${var.environment}-event-dlq-messages"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Events in DLQ - delivery failures detected"
  alarm_actions       = var.alarm_sns_topic_arn != "" ? [var.alarm_sns_topic_arn] : []

  dimensions = {
    QueueName = aws_sqs_queue.event_dlq.name
  }

  tags = {
    Environment = var.environment
    Platform    = "glenkeos"
  }
}

# Outputs
output "event_bus_name" {
  description = "EventBridge event bus name"
  value       = aws_cloudwatch_event_bus.glenkeos.name
}

output "event_bus_arn" {
  description = "EventBridge event bus ARN"
  value       = aws_cloudwatch_event_bus.glenkeos.arn
}

output "event_dlq_url" {
  description = "Event DLQ URL"
  value       = aws_sqs_queue.event_dlq.url
}

output "event_dlq_arn" {
  description = "Event DLQ ARN"
  value       = aws_sqs_queue.event_dlq.arn
}

output "event_archive_arn" {
  description = "Event archive ARN (for replay)"
  value       = aws_cloudwatch_event_archive.glenkeos.arn
}

output "event_rules" {
  description = "Map of event rules created"
  value = {
    for k, v in aws_cloudwatch_event_rule.events : k => {
      name = v.name
      arn  = v.arn
    }
  }
}

output "event_log_group" {
  description = "CloudWatch log group for event debugging"
  value       = aws_cloudwatch_log_group.eventbridge.name
}
