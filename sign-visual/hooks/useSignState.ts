/**
 * useSignState Hook
 * React hook for accessing and managing sign state
 */

import { stateMachine, AgentState, StateEvent } from '../engine/stateMachine';
import { realtimeProvider } from '../providers/realtime';

export interface SignStateHook {
  currentState: AgentState;
  stateHistory: StateEvent[];
  emitState: (event: Omit<StateEvent, 'timestamp'>) => void;
  subscribe: (callback: (event: StateEvent) => void) => () => void;
  subscribeToState: (state: AgentState, callback: (event: StateEvent) => void) => () => void;
}

/**
 * Hook for managing sign state
 */
export function useSignState(): SignStateHook {
  const getCurrentState = (): AgentState => {
    return stateMachine.getCurrentState();
  };

  const getStateHistory = (limit: number = 10): StateEvent[] => {
    return stateMachine.getHistory(limit);
  };

  const emitState = (event: Omit<StateEvent, 'timestamp'>): void => {
    realtimeProvider.emitStateChange(event);
  };

  const subscribe = (callback: (event: StateEvent) => void): (() => void) => {
    return realtimeProvider.onStateChange(callback);
  };

  const subscribeToState = (state: AgentState, callback: (event: StateEvent) => void): (() => void) => {
    return realtimeProvider.onState(state, callback);
  };

  return {
    currentState: getCurrentState(),
    stateHistory: getStateHistory(),
    emitState,
    subscribe,
    subscribeToState
  };
}

/**
 * Helper function to emit common state transitions
 */
export const signStateHelpers = {
  /**
   * Emit listening state
   */
  startListening: (actor: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'listening',
      requiresUser: false,
      context: {
        action: 'Receiving input'
      }
    });
  },

  /**
   * Emit processing state
   */
  startProcessing: (actor: string, confidence?: number): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'processing',
      confidence,
      requiresUser: false,
      context: {
        action: 'Analyzing data'
      }
    });
  },

  /**
   * Emit validating state
   */
  startValidating: (actor: string, confidence?: number): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'validating',
      confidence,
      requiresUser: false,
      context: {
        action: 'Validating information'
      }
    });
  },

  /**
   * Emit deciding state
   */
  startDeciding: (actor: string, confidence?: number): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'deciding',
      confidence,
      requiresUser: false,
      context: {
        action: 'Making decision'
      }
    });
  },

  /**
   * Emit executing state
   */
  startExecuting: (actor: string, action?: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'executing',
      requiresUser: false,
      context: {
        action: action || 'Executing action'
      }
    });
  },

  /**
   * Emit completed state
   */
  complete: (actor: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'completed',
      requiresUser: false,
      context: {
        action: 'Task completed'
      }
    });
  },

  /**
   * Emit error state
   */
  error: (actor: string, errorMessage: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'error',
      requiresUser: false,
      context: {
        error: errorMessage
      }
    });
  },

  /**
   * Emit waiting for input state
   */
  waitForInput: (actor: string, nextAction?: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'waiting_input',
      requiresUser: true,
      context: {
        nextAction: nextAction || 'Waiting for user input'
      }
    });
  },

  /**
   * Return to idle state
   */
  idle: (actor: string): void => {
    realtimeProvider.emitStateChange({
      actor,
      state: 'idle',
      requiresUser: false
    });
  }
};
