import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from './api.service';

export interface CartItem {
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface CartResponse {
  id: string;
  accountId: string;
  promotionCode?: string;
  discountAmountCents: number;
  subtotalCents: number;
  totalAmountCents: number;
  itemCount: number;
  totalQuantity: number;
  items: CartItem[];
}

export interface AddItemToCartRequest {
  product_id: string; // Backend expects snake_case in JSON
  quantity: number;
}

export interface CheckoutRequest {
  account_id: string; // Backend requires account_id
  delivery_date: string; // ISO date string
  delivery_datetime?: string; // ISO datetime string
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  payment_method: string; // 'PIX' | 'CREDIT_CARD' | 'PENDING'
  notes?: string;
  promotion_code?: string;
  delivery_fee_cents?: number; // Delivery fee in cents
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly SESSION_ID_PREFIX = 'cartSessionId_';
  
  // Subject to notify components when cart is updated
  private cartUpdatedSubject = new Subject<{ accountId: string; cart: CartResponse }>();
  public cartUpdated$ = this.cartUpdatedSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Gets or creates a session ID for the given account.
   * Stores it in localStorage for persistence across page navigations.
   */
  private getCartSessionId(accountId: string): string {
    const key = `${this.SESSION_ID_PREFIX}${accountId}`;
    let sessionId = localStorage.getItem(key);

    if (!sessionId) {
      // Generate a new session ID
      sessionId = `session_${this.generateUUID()}`;
      localStorage.setItem(key, sessionId);
    }

    return sessionId;
  }

  /**
   * Generates a UUID v4.
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Gets the cart headers with session ID.
   */
  private getCartHeaders(accountId: string): HttpHeaders {
    return new HttpHeaders({
      'X-Cart-Session-Id': this.getCartSessionId(accountId)
    });
  }

  /**
   * Gets the cart for an account.
   */
  getCart(accountId: string): Observable<CartResponse> {
    return this.apiService.get<any>(
      `/cart/${accountId}`,
      undefined,
      false,
      this.getCartHeaders(accountId)
    ).pipe(
      map((response: any) => this.mapCartResponse(response))
    );
  }

  /**
   * Maps backend snake_case response to frontend camelCase interface.
   */
  private mapCartResponse(response: any): CartResponse {
    return {
      id: response.id || '',
      accountId: response.account_id || response.accountId || '',
      promotionCode: response.promotion_code || response.promotionCode,
      discountAmountCents: response.discount_amount_cents || response.discountAmountCents || 0,
      subtotalCents: response.subtotal_cents || response.subtotalCents || 0,
      totalAmountCents: response.total_amount_cents || response.totalAmountCents || 0,
      itemCount: response.item_count || response.itemCount || 0,
      totalQuantity: response.total_quantity || response.totalQuantity || 0,
      items: (response.items || []).map((item: any) => ({
        productId: item.product_id || item.productId || '',
        productName: item.product_name || item.productName,
        productSku: item.product_sku || item.productSku,
        quantity: item.quantity || 0,
        unitPriceCents: item.unit_price_cents || item.unitPriceCents || 0,
        subtotalCents: item.subtotal_cents || item.subtotalCents || 0
      }))
    };
  }

  /**
   * Adds an item to the cart.
   */
  addItemToCart(accountId: string, request: AddItemToCartRequest): Observable<CartResponse> {
    return this.apiService.post<any>(
      `/cart/${accountId}/items`,
      request,
      undefined,
      this.getCartHeaders(accountId)
    ).pipe(
      map((response: any) => this.mapCartResponse(response)),
      tap((cart: CartResponse) => {
        // Notify all subscribers that cart was updated
        this.cartUpdatedSubject.next({ accountId, cart });
      })
    );
  }

  /**
   * Updates the quantity of an item in the cart.
   */
  updateItemQuantity(accountId: string, productId: string, quantity: number): Observable<CartResponse> {
    if (!productId || productId === 'undefined') {
      throw new Error('Product ID is required');
    }
    const headers = this.getCartHeaders(accountId);
    // Merge headers into params for put method
    const params = { quantity };
    return this.apiService.put<any>(
      `/cart/${accountId}/items/${productId}`,
      null,
      params,
      headers
    ).pipe(
      map((response: any) => this.mapCartResponse(response)),
      tap((cart: CartResponse) => {
        // Notify all subscribers that cart was updated
        this.cartUpdatedSubject.next({ accountId, cart });
      })
    );
  }

  /**
   * Removes an item from the cart.
   */
  removeItemFromCart(accountId: string, productId: string): Observable<CartResponse> {
    if (!productId || productId === 'undefined') {
      throw new Error('Product ID is required');
    }
    return this.apiService.delete<any>(
      `/cart/${accountId}/items/${productId}`,
      undefined,
      this.getCartHeaders(accountId)
    ).pipe(
      map((response: any) => this.mapCartResponse(response)),
      tap((cart: CartResponse) => {
        // Notify all subscribers that cart was updated
        this.cartUpdatedSubject.next({ accountId, cart });
      })
    );
  }

  /**
   * Applies a promotion code to the cart.
   */
  applyPromotion(accountId: string, promotionCode: string): Observable<CartResponse> {
    return this.apiService.post<any>(
      `/cart/${accountId}/promotion`,
      { code: promotionCode }, // Backend expects { code: string } in ApplyPromotionRequest
      undefined,
      this.getCartHeaders(accountId)
    ).pipe(
      map((response: any) => this.mapCartResponse(response)),
      tap((cart: CartResponse) => {
        // Notify all subscribers that cart was updated
        this.cartUpdatedSubject.next({ accountId, cart });
      })
    );
  }

  /**
   * Removes the promotion code from the cart.
   */
  removePromotion(accountId: string): Observable<CartResponse> {
    return this.apiService.delete<any>(
      `/cart/${accountId}/promotion`,
      undefined,
      this.getCartHeaders(accountId)
    ).pipe(
      map((response: any) => this.mapCartResponse(response)),
      tap((cart: CartResponse) => {
        // Notify all subscribers that cart was updated
        this.cartUpdatedSubject.next({ accountId, cart });
      })
    );
  }

  /**
   * Clears the cart session ID for an account.
   * Useful when logging out or switching accounts.
   */
  clearCartSession(accountId: string): void {
    const key = `${this.SESSION_ID_PREFIX}${accountId}`;
    localStorage.removeItem(key);
  }

  /**
   * Clears guest cart tracking (alias for clearCartSession).
   * @deprecated Use clearCartSession instead
   */
  clearGuestCartTracking(accountId: string): void {
    this.clearCartSession(accountId);
  }

  /**
   * Checkout cart - creates an order from cart items.
   * Requires authentication (CUSTOMER role).
   */
  checkout(accountId: string, request: CheckoutRequest): Observable<any> {
    return this.apiService.post<any>(
      `/cart/${accountId}/checkout`,
      request,
      undefined,
      this.getCartHeaders(accountId)
    );
  }
}

