/**
 * Sign Visual System - Main Entry Point
 * Exports all public APIs for the sign language visualization system
 */

// Engine
export { SignStateMachine, stateMachine, AgentState, StateEvent } from './engine/stateMachine';
export { SignEventBus, eventBus, SignEvent } from './engine/eventBus';

// Renderers
export { SignerAvatar, SignerConfig } from './renderers/signer-avatar';
export { FallbackVisual } from './renderers/fallback-visual';

// Components
export { SignerPanel, SignerPanelProps } from './components/SignerPanel';
export { StateIndicator, StateIndicatorProps } from './components/StateIndicator';
export { ConfidenceCue, ConfidenceCueProps } from './components/ConfidenceCue';

// Providers
export { RealtimeProvider, realtimeProvider, RealtimeConfig } from './providers/realtime';
export { PlaybackProvider, PlaybackConfig, PlaybackState } from './providers/playback';

// Hooks
export { useSignState, signStateHelpers, SignStateHook } from './hooks/useSignState';
export { useIntentMap, intentMapHelpers, IntentMapping, SystemMapping, IntentMapHook } from './hooks/useIntentMap';

// Integration
export {
  initializeSignVisual,
  wrapAgentWithSignState,
  integrateWithAgentManager,
  setupSignVisualForExistingApp,
  signEmit
} from './integration';

// Version
export const VERSION = '1.0.0';

// Initialize on import if in browser
if (typeof window !== 'undefined' && !window.SignVisualSystem) {
  window.SignVisualSystem = {
    version: VERSION,
    initialize: () => import('./integration').then(m => m.initializeSignVisual()),
    setup: () => import('./integration').then(m => m.setupSignVisualForExistingApp())
  };
  
  console.log(`[SignVisualSystem] v${VERSION} loaded`);
}
