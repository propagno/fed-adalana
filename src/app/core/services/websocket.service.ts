import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { Notification } from './notification.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client | null = null;
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  
  private notificationsSubject = new Subject<Notification>();
  public notifications$ = this.notificationsSubject.asObservable();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  constructor(private authService: AuthService) {}

  /**
   * Connect to WebSocket server
   * @param userId User ID for user-specific notifications
   * @param accountId Account ID for account-specific notifications (optional)
   */
  connect(userId: string, accountId?: string): void {
    if (this.client && this.client.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.error('Cannot connect WebSocket: No token available');
      return;
    }

    // Get base URL from environment and convert to WebSocket URL
    const baseUrl = this.getBaseUrl();
    const wsUrl = `${baseUrl.replace('http://', 'ws://').replace('https://', 'wss://')}/ws/notifications?token=${encodeURIComponent(token)}`;

    this.client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.connectionStatusSubject.next(true);
        this.reconnectAttempts = 0;

        // Subscribe to user-specific notifications
        if (userId) {
          this.subscribeToUserNotifications(userId);
        }

        // Subscribe to account-specific notifications
        if (accountId) {
          this.subscribeToAccountNotifications(accountId);
        }
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.connectionStatusSubject.next(false);
        this.attemptReconnect(userId, accountId);
      },
      onStompError: (frame: any) => {
        console.error('WebSocket STOMP error:', frame);
        this.connectionStatusSubject.next(false);
      },
      onWebSocketError: (event: Event) => {
        console.error('WebSocket error:', event);
        this.connectionStatusSubject.next(false);
      }
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connectionStatusSubject.next(false);
      console.log('WebSocket disconnected');
    }
  }

  /**
   * Subscribe to user-specific notifications
   */
  private subscribeToUserNotifications(userId: string): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    const destination = `/topic/notifications/user/${userId}`;
    this.client.subscribe(destination, (message: IMessage) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        console.log('Received user notification via WebSocket:', notification);
        this.notificationsSubject.next(notification);
      } catch (error) {
        console.error('Error parsing WebSocket notification:', error);
      }
    });
  }

  /**
   * Subscribe to account-specific notifications
   */
  private subscribeToAccountNotifications(accountId: string): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    const destination = `/topic/notifications/account/${accountId}`;
    this.client.subscribe(destination, (message: IMessage) => {
      try {
        const notification: Notification = JSON.parse(message.body);
        console.log('Received account notification via WebSocket:', notification);
        this.notificationsSubject.next(notification);
      } catch (error) {
        console.error('Error parsing WebSocket notification:', error);
      }
    });
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(userId: string, accountId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max WebSocket reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting WebSocket reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect(userId, accountId);
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Get base URL for WebSocket connection
   * Note: SockJS requires HTTP/HTTPS URLs, not ws/wss URLs
   * SockJS will handle the WebSocket upgrade internally
   */
  private getBaseUrl(): string {
    // Use the same base URL as API service from environment
    // SockJS requires HTTP/HTTPS, not ws/wss
    const apiUrl = environment.apiUrl || 'http://localhost:8080';
    return apiUrl;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

