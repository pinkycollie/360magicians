/**
 * Fallback Visual Renderer
 * Provides icon and motion-based visuals for low-bandwidth scenarios
 */

import { AgentState, StateEvent } from '../engine/stateMachine';

export class FallbackVisual {
  private container: HTMLElement;
  private currentState: AgentState = 'idle';

  constructor(container: HTMLElement) {
    this.container = container;
    this.initialize();
  }

  private initialize(): void {
    this.container.classList.add('fallback-visual');
    this.render();
  }

  /**
   * Update visual based on state event
   */
  updateState(event: StateEvent): void {
    this.currentState = event.state;
    this.render();
    this.animateIcon(event);
  }

  /**
   * Render the fallback visual
   */
  private render(): void {
    const icon = this.getStateIcon(this.currentState);
    const color = this.getStateColor(this.currentState);
    const label = this.getStateLabel(this.currentState);

    this.container.innerHTML = `
      <div class="fallback-container" data-state="${this.currentState}">
        <div class="state-icon" style="color: ${color}">
          ${icon}
        </div>
        <div class="state-text">
          <div class="state-title">${label}</div>
          <div class="state-description">${this.getStateDescription(this.currentState)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Animate the icon
   */
  private animateIcon(event: StateEvent): void {
    const iconElement = this.container.querySelector('.state-icon') as HTMLElement;
    if (!iconElement) return;

    // Remove existing animation classes
    iconElement.classList.remove('pulse', 'spin', 'bounce', 'shake');

    // Add animation based on state
    const animation = this.getStateAnimation(this.currentState);
    if (animation) {
      iconElement.classList.add(animation);
    }

    // Show confidence if available
    if (event.confidence !== undefined) {
      this.showConfidence(event.confidence);
    }

    // Show context if available
    if (event.context) {
      this.showContext(event.context);
    }
  }

  /**
   * Show confidence indicator
   */
  private showConfidence(confidence: number): void {
    let confidenceBar = this.container.querySelector('.confidence-bar') as HTMLElement;
    
    if (!confidenceBar) {
      confidenceBar = document.createElement('div');
      confidenceBar.className = 'confidence-bar';
      const fallbackContainer = this.container.querySelector('.fallback-container');
      if (fallbackContainer && !fallbackContainer.contains(confidenceBar)) {
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

  /**
   * Show context information
   */
  private showContext(context: any): void {
    let contextBox = this.container.querySelector('.context-box') as HTMLElement;
    
    if (!contextBox) {
      contextBox = document.createElement('div');
      contextBox.className = 'context-box';
      const fallbackContainer = this.container.querySelector('.fallback-container');
      if (fallbackContainer && !fallbackContainer.contains(contextBox)) {
        fallbackContainer.appendChild(contextBox);
      }
    }

    const contextItems: string[] = [];
    
    if (context.action) {
      contextItems.push(`Action: ${context.action}`);
    }
    if (context.warning) {
      contextItems.push(`⚠️ ${context.warning}`);
    }
    if (context.error) {
      contextItems.push(`❌ ${context.error}`);
    }
    if (context.nextAction) {
      contextItems.push(`Next: ${context.nextAction}`);
    }

    contextBox.innerHTML = contextItems.join('<br>');
  }

  /**
   * Get icon for state
   */
  private getStateIcon(state: AgentState): string {
    const icons: Record<AgentState, string> = {
      idle: '⚪',
      listening: '👂',
      processing: '⚙️',
      validating: '✓',
      deciding: '🤔',
      executing: '▶️',
      completed: '✅',
      error: '❌',
      waiting_input: '❓'
    };

    return icons[state] || '⚪';
  }

  /**
   * Get color for state
   */
  private getStateColor(state: AgentState): string {
    const colors: Record<AgentState, string> = {
      idle: '#888888',
      listening: '#4CAF50',
      processing: '#2196F3',
      validating: '#FF9800',
      deciding: '#9C27B0',
      executing: '#00BCD4',
      completed: '#4CAF50',
      error: '#F44336',
      waiting_input: '#FFC107'
    };

    return colors[state] || '#888888';
  }

  /**
   * Get animation for state
   */
  private getStateAnimation(state: AgentState): string | null {
    const animations: Record<AgentState, string | null> = {
      idle: null,
      listening: 'pulse',
      processing: 'spin',
      validating: 'pulse',
      deciding: 'bounce',
      executing: 'spin',
      completed: 'bounce',
      error: 'shake',
      waiting_input: 'pulse'
    };

    return animations[state];
  }

  /**
   * Get label for state
   */
  private getStateLabel(state: AgentState): string {
    const labels: Record<AgentState, string> = {
      idle: 'Ready',
      listening: 'Listening',
      processing: 'Processing',
      validating: 'Validating',
      deciding: 'Deciding',
      executing: 'Executing',
      completed: 'Completed',
      error: 'Error',
      waiting_input: 'Needs Input'
    };

    return labels[state] || state;
  }

  /**
   * Get description for state
   */
  private getStateDescription(state: AgentState): string {
    const descriptions: Record<AgentState, string> = {
      idle: 'System is ready',
      listening: 'Receiving your input',
      processing: 'Analyzing information',
      validating: 'Checking data',
      deciding: 'Making a decision',
      executing: 'Performing action',
      completed: 'Task complete',
      error: 'Something went wrong',
      waiting_input: 'Waiting for your input'
    };

    return descriptions[state] || '';
  }

  /**
   * Destroy the fallback visual
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}
