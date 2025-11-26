import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appAriaLive]',
  standalone: true
})
export class AriaLiveDirective implements OnInit, OnDestroy {
  @Input() appAriaLive: 'polite' | 'assertive' | 'off' = 'polite';
  @Input() ariaAtomic: boolean = false;
  @Input() ariaRelevant: 'additions' | 'removals' | 'text' | 'all' = 'additions';

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const element = this.el.nativeElement;
    element.setAttribute('aria-live', this.appAriaLive);
    element.setAttribute('aria-atomic', this.ariaAtomic.toString());
    element.setAttribute('aria-relevant', this.ariaRelevant);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}

