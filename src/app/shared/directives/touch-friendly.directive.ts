import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

/**
 * Directive to ensure touch-friendly interactions
 * Adds proper touch event handling and ensures minimum touch target size
 */
@Directive({
  selector: '[appTouchFriendly]',
  standalone: true
})
export class TouchFriendlyDirective {
  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {
    // Ensure minimum touch target size (44x44px recommended by WCAG)
    const element = this.el.nativeElement;
    const computedStyle = window.getComputedStyle(element);
    
    const minSize = 44; // pixels
    const currentWidth = parseInt(computedStyle.width) || 0;
    const currentHeight = parseInt(computedStyle.height) || 0;
    const currentMinWidth = parseInt(computedStyle.minWidth) || 0;
    const currentMinHeight = parseInt(computedStyle.minHeight) || 0;

    if (currentWidth < minSize && currentMinWidth < minSize) {
      this.renderer.setStyle(element, 'min-width', `${minSize}px`);
    }
    
    if (currentHeight < minSize && currentMinHeight < minSize) {
      this.renderer.setStyle(element, 'min-height', `${minSize}px`);
    }

    // Add touch-action CSS property for better touch handling
    this.renderer.setStyle(element, 'touch-action', 'manipulation');
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    // Add active state for touch feedback
    this.renderer.addClass(this.el.nativeElement, 'touch-active');
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    // Remove active state after a short delay for visual feedback
    setTimeout(() => {
      this.renderer.removeClass(this.el.nativeElement, 'touch-active');
    }, 150);
  }
}

