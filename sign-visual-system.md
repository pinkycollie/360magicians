# Sign Visual System

## Purpose

Provide sign language as a primary interaction layer for agentic systems.
Not translation. State + intent visualization.

## Core Principle

Sign visuals reflect system state, not just output text.

**Text = optional**  
**Sign = authoritative**

## Directory Structure

```
/sign-visual
  /components
    SignerPanel.tsx       # persistent, dockable
    StateIndicator.tsx    # listening | processing | deciding | executing | error
    ConfidenceCue.tsx     # certainty / uncertainty / warning
  /states
    idle.json
    listening.json
    processing.json
    validating.json
    deciding.json
    executing.json
    completed.json
    error.json
    waiting_input.json
  /semantics
    intent.map.json       # user intent → sign semantic
    system.map.json       # system action → sign semantic
  /providers
    realtime.ts           # live agent state stream
    playback.ts           # async / replay
  /engine
    stateMachine.ts       # single source of truth for agent state
    eventBus.ts           # emits state changes
  /renderers
    signer-avatar.ts      # stub → video → generative later
    fallback-visual.ts    # icons + motion for low-bandwidth
  /hooks
    useSignState.ts       # React hook for state management
    useIntentMap.ts       # React hook for intent mapping
```

## Sign Rendering Rules

### No word-for-word translation
Use semantic chunks

### Always expose:
- what the system is doing
- why it paused
- what it needs next

## Integration Points

- **MagicianCore** → invokes SignerPanel by default
- **Validator** → switches to "deciding / warning" state
- **Compliance** → high-visibility caution semantics
- **Errors** → explicit, non-ambiguous signing (no silent fails)

## Accessibility Contract

- Sign panel never hidden behind modals
- User controls size, speed, replay
- Works async-first (no forced realtime)

## Definition of Done

- Deaf user understands system state without reading text
- No action happens without a visible sign state
- System silence is never ambiguous

## Non-Goals

- Not subtitles
- Not decorative avatars
- Not post-hoc translation

## Philosophy

**If the system thinks, it signs.**  
**If it cannot sign, it should not act.**

## State Machine

The sign visual system uses a state machine to manage transitions:

```
idle → listening → processing → validating → deciding → executing → completed
                       ↓            ↓           ↓           ↓
                     error ←────────┴───────────┴───────────┘
                       ↓
                   waiting_input
```

### State Descriptions

- **idle**: System is ready, waiting for input
- **listening**: Actively receiving and understanding user input
- **processing**: Analyzing and processing information
- **validating**: Checking and verifying information
- **deciding**: Making a decision or choosing an action
- **executing**: Performing an action or fetching data
- **completed**: Successfully completed the task
- **error**: Encountered an error or problem
- **waiting_input**: Needs user input to continue

## Usage Example

```typescript
import { SignerPanel } from './sign-visual/components/SignerPanel';
import { signStateHelpers } from './sign-visual/hooks/useSignState';

// Create the sign panel
const container = document.getElementById('sign-panel-container');
const signerPanel = new SignerPanel(container, {
  position: 'right',
  size: 'medium',
  resizable: true
});

// Emit state changes
signStateHelpers.startListening('MagicianCore');
signStateHelpers.startProcessing('MagicianCore', 0.85);
signStateHelpers.complete('MagicianCore');
```

## Event System

The sign visual system uses an event bus for state changes:

```typescript
import { realtimeProvider } from './sign-visual/providers/realtime';

// Subscribe to state changes
const unsubscribe = realtimeProvider.onStateChange((event) => {
  console.log('State changed:', event.state);
  console.log('Actor:', event.actor);
  console.log('Confidence:', event.confidence);
});

// Emit a state change
realtimeProvider.emitStateChange({
  actor: 'DataProcessor',
  state: 'processing',
  confidence: 0.92,
  requiresUser: false,
  context: {
    action: 'Processing CSV file'
  }
});
```

## Semantic Mapping

User intents and system actions are mapped to sign semantics:

### User Intent Mapping
- query → asking
- command → directing
- confirmation → agreeing
- rejection → disagreeing
- request_help → requesting_assistance

### System Action Mapping
- agent_thinking → analyzing (processing state)
- agent_validating → checking (validating state)
- agent_deciding → choosing (deciding state)
- agent_executing → doing (executing state)
- agent_error → failed (error state)
- agent_warning → cautioning (validating state)

## Visual Cues

Each state has associated visual cues:

- **Posture**: Overall body position
- **Hand Position**: Hand gesture and placement
- **Facial Expression**: Emotional/cognitive state
- **Movement**: Animation style and rhythm

## Confidence Display

Confidence levels are displayed when available:

- **High (≥80%)**: Green indicator
- **Medium (50-79%)**: Yellow indicator  
- **Low (<50%)**: Red indicator

## Playback & Replay

The system supports playback of state sequences:

```typescript
import { PlaybackProvider } from './sign-visual/providers/playback';

const playback = new PlaybackProvider({
  speed: 1.0,
  loop: false,
  autoPlay: false
});

// Load historical events
playback.loadEvents(stateHistory);

// Control playback
playback.play();
playback.pause();
playback.stepForward();
playback.stepBackward();
playback.setSpeed(1.5);
```

## Customization

The sign panel can be customized:

- **Position**: left, right, top, bottom
- **Size**: small, medium, large
- **Speed**: 0.5x to 2.0x
- **Resizable**: User can resize the panel
- **Draggable**: User can move the panel
- **Fallback Mode**: Use icon-based visuals for low bandwidth

## Next Steps

1. Wire sign state emission into existing agent system
2. Add visual styling (CSS)
3. Implement generative sign language avatars
4. Add multilingual sign language support (ASL, BSL, JSL, etc.)
5. Create governance process for sign semantic approval
6. Integrate with ChatGPT App Store as capability
