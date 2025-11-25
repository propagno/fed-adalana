import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loading" 
         class="fixed top-0 left-0 right-0 h-1 bg-blue-200 z-[10000]">
      <div class="h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-loading-bar"></div>
    </div>
  `,
  styles: [`
    @keyframes loading-bar {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-loading-bar {
      animation: loading-bar 1.5s ease-in-out infinite;
    }
  `]
})
export class LoadingBarComponent implements OnInit, OnDestroy {
  loading = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => 
          event instanceof NavigationStart ||
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        )
      )
      .subscribe(event => {
        if (event instanceof NavigationStart) {
          this.loading = true;
        } else {
          // Small delay to ensure smooth transition
          setTimeout(() => {
            this.loading = false;
          }, 100);
        }
      });
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}

