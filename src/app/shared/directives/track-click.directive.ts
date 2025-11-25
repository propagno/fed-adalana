import { Directive, HostListener, Input } from '@angular/core';
import { AnalyticsService } from '../../core/services/analytics.service';

@Directive({
  selector: '[appTrackClick]',
  standalone: true
})
export class TrackClickDirective {
  @Input() appTrackClick?: string;
  @Input() trackCategory?: string = 'User Interaction';
  @Input() trackLabel?: string;

  constructor(private analyticsService: AnalyticsService) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    const action = this.appTrackClick || 'Click';
    const label = this.trackLabel || (event.target as HTMLElement)?.textContent?.trim() || 'Unknown';

    this.analyticsService.trackEvent({
      category: this.trackCategory || 'User Interaction',
      action: action,
      label: label
    });
  }
}

