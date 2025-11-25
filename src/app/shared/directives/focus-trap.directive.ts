import { Directive, ElementRef, Input, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appFocusTrap]',
  standalone: true
})
export class FocusTrapDirective implements AfterViewInit, OnDestroy {
  @Input() appFocusTrap: boolean = true;

  private firstFocusableElement?: HTMLElement;
  private lastFocusableElement?: HTMLElement;
  private keydownHandler?: (e: KeyboardEvent) => void;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    if (!this.appFocusTrap) return;

    this.setupFocusTrap();
  }

  ngOnDestroy(): void {
    if (this.keydownHandler) {
      this.el.nativeElement.removeEventListener('keydown', this.keydownHandler);
    }
  }

  private setupFocusTrap(): void {
    const focusableElements = this.getFocusableElements();
    
    if (focusableElements.length === 0) return;

    this.firstFocusableElement = focusableElements[0];
    this.lastFocusableElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    this.firstFocusableElement.focus();

    // Trap focus
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusableElement) {
          e.preventDefault();
          this.lastFocusableElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusableElement) {
          e.preventDefault();
          this.firstFocusableElement?.focus();
        }
      }
    };

    this.el.nativeElement.addEventListener('keydown', this.keydownHandler);
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return Array.from(this.el.nativeElement.querySelectorAll<HTMLElement>(selector))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
  }
}

