import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
  accountId?: string;
}

export interface RegisterRequest {
  companyName: string;
  adminName: string;
  email: string;
  password: string;
  currency?: string;
  timezone?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  account_id: string | null;
  user_id: string;
  email: string;
  role: string;
}

export interface UserInfo {
  id: string;
  accountId: string | null;
  email: string;
  role: string;
  name?: string;
  emailVerified?: boolean;
}

export interface UserProfile {
  id: string;
  account_id: string | null;
  email: string;
  name: string;
  role: string;
  phone: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RegisterCustomerRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/login', credentials).subscribe({
        next: (response) => {
          this.setAuthData(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/register', data).subscribe({
        next: (response) => {
          this.setAuthData(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return new Observable(observer => {
        observer.error('No refresh token available');
      });
    }

    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/refresh', { refreshToken }).subscribe({
        next: (response) => {
          this.setAuthData(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.logout();
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Call backend to invalidate tokens
    if (accessToken && refreshToken) {
      this.apiService.post('/auth/logout', {
        accessToken: accessToken,
        refreshToken: refreshToken
      }).subscribe({
        next: () => {
          // Tokens invalidated successfully
        },
        error: (error) => {
          // Even if logout fails, clear local storage
          console.error('Error during logout:', error);
        },
        complete: () => {
          // Always clear local storage and navigate
          this.clearAuthData();
        }
      });
    } else {
      // No tokens to invalidate, just clear local storage
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUserProfile(): Observable<UserProfile> {
    return this.apiService.get<UserProfile>('/auth/me');
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role.toLowerCase() === role.toLowerCase();
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isDeliverer(): boolean {
    return this.hasRole('deliverer');
  }

  isOperator(): boolean {
    return this.hasRole('operator');
  }

  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }

  isCustomer(): boolean {
    return this.hasRole('customer');
  }

  registerCustomer(data: RegisterCustomerRequest): Observable<AuthResponse> {
    return new Observable(observer => {
      this.apiService.post<AuthResponse>('/auth/register/customer', data).subscribe({
        next: (response) => {
          this.setAuthData(response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  verifyEmail(token: string): Observable<any> {
    return this.apiService.post('/auth/verify-email', null, { token });
  }

  resendVerification(email: string): Observable<any> {
    return this.apiService.post('/auth/resend-verification', { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.apiService.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post('/auth/reset-password', { token, newPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    const request: ChangePasswordRequest = {
      current_password: currentPassword,
      new_password: newPassword
    };
    
    return new Observable(observer => {
      this.apiService.post<void>('/auth/change-password', request).subscribe({
        next: () => {
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
   * Redirects user to appropriate dashboard based on role
   */
  redirectByRole(role: string): void {
    switch(role) {
      case 'customer':
        this.router.navigate(['/catalog']);
        break;
      case 'admin':
      case 'operator':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'deliverer':
        this.router.navigate(['/deliverer']);
        break;
      case 'super_admin':
        this.router.navigate(['/super-admin/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

  private setAuthData(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    
    // Extract name from JWT token
    const tokenPayload = this.parseJwtToken(response.access_token);
    
    const userInfo: UserInfo = {
      id: response.user_id,
      accountId: response.account_id || null, // Explicitly handle null
      email: response.email,
      role: response.role,
      name: tokenPayload?.name || undefined
    };
    
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    this.currentUserSubject.next(userInfo);
  }

  private parseJwtToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT token', e);
      return null;
    }
  }

  private loadUserFromStorage(): void {
    const userInfoStr = localStorage.getItem('user_info');
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        this.currentUserSubject.next(userInfo);
      } catch (e) {
        console.error('Error loading user from storage', e);
        this.logout();
      }
    }
  }
}
