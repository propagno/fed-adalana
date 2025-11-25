import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface TrackingLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  constructor(private apiService: ApiService) {}
  
  sendLocation(orderId: string, latitude: number, longitude: number): Observable<void> {
    return this.apiService.post<void>(`/tracking/orders/${orderId}/location`, {
      latitude,
      longitude
    });
  }
  
  getLatestLocation(orderId: string): Observable<TrackingLocation | null> {
    return this.apiService.get<TrackingLocation>(`/tracking/orders/${orderId}/location`);
  }
  
  // Polling a cada 30 segundos
  startLocationPolling(orderId: string): Observable<TrackingLocation | null> {
    return interval(30000).pipe(
      startWith(0),
      switchMap(() => this.getLatestLocation(orderId))
    );
  }
}

