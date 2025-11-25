import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SubscriptionService, Subscription } from '../../../core/services/subscription.service';
import { OrderService, OrderResponse } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { MapPinIconComponent } from '../../../shared/components/icons/map-pin-icon.component';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonComponent, 
    CardComponent, 
    BadgeComponent, 
    MapPinIconComponent, 
    MarketplaceNavbarComponent,
    PageHeaderComponent,
    SkeletonLoaderComponent
  ],
  templateUrl: './customer-dashboard.component.html',
  styles: []
})
export class CustomerDashboardComponent implements OnInit {
  subscriptions: Subscription[] = [];
  orders: OrderResponse[] = [];
  loadingSubscriptions = false;
  loadingOrders = false;

  constructor(
    private subscriptionService: SubscriptionService,
    private orderService: OrderService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadOrders();
  }

  loadSubscriptions(): void {
    this.loadingSubscriptions = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subscriptions) => {
        this.subscriptions = subscriptions;
        this.loadingSubscriptions = false;
      },
      error: (err) => {
        console.error('Error loading subscriptions', err);
        this.loadingSubscriptions = false;
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loadingOrders = false;
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.loadingOrders = false;
      }
    });
  }

  get activeSubscriptionsCount(): number {
    return this.subscriptions.filter(s => s.status === 'active').length;
  }

  get activeSubscriptions(): Subscription[] {
    return this.subscriptions
      .filter(s => s.status === 'active')
      .sort((a, b) => a.next_delivery.localeCompare(b.next_delivery));
  }

  get pendingOrdersCount(): number {
    return this.orders.filter(o => 
      o.status === 'pending' || 
      o.delivery_status === 'pending' || 
      o.delivery_status === 'in_transit'
    ).length;
  }

  get recentOrders(): OrderResponse[] {
    return this.orders
      .sort((a, b) => new Date(b.delivery_date).getTime() - new Date(a.delivery_date).getTime())
      .slice(0, 5);
  }

  get nextDeliveryDate(): string | null {
    const activeSubs = this.activeSubscriptions;
    return activeSubs.length > 0 ? activeSubs[0].next_delivery : null;
  }

  get nextDeliveryProduct(): string | null {
    const activeSubs = this.activeSubscriptions;
    return activeSubs.length > 0 ? (activeSubs[0].product_name || null) : null;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Em Preparo',
      'in_transit': 'Em Trânsito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return labels[status.toLowerCase()] || status;
  }

  getStatusBadgeVariant(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' {
    const variants: { [key: string]: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'accent' | 'neutral' } = {
      'pending': 'warning',
      'confirmed': 'info',
      'preparing': 'info',
      'in_transit': 'info',
      'delivered': 'success',
      'cancelled': 'error'
    };
    return variants[status.toLowerCase()] || 'neutral';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.name || user?.email?.split('@')[0] || 'Cliente';
  }

  formatDate(date: string): string {
    return FormatUtil.formatDate(date);
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }
}

