// Agent Management System
class AgentManager {
    constructor() {
        this.agents = [];
        this.workflows = [];
        this.config = {
            models: {},
            deployment: {},
            monitoring: {}
        };
        this.init();
    }

    init() {
        // Emit sign state: initializing
        if (window.signStateHelpers) {
            window.signStateHelpers.startProcessing('AgentManager', 0.9);
        }

        this.loadFromSchema();
        this.setupEventListeners();
        this.updateDashboard();

        // Complete initialization
        if (window.signStateHelpers) {
            setTimeout(() => {
                window.signStateHelpers.complete('AgentManager');
                setTimeout(() => {
                    window.signStateHelpers.idle('AgentManager');
                }, 500);
            }, 500);
        }
    }

    loadFromSchema() {
        // Load agents from the schema
        this.loadInternalAgents();
        this.loadExternalAgents();
        this.loadOperators();
    }

    loadInternalAgents() {
        const internalAgents = [
            {
                id: 'data_processor_001',
                name: 'Data Processing Agent',
                type: 'internal',
                status: 'active',
                description: 'Cleans, transforms, and validates data',
                capabilities: ['csv_parsing', 'data_validation', 'format_conversion', 'deduplication'],
                model: 'gpt-4o'
            },
            {
                id: 'content_gen_001',
                name: 'Content Generation Agent',
                type: 'internal',
                status: 'active',
                description: 'Generates marketing and communication content',
                capabilities: ['blog_posts', 'product_descriptions', 'email_campaigns', 'social_media'],
                model: 'claude-sonnet-4'
            },
            {
                id: 'code_assist_001',
                name: 'Code Assistant Agent',
                type: 'internal',
                status: 'active',
                description: 'Assists developers with code generation and debugging',
                capabilities: ['code_generation', 'code_review', 'debugging', 'refactoring', 'testing'],
                model: 'gpt-4o'
            },
            {
                id: 'analytics_001',
                name: 'Analytics Agent',
                type: 'internal',
                status: 'active',
                description: 'Analyzes data and generates insights',
                capabilities: ['data_analysis', 'reporting', 'ml_operations', 'forecasting'],
                model: 'gpt-4-turbo'
            },
            {
                id: 'support_auto_001',
                name: 'Support Automation Agent',
                type: 'internal',
                status: 'inactive',
                description: 'Automates customer support workflows',
                capabilities: ['ticket_management', 'knowledge_base', 'response_generation'],
                model: 'gpt-3.5-turbo'
            }
        ];

        this.agents.push(...internalAgents);
        this.renderAgents('internal', internalAgents);
    }

    loadExternalAgents() {
        const externalAgents = [
            {
                id: 'chatbot_001',
                name: 'Conversational AI Bot',
                type: 'external',
                status: 'active',
                description: 'Customer-facing chatbot for multiple channels',
                capabilities: ['natural_conversation', 'customer_support', 'sales_assistant', 'booking_assistant'],
                model: 'gpt-4o'
            },
            {
                id: 'voice_001',
                name: 'Voice AI Agent',
                type: 'external',
                status: 'inactive',
                description: 'Voice-based AI for phone interfaces',
                capabilities: ['speech_recognition', 'speech_synthesis', 'conversation_flow'],
                model: 'gpt-4o'
            },
            {
                id: 'email_001',
                name: 'Email AI Agent',
                type: 'external',
                status: 'active',
                description: 'Handles incoming emails intelligently',
                capabilities: ['email_classification', 'auto_response', 'smart_routing'],
                model: 'gpt-3.5-turbo'
            },
            {
                id: 'recommender_001',
                name: 'Recommendation Agent',
                type: 'external',
                status: 'active',
                description: 'Provides personalized recommendations',
                capabilities: ['product_recommendations', 'content_recommendations', 'personalization'],
                model: 'gemini-pro'
            }
        ];

        this.agents.push(...externalAgents);
        this.renderAgents('external', externalAgents);
    }

