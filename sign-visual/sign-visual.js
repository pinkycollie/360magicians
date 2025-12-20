/**
 * Sign Visual System - Browser Integration
 * Pure JavaScript version for browser compatibility
 */

(function() {
  'use strict';

  // State Machine
  class SignStateMachine {
    constructor() {
      this.currentState = 'idle';
      this.stateHistory = [];
      this.listeners = new Map();
      this.initializeStates();
    }

    initializeStates() {
      const states = ['idle', 'listening', 'processing', 'validating', 'deciding', 'executing', 'completed', 'error', 'waiting_input'];
      states.forEach(state => this.listeners.set(state, []));
      this.listeners.set('*', []);
    }

    emit(event) {
      const fullEvent = {
        ...event,
        timestamp: Date.now()
      };

      this.currentState = event.state;
      this.stateHistory.push(fullEvent);

      if (this.stateHistory.length > 100) {
        this.stateHistory = this.stateHistory.slice(-100);
      }

      const stateListeners = this.listeners.get(event.state) || [];
      stateListeners.forEach(callback => callback(fullEvent));

      const wildcardListeners = this.listeners.get('*') || [];
      wildcardListeners.forEach(callback => callback(fullEvent));
    }

    on(state, callback) {
      if (!this.listeners.has(state)) {
        this.listeners.set(state, []);
      }
      
      const listeners = this.listeners.get(state);
      if (!listeners.includes(callback)) {
        listeners.push(callback);
        this.listeners.set(state, listeners);
      }

      return () => {
        const currentListeners = this.listeners.get(state) || [];
        const index = currentListeners.indexOf(callback);
        if (index > -1) {
          currentListeners.splice(index, 1);
          this.listeners.set(state, currentListeners);
        }
      };
    }

    getCurrentState() {
      return this.currentState;
    }

    getHistory(limit = 10) {
      return this.stateHistory.slice(-limit);
    }
  }

  // Global instance
  window.signStateMachine = new SignStateMachine();

  // Simple Sign Panel implementation
  class SimpleSignPanel {
    constructor(position = 'right') {
      this.position = position;
      this.currentState = 'idle';
      this.createPanel();
      this.setupListeners();
    }

    createPanel() {
      this.panel = document.createElement('div');
      this.panel.className = `signer-panel position-${this.position} size-medium`;
      this.panel.innerHTML = `
        <div class="panel-header">
          <div class="panel-title">Sign Language</div>
          <div class="panel-controls">
            <button class="control-btn minimize-btn" title="Minimize">−</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="renderer-container">
            <div class="fallback-visual">
              <div class="fallback-container" data-state="idle">
                <div class="state-icon" style="color: #888888">⚪</div>
                <div class="state-text">
                  <div class="state-title">Ready</div>
                  <div class="state-description">System is ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-footer">
          <div class="status-text">Ready</div>
        </div>
      `;

      document.body.appendChild(this.panel);

      // Minimize button
      const minimizeBtn = this.panel.querySelector('.minimize-btn');
      minimizeBtn.addEventListener('click', () => {
        this.panel.classList.toggle('minimized');
        minimizeBtn.textContent = this.panel.classList.contains('minimized') ? '+' : '−';
      });
    }

    setupListeners() {
      window.signStateMachine.on('*', (event) => {
        this.updateState(event);
      });
    }

    updateState(event) {
      this.currentState = event.state;
      const stateInfo = this.getStateInfo(event.state);
      
      const container = this.panel.querySelector('.fallback-container');
      const icon = this.panel.querySelector('.state-icon');
      const title = this.panel.querySelector('.state-title');
      const description = this.panel.querySelector('.state-description');
      const statusText = this.panel.querySelector('.status-text');

      container.dataset.state = event.state;
      icon.textContent = stateInfo.icon;
      icon.style.color = stateInfo.color;
      title.textContent = stateInfo.label;
      description.textContent = stateInfo.description;

      // Remove existing animation
      icon.className = 'state-icon';
      
      // Add new animation
      if (stateInfo.animation) {
        icon.classList.add(stateInfo.animation);
      }

      // Update status text
      let status = event.actor;
      if (event.context && event.context.action) {
        status += `: ${event.context.action}`;
      }
      if (event.confidence !== undefined) {
        status += ` (${Math.round(event.confidence * 100)}%)`;
      }
      statusText.textContent = status;

      // Show confidence if available
      if (event.confidence !== undefined) {
        this.showConfidence(event.confidence);
      }
    }

    showConfidence(confidence) {
      let confidenceBar = this.panel.querySelector('.confidence-bar');
      
      if (!confidenceBar) {
        confidenceBar = document.createElement('div');
        confidenceBar.className = 'confidence-bar';
        const fallbackContainer = this.panel.querySelector('.fallback-container');
        if (fallbackContainer) {
          fallbackContainer.appendChild(confidenceBar);
        }
      }

      const percentage = Math.round(confidence * 100);
      confidenceBar.innerHTML = `
        <div class="confidence-label">Confidence</div>
        <div class="confidence-fill" style="width: ${percentage}%"></div>
        <div class="confidence-value">${percentage}%</div>
      `;
    }

    getStateInfo(state) {
      const stateMap = {
        idle: { icon: '⚪', color: '#888888', label: 'Ready', description: 'System is ready', animation: null },
        listening: { icon: '👂', color: '#4CAF50', label: 'Listening', description: 'Receiving your input', animation: 'pulse' },
        processing: { icon: '⚙️', color: '#2196F3', label: 'Processing', description: 'Analyzing information', animation: 'spin' },
        validating: { icon: '✓', color: '#FF9800', label: 'Validating', description: 'Checking data', animation: 'pulse' },
        deciding: { icon: '🤔', color: '#9C27B0', label: 'Deciding', description: 'Making a decision', animation: 'bounce' },
        executing: { icon: '▶️', color: '#00BCD4', label: 'Executing', description: 'Performing action', animation: 'spin' },
        completed: { icon: '✅', color: '#4CAF50', label: 'Completed', description: 'Task complete', animation: 'bounce' },
        error: { icon: '❌', color: '#F44336', label: 'Error', description: 'Something went wrong', animation: 'shake' },
        waiting_input: { icon: '❓', color: '#FFC107', label: 'Needs Input', description: 'Waiting for your input', animation: 'pulse' }
      };

      return stateMap[state] || stateMap.idle;
    }
  }

  // Helper functions
  window.signStateHelpers = {
    startListening: function(actor) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'listening',
        requiresUser: false,
        context: { action: 'Receiving input' }
      });
    },

    startProcessing: function(actor, confidence) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'processing',
        confidence: confidence,
        requiresUser: false,
        context: { action: 'Analyzing data' }
      });
    },

    startValidating: function(actor, confidence) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'validating',
        confidence: confidence,
        requiresUser: false,
        context: { action: 'Validating information' }
      });
    },

    startDeciding: function(actor, confidence) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'deciding',
        confidence: confidence,
        requiresUser: false,
        context: { action: 'Making decision' }
      });
    },

    startExecuting: function(actor, action) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'executing',
        requiresUser: false,
        context: { action: action || 'Executing action' }
      });
    },

    complete: function(actor) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'completed',
        requiresUser: false,
        context: { action: 'Task completed' }
      });
    },

    error: function(actor, errorMessage) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'error',
        requiresUser: false,
        context: { error: errorMessage }
      });
    },

    waitForInput: function(actor, nextAction) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'waiting_input',
        requiresUser: true,
        context: { nextAction: nextAction || 'Waiting for user input' }
      });
    },

    idle: function(actor) {
      window.signStateMachine.emit({
        actor: actor,
        state: 'idle',
        requiresUser: false
      });
    }
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.signPanel = new SimpleSignPanel('right');
      console.log('[SignVisual] System initialized');
    });
  } else {
    window.signPanel = new SimpleSignPanel('right');
    console.log('[SignVisual] System initialized');
  }

})();
