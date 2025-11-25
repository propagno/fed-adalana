import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { AdminService, DashboardOverview } from '../../../core/services/admin.service';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { ToastService } from '../../../shared/services/toast.service';
import { filter } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent, SkeletonLoaderComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  overview: DashboardOverview | null = null;
  loading = true;
  error: string | null = null;
  private subscriptions = new Subscription();

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    
    // Atualizar dashboard quando navegar de volta para esta página
    this.subscriptions.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe((event: any) => {
        if (event.url === '/admin' || event.url === '/admin/') {
          this.loadDashboard();
        }
      })
    );
    
    // Atualizar dashboard a cada 30 segundos
    this.subscriptions.add(
      interval(30000).subscribe(() => {
        this.loadDashboard();
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getDashboardOverview().subscribe({
      next: (data) => {
        this.overview = data;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar dashboard');
        this.error = 'Erro ao carregar dashboard';
        this.loading = false;
        console.error('Error loading dashboard', err);
      }
    });
  }

  formatCurrency(value: number, currency: string): string {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL'
    }).format(value);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? '↑' : '↓';
  }

  getGrowthColor(growth: number): string {
    return growth >= 0 ? 'text-success' : 'text-error';
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
