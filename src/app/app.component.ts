import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './shared/components/toast/toast.component';
import { SkipLinksComponent } from './shared/components/skip-links/skip-links.component';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator/offline-indicator.component';
import { BottomNavigationComponent } from './shared/components/bottom-navigation/bottom-navigation.component';
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastComponent, SkipLinksComponent, OfflineIndicatorComponent, BottomNavigationComponent, ConfirmationModalComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-skip-links></app-skip-links>
      <router-outlet></router-outlet>
      <app-bottom-navigation></app-bottom-navigation>
      <app-toast></app-toast>
      <app-offline-indicator></app-offline-indicator>
      <app-confirmation-modal></app-confirmation-modal>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'fed-adalana';
}
