import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="getClasses()" [style.width]="width" [style.height]="height">
      <div class="animate-pulse bg-gray-200 rounded w-full h-full"></div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() rounded: boolean = true;
  @Input() variant: 'text' | 'circular' | 'rectangular' = 'text';

  getClasses(): string {
    let classes = '';
    
    if (this.rounded) {
      classes += 'rounded ';
    }
    
    if (this.variant === 'circular') {
      classes += 'rounded-full ';
    } else if (this.variant === 'rectangular') {
      classes += 'rounded-lg ';
    }
    
    return classes.trim();
  }
}

