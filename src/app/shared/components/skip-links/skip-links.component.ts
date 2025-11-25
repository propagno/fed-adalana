import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SkipLinkDirective } from '../../directives/skip-link.directive';

@Component({
  selector: 'app-skip-links',
  standalone: true,
  imports: [CommonModule, SkipLinkDirective],
  template: `
    <nav class="skip-links" aria-label="Navegação rápida">
      <a href="#main-content" 
         appSkipLink="main-content"
         class="skip-link">
        Ir para conteúdo principal
      </a>
      <a href="#navigation" 
         appSkipLink="navigation"
         class="skip-link">
        Ir para navegação
      </a>
    </nav>
  `,
  styles: [`
    .skip-links {
      position: absolute;
      top: -100px;
      left: 0;
      z-index: 10000;
    }

    .skip-link {
      position: absolute;
      top: 0;
      left: 0;
      padding: 12px 24px;
      background: #1e40af;
      color: white;
      text-decoration: none;
      font-weight: 600;
      border-radius: 0 0 4px 0;
      transform: translateY(-100%);
      transition: transform 0.2s;
    }

    .skip-link:focus {
      transform: translateY(0);
      outline: 3px solid #fbbf24;
      outline-offset: 2px;
    }

    .skip-link:hover {
      background: #1e3a8a;
    }
  `]
})
export class SkipLinksComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Reset focus on route change
    this.subscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Focus main content on route change
        setTimeout(() => {
          const mainContent = document.getElementById('main-content');
          if (mainContent) {
            mainContent.focus();
          }
        }, 100);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}

