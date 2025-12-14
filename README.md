# 360 Magicians - Agent Development Kit (ADK)

## Overview

The 360 Magicians Agent Development Kit is a foundational platform for building, managing, and deploying AI agents in an **agnostic framework**. This HTML-based interface provides an intuitive way to configure agents, orchestrate workflows, and manage deployments across multiple LLM providers.

## Features

### 🤖 Agent Management
- **Internal Agents**: Automate internal business operations
  - Data Processing Agent
  - Content Generation Agent
  - Code Assistant Agent
  - Analytics Agent
  - Support Automation Agent
  - Workflow Automation Agent
  - Monitoring Agent
  - Security Agent

- **External Agents**: Customer-facing AI interactions
  - Conversational AI Bot
  - Voice AI Agent
  - Email AI Agent
  - Recommendation Agent
  - Social Media Agent

- **Specialized Operators**: Task-specific automation
  - Web Scraping Operator
  - Document Processing Operator
  - Testing Operator
  - Deployment Operator
  - Reporting Operator

### 🔌 Multi-Provider LLM Support
- **OpenAI**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic**: Claude Sonnet 4, Claude Opus 4
- **Google**: Gemini Pro, Gemini Ultra
- **Local Models (Ollama)**: Llama 3, Mistral, CodeLlama

### 🔄 Workflow Orchestration
- Visual workflow builder
- Multi-agent coordination
- Sequential and parallel execution
- Conditional routing
- Error handling and retry logic

### 🚀 Deployment Options
- **Docker Compose**: Local and development environments
- **Kubernetes**: Production-ready deployments
- Auto-generated configuration files
- Environment variable management

### 📊 Monitoring & Analytics
- Real-time agent performance metrics
- System health monitoring
- Log aggregation and viewing
- Alert management

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Docker/Kubernetes for deployment
- Optional: Ollama for local LLM hosting

### Quick Start

1. **Open the Platform**
   ```bash
   # Simply open index.html in your browser
   open index.html
   # or
   python -m http.server 8000
   # Then navigate to http://localhost:8000
   ```

2. **Configure LLM Providers**
   - Navigate to the "Models" section
   - Add your API keys for OpenAI, Anthropic, or Google
   - Configure local Ollama endpoint if using local models
   - Test connections to verify setup

3. **Create or Enable Agents**
   - Go to the "Agents" section
   - Browse pre-configured agents or create new ones
   - Click on any agent card to view/edit details
   - Toggle agent status (active/inactive)

4. **Build Workflows**
   - Navigate to "Orchestration"
   - Drag agents from the sidebar to the canvas
   - Define connections and dependencies
   - Configure properties for each step
   - Save and deploy your workflow

5. **Deploy Your System**
   - Go to "Deployment" section
   - Generate Docker Compose or Kubernetes configurations
   - Download generated files
   - Deploy using your preferred method

6. **Monitor Performance**
   - Check the "Monitoring" section
   - View real-time metrics and logs
   - Set up alerts for critical events

## Architecture

### Framework-Agnostic Design
This platform is designed to work with any LLM provider and deployment infrastructure:

```
┌─────────────────────────────────────┐
│     Agent Development Kit UI        │
│         (HTML Interface)            │
└─────────────────┬───────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌────▼─────┐  ┌───▼────┐
│ OpenAI │  │Anthropic │  │ Ollama │
└────────┘  └──────────┘  └────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐  ┌────▼─────┐  ┌───▼────┐
│ Docker │  │Kubernetes│  │  Cloud │
└────────┘  └──────────┘  └────────┘
```

### System Components

1. **Agent Registry**: Central catalog of all available agents
2. **Task Queue**: Redis/Bull for job distribution
3. **Message Bus**: RabbitMQ/Kafka for agent communication
4. **State Management**: Persistent agent memory and context
5. **Model Router**: Intelligent routing to optimal models

## Agent Types

### Internal Agents
These agents automate internal business operations and are not exposed to end users.

**Example: Data Processing Agent**
```javascript
{
  "agent_id": "data_processor_001",
  "capabilities": [
    "csv_parsing",
    "data_validation",
    "format_conversion",
    "deduplication"
  ],
  "model": "gpt-4o"
}
```

### External Agents
Customer-facing agents that interact directly with users.

**Example: Chatbot**
```javascript
{
  "agent_id": "chatbot_001",
  "channels": ["website", "mobile_app", "whatsapp"],
  "capabilities": [
    "customer_support",
    "sales_assistant",
    "booking_assistant"
  ],
  "model": "gpt-4o"
}
```

