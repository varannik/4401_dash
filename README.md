# Real-Time Monitoring Dashboard - Multi-Cloud Architecture

## Overview
This repository contains a comprehensive real-time monitoring dashboard system designed to work across both Azure and AWS ecosystems. The system implements an event-driven architecture with Kafka for data streaming and Next.js for the centralized dashboard.

## Architecture Overview

### Data Flow
1. **Data Ingestion Layer** → Staging DB
   - Real-time data from IoT Hub
   - Batch data from APIs/CSV files
2. **Centralized Monitoring Dashboard** → Data visualization
3. **Missing Value Detection** → Anomaly DB
4. **Clean Data Processing** → Next Staging DB
5. **Anomaly Detection** (2-step process)
   - Heuristic Rules
   - Machine Learning Techniques
6. **RAG Error Reporting System** → Knowledge Base + LLM
7. **Expert Review & Correction** → Final DB

## Technology Stack

### Core Technologies
- **Event Streaming**: Apache Kafka
- **Frontend**: Next.js 14 with TypeScript
- **Data Processing**: Python (Apache Spark)
- **Machine Learning**: Python (scikit-learn, TensorFlow)
- **RAG System**: LangChain + OpenAI/Azure OpenAI

### Azure Native Tools
- **Azure IoT Hub**: Real-time data ingestion
- **Azure Event Hubs**: Kafka-compatible streaming
- **Azure Data Factory**: Batch data processing
- **Azure SQL Database**: Staging and final databases
- **Azure Cosmos DB**: Anomaly and knowledge base
- **Azure Machine Learning**: ML-based anomaly detection
- **Azure Cognitive Search**: RAG knowledge base
- **Azure OpenAI**: LLM for error reporting
- **Azure App Service**: Next.js dashboard hosting

### AWS Native Tools
- **AWS IoT Core**: Real-time data ingestion
- **Amazon MSK (Managed Kafka)**: Event streaming
- **AWS Glue**: Batch data processing
- **Amazon RDS**: Staging and final databases
- **Amazon DynamoDB**: Anomaly and knowledge base
- **Amazon SageMaker**: ML-based anomaly detection
- **Amazon Kendra**: RAG knowledge base
- **Amazon Bedrock**: LLM for error reporting
- **AWS Amplify**: Next.js dashboard hosting

## Project Structure
```
├── dashboard/                 # Next.js monitoring dashboard
├── data-ingestion/           # Data ingestion services
├── data-processing/          # Data processing pipelines
├── anomaly-detection/        # Anomaly detection services
├── rag-system/              # RAG error reporting system
├── infrastructure/          # Cloud infrastructure (Terraform)
├── kafka-config/           # Kafka configuration
├── docs/                   # Documentation
└── scripts/               # Deployment and utility scripts
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker
- Terraform
- Azure CLI / AWS CLI

### Installation
```bash
# Clone and setup
git clone <repository-url>
cd realtime-monitoring

# Install dependencies
npm install
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Configure your cloud credentials and endpoints

# Start local development
docker-compose up -d
npm run dev
```

## Deployment

### Azure Deployment
```bash
cd infrastructure/azure
terraform init
terraform plan
terraform apply
```

### AWS Deployment
```bash
cd infrastructure/aws
terraform init
terraform plan
terraform apply
```

## Best Practices Implemented

1. **Event-Driven Architecture**: Loose coupling between components
2. **Microservices Pattern**: Independent, scalable services
3. **Data Lake Architecture**: Staged data processing
4. **Real-time Processing**: Stream processing with Kafka
5. **MLOps**: Automated ML pipeline deployment
6. **Observability**: Comprehensive logging and monitoring
7. **Security**: IAM, encryption, and network security
8. **Cost Optimization**: Auto-scaling and resource optimization

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License
This project is licensed under the MIT License - see [LICENSE](LICENSE) file. 