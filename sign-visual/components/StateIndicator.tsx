/**
 * StateIndicator Component
 * Visual indicator for system state
 */

import { AgentState } from '../engine/stateMachine';

export interface StateIndicatorProps {
  state: AgentState;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export class StateIndicator {
  private container: HTMLElement;
  private currentState: AgentState;
  private config: Required<StateIndicatorProps>;

  constructor(container: HTMLElement, props: StateIndicatorProps) {
    this.container = container;
    this.currentState = props.state;
    this.config = {
      state: props.state,
      size: props.size || 'medium',
      showLabel: props.showLabel !== false
    };
    this.initialize();
  }

  private initialize(): void {
    this.container.classList.add('state-indicator');
    this.container.classList.add(`size-${this.config.size}`);
    this.render();
  }

  /**
   * Update indicator state
   */
  updateState(state: AgentState): void {
    this.currentState = state;
    this.render();
  }

  /**
   * Render the state indicator
   */
  private render(): void {
    const stateInfo = this.getStateInfo(this.currentState);
    
    this.container.innerHTML = `
      <div class="indicator-wrapper" data-state="${this.currentState}">
        <div class="indicator-icon" style="background-color: ${stateInfo.color}">
          <span class="icon-symbol">${stateInfo.symbol}</span>
        </div>
        ${this.config.showLabel ? `
          <div class="indicator-label">
            <div class="label-text">${stateInfo.label}</div>
            <div class="label-description">${stateInfo.description}</div>
          </div>
        ` : ''}
      </div>
    `;

    // Add pulsing animation for active states
    if (this.isActiveState(this.currentState)) {
      const icon = this.container.querySelector('.indicator-icon');
      icon?.classList.add('pulsing');
    }
  }

  /**
   * Get state information
   */
  private getStateInfo(state: AgentState): {
    color: string;
    symbol: string;
    label: string;
    description: string;
  } {
    const stateMap = {
      idle: {
        color: '#9E9E9E',
        symbol: '○',
        label: 'Idle',
        description: 'Ready to start'
      },
      listening: {
        color: '#4CAF50',
        symbol: '👂',
        label: 'Listening',
        description: 'Receiving input'
      },
      processing: {
        color: '#2196F3',
        symbol: '⚙',
        label: 'Processing',
        description: 'Analyzing data'
      },
      validating: {
        color: '#FF9800',
        symbol: '✓',
        label: 'Validating',
        description: 'Checking information'
      },
      deciding: {
        color: '#9C27B0',
        symbol: '?',
        label: 'Deciding',
        description: 'Making decision'
      },
      executing: {
        color: '#00BCD4',
        symbol: '▶',
        label: 'Executing',
        description: 'Performing action'
      },
      completed: {
        color: '#4CAF50',
        symbol: '✓',
        label: 'Completed',
        description: 'Task finished'
      },
      error: {
        color: '#F44336',
        symbol: '!',
        label: 'Error',
        description: 'Something went wrong'
      },
      waiting_input: {
        color: '#FFC107',
        symbol: '?',
        label: 'Waiting',
        description: 'Needs your input'
      }
    };

    return stateMap[state] || stateMap.idle;
  }

  /**
   * Check if state is active
   */
  private isActiveState(state: AgentState): boolean {
    const activeStates: AgentState[] = [
      'listening', 'processing', 'validating', 'deciding', 'executing'
    ];
    return activeStates.includes(state);
  }

  /**
   * Set size
   */
  setSize(size: 'small' | 'medium' | 'large'): void {
    this.container.classList.remove(`size-${this.config.size}`);
    this.config.size = size;
    this.container.classList.add(`size-${this.config.size}`);
  }

  /**
   * Destroy the indicator
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}