### Specialized Operators
Task-specific automation for particular operations.

**Example: Web Scraping Operator**
```javascript
{
  "operator_id": "scraper_001",
  "capabilities": [
    "static_scraping",
    "dynamic_scraping",
    "api_extraction"
  ],
  "model": "llama3"
}
```

## Configuration

### Environment Variables

Create a `.env` file with your configuration:

```bash
# LLM Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# Infrastructure
DATABASE_URL=postgresql://localhost:5432/agents
REDIS_URL=redis://localhost:6379

# Ollama (Local)
OLLAMA_ENDPOINT=http://localhost:11434

# Agent Configuration
AGENT_CONCURRENCY=10
LOG_LEVEL=INFO
```

### Docker Deployment

Generate and download the Docker Compose file from the platform, or use this template:

```yaml
version: '3.8'

services:
  orchestrator:
    image: 360magicians/orchestrator:latest
    environment:
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://postgres:5432/agents
    ports:
      - "8000:8000"

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=agents
      - POSTGRES_PASSWORD=changeme
```

Run with:
```bash
docker-compose up -d
```

### Kubernetes Deployment

Generate Kubernetes manifests from the platform or use kubectl:

```bash
kubectl apply -f kubernetes-config.yml
```

## API Integration

The platform generates configuration that works with a REST API:

### Agent Execution
```bash
POST /api/agents/{agent_id}/execute
Content-Type: application/json

{
  "task": "process_data",
  "input": {
    "file": "data.csv"
  }
}
```

### Workflow Execution
```bash
POST /api/workflows/{workflow_id}/execute
Content-Type: application/json

{
  "inputs": {
    "customer_id": "12345"
  }
}
```

## Security & Best Practices

### Security Considerations
1. **API Keys**: Never commit API keys to version control
2. **Authentication**: Use JWT or OAuth for API access
3. **Rate Limiting**: Implement rate limits on all endpoints
4. **Data Privacy**: Redact PII in logs and monitoring
5. **Encryption**: Use TLS 1.3 for all communications

### Best Practices
1. **Start Small**: Begin with 1-2 agents and scale up
2. **Test Locally**: Use Ollama for development and testing
3. **Monitor Costs**: Track API usage and optimize model selection
4. **Fallback Strategy**: Always configure fallback models
5. **Version Control**: Keep configuration in git (except secrets)

## Integrations

### Supported Integrations
- **Message Queues**: RabbitMQ, Redis, Kafka
- **Databases**: PostgreSQL, MySQL, MongoDB
- **Vector Stores**: Pinecone, Weaviate, Chroma
- **Auth Providers**: DeafAUTH, OAuth, JWT
- **Monitoring**: Prometheus, Grafana, ELK Stack

### Example: RAG Integration with Fibonrose

```javascript
{
  "agent_id": "rag_agent_001",
  "type": "internal",
  "vector_store": {
    "provider": "fibonrose",
    "endpoint": "http://fibonrose:8001",
    "embedding_model": "text-embedding-3-large"
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: Agent not responding
- Check agent status in the dashboard
- Verify LLM provider API keys
- Review logs for error messages

**Issue**: Deployment fails
- Validate Docker/Kubernetes configuration
- Check resource limits
- Verify network connectivity

**Issue**: High latency
- Switch to faster models (e.g., GPT-3.5 instead of GPT-4)
- Enable caching for repeated requests
- Scale up replicas in Kubernetes

## Contributing

This is an open platform designed for customization:

1. Fork the repository
2. Add new agent templates
3. Create custom workflows
4. Share your configurations

## Documentation

For more detailed documentation, see:
- [agents-schema.json](agents-schema.json) - Complete agent specification
- [ai_agent-workflow.md](ai_agent-workflow.md) - Workflow documentation
- [ai_ollama-setup.md](ai_ollama-setup.md) - Ollama setup guide

## Support

For issues and questions:
- GitHub Issues: https://github.com/360magicians/adk-docs
- Documentation: This README and associated files

## License

This platform is provided as-is for use in building AI agent systems.

## Roadmap

- [ ] Visual workflow builder with drag-and-drop
- [ ] Real-time agent performance charts
- [ ] Agent marketplace for sharing configurations
- [ ] Advanced monitoring and alerting
- [ ] Multi-tenancy support
- [ ] Custom agent templates
- [ ] Workflow version control
- [ ] A/B testing for agent configurations

## Version

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready
