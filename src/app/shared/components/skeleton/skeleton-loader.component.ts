import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonComponent } from './skeleton.component';
import { CardComponent } from '../design-system/card/card.component';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, CardComponent],
  template: `
    <div [ngSwitch]="type">
      <!-- Card Skeleton -->
      <app-card *ngSwitchCase="'card'" [elevation]="1" padding="lg" customClass="skeleton-shimmer">
        <app-skeleton width="60%" height="1.5rem" variant="rectangular"></app-skeleton>
        <div class="space-y-3 mt-4">
          <app-skeleton width="100%" height="1rem" variant="text"></app-skeleton>
          <app-skeleton width="80%" height="1rem" variant="text"></app-skeleton>
        </div>
        <div class="flex gap-2 mt-6">
          <app-skeleton width="100px" height="2.5rem" variant="rectangular"></app-skeleton>
          <app-skeleton width="100px" height="2.5rem" variant="rectangular"></app-skeleton>
        </div>
      </app-card>

      <!-- Table Skeleton -->
      <div *ngSwitchCase="'table'" class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="p-4 border-b border-gray-200">
          <app-skeleton width="200px" height="1.5rem" variant="rectangular"></app-skeleton>
        </div>
        <div class="divide-y divide-gray-200">
          <div *ngFor="let row of [1,2,3,4,5]" class="p-4 grid grid-cols-4 gap-4">
            <app-skeleton width="100%" height="1rem" variant="text"></app-skeleton>
            <app-skeleton width="100%" height="1rem" variant="text"></app-skeleton>
            <app-skeleton width="100%" height="1rem" variant="text"></app-skeleton>
            <app-skeleton width="80px" height="1.5rem" variant="rectangular"></app-skeleton>
          </div>
        </div>
      </div>

      <!-- List Skeleton -->
      <div *ngSwitchCase="'list'" class="space-y-4">
        <div *ngFor="let item of [1,2,3,4,5]" class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="flex items-center gap-4">
            <app-skeleton width="60px" height="60px" variant="circular"></app-skeleton>
            <div class="flex-1 space-y-2">
              <app-skeleton width="60%" height="1.25rem" variant="rectangular"></app-skeleton>
              <app-skeleton width="40%" height="1rem" variant="text"></app-skeleton>
            </div>
            <app-skeleton width="100px" height="1.5rem" variant="rectangular"></app-skeleton>
          </div>
        </div>
      </div>

      <!-- Product Card Skeleton -->
      <app-card *ngSwitchCase="'product-card'" variant="product" [elevation]="1" padding="none" customClass="overflow-hidden skeleton-shimmer">
        <app-skeleton width="100%" height="200px" variant="rectangular"></app-skeleton>
        <div class="p-6 space-y-3">
          <app-skeleton width="80%" height="1.25rem" variant="rectangular"></app-skeleton>
          <app-skeleton width="60%" height="1rem" variant="text"></app-skeleton>
          <app-skeleton width="100px" height="1.5rem" variant="rectangular"></app-skeleton>
        </div>
      </app-card>

      <!-- Default: Custom rows -->
      <div *ngSwitchDefault class="space-y-2">
        <app-skeleton *ngFor="let row of rows" 
                      [width]="row.width || '100%'" 
                      [height]="row.height || '1rem'"
                      [variant]="row.variant || 'text'">
        </app-skeleton>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-shimmer {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 2s linear infinite;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'table' | 'list' | 'product-card' | 'custom' = 'custom';
  @Input() rows: Array<{ width?: string; height?: string; variant?: 'text' | 'circular' | 'rectangular' }> = [
    { width: '100%', height: '1rem' },
    { width: '80%', height: '1rem' },
    { width: '60%', height: '1rem' }
  ];
}