    loadOperators() {
        const operators = [
            {
                id: 'scraper_001',
                name: 'Web Scraping Operator',
                type: 'operator',
                status: 'active',
                description: 'Extracts data from websites',
                capabilities: ['static_scraping', 'dynamic_scraping', 'api_extraction'],
                model: 'llama3'
            },
            {
                id: 'doc_proc_001',
                name: 'Document Processing Operator',
                type: 'operator',
                status: 'active',
                description: 'Processes and extracts data from documents',
                capabilities: ['pdf_extraction', 'ocr', 'table_extraction', 'form_filling'],
                model: 'gpt-4-vision'
            },
            {
                id: 'test_auto_001',
                name: 'Testing Operator',
                type: 'operator',
                status: 'inactive',
                description: 'Automated testing agent',
                capabilities: ['unit_tests', 'integration_tests', 'e2e_tests', 'visual_testing'],
                model: 'codellama'
            },
            {
                id: 'deploy_001',
                name: 'Deployment Operator',
                type: 'operator',
                status: 'active',
                description: 'Automates deployment workflows',
                capabilities: ['build_automation', 'deployment_strategies', 'environment_management'],
                model: 'gpt-4o'
            }
        ];

        this.agents.push(...operators);
        this.renderAgents('operators', operators);
    }

    renderAgents(type, agents) {
        const container = document.getElementById(`${type}-agents-grid`) || document.getElementById(`${type}-grid`);
        if (!container) return;

        container.innerHTML = agents.map(agent => `
            <div class="agent-card" onclick="agentManager.editAgent('${agent.id}')">
                <span class="agent-status ${agent.status}">${agent.status.toUpperCase()}</span>
                <h3>${agent.name}</h3>
                <p class="agent-description">${agent.description}</p>
                <div class="agent-capabilities">
                    ${agent.capabilities.slice(0, 3).map(cap => 
                        `<span class="capability-tag">${cap}</span>`
                    ).join('')}
                </div>
            </div>
        `).join('');
    }

