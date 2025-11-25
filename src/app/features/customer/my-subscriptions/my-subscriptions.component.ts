import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { SubscriptionService, Subscription } from '../../../core/services/subscription.service';
import { CustomerClubSubscriptionService, CustomerClubSubscription } from '../../../core/services/customer-club-subscription.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { AuthService } from '../../../core/services/auth.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/services/toast.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-my-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, EmptyStateComponent, SkeletonLoaderComponent, ButtonComponent, CardComponent, BadgeComponent, MapPinIconComponent, ModalComponent, MarketplaceNavbarComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-h1 font-display text-primary">Minhas Assinaturas</h1>
          <p class="text-body-lg text-gray-600 mt-2">Gerencie suas assinaturas ativas e acompanhe suas entregas</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-skeleton-loader *ngFor="let i of [1,2,3]" type="card"></app-skeleton-loader>
        </div>

        <!-- Club Subscription Section -->
        <div *ngIf="!loading && clubSubscription" class="mb-8">
          <app-card variant="default" [elevation]="2" padding="lg" customClass="relative overflow-hidden bg-gradient-to-br from-primary-light to-primary text-white">
            <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div class="relative z-10">
              <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <span class="text-3xl">⭐</span>
                    <h2 class="text-h2 font-display font-bold text-white">
                      {{ clubSubscription.club?.name || 'Clube VIP' }}
                    </h2>
                    <app-badge 
                      [variant]="getStatusBadgeVariant(clubSubscription.status)"
                      size="md"
                      [label]="getStatusLabel(clubSubscription.status)">
                    </app-badge>
                  </div>
                  <p class="text-white/90 text-sm md:text-base">
                    Assinante desde {{ formatDate(clubSubscription.startDate) }}
                  </p>
                </div>
                <div class="text-left md:text-right">
                  <p class="text-sm text-white/80 mb-1">Mensalidade</p>
                  <p class="text-3xl md:text-4xl font-display font-bold text-white">
                    {{ formatCurrencyFromReais(clubSubscription.club?.monthlyFee || 0) }}
                  </p>
                </div>
              </div>

              <!-- Club Benefits -->
              <div *ngIf="hasClubBenefits()" class="mb-6">
                <p class="text-white/90 text-sm font-semibold mb-3">Benefícios Ativos:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div *ngFor="let benefit of getClubBenefits()" 
                       class="flex items-center gap-2 text-white/90 text-sm">
                    <span class="text-success text-lg">✓</span>
                    <span>{{ benefit }}</span>
                  </div>
                  <div *ngIf="getClubDiscountPercentage() > 0" 
                       class="flex items-center gap-2 text-white/90 text-sm">
                    <span class="text-success text-lg">✓</span>
                    <span>{{ getClubDiscountPercentage() }}% de desconto automático</span>
                  </div>
                </div>
              </div>

              <!-- Club Actions -->
              <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/20">
                <app-button 
                  variant="secondary"
                  size="md"
                  label="Gerenciar Clube"
                  [fullWidth]="true"
                  (clicked)="goToClubManagement()">
                </app-button>
              </div>
            </div>
          </app-card>
        </div>

        <!-- Product Subscriptions Section -->
        <div *ngIf="!loading" class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-h2 font-display font-semibold text-primary">
              Assinaturas de Produtos
            </h2>
            <app-badge *ngIf="subscriptions.length > 0" variant="info" size="md" [label]="subscriptions.length + ' ' + (subscriptions.length === 1 ? 'assinatura' : 'assinaturas')"></app-badge>
          </div>
        </div>

        <!-- Empty State -->
        <app-empty-state *ngIf="!loading && subscriptions.length === 0 && !clubSubscription"
                         title="Nenhuma Assinatura"
                         message="Você ainda não possui assinaturas ativas. Explore nosso catálogo e encontre produtos incríveis!"
                         [actionLabel]="'Explorar Catálogo'"
                         [actionHandler]="goToCatalog.bind(this)">
        </app-empty-state>

        <!-- Subscriptions Grid -->
        <div *ngIf="!loading && subscriptions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-card *ngFor="let subscription of subscriptions" 
                    variant="interactive"
                    [elevation]="1"
                    padding="lg"
                    class="relative"
                    [customClass]="isClubSubscription(subscription) ? 'border-2 border-accent' : ''">
            <!-- Club Badge -->
            <div *ngIf="isClubSubscription(subscription)" class="absolute top-4 left-4 z-10">
              <app-badge variant="accent" size="sm" label="Clube VIP"></app-badge>
            </div>
            
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <app-badge 
                [variant]="getStatusBadgeVariant(subscription.status)"
                size="md"
                [label]="getStatusLabel(subscription.status)">
              </app-badge>
            </div>

            <!-- Product Info -->
            <div class="mb-6 pr-20" [class.pl-20]="isClubSubscription(subscription)">
              <h3 class="text-h3 font-display text-primary mb-2">{{ subscription.product_name || 'Produto' }}</h3>
              <p *ngIf="subscription.account_name" class="text-body-sm text-primary-light font-medium mb-1">
                {{ subscription.account_name }}
              </p>
              <app-badge *ngIf="subscription.product_sku" variant="neutral" size="sm" [label]="'SKU: ' + subscription.product_sku"></app-badge>
            </div>

            <!-- Delivery Info com Pin de Mapa -->
            <app-card variant="highlighted" [elevation]="0" padding="md" customClass="mb-6 border-l-4 border-primary-light">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary-light/10 rounded-large flex items-center justify-center flex-shrink-0">
                  <app-map-pin-icon size="md" variant="filled" color="text-primary-light"></app-map-pin-icon>
                </div>
                <div class="flex-1">
                  <p class="text-body-sm text-gray-600 mb-1">Próxima Entrega</p>
                  <p class="text-h4 font-semibold text-primary">{{ formatDate(subscription.next_delivery) }}</p>
                  <p class="text-caption text-gray-500 mt-1">{{ getIntervalLabel(subscription.interval) }}</p>
                </div>
              </div>
            </app-card>

            <!-- Subscription Details -->
            <div class="space-y-3 mb-6">
              <div class="flex justify-between items-center">
                <span class="text-body-sm text-gray-600">Quantidade:</span>
                <span class="text-body font-semibold text-primary">{{ subscription.quantity }}</span>
              </div>
              <div *ngIf="subscription.start_date" class="flex justify-between items-center">
                <span class="text-body-sm text-gray-600">Início:</span>
                <span class="text-body font-semibold text-primary">{{ formatDate(subscription.start_date) }}</span>
              </div>
              <div *ngIf="subscription.total_deliveries_count" class="flex justify-between items-center">
                <span class="text-body-sm text-gray-600">Total de Entregas:</span>
                <span class="text-body font-semibold text-primary">{{ subscription.total_deliveries_count }}</span>
              </div>
              <div *ngIf="subscription.subscription_value" class="flex justify-between items-center pt-2 border-t border-gray-200">
                <span class="text-body-sm text-gray-600">Valor:</span>
                <span class="text-h4 font-bold text-primary-light">{{ formatCurrency(subscription.subscription_value) }}</span>
              </div>
            </div>

            <!-- Calendar Preview -->
            <div *ngIf="getUpcomingDeliveries(subscription).length > 0" class="mb-6">
              <p class="text-body-sm font-medium text-primary mb-3">Próximas Entregas</p>
              <div class="flex flex-wrap gap-2">
                <app-badge 
                  *ngFor="let delivery of getUpcomingDeliveries(subscription)" 
                  variant="info" 
                  size="sm"
                  [label]="formatShortDate(delivery)">
                </app-badge>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 pt-4 border-t border-gray-200">
              <app-button 
                *ngIf="subscription.status === 'active'" 
                variant="secondary"
                size="md"
                label="Pausar"
                [fullWidth]="true"
                (clicked)="openPauseModal(subscription)">
              </app-button>
              <app-button 
                *ngIf="subscription.status === 'paused'" 
                variant="primary"
                size="md"
                label="Retomar"
                [fullWidth]="true"
                (clicked)="resumeSubscription(subscription)">
              </app-button>
              <app-button 
                *ngIf="subscription.status !== 'cancelled'" 
                variant="danger"
                size="md"
                label="Cancelar"
                [fullWidth]="true"
                (clicked)="openCancelModal(subscription)">
              </app-button>
            </div>
          </app-card>
        </div>
      </div>

      <!-- Pause Modal -->
      <app-modal
        [isOpen]="showPauseModal"
        title="Pausar Assinatura"
        description="Informe o motivo da pausa (opcional)"
        [showFooter]="true"
        cancelLabel="Cancelar"
        confirmLabel="Pausar"
        confirmVariant="secondary"
        (closed)="showPauseModal = false; selectedSubscription = null; pauseReason = ''"
        (confirmed)="confirmPause()">
        <div class="space-y-4">
          <label class="block text-body-sm font-medium text-primary">Motivo da Pausa</label>
          <textarea 
            [(ngModel)]="pauseReason"
            rows="3"
            placeholder="Ex: Viagem, estoque em casa..."
            class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
          </textarea>
        </div>
      </app-modal>

      <!-- Cancel Modal -->
      <app-modal
        [isOpen]="showCancelModal"
        title="Cancelar Assinatura"
        description="Esta ação não pode ser desfeita. Tem certeza que deseja cancelar esta assinatura?"
        [showFooter]="true"
        cancelLabel="Voltar"
        confirmLabel="Cancelar Assinatura"
        confirmVariant="danger"
        (closed)="showCancelModal = false; selectedSubscription = null; cancelReason = ''"
        (confirmed)="confirmCancel()">
        <div class="space-y-4">
          <label class="block text-body-sm font-medium text-primary">Motivo do Cancelamento (opcional)</label>
          <textarea 
            [(ngModel)]="cancelReason"
            rows="3"
            placeholder="Ex: Não preciso mais do produto..."
            class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
          </textarea>
        </div>
      </app-modal>
    </div>
  `,
  styles: []
})
export class MySubscriptionsComponent implements OnInit {
  subscriptions: Subscription[] = [];
  clubSubscription: CustomerClubSubscription | null = null;
  loading = false;
  error: string | null = null;
  showPauseModal = false;
  showCancelModal = false;
  selectedSubscription: Subscription | null = null;
  pauseReason = '';
  cancelReason = '';
  accountIds: string[] = [];

  constructor(
    private subscriptionService: SubscriptionService,
    private customerClubSubscriptionService: CustomerClubSubscriptionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.loading = true;
    
    // Load product subscriptions
    const productSubscriptions$ = this.subscriptionService.getMySubscriptions().pipe(
      catchError(err => {
        console.error('Error loading product subscriptions', err);
        return of([]);
      })
    );

    // Load club subscriptions from all accounts the user has subscriptions with
    // First, get product subscriptions to extract accountIds
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => {
        // Extract unique accountIds from subscriptions
        const accountIdsSet = new Set<string>();
        subs.forEach(sub => {
          if (sub.account_id) {
            accountIdsSet.add(sub.account_id);
          }
        });

        this.accountIds = Array.from(accountIdsSet);

        // If no accountIds found, try to get from current user
        if (this.accountIds.length === 0) {
          const user = this.authService.getCurrentUser();
          if (user && user.accountId) {
            this.accountIds = [user.accountId];
          }
        }

        // Load club subscriptions from all accounts
        const clubSubscriptionRequests = this.accountIds.map(accountId =>
          this.customerClubSubscriptionService.getMyClubSubscription(accountId).pipe(
            catchError(() => of(null))
          )
        );

        // Combine both requests
        forkJoin({
          productSubscriptions: of(subs),
          clubSubscriptions: clubSubscriptionRequests.length > 0 
            ? forkJoin(clubSubscriptionRequests).pipe(
                map(results => results.find(sub => sub !== null) || null)
              )
            : of(null)
        }).subscribe({
          next: (results) => {
            this.subscriptions = results.productSubscriptions || [];
            this.clubSubscription = results.clubSubscriptions || null;
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading subscriptions', err);
            this.error = 'Erro ao carregar assinaturas';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading subscriptions', err);
        this.error = 'Erro ao carregar assinaturas';
        this.loading = false;
      }
    });
  }

  isClubSubscription(subscription: Subscription): boolean {
    // Check if subscription has subscription_club_id (indicating it's from a club)
    return !!subscription.subscription_club_id;
  }

  goToClubManagement(): void {
    if (this.clubSubscription && this.accountIds.length > 0) {
      this.router.navigate(['/customer/my-club-subscription'], {
        queryParams: { accountId: this.accountIds[0] }
      });
    }
  }

  openPauseModal(subscription: Subscription): void {
    this.selectedSubscription = subscription;
    this.pauseReason = '';
    this.showPauseModal = true;
  }

  confirmPause(): void {
    if (!this.selectedSubscription) return;
    
    this.subscriptionService.pauseSubscription(this.selectedSubscription.id, {
      reason: this.pauseReason || 'Pausado pelo cliente',
      paused_until: undefined
    }).subscribe({
      next: () => {
        this.toastService.success('Assinatura pausada com sucesso!');
        this.showPauseModal = false;
        this.selectedSubscription = null;
        this.pauseReason = '';
        this.loadSubscriptions();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao pausar assinatura');
      }
    });
  }

  resumeSubscription(subscription: Subscription): void {
    this.subscriptionService.resumeSubscription(subscription.id).subscribe({
      next: () => {
        this.toastService.success('Assinatura retomada com sucesso!');
        this.loadSubscriptions();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao retomar assinatura');
      }
    });
  }

  openCancelModal(subscription: Subscription): void {
    this.selectedSubscription = subscription;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  confirmCancel(): void {
    if (!this.selectedSubscription) return;
    
    this.subscriptionService.cancelSubscription(this.selectedSubscription.id, this.cancelReason || undefined).subscribe({
      next: () => {
        this.toastService.success('Assinatura cancelada com sucesso!');
        this.showCancelModal = false;
        this.selectedSubscription = null;
        this.cancelReason = '';
        this.loadSubscriptions();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao cancelar assinatura');
      }
    });
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      active: 'Ativa',
      paused: 'Pausada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      active: 'success',
      paused: 'warning',
      cancelled: 'error'
    };
    return variants[status] || 'info';
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  formatCurrencyFromReais(value: number): string {
    return FormatUtil.formatCurrencyFromReais(value);
  }

  getUpcomingDeliveries(subscription: Subscription): string[] {
    const deliveries: string[] = [];
    if (!subscription.next_delivery) return deliveries;
    
    const startDate = new Date(subscription.next_delivery);
    const intervalDays = this.getIntervalDays(subscription.interval, subscription.custom_interval_days);
    
    for (let i = 0; i < 3; i++) {
      const deliveryDate = new Date(startDate);
      deliveryDate.setDate(startDate.getDate() + (i * intervalDays));
      deliveries.push(deliveryDate.toISOString());
    }
    
    return deliveries;
  }

  getIntervalDays(interval: string, customDays?: number): number {
    const days: { [key: string]: number } = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
      custom: customDays || 30
    };
    return days[interval] || 30;
  }

  formatShortDate(date: string): string {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }

  getIntervalLabel(interval: string): string {
    const labels: { [key: string]: string } = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      custom: 'Personalizado'
    };
    return labels[interval] || interval;
  }

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  hasClubBenefits(): boolean {
    return !!(this.clubSubscription?.club?.benefits && this.clubSubscription.club.benefits.length > 0);
  }

  getClubBenefits(): string[] {
    return this.clubSubscription?.club?.benefits || [];
  }

  getClubDiscountPercentage(): number {
    return this.clubSubscription?.club?.discountPercentage || 0;
  }
}
