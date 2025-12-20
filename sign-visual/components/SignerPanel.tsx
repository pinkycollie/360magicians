/**
 * SignerPanel Component
 * Persistent, dockable panel for sign language visualization
 */

import { StateEvent } from '../engine/stateMachine';
import { SignerAvatar } from '../renderers/signer-avatar';
import { FallbackVisual } from '../renderers/fallback-visual';

export interface SignerPanelProps {
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'small' | 'medium' | 'large';
  resizable?: boolean;
  draggable?: boolean;
  useFallback?: boolean;
  speed?: number;
}

export class SignerPanel {
  private container: HTMLElement;
  private panel: HTMLElement | null = null;
  private renderer: SignerAvatar | FallbackVisual | null = null;
  private config: Required<SignerPanelProps>;
  private isDragging: boolean = false;
  private isResizing: boolean = false;

  constructor(container: HTMLElement, props: SignerPanelProps = {}) {
    this.container = container;
    this.config = {
      position: props.position || 'right',
      size: props.size || 'medium',
      resizable: props.resizable !== false,
      draggable: props.draggable !== false,
      useFallback: props.useFallback || false,
      speed: props.speed || 1.0
    };
    this.initialize();
  }

  private initialize(): void {
    this.createPanel();
    this.setupRenderer();
    this.setupControls();
    this.setupEventListeners();
  }

  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.className = `signer-panel position-${this.config.position} size-${this.config.size}`;
    this.panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">Sign Language</div>
        <div class="panel-controls">
          <button class="control-btn replay-btn" title="Replay">↻</button>
          <button class="control-btn speed-btn" title="Speed">⚡</button>
          <button class="control-btn size-btn" title="Resize">⛶</button>
          <button class="control-btn minimize-btn" title="Minimize">−</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="renderer-container"></div>
      </div>
      <div class="panel-footer">
        <div class="status-text">Ready</div>
      </div>
    `;

    if (this.config.resizable) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      this.panel.appendChild(resizeHandle);
    }

    this.container.appendChild(this.panel);
  }

  private setupRenderer(): void {
    const rendererContainer = this.panel?.querySelector('.renderer-container') as HTMLElement;
    if (!rendererContainer) return;

    if (this.config.useFallback) {
      this.renderer = new FallbackVisual(rendererContainer);
    } else {
      this.renderer = new SignerAvatar(rendererContainer, {
        size: this.config.size,
        speed: this.config.speed
      });
    }
  }

  private setupControls(): void {
    if (!this.panel) return;

    // Replay button
    const replayBtn = this.panel.querySelector('.replay-btn');
    replayBtn?.addEventListener('click', () => this.replay());

    // Speed button
    const speedBtn = this.panel.querySelector('.speed-btn');
    speedBtn?.addEventListener('click', () => this.toggleSpeed());

    // Size button
    const sizeBtn = this.panel.querySelector('.size-btn');
    sizeBtn?.addEventListener('click', () => this.cycleSize());

    // Minimize button
    const minimizeBtn = this.panel.querySelector('.minimize-btn');
    minimizeBtn?.addEventListener('click', () => this.toggleMinimize());
  }

  private setupEventListeners(): void {
    if (!this.panel) return;

    // Make panel draggable if enabled
    if (this.config.draggable) {
      const header = this.panel.querySelector('.panel-header') as HTMLElement;
      header.style.cursor = 'move';
      
      header.addEventListener('mousedown', (e) => {
        if ((e.target as HTMLElement).closest('.panel-controls')) return;
        this.isDragging = true;
        header.dataset.startX = e.clientX.toString();
        header.dataset.startY = e.clientY.toString();
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.panel) return;
        
        const startX = parseInt(header.dataset.startX || '0');
        const startY = parseInt(header.dataset.startY || '0');
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        const rect = this.panel.getBoundingClientRect();
        this.panel.style.left = `${rect.left + deltaX}px`;
        this.panel.style.top = `${rect.top + deltaY}px`;
        
        header.dataset.startX = e.clientX.toString();
        header.dataset.startY = e.clientY.toString();
      });

      document.addEventListener('mouseup', () => {
        this.isDragging = false;
      });
    }

    // Make panel resizable if enabled
    if (this.config.resizable) {
      const resizeHandle = this.panel.querySelector('.resize-handle') as HTMLElement;
      
      resizeHandle?.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.isResizing = true;
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.isResizing || !this.panel) return;
        
        const rect = this.panel.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        const newHeight = e.clientY - rect.top;
        
        if (newWidth > 200) {
          this.panel.style.width = `${newWidth}px`;
        }
        if (newHeight > 200) {
          this.panel.style.height = `${newHeight}px`;
        }
      });

      document.addEventListener('mouseup', () => {
        this.isResizing = false;
      });
    }
  }

  /**
   * Update panel with new state
   */
  updateState(event: StateEvent): void {
    if (this.renderer) {
      this.renderer.updateState(event);
    }

    // Update status text
    const statusText = this.panel?.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = this.getStatusText(event);
    }
  }

  private getStatusText(event: StateEvent): string {
    let text = event.actor;
    if (event.context?.action) {
      text += `: ${event.context.action}`;
    }
    if (event.confidence !== undefined) {
      text += ` (${Math.round(event.confidence * 100)}%)`;
    }
    return text;
  }

  /**
   * Replay last state
   */
  private replay(): void {
    // Implementation for replay functionality
    console.log('Replay requested');
  }

  /**
   * Toggle speed
   */
  private toggleSpeed(): void {
    const speeds = [0.5, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(this.config.speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    this.config.speed = speeds[nextIndex];
    
    if (this.renderer && 'setSpeed' in this.renderer) {
      this.renderer.setSpeed(this.config.speed);
    }

    const speedBtn = this.panel?.querySelector('.speed-btn');
    if (speedBtn) {
      speedBtn.textContent = `${this.config.speed}x`;
    }
  }

  /**
   * Cycle through sizes
   */
  private cycleSize(): void {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(this.config.size);
    const nextIndex = (currentIndex + 1) % sizes.length;
    this.config.size = sizes[nextIndex];
    
    if (this.panel) {
      sizes.forEach(size => this.panel!.classList.remove(`size-${size}`));
      this.panel.classList.add(`size-${this.config.size}`);
    }

    if (this.renderer && 'resize' in this.renderer) {
      this.renderer.resize(this.config.size);
    }
  }

  /**
   * Toggle minimize state
   */
  private toggleMinimize(): void {
    this.panel?.classList.toggle('minimized');
    const minimizeBtn = this.panel?.querySelector('.minimize-btn');
    if (minimizeBtn) {
      minimizeBtn.textContent = this.panel?.classList.contains('minimized') ? '+' : '−';
    }
  }

  /**
   * Destroy the panel
   */
  destroy(): void {
    if (this.renderer && 'destroy' in this.renderer) {
      this.renderer.destroy();
    }
    this.panel?.remove();
  }
}
