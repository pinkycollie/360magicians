/**
 * useIntentMap Hook
 * Maps user intents and system actions to sign semantics
 */

import intentMap from '../semantics/intent.map.json';
import systemMap from '../semantics/system.map.json';

export interface IntentMapping {
  signSemantic: string;
  visualPriority: string;
  confidence?: string;
  gestures?: string[];
}

export interface SystemMapping {
  signSemantic: string;
  state: string;
  visualPriority: string;
  requiresConfidence: boolean;
}

export interface IntentMapHook {
  mapIntent: (intent: string) => IntentMapping | null;
  mapSystemAction: (action: string) => SystemMapping | null;
  getAllIntents: () => string[];
  getAllSystemActions: () => string[];
  getIntentGestures: (intent: string) => string[];
  getSystemActionState: (action: string) => string | null;
}

/**
 * Hook for mapping intents to sign semantics
 */
export function useIntentMap(): IntentMapHook {
  /**
   * Map user intent to sign semantic
   */
  const mapIntent = (intent: string): IntentMapping | null => {
    const mapping = (intentMap.mappings as any)[intent];
    if (!mapping) {
      console.warn(`[useIntentMap] No mapping found for intent: ${intent}`);
      return null;
    }
    return mapping;
  };

  /**
   * Map system action to sign semantic
   */
  const mapSystemAction = (action: string): SystemMapping | null => {
    const mapping = (systemMap.mappings as any)[action];
    if (!mapping) {
      console.warn(`[useIntentMap] No mapping found for system action: ${action}`);
      return null;
    }
    return mapping;
  };

  /**
   * Get all available intent keys
   */
  const getAllIntents = (): string[] => {
    return Object.keys(intentMap.mappings);
  };

  /**
   * Get all available system action keys
   */
  const getAllSystemActions = (): string[] => {
    return Object.keys(systemMap.mappings);
  };

  /**
   * Get gestures for a specific intent
   */
  const getIntentGestures = (intent: string): string[] => {
    const mapping = mapIntent(intent);
    return mapping?.gestures || [];
  };

  /**
   * Get the state associated with a system action
   */
  const getSystemActionState = (action: string): string | null => {
    const mapping = mapSystemAction(action);
    return mapping?.state || null;
  };

  return {
    mapIntent,
    mapSystemAction,
    getAllIntents,
    getAllSystemActions,
    getIntentGestures,
    getSystemActionState
  };
}

/**
 * Helper functions for intent mapping
 */
export const intentMapHelpers = {
  /**
   * Check if an intent requires confidence display
   */
  requiresConfidence: (intent: string): boolean => {
    const mapping = (intentMap.mappings as any)[intent];
    return mapping?.confidence === 'required';
  },

  /**
   * Get visual priority for intent
   */
  getVisualPriority: (intent: string): string => {
    const mapping = (intentMap.mappings as any)[intent];
    return mapping?.visualPriority || 'medium';
  },

  /**
   * Check if system action requires confidence display
   */
  systemActionRequiresConfidence: (action: string): boolean => {
    const mapping = (systemMap.mappings as any)[action];
    return mapping?.requiresConfidence || false;
  },

  /**
   * Get visual priority for system action
   */
  getSystemActionPriority: (action: string): string => {
    const mapping = (systemMap.mappings as any)[action];
    return mapping?.visualPriority || 'medium';
  },

  /**
   * Check if priority is urgent
   */
  isUrgent: (priority: string): boolean => {
    return priority === 'urgent' || priority === 'critical';
  },

  /**
   * Get appropriate confidence threshold for action
   */
  getConfidenceThreshold: (action: string): number => {
    const priority = intentMapHelpers.getSystemActionPriority(action);
    
    // Higher threshold for urgent actions
    if (priority === 'critical') return 0.9;
    if (priority === 'urgent') return 0.8;
    if (priority === 'high') return 0.7;
    
    return 0.5;
  }
};
