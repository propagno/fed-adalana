import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CustomerClubSubscriptionService, CustomerClubSubscription, PauseSubscriptionRequest, CancelSubscriptionRequest, PaymentHistoryItem } from '../../../core/services/customer-club-subscription.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { ToastService } from '../../../shared/services/toast.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-my-club-subscription',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MarketplaceNavbarComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ModalComponent
  ],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <!-- Header -->
        <div class="mb-6 md:mb-8">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary mb-2">
            Meu Clube de Assinatura
          </h1>
          <p class="text-sm md:text-base text-gray-600">
            Gerencie sua assinatura e aproveite todos os benefícios exclusivos
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-6">
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </div>

        <!-- Empty State - No Active Subscription -->
        <app-empty-state *ngIf="!loading && !subscription"
                         title="Você não tem um clube ativo"
                         message="Assine agora e aproveite benefícios exclusivos como frete grátis e descontos especiais!"
                         [actionLabel]="'Explorar Clubes'"
                         [actionHandler]="exploreClubs.bind(this)">
        </app-empty-state>

        <!-- Subscription Content -->
        <div *ngIf="!loading && subscription" class="space-y-6">
          <!-- Status Card - Mobile Optimized -->
          <app-card variant="default" [elevation]="2" padding="lg" customClass="bg-gradient-to-br from-primary-light to-primary text-white">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h2 class="text-xl md:text-2xl font-display font-bold text-white">
                    {{ subscription.club?.name || 'Clube Premium' }}
                  </h2>
                  <app-badge 
                    [variant]="getStatusBadgeVariant(subscription.status)"
                    size="md"
                    [label]="getStatusLabel(subscription.status)">
                  </app-badge>
                </div>
                <p class="text-white/90 text-sm">
                  Assinante desde {{ formatDate(subscription.startDate) }}
                </p>
              </div>
              <div class="text-left sm:text-right">
                <p class="text-sm text-white/80 mb-1">Mensalidade</p>
                <p class="text-3xl md:text-4xl font-display font-bold text-white">
                  {{ formatCurrency(subscription.club?.monthlyFee || 0) }}
                </p>
              </div>
            </div>
          </app-card>

          <!-- Stats Cards Row - Responsive Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Next Billing -->
            <app-card *ngIf="subscription.nextBillingDate && subscription.status === 'active'" 
                      variant="neutral" [elevation]="1" padding="md">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-primary/10 rounded-large flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">📅</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 mb-1">Próxima Cobrança</p>
                  <p class="text-body font-semibold text-primary truncate">
                    {{ formatDate(subscription.nextBillingDate) }}
                  </p>
                </div>
              </div>
            </app-card>

            <!-- Months Active -->
            <app-card *ngIf="subscription.monthsActive !== undefined" 
                      variant="neutral" [elevation]="1" padding="md">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-accent/10 rounded-large flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">⏱️</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 mb-1">Tempo de Assinatura</p>
                  <p class="text-body font-semibold text-primary">
                    {{ subscription.monthsActive }} {{ subscription.monthsActive === 1 ? 'mês' : 'meses' }}
                  </p>
                </div>
              </div>
            </app-card>

            <!-- Total Saved -->
            <app-card *ngIf="subscription.totalSaved !== undefined" 
                      variant="neutral" [elevation]="1" padding="md"
                      customClass="sm:col-span-2 lg:col-span-1">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-success/10 rounded-large flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">💰</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-gray-500 mb-1">Economia Total</p>
                  <p class="text-body font-semibold text-success">
                    {{ formatCurrency(subscription.totalSaved) }}
                  </p>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Benefits Card -->
          <app-card variant="neutral" [elevation]="1" padding="lg">
            <h3 class="text-h3 font-display font-semibold text-primary mb-4">
              Seus Benefícios Ativos
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div *ngFor="let benefit of subscription.club?.benefits" 
                   class="flex items-start gap-3 p-3 bg-success/5 rounded-large">
                <span class="text-success text-xl flex-shrink-0">✓</span>
                <p class="text-body-sm font-medium text-gray-800 flex-1">{{ benefit }}</p>
              </div>
              <div *ngIf="subscription.club?.discountPercentage && (subscription.club?.discountPercentage ?? 0) > 0" 
                   class="flex items-start gap-3 p-3 bg-accent/10 rounded-large border border-accent md:col-span-2">
                <span class="text-xl flex-shrink-0">🎉</span>
                <div class="flex-1">
                  <p class="text-body-sm font-semibold text-primary">
                    {{ subscription.club?.discountPercentage }}% de desconto em todos os produtos
                  </p>
                  <p class="text-caption text-gray-600 mt-1">
                    Aplicado automaticamente no checkout
                  </p>
                </div>
              </div>
            </div>
          </app-card>

          <!-- Paused Info -->
          <app-card *ngIf="subscription.status === 'paused'" 
                    variant="highlighted" [elevation]="0" padding="md" 
                    customClass="border-l-4 border-warning">
            <div class="flex gap-3">
              <span class="text-2xl flex-shrink-0">⏸️</span>
              <div class="flex-1">
                <p class="text-body-sm font-semibold text-primary mb-1">
                  Assinatura Pausada
                </p>
                <p class="text-body-sm text-gray-700">
                  Sua assinatura está pausada. 
                  <span *ngIf="subscription.pausedUntil">
                    Será retomada automaticamente em {{ formatDate(subscription.pausedUntil) }}.
                  </span>
                  <span *ngIf="!subscription.pausedUntil">
                    Clique em "Retomar" para reativar os benefícios.
                  </span>
                </p>
              </div>
            </div>
          </app-card>

          <!-- Payment History Card -->
          <app-card variant="neutral" [elevation]="1" padding="lg">
            <h3 class="text-h3 font-display font-semibold text-primary mb-4">
              Histórico de Pagamentos
            </h3>
            
            <div *ngIf="loadingPaymentHistory" class="text-center py-8">
              <p class="text-body-sm text-gray-500">Carregando histórico...</p>
            </div>
            
            <div *ngIf="!loadingPaymentHistory && paymentHistory.length === 0" class="text-center py-8">
              <p class="text-body-sm text-gray-500">Nenhum pagamento registrado ainda.</p>
            </div>
            
            <div *ngIf="!loadingPaymentHistory && paymentHistory.length > 0" class="space-y-3">
              <div *ngFor="let payment of paymentHistory" 
                   class="flex items-center justify-between p-4 bg-white rounded-large border border-gray-200 hover:border-primary-light transition-colors">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <p class="text-body font-semibold text-primary">{{ payment.description }}</p>
                    <app-badge 
                      [variant]="getPaymentStatusBadgeVariant(payment.status)"
                      size="sm"
                      [label]="getPaymentStatusLabel(payment.status)">
                    </app-badge>
                  </div>
                  <p class="text-body-sm text-gray-600">
                    {{ formatDate(payment.billingDate) }}
                    <span *ngIf="payment.paidAt && payment.status === 'PAID'" class="ml-2">
                      • Pago em {{ formatDate(payment.paidAt) }}
                    </span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-h4 font-display font-bold text-primary">
                    {{ formatCurrency(payment.amountCents / 100) }}
                  </p>
                </div>
              </div>
            </div>
          </app-card>

          <!-- Actions - Mobile-First Buttons -->
          <div class="flex flex-col sm:flex-row gap-3">
            <app-button 
              *ngIf="subscription.status === 'active'"
              variant="secondary"
              size="lg"
              label="Pausar Assinatura"
              [fullWidth]="true"
              (clicked)="openPauseModal()">
            </app-button>
            <app-button 
              *ngIf="subscription.status === 'paused'"
              variant="primary"
              size="lg"
              label="Retomar Assinatura"
              [fullWidth]="true"
              [loading]="resuming"
              (clicked)="resumeSubscription()">
            </app-button>
            <app-button 
              *ngIf="subscription.status === 'cancelled'"
              variant="primary"
              size="lg"
              label="Reativar Assinatura"
              [fullWidth]="true"
              [loading]="reactivating"
              (clicked)="reactivateSubscription()">
            </app-button>
            <app-button 
              *ngIf="subscription.status !== 'cancelled'"
              variant="danger"
              size="lg"
              label="Cancelar Assinatura"
              [fullWidth]="true"
              (clicked)="openCancelModal()">
            </app-button>
          </div>
        </div>
      </div>

      <!-- Pause Modal - Bottom Sheet Style on Mobile -->
      <app-modal
        [isOpen]="showPauseModal"
        title="Pausar Assinatura"
        description="Você pode pausar sua assinatura temporariamente"
        [showFooter]="true"
        cancelLabel="Cancelar"
        confirmLabel="Pausar"
        confirmVariant="secondary"
        (closed)="showPauseModal = false; pauseReason = ''; pauseUntil = ''"
        (confirmed)="confirmPause()">
        <div class="space-y-4">
          <div>
            <label class="block text-body-sm font-medium text-primary mb-2">
              Motivo da pausa (opcional)
            </label>
            <textarea 
              [(ngModel)]="pauseReason"
              rows="3"
              placeholder="Ex: Viagem, estoque em casa..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
            </textarea>
          </div>
          <div>
            <label class="block text-body-sm font-medium text-primary mb-2">
              Retomar automaticamente em (opcional)
            </label>
            <input 
              type="date"
              [(ngModel)]="pauseUntil"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all min-h-[44px]">
            <p class="text-caption text-gray-500 mt-2">
              Se não informar, você precisará retomar manualmente
            </p>
          </div>
        </div>
      </app-modal>

      <!-- Cancel Modal -->
      <app-modal
        [isOpen]="showCancelModal"
        title="Cancelar Assinatura"
        description="Tem certeza que deseja cancelar? Você perderá todos os benefícios do clube."
        [showFooter]="true"
        cancelLabel="Voltar"
        confirmLabel="Cancelar Assinatura"
        confirmVariant="danger"
        (closed)="showCancelModal = false; cancelReason = ''"
        (confirmed)="confirmCancel()">
        <div class="space-y-4">
          <div class="p-4 bg-error/5 border border-error/20 rounded-large">
            <p class="text-body-sm text-gray-700">
              ⚠️ Ao cancelar, você perderá:
            </p>
            <ul class="list-disc list-inside text-body-sm text-gray-700 mt-2 space-y-1">
              <li>Frete grátis em todos os pedidos</li>
              <li>Descontos exclusivos de {{ subscription?.club?.discountPercentage }}%</li>
              <li>Atendimento prioritário</li>
            </ul>
          </div>
          <div>
            <label class="block text-body-sm font-medium text-primary mb-2">
              Por que você está cancelando? (opcional)
            </label>
            <textarea 
              [(ngModel)]="cancelReason"
              rows="3"
              placeholder="Seu feedback é importante para nós..."
              class="w-full px-4 py-2.5 border border-gray-300 rounded-medium text-body focus:ring-2 focus:ring-primary-light focus:border-transparent transition-all">
            </textarea>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: []
})
export class MyClubSubscriptionComponent implements OnInit {
  subscription: CustomerClubSubscription | null = null;
  paymentHistory: PaymentHistoryItem[] = [];
  loading = false;
  loadingPaymentHistory = false;
  resuming = false;
  reactivating = false;
  showPauseModal = false;
  showCancelModal = false;
  pauseReason = '';
  pauseUntil = '';
  cancelReason = '';
  accountId: string = '';

