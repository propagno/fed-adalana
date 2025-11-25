import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfflineService } from '../../../core/services/offline.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOffline" 
         class="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white px-4 py-3 z-50 shadow-lg">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm font-medium">
            Você está offline. Algumas funcionalidades podem estar limitadas.
          </p>
        </div>
        <button (click)="dismiss()" 
                aria-label="Fechar aviso de offline"
                class="text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-yellow-500 rounded">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class OfflineIndicatorComponent implements OnInit, OnDestroy {
  isOffline = false;
  private subscription?: Subscription;
  private dismissed = false;

  constructor(private offlineService: OfflineService) {}

  ngOnInit(): void {
    this.subscription = this.offlineService.onlineStatus$.subscribe(isOnline => {
      if (!isOnline) {
        this.isOffline = true;
        this.dismissed = false;
      } else {
        this.isOffline = false;
        this.dismissed = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  dismiss(): void {
    this.dismissed = true;
    this.isOffline = false;
  }
}

