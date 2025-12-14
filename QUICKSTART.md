# Quick Start Guide - 360 Magicians Agent Development Kit

## 🚀 Get Started in 5 Minutes

### Step 1: Open the Platform

#### Option A: Direct File Access
```bash
# Simply open the index.html file in your browser
open index.html
# or double-click the file
```

#### Option B: Local Web Server
```bash
# Using Python
python -m http.server 8080
# or Python 3
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then open: http://localhost:8080
```

### Step 2: Configure Your First Agent

1. **Navigate to "Agents" section** using the top navigation bar
2. **Click "+ Create New Agent"** button
3. **Fill in the form**:
   - Agent Name: "My First Agent"
   - Agent Type: Internal
   - Description: "A test agent for learning"
   - Capabilities: "data_processing, analysis"
   - Model Provider: OpenAI (or Ollama for local)
4. **Click "Save Agent"**

### Step 3: Configure LLM Provider

1. **Go to "Models" section**
2. **Choose your provider**:
   
   **For Cloud (OpenAI)**:
   ```
   API Key: sk-your-openai-key
   Models: ✓ GPT-4o
   ```
   
   **For Local (Ollama)**:
   ```
   Endpoint: http://localhost:11434
   Models: ✓ Llama 3
   ```
3. **Click "Test Connection"** to verify

### Step 4: View Dashboard

1. **Return to "Dashboard"** section
2. **View your system status**:
   - Active Agents count
   - Task Queue depth
   - Success Rate
   - API Calls

### Step 5: Generate Deployment Config

1. **Navigate to "Deployment"** section
2. **Click "Generate Config"** for Docker Compose or Kubernetes
3. **Click "Download"** to save the configuration
4. **Deploy** using your preferred method:

   ```bash
   # For Docker
   docker-compose up -d
   
   # For Kubernetes
   kubectl apply -f kubernetes-config.yml
   ```

## 📖 Key Features to Explore

### Agent Management
- **Browse Pre-configured Agents**: View 15+ ready-to-use agents
- **Create Custom Agents**: Build agents tailored to your needs
- **Toggle Status**: Activate/deactivate agents with one click

### Workflow Orchestration
- **Visual Builder**: Drag and drop agents to create workflows
- **Multi-step Processes**: Chain multiple agents together
- **Conditional Logic**: Route based on results

### Multi-Provider Support
- **OpenAI**: Industry-leading models
- **Anthropic**: Long context, safety-focused
- **Google**: Multimodal capabilities
- **Ollama**: Privacy-first local hosting

### Monitoring
- **Real-time Logs**: Watch agent activity live
- **Performance Metrics**: Track success rates and latency
- **Alert Management**: Get notified of issues

## 🔧 Common Use Cases

### Use Case 1: Customer Support Automation
1. Enable "Conversational AI Bot" agent
2. Configure for website integration
3. Set up fallback to human agents
4. Monitor performance in dashboard

### Use Case 2: Content Generation Pipeline
1. Enable "Content Generation Agent"
2. Create workflow: Topic → Draft → Review → Publish
3. Configure output channels (blog, social media)
4. Schedule regular content creation

### Use Case 3: Data Processing Pipeline
1. Enable "Data Processing Agent"
2. Configure input sources (CSV, JSON, API)
3. Set validation rules
4. Output to database or warehouse

## 🛠️ Ollama Setup for Local Development

### Install Ollama
```bash
# Linux/Mac
curl https://ollama.ai/install.sh | sh

# Verify installation
ollama --version
```

### Pull a Model
```bash
# Pull Llama 3
ollama pull llama3

# Or Mistral
ollama pull mistral

# Or CodeLlama for coding tasks
ollama pull codellama
```

### Start Ollama Server
```bash
# Start the server (runs on port 11434)
ollama serve
```

### Configure in Platform
1. Go to "Models" section
2. Enter endpoint: `http://localhost:11434`
3. Select your pulled models
4. Test connection

## 📊 Understanding the Dashboard

### Metrics Explained

**Active Agents**
- Shows currently running agents
- Click to view agent details

**Task Queue**
- Number of pending tasks
- Monitor for backlog

**Success Rate**
- Percentage of successful completions
- Based on last 24 hours

**API Calls**
- Total calls today
- Monitor for cost optimization

## 🔐 Security Best Practices

### API Keys
```bash
# Store in environment variables
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."

# Use .env file (never commit!)
echo "OPENAI_API_KEY=sk-..." > .env
```

### Access Control
- Use JWT tokens for API access
- Implement rate limiting
- Enable CORS only for trusted domains

### Data Privacy
- Redact PII in logs
- Use local models for sensitive data
- Encrypt data at rest and in transit

## 🎯 Next Steps

1. **Explore Pre-built Agents**: Browse the 15+ included agents
2. **Build Your First Workflow**: Chain agents together
3. **Deploy to Production**: Use Docker or Kubernetes
4. **Monitor Performance**: Track metrics and logs
5. **Scale Up**: Add more agents as needed

## 💡 Tips & Tricks

### Cost Optimization
- Use GPT-3.5 for simple tasks
- Cache repeated requests
- Use local models for development

### Performance
- Enable parallel processing
- Scale replicas in Kubernetes
- Use Redis for caching

### Development
- Start with Ollama locally
- Test workflows before deploying
- Use debug logging during development

## 📚 Additional Resources

- **Full Documentation**: See [README.md](README.md)
- **Agent Schema**: See [agents-schema.json](agents-schema.json)
- **Workflow Guide**: See [ai_agent-workflow.md](ai_agent-workflow.md)
- **Ollama Setup**: See [ai_ollama-setup.md](ai_ollama-setup.md)

## ❓ Troubleshooting

### "Agent not responding"
- Check agent status in dashboard
- Verify API keys in Models section
- Review logs for errors

### "Cannot connect to LLM provider"
- Test connection in Models section
- Check API key validity
- Verify network connectivity

### "Deployment fails"
- Validate generated configuration
- Check Docker/Kubernetes logs
- Verify resource availability

## 🤝 Getting Help

- **Check Logs**: Monitoring → Recent Logs
- **Review Documentation**: README.md
- **GitHub Issues**: Report bugs and request features

---

**Ready to build your AI agent system?** Open `index.html` and start creating! 🚀
