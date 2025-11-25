import { Directive, ElementRef, EventEmitter, OnInit, OnDestroy, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPullToRefresh]',
  standalone: true
})
export class PullToRefreshDirective implements OnInit, OnDestroy {
  @Output() refresh = new EventEmitter<void>();

  private touchStartY = 0;
  private touchCurrentY = 0;
  private isDragging = false;
  private pullThreshold = 80; // Distance in pixels to trigger refresh
  private maxPull = 120; // Maximum pull distance

  private indicatorElement?: HTMLElement;
  private listeners: (() => void)[] = [];

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Create pull indicator
    this.createIndicator();

    // Add touch event listeners
    const touchStart = this.renderer.listen(
      this.el.nativeElement,
      'touchstart',
      this.onTouchStart.bind(this)
    );
    const touchMove = this.renderer.listen(
      this.el.nativeElement,
      'touchmove',
      this.onTouchMove.bind(this)
    );
    const touchEnd = this.renderer.listen(
      this.el.nativeElement,
      'touchend',
      this.onTouchEnd.bind(this)
    );

    this.listeners.push(touchStart, touchMove, touchEnd);

    // Set relative position on container
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.setStyle(this.el.nativeElement, 'overflow-y', 'auto');
  }

  ngOnDestroy(): void {
    // Remove event listeners
    this.listeners.forEach(unlisten => unlisten());

    // Remove indicator
    if (this.indicatorElement && this.indicatorElement.parentNode) {
      this.indicatorElement.parentNode.removeChild(this.indicatorElement);
    }
  }

  private createIndicator(): void {
    this.indicatorElement = this.renderer.createElement('div');
    
    // Set styles
    this.renderer.setStyle(this.indicatorElement, 'position', 'absolute');
    this.renderer.setStyle(this.indicatorElement, 'top', '-60px');
    this.renderer.setStyle(this.indicatorElement, 'left', '50%');
    this.renderer.setStyle(this.indicatorElement, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(this.indicatorElement, 'width', '40px');
    this.renderer.setStyle(this.indicatorElement, 'height', '40px');
    this.renderer.setStyle(this.indicatorElement, 'display', 'flex');
    this.renderer.setStyle(this.indicatorElement, 'align-items', 'center');
    this.renderer.setStyle(this.indicatorElement, 'justify-content', 'center');
    this.renderer.setStyle(this.indicatorElement, 'z-index', '10');
    this.renderer.setStyle(this.indicatorElement, 'opacity', '0');
    this.renderer.setStyle(this.indicatorElement, 'transition', 'opacity 0.3s ease');

    // Create spinner SVG
    const spinner = `
      <svg class="animate-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
    if (this.indicatorElement) {
      this.indicatorElement.innerHTML = spinner;
      this.renderer.addClass(this.indicatorElement, 'text-primary-light');
    }

    // Insert at beginning of container
    this.renderer.insertBefore(
      this.el.nativeElement.parentNode,
      this.indicatorElement,
      this.el.nativeElement
    );
  }

  private onTouchStart(event: TouchEvent): void {
    // Only allow pull-to-refresh when scrolled to top
    if (this.el.nativeElement.scrollTop === 0) {
      this.touchStartY = event.touches[0].clientY;
      this.isDragging = true;
    }
  }

  private onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;

    this.touchCurrentY = event.touches[0].clientY;
    const pullDistance = this.touchCurrentY - this.touchStartY;

    // Only allow downward pull when at top
    if (pullDistance > 0 && this.el.nativeElement.scrollTop === 0) {
      // Prevent default scroll
      event.preventDefault();

      // Apply resistance curve (slower as it pulls further)
      const resistedDistance = Math.min(
        pullDistance * 0.5,
        this.maxPull
      );

      // Update container transform
      this.renderer.setStyle(
        this.el.nativeElement,
        'transform',
        `translateY(${resistedDistance}px)`
      );
      this.renderer.setStyle(
        this.el.nativeElement,
        'transition',
        'none'
      );

      // Update indicator
      if (this.indicatorElement) {
        const opacity = Math.min(resistedDistance / this.pullThreshold, 1);
        this.renderer.setStyle(this.indicatorElement, 'opacity', opacity.toString());
        
        // Rotate spinner based on pull distance
        const rotation = (resistedDistance / this.pullThreshold) * 360;
        const svg = this.indicatorElement.querySelector('svg');
        if (svg && resistedDistance < this.pullThreshold) {
          this.renderer.setStyle(svg, 'transform', `rotate(${rotation}deg)`);
        }
      }
    }
  }

  private onTouchEnd(event: TouchEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;
    const pullDistance = this.touchCurrentY - this.touchStartY;
    const resistedDistance = pullDistance * 0.5;

    // Reset transform with transition
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'transform 0.3s ease'
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transform',
      'translateY(0)'
    );

    // Check if pulled far enough to trigger refresh
    if (resistedDistance >= this.pullThreshold) {
      // Show loading indicator briefly
      if (this.indicatorElement) {
        this.renderer.setStyle(this.indicatorElement, 'opacity', '1');
        const svg = this.indicatorElement.querySelector('svg');
        if (svg) {
          this.renderer.addClass(svg, 'animate-spin');
        }
      }

      // Emit refresh event
      this.refresh.emit();

      // Hide indicator after delay
      setTimeout(() => {
        if (this.indicatorElement) {
          this.renderer.setStyle(this.indicatorElement, 'opacity', '0');
          const svg = this.indicatorElement.querySelector('svg');
          if (svg) {
            this.renderer.removeClass(svg, 'animate-spin');
            this.renderer.setStyle(svg, 'transform', 'rotate(0deg)');
          }
        }
      }, 800);
    } else {
      // Hide indicator immediately if not triggered
      if (this.indicatorElement) {
        this.renderer.setStyle(this.indicatorElement, 'opacity', '0');
        const svg = this.indicatorElement.querySelector('svg');
        if (svg) {
          this.renderer.setStyle(svg, 'transform', 'rotate(0deg)');
        }
      }
    }

    // Reset touch positions
    this.touchStartY = 0;
    this.touchCurrentY = 0;
  }
}

