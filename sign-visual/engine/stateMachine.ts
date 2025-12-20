/**
 * State Machine - Single source of truth for agent state
 * Manages system state transitions for sign language visualization
 */

export type AgentState = 
  | 'idle'
  | 'listening'
  | 'processing'
  | 'validating'
  | 'deciding'
  | 'executing'
  | 'completed'
  | 'error'
  | 'waiting_input';

export interface StateEvent {
  actor: string;
  state: AgentState;
  confidence?: number;
  requiresUser: boolean;
  context?: {
    action?: string;
    warning?: string;
    error?: string;
    nextAction?: string;
  };
  timestamp: number;
}

export class SignStateMachine {
  private currentState: AgentState = 'idle';
  private stateHistory: StateEvent[] = [];
  private listeners: Map<string, Array<(event: StateEvent) => void>> = new Map();

  constructor() {
    this.initializeStates();
  }

  private initializeStates(): void {
    // Initialize state listeners registry
    const states: AgentState[] = [
      'idle', 'listening', 'processing', 'validating', 
      'deciding', 'executing', 'completed', 'error', 'waiting_input'
    ];
    
    states.forEach(state => {
      this.listeners.set(state, []);
    });
    this.listeners.set('*', []); // Wildcard listeners
  }

  /**
   * Emit a state change event
   * Every agent action MUST emit a state event
   */
  emit(event: Omit<StateEvent, 'timestamp'>): void {
    const fullEvent: StateEvent = {
      ...event,
      timestamp: Date.now()
    };

    // Validate state transition
    if (!this.isValidTransition(this.currentState, event.state)) {
      console.warn(`Invalid state transition from ${this.currentState} to ${event.state}`);
    }

    this.currentState = event.state;
    this.stateHistory.push(fullEvent);

    // Trim history to last 100 events
    if (this.stateHistory.length > 100) {
      this.stateHistory = this.stateHistory.slice(-100);
    }

    // Notify state-specific listeners
    const stateListeners = this.listeners.get(event.state) || [];
    stateListeners.forEach(callback => callback(fullEvent));

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*') || [];
    wildcardListeners.forEach(callback => callback(fullEvent));
  }

  /**
   * Subscribe to state changes
   */
  on(state: AgentState | '*', callback: (event: StateEvent) => void): () => void {
    const listeners = this.listeners.get(state) || [];
    listeners.push(callback);
    this.listeners.set(state, listeners);

    // Return unsubscribe function
    return () => {
      const currentListeners = this.listeners.get(state) || [];
      const index = currentListeners.indexOf(callback);
      if (index > -1) {
        currentListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get current state
   */
  getCurrentState(): AgentState {
    return this.currentState;
  }

  /**
   * Get recent state history
   */
  getHistory(limit: number = 10): StateEvent[] {
    return this.stateHistory.slice(-limit);
  }

  /**
   * Clear state history
   */
  clearHistory(): void {
    this.stateHistory = [];
  }

  /**
   * Validate state transitions
   */
  private isValidTransition(from: AgentState, to: AgentState): boolean {
    // Define valid state transitions
    const validTransitions: Record<AgentState, AgentState[]> = {
      idle: ['listening', 'processing'],
      listening: ['processing', 'idle', 'error'],
      processing: ['validating', 'deciding', 'executing', 'completed', 'error'],
      validating: ['deciding', 'executing', 'error', 'waiting_input'],
      deciding: ['executing', 'validating', 'error', 'waiting_input'],
      executing: ['completed', 'error', 'processing', 'waiting_input'],
      completed: ['idle', 'listening'],
      error: ['idle', 'listening', 'processing'],
      waiting_input: ['listening', 'processing', 'idle']
    };

    const isValid = validTransitions[from]?.includes(to) || false;
    
    if (!isValid) {
      console.warn(`[StateMachine] Invalid state transition from ${from} to ${to}`);
    }
    
    return isValid;
  }

  /**
   * Force state reset (use with caution)
   */
  reset(): void {
    this.currentState = 'idle';
    this.stateHistory = [];
  }
}

// Singleton instance
export const stateMachine = new SignStateMachine();
