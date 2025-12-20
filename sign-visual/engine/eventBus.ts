/**
 * Event Bus - Centralized event system for sign visual state
 * Emits state changes to all subscribers
 */

import { StateEvent, AgentState } from './stateMachine';

export interface SignEvent extends StateEvent {
  visualHint?: 'urgent' | 'normal' | 'success' | 'warning';
  duration?: number; // Expected duration in ms
}

export type EventCallback = (event: SignEvent) => void;

export class SignEventBus {
  private subscribers: Map<string, EventCallback[]> = new Map();
  private eventLog: SignEvent[] = [];

  constructor() {
    this.initializeChannels();
  }

  private initializeChannels(): void {
    // Initialize event channels
    const channels = [
      'state.change',
      'state.listening',
      'state.processing',
      'state.validating',
      'state.deciding',
      'state.executing',
      'state.completed',
      'state.error',
      'state.waiting_input',
      'visual.update',
      'confidence.change'
    ];

    channels.forEach(channel => {
      this.subscribers.set(channel, []);
    });
  }

  /**
   * Subscribe to events on a specific channel
   */
  subscribe(channel: string, callback: EventCallback): () => void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, []);
    }

    const callbacks = this.subscribers.get(channel)!;
    callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const currentCallbacks = this.subscribers.get(channel) || [];
      const index = currentCallbacks.indexOf(callback);
      if (index > -1) {
        currentCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Publish an event to all subscribers
   */
  publish(channel: string, event: SignEvent): void {
    // Log event
    this.eventLog.push(event);
    if (this.eventLog.length > 200) {
      this.eventLog = this.eventLog.slice(-200);
    }

    // Notify subscribers
    const callbacks = this.subscribers.get(channel) || [];
    callbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`Error in event callback for channel ${channel}:`, error);
      }
    });

    // Also publish to wildcard channel
    const wildcardCallbacks = this.subscribers.get('*') || [];
    wildcardCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in wildcard event callback:', error);
      }
    });
  }

  /**
   * Emit state change event
   */
  emitStateChange(event: SignEvent): void {
    this.publish('state.change', event);
    this.publish(`state.${event.state}`, event);
  }

  /**
   * Get event log
   */
  getEventLog(limit: number = 50): SignEvent[] {
    return this.eventLog.slice(-limit);
  }

  /**
   * Clear event log
   */
  clearLog(): void {
    this.eventLog = [];
  }

  /**
   * Get subscriber count for a channel
   */
  getSubscriberCount(channel: string): number {
    return (this.subscribers.get(channel) || []).length;
  }
}

// Singleton instance
export const eventBus = new SignEventBus();
