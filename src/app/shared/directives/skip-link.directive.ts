import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSkipLink]',
  standalone: true
})
export class SkipLinkDirective {
  @Input() appSkipLink?: string;

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    
    const targetId = this.appSkipLink || this.el.nativeElement.getAttribute('href')?.replace('#', '');
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

