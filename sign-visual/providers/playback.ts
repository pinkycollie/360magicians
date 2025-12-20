/**
 * Playback Provider
 * Provides async/replay functionality for sign visualization
 */

import { StateEvent, AgentState } from '../engine/stateMachine';

export interface PlaybackConfig {
  speed?: number;
  loop?: boolean;
  autoPlay?: boolean;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentIndex: number;
  totalEvents: number;
  speed: number;
}

export class PlaybackProvider {
  private events: StateEvent[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private playbackTimer: number | null = null;
  private config: Required<PlaybackConfig>;
  private listeners: Array<(event: StateEvent) => void> = [];

  constructor(config: PlaybackConfig = {}) {
    this.config = {
      speed: config.speed || 1.0,
      loop: config.loop || false,
      autoPlay: config.autoPlay || false
    };
  }

  /**
   * Load events for playback
   */
  loadEvents(events: StateEvent[]): void {
    this.events = [...events];
    this.currentIndex = 0;
    
    if (this.config.autoPlay) {
      this.play();
    }
  }

  /**
   * Add event to playback queue
   */
  addEvent(event: StateEvent): void {
    this.events.push(event);
  }

  /**
   * Clear all events
   */
  clearEvents(): void {
    this.stop();
    this.events = [];
    this.currentIndex = 0;
  }

  /**
   * Play the event sequence
   */
  play(): void {
    if (this.isPlaying) return;
    if (this.events.length === 0) {
      console.warn('[PlaybackProvider] No events to play');
      return;
    }

    this.isPlaying = true;
    this.playNext();
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    if (this.playbackTimer) {
      clearTimeout(this.playbackTimer);
      this.playbackTimer = null;
    }
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    this.pause();
    this.currentIndex = 0;
  }

  /**
   * Play next event in sequence
   */
  private playNext(): void {
    if (!this.isPlaying) return;
    
    if (this.currentIndex >= this.events.length) {
      if (this.config.loop) {
        this.currentIndex = 0;
      } else {
        this.stop();
        return;
      }
    }

    const currentEvent = this.events[this.currentIndex];
    this.notifyListeners(currentEvent);

    this.currentIndex++;

    // Calculate delay until next event
    const delay = this.calculateDelay(currentEvent);
    
    this.playbackTimer = window.setTimeout(() => {
      this.playNext();
    }, delay);
  }

  /**
   * Calculate delay based on event and speed
   */
  private calculateDelay(event: StateEvent): number {
    // Base delay based on state
    const baseDelays: Record<AgentState, number> = {
      idle: 500,
      listening: 1000,
      processing: 2000,
      validating: 1500,
      deciding: 1500,
      executing: 2000,
      completed: 1000,
      error: 2000,
      waiting_input: 3000
    };

    const baseDelay = baseDelays[event.state] || 1000;
    return baseDelay / this.config.speed;
  }

  /**
   * Seek to specific event
   */
  seek(index: number): void {
    if (index < 0 || index >= this.events.length) {
      console.warn('[PlaybackProvider] Invalid seek index');
      return;
    }

    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentIndex = index;
    
    const event = this.events[this.currentIndex];
    this.notifyListeners(event);

    if (wasPlaying) {
      this.play();
    }
  }

  /**
   * Step forward one event
   */
  stepForward(): void {
    if (this.currentIndex < this.events.length - 1) {
      this.currentIndex++;
      const event = this.events[this.currentIndex];
      this.notifyListeners(event);
    }
  }

  /**
   * Step backward one event
   */
  stepBackward(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      const event = this.events[this.currentIndex];
      this.notifyListeners(event);
    }
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.config.speed = Math.max(0.25, Math.min(4.0, speed));
  }

  /**
   * Set loop mode
   */
  setLoop(loop: boolean): void {
    this.config.loop = loop;
  }

  /**
   * Subscribe to playback events
   */
  onEvent(callback: (event: StateEvent) => void): () => void {
    this.listeners.push(callback);
    
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: StateEvent): void {
    this.listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('[PlaybackProvider] Error in listener:', error);
      }
    });
  }

  /**
   * Get playback state
   */
  getState(): PlaybackState {
    return {
      isPlaying: this.isPlaying,
      currentIndex: this.currentIndex,
      totalEvents: this.events.length,
      speed: this.config.speed
    };
  }

  /**
   * Get current event
   */
  getCurrentEvent(): StateEvent | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.events.length) {
      return this.events[this.currentIndex];
    }
    return null;
  }

  /**
   * Get all events
   */
  getAllEvents(): StateEvent[] {
    return [...this.events];
  }

  /**
   * Destroy provider
   */
  destroy(): void {
    this.stop();
    this.clearEvents();
    this.listeners = [];
  }
}
