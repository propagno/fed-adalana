import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  route?: string[];
  queryParams?: any;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
      <a routerLink="/" class="hover:text-gray-900 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </a>
      <span class="text-gray-400">/</span>
      <ng-container *ngFor="let item of items; let last = last">
        <a *ngIf="!last && item.route" 
           [routerLink]="item.route" 
           [queryParams]="item.queryParams"
           class="hover:text-gray-900 transition-colors">
          {{ item.label }}
        </a>
        <span *ngIf="!last && !item.route" class="text-gray-600">{{ item.label }}</span>
        <span *ngIf="last" class="text-gray-900 font-semibold">{{ item.label }}</span>
        <span *ngIf="!last" class="text-gray-400">/</span>
      </ng-container>
    </nav>
  `,
  styles: []
})
export class BreadcrumbsComponent {
  @Input() items: BreadcrumbItem[] = [];
}

