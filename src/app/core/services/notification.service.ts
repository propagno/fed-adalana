import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { WebSocketService } from './websocket.service';
import { AuthService } from './auth.service';

export type NotificationType = 'ORDER' | 'SUBSCRIPTION' | 'PAYMENT' | 'SYSTEM' | 'PROMOTION';

export interface Notification {
  id: string;
  user_id?: string;
  account_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateNotificationRequest {
  user_id?: string;
  account_id?: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsUpdatedSubject = new BehaviorSubject<void>(undefined);
  public notificationsUpdated$ = this.notificationsUpdatedSubject.asObservable();
  
  private websocketSubscription?: Subscription;

  constructor(
    private apiService: ApiService,
    private webSocketService: WebSocketService,
    private authService: AuthService
  ) {
    // Subscribe to WebSocket notifications
    this.websocketSubscription = this.webSocketService.notifications$.subscribe(notification => {
      // Emit update event when notification is received via WebSocket
      this.notificationsUpdatedSubject.next(undefined);
    });
    
    // Connect WebSocket when user is authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.connectWebSocket(user.id, user.accountId || undefined);
      } else {
        this.disconnectWebSocket();
      }
    });
  }

  /**
   * Connect to WebSocket for real-time notifications
   */
  private connectWebSocket(userId: string, accountId?: string): void {
    try {
      this.webSocketService.connect(userId, accountId);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      // Don't throw - allow app to continue without WebSocket
    }
  }

  /**
   * Disconnect from WebSocket
   */
  private disconnectWebSocket(): void {
    this.webSocketService.disconnect();
  }

  /**
   * Get all notifications for the authenticated user
   */
  getNotifications(): Observable<Notification[]> {
    return this.apiService.get<Notification[]>('/notifications');
  }

  /**
   * Get unread count for the authenticated user
   */
  getUnreadCount(): Observable<number> {
    return this.apiService.get<number>('/notifications/unread-count');
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): Observable<void> {
    return new Observable(observer => {
      this.apiService.patch<void>(`/notifications/${id}/read`, {}).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<void> {
    return new Observable(observer => {
      this.apiService.patch<void>('/notifications/read-all', {}).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): Observable<void> {
    return new Observable(observer => {
      this.apiService.delete<void>(`/notifications/${id}`).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Get notifications for a specific account (ADMIN only)
   */
  getAccountNotifications(accountId: string): Observable<Notification[]> {
    return this.apiService.get<Notification[]>(`/notifications/accounts/${accountId}`);
  }

  /**
   * Get unread count for a specific account (ADMIN only)
   */
  getAccountUnreadCount(accountId: string): Observable<number> {
    return this.apiService.get<number>(`/notifications/accounts/${accountId}/unread-count`);
  }

  /**
   * Mark a notification as read for a specific account (ADMIN only)
   */
  markAccountNotificationAsRead(accountId: string, notificationId: string): Observable<void> {
    return new Observable(observer => {
      this.apiService.patch<void>(`/notifications/accounts/${accountId}/${notificationId}/read`, {}).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Mark all notifications as read for a specific account (ADMIN only)
   */
  markAllAccountNotificationsAsRead(accountId: string): Observable<void> {
    return new Observable(observer => {
      this.apiService.patch<void>(`/notifications/accounts/${accountId}/read-all`, {}).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Delete a notification for a specific account (ADMIN only)
   */
  deleteAccountNotification(accountId: string, notificationId: string): Observable<void> {
    return new Observable(observer => {
      this.apiService.delete<void>(`/notifications/accounts/${accountId}/${notificationId}`).subscribe({
        next: () => {
          this.notifyUpdate();
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Notify subscribers that notifications have been updated
   */
  private notifyUpdate(): void {
    this.notificationsUpdatedSubject.next(undefined);
  }
}
