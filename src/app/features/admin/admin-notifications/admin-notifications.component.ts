import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { catchError, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './admin-notifications.component.html',
  styleUrls: ['./admin-notifications.component.css']
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  filter: 'all' | 'unread' = 'all';
  typeFilter: 'all' | 'ORDER' | 'SUBSCRIPTION' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION' = 'all';
  loading = false;
  unreadCount = 0;
  accountId: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('AdminNotificationsComponent: Current user:', user);
    
    if (user && user.accountId) {
      this.accountId = user.accountId;
      console.log('AdminNotificationsComponent: Loading notifications for accountId:', this.accountId);
      this.loadNotifications();
      this.loadUnreadCount();
      
      // Subscribe to updates
      this.subscriptions.add(
        this.notificationService.notificationsUpdated$.subscribe(() => {
          this.loadNotifications();
          this.loadUnreadCount();
        })
      );
    } else {
      console.warn('AdminNotificationsComponent: User not authenticated or accountId not found');
      this.toastService.error('Erro: Conta não encontrada. Faça login novamente.');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    if (!this.accountId) {
      console.warn('loadNotifications: AccountId is null, cannot load notifications');
      return;
    }
    
    console.log('loadNotifications: Loading notifications for accountId:', this.accountId);
    this.loading = true;
    this.notificationService.getAccountNotifications(this.accountId).pipe(
      catchError(error => {
        console.error('Error loading notifications:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.toastService.error('Erro ao carregar notificações: ' + (error.error?.message || error.message));
        return of([]);
      }),
      finalize(() => this.loading = false)
    ).subscribe(notifications => {
      console.log('loadNotifications: Received notifications:', notifications.length);
      this.notifications = notifications;
      this.applyFilters();
    });
  }

  loadUnreadCount(): void {
    if (!this.accountId) return;
    
    this.notificationService.getAccountUnreadCount(this.accountId).pipe(
      catchError(() => of(0))
    ).subscribe(count => {
      this.unreadCount = count;
    });
  }

  applyFilters(): void {
    let filtered = [...this.notifications];
    
    // Apply read/unread filter
    if (this.filter === 'unread') {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Apply type filter
    if (this.typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === this.typeFilter);
    }
    
    this.filteredNotifications = filtered;
  }

  markAsRead(notification: Notification): void {
    if (notification.read || !this.accountId) return;
    
    console.log('markAsRead: Marking notification as read:', notification.id, 'for account:', this.accountId);
    this.notificationService.markAccountNotificationAsRead(this.accountId, notification.id).pipe(
      catchError(error => {
        console.error('Error marking notification as read:', error);
        this.toastService.error('Erro ao marcar notificação como lida: ' + (error.error?.message || error.message));
        return of(null);
      })
    ).subscribe(() => {
      notification.read = true;
      this.loadUnreadCount();
      this.applyFilters();
    });
  }

  markAllAsRead(): void {
    if (this.unreadCount === 0 || !this.accountId) return;
    
    this.notificationService.markAllAccountNotificationsAsRead(this.accountId).pipe(
      catchError(error => {
        console.error('Error marking all as read:', error);
        this.toastService.error('Erro ao marcar todas como lidas');
        return of(null);
      })
    ).subscribe(() => {
      this.notifications.forEach(n => n.read = true);
      this.unreadCount = 0;
      this.applyFilters();
      this.toastService.success('Todas as notificações foram marcadas como lidas');
    });
  }

  deleteNotification(notification: Notification): void {
    if (!confirm('Deseja realmente remover esta notificação?') || !this.accountId) return;
    
    console.log('deleteNotification: Deleting notification:', notification.id, 'for account:', this.accountId);
    this.notificationService.deleteAccountNotification(this.accountId, notification.id).pipe(
      catchError(error => {
        console.error('Error deleting notification:', error);
        this.toastService.error('Erro ao remover notificação: ' + (error.error?.message || error.message));
        return of(null);
      })
    ).subscribe(() => {
      this.notifications = this.notifications.filter(n => n.id !== notification.id);
      this.applyFilters();
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

  handleNotificationClick(notification: Notification): void {
    // Deep linking: Se for notificação de pedido, navegar para página de pedidos
    if (notification.type === 'ORDER' && notification.metadata) {
      const orderId = notification.metadata['orderId'];
      if (orderId) {
        // Marcar como lida primeiro
        if (!notification.read) {
          this.markAsRead(notification);
        }
        // Navegar para página de pedidos (com scroll para o pedido específico se possível)
        this.router.navigate(['/admin/orders'], { 
          queryParams: { highlight: orderId } 
        });
      }
    }
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