    editAgent(agentId) {
        const agent = this.agents.find(a => a.id === agentId);
        if (!agent) return;

        // Emit sign state: agent selected
        if (window.signStateHelpers) {
            window.signStateHelpers.startListening('AgentManager');
        }

        // Populate form
        document.getElementById('agent-name').value = agent.name;
        document.getElementById('agent-type').value = agent.type;
        document.getElementById('agent-description').value = agent.description;
        document.getElementById('agent-capabilities').value = agent.capabilities.join(', ');
        document.getElementById('agent-model').value = agent.model;
        
        showAgentForm();

        // Complete after form shown
        if (window.signStateHelpers) {
            setTimeout(() => {
                window.signStateHelpers.complete('AgentManager');
            }, 500);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.switchSection(section);
            });
        });

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(e.target, tab);
            });
        });

        // Agent Form
        const form = document.getElementById('agent-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAgent();
            });
        }

        // Search
        const searchInput = document.getElementById('agent-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchAgents(e.target.value);
            });
        }
    }

    switchSection(sectionId) {
        // Emit sign state: navigating
        if (window.signStateHelpers) {
            window.signStateHelpers.startProcessing('Navigation', 0.95);
        }

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('active');
            }
        });

        // Update content sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId)?.classList.add('active');

        // Complete navigation
        if (window.signStateHelpers) {
            setTimeout(() => {
                window.signStateHelpers.complete('Navigation');
            }, 300);
        }
    }

    switchTab(button, tabId) {
        // Update tab buttons
        const tabContainer = button.parentElement;
        tabContainer.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        // Update tab content
        const contentContainer = tabContainer.nextElementSibling;
        let current = contentContainer;
        while (current && !current.classList.contains('content-section')) {
            if (current.classList.contains('tab-content')) {
                current.classList.remove('active');
            }
            if (current.id === tabId) {
                current.classList.add('active');
            }
            current = current.nextElementSibling;
        }
    }

    saveAgent() {
        const agentData = {
            id: `agent_${Date.now()}`,
            name: document.getElementById('agent-name').value,
            type: document.getElementById('agent-type').value,
            status: 'inactive',
            description: document.getElementById('agent-description').value,
            capabilities: document.getElementById('agent-capabilities').value.split(',').map(c => c.trim()),
            model: document.getElementById('agent-model').value,
            concurrency: parseInt(document.getElementById('agent-concurrency').value)
        };

        this.agents.push(agentData);
        this.renderAgents(agentData.type, this.agents.filter(a => a.type === agentData.type));
        closeAgentForm();
        this.updateDashboard();
        
        // Show success message
        this.showNotification('Agent created successfully!', 'success');
    }

    searchAgents(query) {
        const lowerQuery = query.toLowerCase();
        const filtered = this.agents.filter(agent => 
            agent.name.toLowerCase().includes(lowerQuery) ||
            agent.description.toLowerCase().includes(lowerQuery) ||
            agent.capabilities.some(cap => cap.toLowerCase().includes(lowerQuery))
        );

        // Re-render filtered results
        ['internal', 'external', 'operators'].forEach(type => {
            const typeAgents = filtered.filter(a => a.type === type || (type === 'operators' && a.type === 'operator'));
            this.renderAgents(type, typeAgents);
        });
    }

    updateDashboard() {
        const activeCount = this.agents.filter(a => a.status === 'active').length;
        document.getElementById('active-agents-count').textContent = activeCount;
        
        // Simulate other metrics
        document.getElementById('task-queue-count').textContent = Math.floor(Math.random() * 50);
        document.getElementById('api-calls').textContent = Math.floor(Math.random() * 10000);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: var(--success-color);
            color: white;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global Functions
function showAgentForm() {
    document.getElementById('agent-modal').classList.add('active');
}

function closeAgentForm() {
    document.getElementById('agent-modal').classList.remove('active');
    document.getElementById('agent-form').reset();
}

function createWorkflow() {
    alert('Workflow creation interface will open here. This is a placeholder for the full implementation.');
}

function saveWorkflow() {
    agentManager.showNotification('Workflow saved successfully!', 'success');
}

function validateWorkflow() {
    agentManager.showNotification('Workflow validated successfully!', 'success');
}

function deployWorkflow() {
    agentManager.showNotification('Workflow deployed successfully!', 'success');
}

function addModelProvider() {
    alert('Add custom model provider dialog will open here.');
}

function testConnection(provider) {
    agentManager.showNotification(`Testing connection to ${provider}...`, 'info');
    setTimeout(() => {
        agentManager.showNotification(`Connected to ${provider} successfully!`, 'success');
    }, 1500);
}

function generateDockerCompose() {
    const agents = agentManager.agents.filter(a => a.status === 'active');
    let config = `version: '3.8'\n\nservices:\n`;
    
    config += `  orchestrator:\n`;
    config += `    image: 360magicians/orchestrator:latest\n`;
    config += `    environment:\n`;
    config += `      - REDIS_URL=redis://redis:6379\n`;
    config += `      - DATABASE_URL=postgresql://postgres:5432/agents\n`;
    config += `    ports:\n`;
    config += `      - "8000:8000"\n\n`;

    agents.forEach(agent => {
        config += `  ${agent.id}:\n`;
        config += `    image: 360magicians/${agent.id}:latest\n`;
        config += `    environment:\n`;
        config += `      - AGENT_ID=${agent.id}\n`;
        config += `      - MODEL=${agent.model}\n`;
        config += `    depends_on:\n`;
        config += `      - orchestrator\n\n`;
    });

    config += `  redis:\n`;
    config += `    image: redis:alpine\n`;
    config += `    ports:\n`;
    config += `      - "6379:6379"\n\n`;

    config += `  postgres:\n`;
    config += `    image: postgres:15\n`;
    config += `    environment:\n`;
    config += `      - POSTGRES_DB=agents\n`;
    config += `      - POSTGRES_PASSWORD=changeme\n`;

    document.getElementById('docker-compose-config').value = config;
    agentManager.showNotification('Docker Compose configuration generated!', 'success');
}

function generateK8sConfig() {
    const agents = agentManager.agents.filter(a => a.status === 'active');
    let config = `apiVersion: v1\nkind: Namespace\nmetadata:\n  name: agent-system\n---\n\n`;
    
    agents.forEach(agent => {
        config += `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n`;
        config += `  name: ${agent.id}\n  namespace: agent-system\n`;
        config += `spec:\n  replicas: 2\n  selector:\n    matchLabels:\n`;
        config += `      app: ${agent.id}\n  template:\n    metadata:\n`;
        config += `      labels:\n        app: ${agent.id}\n    spec:\n`;
        config += `      containers:\n      - name: ${agent.id}\n`;
        config += `        image: 360magicians/${agent.id}:latest\n`;
        config += `        ports:\n        - containerPort: 8000\n`;
        config += `        env:\n        - name: AGENT_ID\n          value: "${agent.id}"\n`;
        config += `        - name: MODEL\n          value: "${agent.model}"\n---\n\n`;
    });

    document.getElementById('k8s-config').value = config;
    agentManager.showNotification('Kubernetes configuration generated!', 'success');
}

function saveEnvConfig() {
    agentManager.showNotification('Environment configuration saved!', 'success');
}

function downloadConfig(type) {
    let content, filename;
    
    switch(type) {
        case 'docker-compose':
            content = document.getElementById('docker-compose-config').value;
            filename = 'docker-compose.yml';
            break;
        case 'k8s':
            content = document.getElementById('k8s-config').value;
            filename = 'kubernetes-config.yml';
            break;
        case 'env':
            content = document.getElementById('env-vars').value;
            filename = '.env';
            break;
        default:
            return;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    
    agentManager.showNotification(`Downloaded ${filename}!`, 'success');
}

function refreshLogs() {
    const logOutput = document.getElementById('log-output');
    const timestamp = new Date().toISOString().split('T').join(' ').split('.')[0];
    const newLog = document.createElement('div');
    newLog.className = 'log-entry log-info';
    newLog.textContent = `[${timestamp}] INFO: Logs refreshed`;
    logOutput.appendChild(newLog);
    logOutput.scrollTop = logOutput.scrollHeight;
}

function clearLogs() {
    document.getElementById('log-output').innerHTML = '';
    agentManager.showNotification('Logs cleared!', 'success');
}

// Initialize the Agent Manager
let agentManager;
document.addEventListener('DOMContentLoaded', () => {
    agentManager = new AgentManager();
    
    // Simulate real-time updates
    setInterval(() => {
        const logOutput = document.getElementById('log-output');
        const logs = [
            { level: 'info', message: 'Agent task completed' },
            { level: 'success', message: 'Workflow executed successfully' },
            { level: 'info', message: 'Processing queue item' },
            { level: 'info', message: 'API call completed' }
        ];
        
        const randomLog = logs[Math.floor(Math.random() * logs.length)];
        const timestamp = new Date().toISOString().split('T').join(' ').split('.')[0];
        const newLog = document.createElement('div');
        newLog.className = `log-entry log-${randomLog.level}`;
        newLog.textContent = `[${timestamp}] ${randomLog.level.toUpperCase()}: ${randomLog.message}`;
        logOutput.appendChild(newLog);
        
        // Keep only last 50 logs
        while (logOutput.children.length > 50) {
            logOutput.removeChild(logOutput.firstChild);
        }
        
        logOutput.scrollTop = logOutput.scrollHeight;
    }, 5000);

    // Update metrics
    setInterval(() => {
        agentManager.updateDashboard();
    }, 10000);
});

// Export configuration
function exportConfiguration() {
    const config = {
        agents: agentManager.agents,
        workflows: agentManager.workflows,
        models: agentManager.config.models,
        timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-config.json';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Import configuration
function importConfiguration(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const config = JSON.parse(e.target.result);
            agentManager.agents = config.agents || [];
            agentManager.workflows = config.workflows || [];
            agentManager.config.models = config.models || {};
            agentManager.loadFromSchema();
            agentManager.showNotification('Configuration imported successfully!', 'success');
        } catch (error) {
            agentManager.showNotification('Error importing configuration!', 'error');
        }
    };
    reader.readAsText(file);
}
