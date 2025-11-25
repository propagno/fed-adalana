import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SubscriptionClubService, SubscriptionClub } from '../../../core/services/subscription-club.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { PullToRefreshDirective } from '../../../shared/directives/pull-to-refresh.directive';

@Component({
  selector: 'app-subscription-clubs-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MarketplaceNavbarComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    PullToRefreshDirective
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8" appPullToRefresh (refresh)="onRefresh()">
        <!-- Header Mobile-First -->
        <div class="mb-6 md:mb-8">
          <div class="flex items-center gap-2 mb-2">
            <h1 class="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary">
              Clubes de Assinatura
            </h1>
            <app-badge variant="accent" size="sm" label="Novidade"></app-badge>
          </div>
          <p class="text-sm md:text-base text-gray-600 leading-relaxed">
            Assine e receba benefícios exclusivos todos os meses! Frete grátis, descontos especiais e muito mais.
          </p>
        </div>

        <!-- Benefits Banner - Mobile Optimized -->
        <app-card variant="highlighted" [elevation]="1" padding="md" customClass="mb-6 md:mb-8 border-l-4 border-accent">
          <div class="flex flex-col sm:flex-row gap-4 sm:gap-8">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-accent/10 rounded-large flex items-center justify-center flex-shrink-0">
                <span class="text-xl">🚚</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-primary">Frete Grátis</p>
                <p class="text-xs text-gray-600 mt-0.5">Em todas as entregas</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-accent/10 rounded-large flex items-center justify-center flex-shrink-0">
                <span class="text-xl">💰</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-primary">Descontos</p>
                <p class="text-xs text-gray-600 mt-0.5">Até 20% de desconto</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-accent/10 rounded-large flex items-center justify-center flex-shrink-0">
                <span class="text-xl">🎁</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-primary">Prioridade</p>
                <p class="text-xs text-gray-600 mt-0.5">Atendimento VIP</p>
              </div>
            </div>
          </div>
        </app-card>

        <!-- Loading State -->
        <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <app-skeleton-loader *ngFor="let i of [1,2,3]" type="card"></app-skeleton-loader>
        </div>

        <!-- Empty State -->
        <app-empty-state *ngIf="!loading && clubs.length === 0"
                         title="Nenhum Clube Disponível"
                         message="No momento não há clubes de assinatura disponíveis nesta empresa. Volte em breve!"
                         [actionLabel]="'Voltar ao Catálogo'"
                         [actionHandler]="goBack.bind(this)">
        </app-empty-state>

        <!-- Clubs Grid - Mobile-First -->
        <div *ngIf="!loading && clubs.length > 0" 
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <app-card *ngFor="let club of clubs" 
                    variant="interactive"
                    [elevation]="1"
                    padding="none"
                    class="overflow-hidden hover:shadow-elevation-3 transition-shadow duration-300">
            <!-- Club Header with Gradient -->
            <div class="bg-gradient-to-br from-primary-light to-primary p-6 relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div class="relative">
                <app-badge variant="accent" size="sm" label="Clube Premium" customClass="mb-3"></app-badge>
                <h3 class="text-h3 font-display font-bold text-white mb-2">{{ club.name }}</h3>
                <div class="flex items-baseline gap-1">
                  <span class="text-3xl md:text-4xl font-display font-bold text-white">
                    {{ formatCurrency(club.monthlyFee) }}
                  </span>
                  <span class="text-sm text-white/80">/mês</span>
                </div>
              </div>
            </div>

            <!-- Club Body -->
            <div class="p-4 md:p-6">
              <!-- Description -->
              <p *ngIf="club.description" class="text-body-sm text-gray-600 mb-4 line-clamp-2">
                {{ club.description }}
              </p>

              <!-- Discount Badge - Enhanced -->
              <div *ngIf="club.discountPercentage > 0" 
                   class="inline-flex items-center gap-2 bg-gradient-to-r from-success/20 to-success/10 text-success px-4 py-2 rounded-large mb-4 border border-success/30">
                <span class="text-xl">🎉</span>
                <span class="text-sm font-bold">{{ club.discountPercentage }}% de desconto</span>
                <span class="text-xs text-success/80">em todos os produtos</span>
              </div>

              <!-- Benefits List - Enhanced -->
              <div class="space-y-2.5 mb-6">
                <p class="text-body-sm font-bold text-primary mb-3 flex items-center gap-2">
                  <span class="text-lg">✨</span>
                  Benefícios Inclusos:
                </p>
                <div *ngFor="let benefit of club.benefits; let last = last" 
                     class="flex items-start gap-2 p-2.5 bg-success/5 rounded-medium"
                     [class.mb-2]="!last">
                  <span class="text-success text-lg flex-shrink-0 mt-0.5">✓</span>
                  <span class="text-body-sm text-gray-700 flex-1 font-medium">{{ benefit }}</span>
                </div>
                <div *ngIf="club.benefits.length === 0" class="text-body-sm text-gray-500 italic p-2.5">
                  Nenhum benefício cadastrado
                </div>
              </div>

              <!-- Products Count -->
              <div *ngIf="club.productIds && club.productIds.length > 0" 
                   class="mb-4 p-3 bg-primary/5 rounded-medium border border-primary/20">
                <div class="flex items-center gap-2">
                  <span class="text-lg">📦</span>
                  <span class="text-body-sm font-semibold text-primary">
                    {{ club.productIds.length }} {{ club.productIds.length === 1 ? 'produto incluído' : 'produtos incluídos' }}
                  </span>
                </div>
              </div>

              <!-- Subscribers Count - Enhanced -->
              <div *ngIf="club.subscribersCount !== undefined && club.subscribersCount > 0" 
                   class="mb-4 p-3 bg-accent/5 rounded-medium border border-accent/20">
                <div class="flex items-center gap-2">
                  <span class="text-lg">👥</span>
                  <span class="text-body-sm font-semibold text-primary">
                    {{ club.subscribersCount }} {{ club.subscribersCount === 1 ? 'pessoa já assinou' : 'pessoas já assinaram' }}
                  </span>
                </div>
              </div>

              <!-- CTA Button - Full Width Mobile -->
              <app-button 
                variant="primary"
                size="lg"
                [label]="isAuthenticated ? 'Assinar Agora' : 'Faça Login para Assinar'"
                [fullWidth]="true"
                (clicked)="subscribe(club)">
              </app-button>

              <!-- Additional Info -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <div class="flex items-center justify-center gap-4 text-caption text-gray-500">
                  <span class="flex items-center gap-1">
                    <span>🔄</span>
                    <span>Renovação automática</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <span>❌</span>
                    <span>Sem taxa de cancelamento</span>
                  </span>
                </div>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Info Section Mobile -->
        <div class="mt-8 md:mt-12">
          <app-card variant="neutral" [elevation]="0" padding="lg">
            <h3 class="text-h3 font-display font-semibold text-primary mb-4">Como Funciona?</h3>
            <div class="space-y-4">
              <div class="flex gap-4">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-primary font-bold text-sm">1</span>
                </div>
                <div class="flex-1">
                  <p class="text-body-sm font-semibold text-primary mb-1">Escolha seu Clube</p>
                  <p class="text-body-sm text-gray-600">Selecione o clube que melhor se encaixa no seu perfil</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-primary font-bold text-sm">2</span>
                </div>
                <div class="flex-1">
                  <p class="text-body-sm font-semibold text-primary mb-1">Faça a Adesão</p>
                  <p class="text-body-sm text-gray-600">Complete o cadastro em poucos passos</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-primary font-bold text-sm">3</span>
                </div>
                <div class="flex-1">
                  <p class="text-body-sm font-semibold text-primary mb-1">Aproveite os Benefícios</p>
                  <p class="text-body-sm text-gray-600">Descontos e frete grátis em todos os pedidos!</p>
                </div>
              </div>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Line clamp para descrições */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class SubscriptionClubsCatalogComponent implements OnInit {
  clubs: SubscriptionClub[] = [];
  loading = false;
  accountId: string = '';
  isAuthenticated = false;

  constructor(
    private subscriptionClubService: SubscriptionClubService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    
    // Get accountId from query params or route
    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'] || '';
      if (this.accountId) {
        this.loadClubs();
      }
    });

    // Try to get from parent route params (if coming from /catalog/companies/:id)
    this.route.parent?.params.subscribe(params => {
      if (params['id'] && !this.accountId) {
        this.accountId = params['id'];
        this.loadClubs();
      }
    });
  }

  loadClubs(): void {
    if (!this.accountId) {
      console.warn('No accountId provided');
      return;
    }

    this.loading = true;
    this.subscriptionClubService.getClubs(this.accountId).subscribe({
      next: (clubs) => {
        this.clubs = clubs.filter(club => club.active);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading subscription clubs', err);
        this.loading = false;
      }
    });
  }

  subscribe(club: SubscriptionClub): void {
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: `/catalog/clubs/${club.id}/subscribe` }
      });
      return;
    }

    // Navigate to subscription flow
    this.router.navigate(['/catalog/clubs', club.id, 'subscribe'], {
      queryParams: { accountId: this.accountId }
    });
  }

  formatCurrency(value: number): string {
    // monthlyFee vem em reais (BigDecimal), não em centavos
    return FormatUtil.formatCurrencyFromReais(value);
  }

  onRefresh(): void {
    console.log('🔄 Pull-to-refresh triggered');
    this.loadClubs();
  }

  goBack(): void {
    if (this.accountId) {
      this.router.navigate(['/catalog/companies', this.accountId]);
    } else {
      this.router.navigate(['/catalog']);
    }
  }
}

