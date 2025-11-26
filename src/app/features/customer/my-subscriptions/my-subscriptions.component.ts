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
  templateUrl: './my-subscriptions.component.html',
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
