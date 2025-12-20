/**
 * ConfidenceCue Component
 * Displays confidence, uncertainty, and warning indicators
 */

export interface ConfidenceCueProps {
  confidence?: number;
  warning?: string;
  type?: 'confidence' | 'uncertainty' | 'warning';
  size?: 'small' | 'medium' | 'large';
}

export class ConfidenceCue {
  private container: HTMLElement;
  private config: ConfidenceCueProps;

  constructor(container: HTMLElement, props: ConfidenceCueProps = {}) {
    this.container = container;
    this.config = props;
    this.initialize();
  }

  private initialize(): void {
    this.container.classList.add('confidence-cue');
    this.container.classList.add(`size-${this.config.size || 'medium'}`);
    this.render();
  }

  /**
   * Update confidence value
   */
  updateConfidence(confidence: number): void {
    this.config.confidence = confidence;
    this.config.type = 'confidence';
    this.render();
  }

  /**
   * Show uncertainty
   */
  showUncertainty(level: 'low' | 'medium' | 'high'): void {
    this.config.type = 'uncertainty';
    this.config.confidence = level === 'low' ? 0.3 : level === 'medium' ? 0.5 : 0.7;
    this.render();
  }

  /**
   * Show warning
   */
  showWarning(message: string): void {
    this.config.type = 'warning';
    this.config.warning = message;
    this.render();
  }

  /**
   * Render the confidence cue
   */
  private render(): void {
    const type = this.config.type || 'confidence';

    if (type === 'warning') {
      this.renderWarning();
    } else if (type === 'uncertainty') {
      this.renderUncertainty();
    } else {
      this.renderConfidence();
    }
  }

  /**
   * Render confidence indicator
   */
  private renderConfidence(): void {
    const confidence = this.config.confidence || 0;
    const percentage = Math.round(confidence * 100);
    const level = this.getConfidenceLevel(confidence);

    this.container.innerHTML = `
      <div class="confidence-container">
        <div class="confidence-label">Confidence</div>
        <div class="confidence-bar-container">
          <div class="confidence-bar-fill confidence-${level}" style="width: ${percentage}%"></div>
        </div>
        <div class="confidence-value">${percentage}%</div>
      </div>
    `;

    this.container.dataset.type = 'confidence';
    this.container.dataset.level = level;
  }

  /**
   * Render uncertainty indicator
   */
  private renderUncertainty(): void {
    const confidence = this.config.confidence || 0.5;
    const uncertaintyLevel = this.getUncertaintyLevel(confidence);

    this.container.innerHTML = `
      <div class="uncertainty-container">
        <div class="uncertainty-icon">
          <span class="icon">❓</span>
        </div>
        <div class="uncertainty-text">
          <div class="uncertainty-label">Uncertainty</div>
          <div class="uncertainty-level">${uncertaintyLevel}</div>
        </div>
      </div>
    `;

    this.container.dataset.type = 'uncertainty';
    this.container.dataset.level = uncertaintyLevel;
  }

  /**
   * Render warning indicator
   */
  private renderWarning(): void {
    const message = this.config.warning || 'Warning';

    this.container.innerHTML = `
      <div class="warning-container">
        <div class="warning-icon">
          <span class="icon">⚠️</span>
        </div>
        <div class="warning-text">
          <div class="warning-label">Warning</div>
          <div class="warning-message">${message}</div>
        </div>
      </div>
    `;

    this.container.dataset.type = 'warning';
    
    // Add attention-grabbing animation
    this.container.classList.add('warning-pulse');
  }

  /**
   * Get confidence level
   */
  private getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  /**
   * Get uncertainty level description
   */
  private getUncertaintyLevel(confidence: number): string {
    if (confidence <= 0.3) return 'Very Uncertain';
    if (confidence <= 0.5) return 'Moderately Uncertain';
    return 'Slightly Uncertain';
  }

  /**
   * Clear the cue
   */
  clear(): void {
    this.container.innerHTML = '';
    this.container.classList.remove('warning-pulse');
    delete this.container.dataset.type;
    delete this.container.dataset.level;
  }

  /**
   * Destroy the cue
   */
  destroy(): void {
    this.clear();
    this.container.classList.remove('confidence-cue');
  }
}
