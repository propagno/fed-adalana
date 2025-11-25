import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showPrompt" 
         class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">A</span>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-900 mb-1">Instalar Adalana</h3>
          <p class="text-xs text-gray-600 mb-3">
            Instale nosso app para acesso rápido e uma experiência melhor!
          </p>
          <div class="flex gap-2">
            <button (click)="install()"
                    class="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Instalar
            </button>
            <button (click)="dismiss()"
                    class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
              Depois
            </button>
          </div>
        </div>
        <button (click)="dismiss()"
                class="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showPrompt = false;
  private deferredPrompt?: BeforeInstallPromptEvent;
  private subscription?: Subscription;

  ngOnInit(): void {
    // Check if already installed
    if (this.isInstalled()) {
      return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
    
    // Check if user has dismissed before (using localStorage)
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (!dismissed) {
      // Show prompt after a delay
      setTimeout(() => {
        if (this.deferredPrompt) {
          this.showPrompt = true;
        }
      }, 3000); // Show after 3 seconds
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
    this.subscription?.unsubscribe();
  }

  private handleBeforeInstallPrompt(event: Event): void {
    event.preventDefault();
    this.deferredPrompt = event as BeforeInstallPromptEvent;
    
    // Show prompt if not dismissed before
    const dismissed = localStorage.getItem('install-prompt-dismissed');
    if (!dismissed) {
      setTimeout(() => {
        this.showPrompt = true;
      }, 3000);
    }
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) {
      return;
    }

    // Show the install prompt
    await this.deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    this.deferredPrompt = undefined;
    this.showPrompt = false;
  }

  dismiss(): void {
    this.showPrompt = false;
    // Remember dismissal for 7 days
    localStorage.setItem('install-prompt-dismissed', Date.now().toString());
    
    // Show again after 7 days
    setTimeout(() => {
      localStorage.removeItem('install-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  }

  private isInstalled(): boolean {
    // Check if running as standalone (installed PWA)
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }
}