  constructor(
    private customerClubSubscriptionService: CustomerClubSubscriptionService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Get accountId from query params first, then fallback to user
    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.accountId = params['accountId'];
        this.loadSubscription();
      } else {
        // Fallback: try to get from current user
        const user = this.authService.getCurrentUser();
        if (user && user.accountId) {
          this.accountId = user.accountId;
          this.loadSubscription();
        } else {
          this.toastService.error('Account ID não encontrado. Por favor, acesse através do catálogo.');
          this.router.navigate(['/catalog']);
        }
      }
    });
  }

  loadSubscription(): void {
    this.loading = true;
    this.customerClubSubscriptionService.getMyClubSubscription(this.accountId).subscribe({
      next: (subscription) => {
        this.subscription = subscription;
        this.loading = false;
        // Load payment history after subscription is loaded
        if (subscription) {
          this.loadPaymentHistory();
        }
      },
      error: (err) => {
        console.error('Error loading club subscription', err);
        this.loading = false;
      }
    });
  }

  loadPaymentHistory(): void {
    this.loadingPaymentHistory = true;
    this.customerClubSubscriptionService.getPaymentHistory(this.accountId).subscribe({
      next: (history) => {
        this.paymentHistory = history;
        this.loadingPaymentHistory = false;
      },
      error: (err) => {
        console.error('Error loading payment history', err);
        this.loadingPaymentHistory = false;
      }
    });
  }

  openPauseModal(): void {
    this.pauseReason = '';
    this.pauseUntil = '';
    this.showPauseModal = true;
  }

  confirmPause(): void {
    if (!this.subscription) return;

    const request: PauseSubscriptionRequest = {
      reason: this.pauseReason || undefined,
      pausedUntil: this.pauseUntil || undefined
    };

    this.customerClubSubscriptionService.pauseClubSubscription(this.accountId, this.subscription.id, request).subscribe({
      next: () => {
        this.toastService.success('Assinatura pausada com sucesso!');
        this.showPauseModal = false;
        this.loadSubscription();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao pausar assinatura');
      }
    });
  }

  resumeSubscription(): void {
    if (!this.subscription) return;

    this.resuming = true;
    this.customerClubSubscriptionService.resumeClubSubscription(this.accountId, this.subscription.id).subscribe({
      next: () => {
        this.toastService.success('Assinatura retomada com sucesso! 🎉');
        this.resuming = false;
        this.loadSubscription();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao retomar assinatura');
        this.resuming = false;
      }
    });
  }

  reactivateSubscription(): void {
    if (!this.subscription || !this.subscription.club?.id) return;

    this.reactivating = true;
    // Reativar assinatura cancelada usando o mesmo endpoint de subscribe
    // O backend detecta assinatura cancelada e reativa automaticamente
    this.customerClubSubscriptionService.subscribeToClub(
      this.accountId,
      this.subscription.club.id,
      { acceptedTerms: true, autoRenew: true }
    ).subscribe({
      next: () => {
        this.toastService.success('Assinatura reativada com sucesso! 🎉');
        this.reactivating = false;
        this.loadSubscription();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao reativar assinatura');
        this.reactivating = false;
      }
    });
  }

  openCancelModal(): void {
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  confirmCancel(): void {
    if (!this.subscription) return;

    const request: CancelSubscriptionRequest = {
      reason: this.cancelReason || undefined
    };

    this.customerClubSubscriptionService.cancelClubSubscription(this.accountId, this.subscription.id, request).subscribe({
      next: () => {
        this.toastService.success('Assinatura cancelada com sucesso');
        this.showCancelModal = false;
        this.loadSubscription();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao cancelar assinatura');
      }
    });
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

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  formatCurrency(value: number): string {
    // Backend returns monthlyFee in reais (BigDecimal), not cents
    return FormatUtil.formatCurrencyFromReais(value);
  }

  getPaymentStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      FAILED: 'Falhou',
      PAUSED: 'Pausado',
      CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  }

  getPaymentStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      PAID: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      PAUSED: 'info',
      CANCELLED: 'error'
    };
    return variants[status] || 'info';
  }

  exploreClubs(): void {
    this.router.navigate(['/catalog/clubs'], {
      queryParams: { accountId: this.accountId }
    });
  }
}

