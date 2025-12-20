/**
 * Realtime Provider
 * Provides live agent state stream for sign visualization
 */

import { stateMachine, StateEvent, AgentState } from '../engine/stateMachine';
import { eventBus } from '../engine/eventBus';

export interface RealtimeConfig {
  pollInterval?: number;
  autoConnect?: boolean;
  reconnectAttempts?: number;
}

export class RealtimeProvider {
  private config: Required<RealtimeConfig>;
  private connected: boolean = false;
  private pollTimer: number | null = null;
  private reconnectCount: number = 0;

  constructor(config: RealtimeConfig = {}) {
    this.config = {
      pollInterval: config.pollInterval || 100,
      autoConnect: config.autoConnect !== false,
      reconnectAttempts: config.reconnectAttempts || 5
    };

    if (this.config.autoConnect) {
      this.connect();
    }
  }

  /**
   * Connect to realtime stream
   */
  connect(): void {
    if (this.connected) return;

    this.connected = true;
    this.startPolling();
    
    console.log('[RealtimeProvider] Connected to state stream');
  }

  /**
   * Disconnect from realtime stream
   */
  disconnect(): void {
    if (!this.connected) return;

    this.connected = false;
    this.stopPolling();
    
    console.log('[RealtimeProvider] Disconnected from state stream');
  }

  /**
   * Start polling for state changes
   */
  private startPolling(): void {
    if (this.pollTimer) return;

    this.pollTimer = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.pollInterval);
  }

  /**
   * Stop polling
   */
  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  /**
   * Check for state updates
   */
  private checkForUpdates(): void {
    // In a real implementation, this would fetch from an API or WebSocket
    // For now, we just listen to the state machine
  }

  /**
   * Emit state change
   */
  emitStateChange(event: Omit<StateEvent, 'timestamp'>): void {
    if (!this.connected) {
      console.warn('[RealtimeProvider] Not connected, cannot emit state');
      return;
    }

    // Emit to state machine
    stateMachine.emit(event);

    // Publish to event bus
    eventBus.emitStateChange({
      ...event,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to state changes
   */
  onStateChange(callback: (event: StateEvent) => void): () => void {
    return eventBus.subscribe('state.change', callback);
  }

  /**
   * Subscribe to specific state
   */
  onState(state: AgentState, callback: (event: StateEvent) => void): () => void {
    return eventBus.subscribe(`state.${state}`, callback);
  }

  /**
   * Get current state
   */
  getCurrentState(): AgentState {
    return stateMachine.getCurrentState();
  }

  /**
   * Get state history
   */
  getStateHistory(limit?: number): StateEvent[] {
    return stateMachine.getHistory(limit);
  }

  /**
   * Reconnect after failure
   */
  private reconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      console.error('[RealtimeProvider] Max reconnect attempts reached');
      return;
    }

    this.reconnectCount++;
    console.log(`[RealtimeProvider] Reconnecting... (${this.reconnectCount}/${this.config.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, 1000 * this.reconnectCount);
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Destroy provider
   */
  destroy(): void {
    this.disconnect();
  }
}

// Singleton instance
export const realtimeProvider = new RealtimeProvider();
