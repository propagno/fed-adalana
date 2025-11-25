import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-customer-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MarketplaceNavbarComponent,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './customer-notifications.component.html',
  styleUrls: ['./customer-notifications.component.css']
})
export class CustomerNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filter: 'all' | 'unread' = 'all';
  loading = false;
  unreadCount = 0;
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadUnreadCount();
    
    // Subscribe to updates
    this.subscriptions.add(
      this.notificationService.notificationsUpdated$.subscribe(() => {
        this.loadNotifications();
        this.loadUnreadCount();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications().pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(notifications => {
      this.notifications = notifications;
      this.applyFilter();
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().pipe(
      catchError(() => of(0))
    ).subscribe(count => {
      this.unreadCount = count;
    });
  }

  applyFilter(): void {
    if (this.filter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.read);
    } else {
      this.filteredNotifications = this.notifications;
    }
  }

  markAsRead(notification: Notification): void {
    if (notification.read) return;
    
    this.notificationService.markAsRead(notification.id).pipe(
      catchError(error => {
        console.error('Error marking notification as read:', error);
        this.toastService.error('Erro ao marcar notificação como lida');
        return of(null);
      })
    ).subscribe(() => {
      notification.read = true;
      this.loadUnreadCount();
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0) return;
    
    this.notificationService.markAllAsRead().pipe(
      catchError(error => {
        console.error('Error marking all as read:', error);
        this.toastService.error('Erro ao marcar todas como lidas');
        return of(null);
      })
    ).subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
      this.applyFilter();
    });
  }

  deleteNotification(notification: Notification): void {
    if (!confirm('Deseja realmente remover esta notificação?')) return;
    
    this.notificationService.deleteNotification(notification.id).pipe(
      catchError(error => {
        console.error('Error deleting notification:', error);
        this.toastService.error('Erro ao remover notificação');
        return of(null);
      })
    ).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      this.applyFilter();
      if (!notification.read) {
        this.loadUnreadCount();
      }
    });
  }

  getNotificationIcon(type: string): string {
    const icons: Record<string, string> = {
      ORDER: '📦',
      SUBSCRIPTION: '🔄',
      PAYMENT: '💳',
      SYSTEM: '🔔',
      PROMOTION: '🎉'
    };
    return icons[type] || '🔔';
  }

  getNotificationColor(type: string): string {
    const colors: Record<string, string> = {
      ORDER: 'bg-blue-100 text-blue-800',
      SUBSCRIPTION: 'bg-green-100 text-green-800',
      PAYMENT: 'bg-yellow-100 text-yellow-800',
      SYSTEM: 'bg-gray-100 text-gray-800',
      PROMOTION: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}

