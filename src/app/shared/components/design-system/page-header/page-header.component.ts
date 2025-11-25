import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl md:text-3xl font-display font-bold text-primary">{{ title }}</h1>
        <p *ngIf="description" class="text-body text-gray-600 mt-1">{{ description }}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-3" *ngIf="showActions">
        <ng-content select="[actions]"></ng-content>
        <app-button *ngIf="actionLabel" 
                    variant="primary" 
                    [label]="actionLabel" 
                    (clicked)="action.emit()">
        </app-button>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() actionLabel = '';
  @Input() showActions = true;
  @Output() action = new EventEmitter<void>();
}

