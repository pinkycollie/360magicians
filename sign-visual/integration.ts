/**
 * Sign Visual Integration
 * Integrates sign language visualization into the existing agent system
 */

import { SignerPanel } from './sign-visual/components/SignerPanel.tsx';
import { signStateHelpers } from './sign-visual/hooks/useSignState';
import { realtimeProvider } from './sign-visual/providers/realtime';

/**
 * Initialize sign visual system
 */
export function initializeSignVisual() {
  // Create container for sign panel
  const container = document.createElement('div');
  container.id = 'sign-panel-container';
  document.body.appendChild(container);

  // Create sign panel
  const signerPanel = new SignerPanel(container, {
    position: 'right',
    size: 'medium',
    resizable: true,
    draggable: true,
    useFallback: false,
    speed: 1.0
  });

  // Subscribe to state changes and update panel
  realtimeProvider.onStateChange((event) => {
    signerPanel.updateState(event);
  });

  return signerPanel;
}

/**
 * Wrap agent operations with sign state emissions
 */
export function wrapAgentWithSignState(agentClass) {
  return class SignEnabledAgent extends agentClass {
    constructor(...args) {
      super(...args);
      this.agentName = this.name || this.id || 'Agent';
    }

    // Override execute to emit states
    async execute(task) {
      try {
        // Start listening
        signStateHelpers.startListening(this.agentName);

        // Start processing
        signStateHelpers.startProcessing(this.agentName, 0.8);

        // Call original execute
        const result = await super.execute(task);

        // Complete
        signStateHelpers.complete(this.agentName);

        return result;
      } catch (error) {
        // Error
        signStateHelpers.error(this.agentName, error.message);
        throw error;
      }
    }

    // Override validate to emit validating state
    async validate(data) {
      signStateHelpers.startValidating(this.agentName, 0.85);
      
      try {
        const result = await super.validate(data);
        return result;
      } catch (error) {
        signStateHelpers.error(this.agentName, `Validation failed: ${error.message}`);
        throw error;
      }
    }

    // Add method to emit custom states
    emitState(state, options = {}) {
      realtimeProvider.emitStateChange({
        actor: this.agentName,
        state: state,
        confidence: options.confidence,
        requiresUser: options.requiresUser || false,
        context: options.context || {}
      });
    }
  };
}

/**
 * Integration helper for existing AgentManager
 */
export function integrateWithAgentManager(agentManager) {
  // Store original methods
  const originalExecuteAgent = agentManager.executeAgent;
  const originalCreateAgent = agentManager.createAgent;

  // Wrap executeAgent
  agentManager.executeAgent = function(agentId, task) {
    const agent = this.getAgent(agentId);
    const agentName = agent?.name || agentId;

    // Emit listening state
    signStateHelpers.startListening(agentName);

    // Call original method
    const result = originalExecuteAgent.call(this, agentId, task);

    // Handle promise or direct result
    if (result && typeof result.then === 'function') {
      return result
        .then((res) => {
          signStateHelpers.complete(agentName);
          return res;
        })
        .catch((err) => {
          signStateHelpers.error(agentName, err.message);
          throw err;
        });
    }

    return result;
  };

  // Wrap createAgent to add sign state support
  agentManager.createAgent = function(config) {
    const agent = originalCreateAgent.call(this, config);
    
    // Add sign state emission methods to agent
    agent.emitSignState = function(state, options = {}) {
      realtimeProvider.emitStateChange({
        actor: this.name || this.id,
        state: state,
        confidence: options.confidence,
        requiresUser: options.requiresUser || false,
        context: options.context || {}
      });
    };

    return agent;
  };

  return agentManager;
}

/**
 * Example usage for existing app.js
 */
export function setupSignVisualForExistingApp() {
  // Initialize sign visual system
  const signerPanel = initializeSignVisual();

  // Get existing agent manager
  const agentManager = window.agentManager;
  
  if (agentManager) {
    // Integrate with existing agent manager
    integrateWithAgentManager(agentManager);
    
    console.log('[SignVisual] Integrated with existing agent system');
  } else {
    console.warn('[SignVisual] AgentManager not found. Make sure to integrate manually.');
  }

  return signerPanel;
}

/**
 * Manual state emission for custom integrations
 */
export const signEmit = {
  listening: (actor) => signStateHelpers.startListening(actor),
  processing: (actor, confidence) => signStateHelpers.startProcessing(actor, confidence),
  validating: (actor, confidence) => signStateHelpers.startValidating(actor, confidence),
  deciding: (actor, confidence) => signStateHelpers.startDeciding(actor, confidence),
  executing: (actor, action) => signStateHelpers.startExecuting(actor, action),
  complete: (actor) => signStateHelpers.complete(actor),
  error: (actor, message) => signStateHelpers.error(actor, message),
  waitForInput: (actor, nextAction) => signStateHelpers.waitForInput(actor, nextAction),
  idle: (actor) => signStateHelpers.idle(actor)
};

// Export for global access
if (typeof window !== 'undefined') {
  window.SignVisual = {
    initialize: initializeSignVisual,
    setup: setupSignVisualForExistingApp,
    emit: signEmit,
    helpers: signStateHelpers,
    provider: realtimeProvider
  };
}
