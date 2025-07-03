"""
AWS Infrastructure for Real-Time Monitoring Dashboard
Implements best practices for multi-service deployment
"""

terraform {
  required_version = ">= 1.0"
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

# Variables
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "realtime-monitoring"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    Project     = "realtime-monitoring"
    Environment = "dev"
    Owner       = "monitoring-team"
  }
}

# VPC and Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-vpc"
  })
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-private-subnet-${count.index + 1}"
  })
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 10}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-public-subnet-${count.index + 1}"
  })
}

data "aws_availability_zones" "available" {
  state = "available"
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-igw"
  })
}

# Route Tables
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups
resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-${var.environment}-app-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8004
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-app-sg"
  })
}

# S3 Bucket for Data Lake
resource "aws_s3_bucket" "data_lake" {
  bucket = "${var.project_name}-${var.environment}-data-lake-${random_string.bucket_suffix.result}"

  tags = var.tags
}

resource "aws_s3_bucket_versioning" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_lake" {
  bucket = aws_s3_bucket.data_lake.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

# RDS PostgreSQL - Staging and Final Data
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-rds-sg"
  })
}

resource "aws_db_instance" "main" {
  identifier     = "${var.project_name}-${var.environment}-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "monitoring"
  username = "postgres"
  password = "P@ssw0rd123!"  # Use AWS Secrets Manager in production

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = var.tags
}

# DynamoDB - Anomaly and Knowledge Base
resource "aws_dynamodb_table" "anomaly" {
  name           = "${var.project_name}-${var.environment}-anomaly"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "error_id"
  range_key      = "timestamp"

  attribute {
    name = "error_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "severity"
    type = "S"
  }

  global_secondary_index {
    name     = "severity-timestamp-index"
    hash_key = "severity"
    range_key = "timestamp"
  }

  tags = var.tags
}

resource "aws_dynamodb_table" "knowledge" {
  name           = "${var.project_name}-${var.environment}-knowledge"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "doc_id"

  attribute {
    name = "doc_id"
    type = "S"
  }

  attribute {
    name = "category"
    type = "S"
  }

  global_secondary_index {
    name     = "category-index"
    hash_key = "category"
  }

  tags = var.tags
}

# AWS IoT Core - Real-time data ingestion
resource "aws_iot_thing_type" "sensor" {
  name = "${var.project_name}-${var.environment}-sensor-type"

  properties {
    description = "IoT sensors for monitoring dashboard"
  }

  tags = var.tags
}

resource "aws_iot_policy" "sensor_policy" {
  name = "${var.project_name}-${var.environment}-sensor-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "iot:Connect",
          "iot:Publish",
          "iot:Subscribe",
          "iot:Receive"
        ]
        Resource = "*"
      }
    ]
  })

  tags = var.tags
}

# Amazon MSK (Managed Kafka)
resource "aws_msk_configuration" "main" {
  kafka_versions = ["2.8.1"]
  name           = "${var.project_name}-${var.environment}-msk-config"

  server_properties = <<PROPERTIES
auto.create.topics.enable=true
default.replication.factor=2
min.insync.replicas=1
num.partitions=4
PROPERTIES
}

resource "aws_msk_cluster" "main" {
  cluster_name           = "${var.project_name}-${var.environment}-msk"
  kafka_version          = "2.8.1"
  number_of_broker_nodes = 2

  broker_node_group_info {
    instance_type   = "kafka.t3.small"
    ebs_volume_size = 20
    client_subnets  = aws_subnet.private[*].id
    security_groups = [aws_security_group.msk.id]
  }

  configuration_info {
    arn      = aws_msk_configuration.main.arn
    revision = aws_msk_configuration.main.latest_revision
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "PLAINTEXT"
      in_cluster    = true
    }
  }

  tags = var.tags
}

resource "aws_security_group" "msk" {
  name_prefix = "${var.project_name}-${var.environment}-msk-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 9092
    to_port         = 9094
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  ingress {
    from_port = 2181
    to_port   = 2181
    protocol  = "tcp"
    self      = true
  }

  tags = merge(var.tags, {
    Name = "${var.project_name}-${var.environment}-msk-sg"
  })
}

# Amazon SageMaker - Machine Learning
resource "aws_sagemaker_notebook_instance" "main" {
  name          = "${var.project_name}-${var.environment}-notebook"
  role_arn      = aws_iam_role.sagemaker.arn
  instance_type = "ml.t3.medium"

  tags = var.tags
}

# SageMaker IAM Role
resource "aws_iam_role" "sagemaker" {
  name = "${var.project_name}-${var.environment}-sagemaker-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "sagemaker.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "sagemaker" {
  role       = aws_iam_role.sagemaker.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"
}

# Amazon Kendra - Knowledge Base Search
resource "aws_kendra_index" "main" {
  name     = "${var.project_name}-${var.environment}-knowledge-index"
  role_arn = aws_iam_role.kendra.arn
  edition  = "DEVELOPER_EDITION"

  tags = var.tags
}

# Kendra IAM Role
resource "aws_iam_role" "kendra" {
  name = "${var.project_name}-${var.environment}-kendra-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "kendra.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "kendra" {
  role       = aws_iam_role.kendra.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
}

# ECS Cluster for Container Apps
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-${var.environment}-cluster"

  capacity_providers = ["FARGATE"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight           = 1
  }

  tags = var.tags
}

# ECR Repository
resource "aws_ecr_repository" "data_ingestion" {
  name                 = "${var.project_name}/data-ingestion"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

resource "aws_ecr_repository" "anomaly_detection" {
  name                 = "${var.project_name}/anomaly-detection"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

resource "aws_ecr_repository" "rag_system" {
  name                 = "${var.project_name}/rag-system"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = var.tags
}

# AWS Amplify for Dashboard
resource "aws_amplify_app" "dashboard" {
  name       = "${var.project_name}-${var.environment}-dashboard"
  repository = "https://github.com/your-org/realtime-monitoring"

  build_spec = <<-EOT
    version: 1
    frontend:
      phases:
        preBuild:
          commands:
            - cd dashboard
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: dashboard/.next
        files:
          - '**/*'
      cache:
        paths:
          - dashboard/node_modules/**/*
  EOT

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  tags = var.tags
}

resource "aws_amplify_branch" "main" {
  app_id      = aws_amplify_app.dashboard.id
  branch_name = "main"

  framework = "Next.js - SSG"
  stage     = "PRODUCTION"

  environment_variables = {
    NODE_ENV = var.environment
  }

  tags = var.tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/ecs/${var.project_name}-${var.environment}"
  retention_in_days = 14

  tags = var.tags
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "s3_bucket_name" {
  value = aws_s3_bucket.data_lake.bucket
}

output "rds_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "dynamodb_anomaly_table" {
  value = aws_dynamodb_table.anomaly.name
}

output "dynamodb_knowledge_table" {
  value = aws_dynamodb_table.knowledge.name
}

output "msk_bootstrap_servers" {
  value = aws_msk_cluster.main.bootstrap_brokers
}

output "sagemaker_notebook_name" {
  value = aws_sagemaker_notebook_instance.main.name
}

output "kendra_index_id" {
  value = aws_kendra_index.main.id
}

output "ecr_data_ingestion_url" {
  value = aws_ecr_repository.data_ingestion.repository_url
}

output "amplify_app_url" {
  value = "https://${aws_amplify_branch.main.branch_name}.${aws_amplify_app.dashboard.default_domain}"
} 