/**
 * Signer Avatar Renderer
 * Renders the sign language avatar based on current state
 */

import { AgentState, StateEvent } from '../engine/stateMachine';

export interface SignerConfig {
  size: 'small' | 'medium' | 'large';
  speed: number; // 0.5 to 2.0
  enableReplay: boolean;
  asyncMode: boolean;
}

export class SignerAvatar {
  private container: HTMLElement;
  private config: SignerConfig;
  private currentState: AgentState = 'idle';
  private animationFrame: number | null = null;

  constructor(container: HTMLElement, config: Partial<SignerConfig> = {}) {
    this.container = container;
    this.config = {
      size: config.size || 'medium',
      speed: config.speed || 1.0,
      enableReplay: config.enableReplay !== false,
      asyncMode: config.asyncMode !== false
    };
    this.initialize();
  }

  private initialize(): void {
    this.container.classList.add('signer-avatar');
    this.container.classList.add(`size-${this.config.size}`);
    this.render();
  }

  /**
   * Update avatar based on state event
   */
  updateState(event: StateEvent): void {
    this.currentState = event.state;
    this.render();
    this.animate(event);
  }

  /**
   * Render the avatar visual
   */
  private render(): void {
    const stateConfig = this.getStateConfig(this.currentState);
    
    this.container.innerHTML = `
      <div class="avatar-container" data-state="${this.currentState}">
        <div class="avatar-figure">
          <div class="avatar-head">
            <div class="facial-expression ${stateConfig.facialExpression}"></div>
          </div>
          <div class="avatar-body">
            <div class="hand left ${stateConfig.handPosition}"></div>
            <div class="hand right ${stateConfig.handPosition}"></div>
          </div>
        </div>
        <div class="state-label">${this.getStateLabel(this.currentState)}</div>
      </div>
    `;
  }

  /**
   * Animate the avatar for current state
   */
  private animate(event: StateEvent): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const stateConfig = this.getStateConfig(this.currentState);
    const figure = this.container.querySelector('.avatar-figure') as HTMLElement;
    
    if (!figure) return;

    // Add animation class
    figure.classList.add(`animation-${stateConfig.movement}`);
    
    // Add confidence indicator if present
    if (event.confidence !== undefined) {
      this.updateConfidenceIndicator(event.confidence);
    }

    // Apply speed modifier
    figure.style.animationDuration = `${1 / this.config.speed}s`;
  }

  /**
   * Update confidence indicator
   */
  private updateConfidenceIndicator(confidence: number): void {
    let indicator = this.container.querySelector('.confidence-indicator') as HTMLElement;
    
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'confidence-indicator';
      this.container.appendChild(indicator);
    }

    const level = confidence >= 0.8 ? 'high' : confidence >= 0.5 ? 'medium' : 'low';
    indicator.className = `confidence-indicator confidence-${level}`;
    indicator.textContent = `${Math.round(confidence * 100)}%`;
  }

  /**
   * Get state configuration
   */
  private getStateConfig(state: AgentState): any {
    const configs = {
      idle: {
        facialExpression: 'attentive',
        handPosition: 'resting',
        movement: 'minimal'
      },
      listening: {
        facialExpression: 'focused',
        handPosition: 'open',
        movement: 'tracking'
      },
      processing: {
        facialExpression: 'concentrated',
        handPosition: 'thinking',
        movement: 'rhythmic'
      },
      validating: {
        facialExpression: 'scrutinizing',
        handPosition: 'checking',
        movement: 'deliberate'
      },
      deciding: {
        facialExpression: 'contemplative',
        handPosition: 'comparing',
        movement: 'alternating'
      },
      executing: {
        facialExpression: 'determined',
        handPosition: 'doing',
        movement: 'purposeful'
      },
      completed: {
        facialExpression: 'satisfied',
        handPosition: 'completion',
        movement: 'confirmatory'
      },
      error: {
        facialExpression: 'concerned',
        handPosition: 'warning',
        movement: 'alert'
      },
      waiting_input: {
        facialExpression: 'questioning',
        handPosition: 'requesting',
        movement: 'inviting'
      }
    };

    return configs[state] || configs.idle;
  }

  /**
   * Get human-readable state label
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
   * Resize the avatar
   */
  resize(size: 'small' | 'medium' | 'large'): void {
    this.container.classList.remove(`size-${this.config.size}`);
    this.config.size = size;
    this.container.classList.add(`size-${this.config.size}`);
  }

  /**
   * Set animation speed
   */
  setSpeed(speed: number): void {
    this.config.speed = Math.max(0.5, Math.min(2.0, speed));
    const figure = this.container.querySelector('.avatar-figure') as HTMLElement;
    if (figure) {
      figure.style.animationDuration = `${1 / this.config.speed}s`;
    }
  }

  /**
   * Destroy the avatar instance
   */
  destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.container.innerHTML = '';
  }
}
