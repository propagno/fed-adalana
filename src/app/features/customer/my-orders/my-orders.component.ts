import { Component, OnInit } from "@angular/core";
import { CommonModule, NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  OrderService,
  OrderResponse,
} from "../../../core/services/order.service";
import { FormatUtil } from "../../../shared/utils/format.util";
import { ToastService } from "../../../core/services/toast.service";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { SkeletonLoaderComponent } from "../../../shared/components/skeleton/skeleton-loader.component";
import { ButtonComponent } from "../../../shared/components/design-system/button/button.component";
import { CardComponent } from "../../../shared/components/design-system/card/card.component";
import { BadgeComponent } from "../../../shared/components/design-system/badge/badge.component";
import { MapPinIconComponent } from "../../../shared/components/icons/map-pin-icon.component";
import { MarketplaceNavbarComponent } from "../../../shared/components/navbar/marketplace-navbar.component";
import { catchError, finalize } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: "app-my-orders",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgClass,
    EmptyStateComponent,
    SkeletonLoaderComponent,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    MapPinIconComponent,
    MarketplaceNavbarComponent,
  ],
  templateUrl: './my-orders.component.html',
  styles: [`
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes slide-up {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    @keyframes scale-in {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.2s ease-out;
    }
    @media (min-width: 768px) {
      .animate-slide-up {
        animation: scale-in 0.2s ease-out;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: OrderResponse[] = [];
  loading = false;

  // Cancellation request modal
  showCancellationRequestModal = false;
  // Details modal
  showDetailsModal = false;
  selectedOrder: OrderResponse | null = null;
  cancellationRequestReason = "";
  loadingCancellation = false;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  groupedOrders: { date: string; orders: OrderResponse[] }[] = [];

  loadOrders(): void {
    this.loading = true;
    this.orderService.getMyOrders().subscribe({
      next: (orders: OrderResponse[]) => {
        console.log('Orders received:', orders);
        // Sort orders by created_at descending (newest first)
        this.orders = orders.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : (a.delivery_date ? new Date(a.delivery_date).getTime() : 0);
          const dateB = b.created_at ? new Date(b.created_at).getTime() : (b.delivery_date ? new Date(b.delivery_date).getTime() : 0);
          return dateB - dateA;
        });
        
        this.groupOrdersByDate();
        console.log('Grouped orders:', this.groupedOrders);
        this.loading = false;
      },
      error: (err: any) => {
        console.error("Error loading orders", err);
        this.loading = false;
      },
    });
  }

  groupOrdersByDate(): void {
    const groups: { [key: string]: OrderResponse[] } = {};
    const today = new Date().toLocaleDateString('pt-BR');
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('pt-BR');

    this.orders.forEach(order => {
      // Use created_at, fallback to delivery_date, fallback to current date
      const dateToUse = order.created_at || order.delivery_date || new Date().toISOString();
      
      const date = new Date(dateToUse).toLocaleDateString('pt-BR');
      let label = date;
      
      if (date === today) label = 'Hoje';
      else if (date === yesterday) label = 'Ontem';
      
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(order);
    });

    // Convert to array and sort groups by date (newest first)
    this.groupedOrders = Object.keys(groups).map(date => ({
      date,
      orders: groups[date]
    })).sort((a, b) => {
      if (a.date === 'Hoje') return -1;
      if (b.date === 'Hoje') return 1;
      if (a.date === 'Ontem') return -1;
      if (b.date === 'Ontem') return 1;
      
      // Parse DD/MM/YYYY to compare
      const [dayA, monthA, yearA] = a.date.split('/').map(Number);
      const [dayB, monthB, yearB] = b.date.split('/').map(Number);
      const dateObjA = new Date(yearA, monthA - 1, dayA);
      const dateObjB = new Date(yearB, monthB - 1, dayB);
      
      return dateObjB.getTime() - dateObjA.getTime();
    });
  }

  getPaymentMethodLabel(method: string | undefined | null): string {
    if (!method) return 'Não informado';
    
    const methods: { [key: string]: string } = {
      'money': 'Dinheiro',
      'pix': 'Pix',
      'debit_card': 'Cartão de Débito',
      'credit_card': 'Cartão de Crédito',
      'meal_voucher': 'Vale Alimentação/Refeição',
      'food_voucher': 'Vale Alimentação/Refeição'
    };
    
    return methods[method.toLowerCase()] || method;
  }

  formatTime(dateString: string | undefined | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: string | undefined | null): string {
    if (!date) return '-';
    return FormatUtil.formatDate(date);
  }

  formatDateTime(date: string | undefined | null): string {
    if (!date) return '-';
    
    // If date is in format YYYY-MM-DD (without time), add default time
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      date = date + 'T00:00:00';
    }
    
    try {
      return FormatUtil.formatDateTime(date);
    } catch (e) {
      // Fallback to formatDate if formatDateTime fails
      return FormatUtil.formatDate(date);
    }
  }

  getStatusLabel(status: string | undefined | null): string {
    if (!status) return "Desconhecido";
    const labels: { [key: string]: string } = {
      pending: "Pendente",
      notified: "Notificado",
      confirmed: "Confirmado",
      in_transit: "Em Trânsito",
      delivered: "Entregue",
      cancelled: "Cancelado",
      cancelled_by_customer: "Cancelado",
      cancelled_by_company: "Cancelado pela Empresa",
      rejected: "Rejeitado",
      failed: "Falhou",
    };
    return labels[status] || status;
  }

  getStatusClass(status: string | undefined | null): string {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
    const classes: { [key: string]: string } = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      notified: "bg-blue-50 text-blue-700 border-blue-200",
      confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
      in_transit: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
      cancelled_by_customer: "bg-red-50 text-red-700 border-red-200",
      cancelled_by_company: "bg-red-50 text-red-700 border-red-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      failed: "bg-red-50 text-red-700 border-red-200",
    };
    return classes[status] || "bg-gray-100 text-gray-800 border-gray-200";
  }

  getStatusBorderColor(status: string | undefined | null): string {
    if (!status) return "border-l-gray-300";
    
    const classes: { [key: string]: string } = {
      pending: "border-l-yellow-400",
      notified: "border-l-blue-400",
      confirmed: "border-l-indigo-400",
      in_transit: "border-l-purple-400",
      delivered: "border-l-green-500",
      cancelled: "border-l-red-500",
      cancelled_by_customer: "border-l-red-500",
      cancelled_by_company: "border-l-red-500",
      rejected: "border-l-red-500",
      failed: "border-l-red-500",
    };
    return classes[status] || "border-l-gray-300";
  }

  getTimelineDotClass(status: string | undefined): string {
    if (!status) return "bg-gray-300";
    const classes: { [key: string]: string } = {
      pending: "bg-warning",
      notified: "bg-info",
      confirmed: "bg-success",
      in_transit: "bg-info",
      delivered: "bg-success",
      cancelled: "bg-error",
      cancelled_by_customer: "bg-error",
      cancelled_by_company: "bg-error",
      rejected: "bg-error",
      failed: "bg-error",
    };
    return classes[status] || "bg-gray-300";
  }

  getTimelineDotInnerClass(status: string | undefined): string {
    return "bg-white";
  }

  getStatusTimeline(currentStatus: string | undefined): string[] {
    if (!currentStatus) return [];
    
    // Don't show timeline for cancelled or rejected orders
    if (currentStatus === 'cancelled_by_customer' || 
        currentStatus === 'cancelled_by_company' || 
        currentStatus === 'rejected' || 
        currentStatus === 'failed') {
      return [];
    }
    
    const allStatuses = [
      "pending",
      "notified",
      "confirmed",
      "in_transit",
      "delivered",
    ];
    const currentIndex = allStatuses.indexOf(currentStatus);
    if (currentIndex === -1) {
      // If status not in timeline, return empty array
      return [];
    }
    return allStatuses.slice(0, currentIndex + 1);
  }

  getTimelineBadgeVariant(
    status: string | undefined,
    currentStatus: string | undefined,
  ):
    | "success"
    | "warning"
    | "error"
    | "info"
    | "primary"
    | "secondary"
    | "accent"
    | "neutral" {
    if (!status || !currentStatus) return "neutral";
    if (status === currentStatus) {
      // Map status to badge variant
      const variants: {
        [key: string]: "success" | "warning" | "error" | "info" | "primary" | "secondary" | "accent" | "neutral";
      } = {
        pending: "warning",
        notified: "info",
        confirmed: "success",
        in_transit: "info",
        delivered: "success",
        cancelled: "error",
        cancelled_by_customer: "error",
        cancelled_by_company: "error",
        rejected: "error",
        failed: "error",
      };
      return variants[status] || "info";
    }
    return "neutral";
  }

  getPaymentStatusLabel(status: string | undefined | null): string {
    if (!status) return "Desconhecido";
    const labels: { [key: string]: string } = {
      pending: "Pendente",
      paid: "Pago",
      refunded: "Reembolsado",
      failed: "Falhou",
    };
    return labels[status] || status;
  }

  formatCurrency(value: number | undefined | null): string {
    if (value === undefined || value === null) return '-';
    // Backend sends amount already in reais (not cents), so we don't divide by 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }
  
  formatCurrencyFromCents(value: number | undefined | null): string {
    if (value === undefined || value === null) return '-';
    // Use FormatUtil for values in cents (like item prices)
    return FormatUtil.formatCurrency(value);
  }

  reorder(order: OrderResponse | null | undefined): void {
    if (!order) return;
    // Navigate to catalog or product page
    this.router.navigate(["/catalog"]);
  }

  goToCatalog(): void {
    this.router.navigate(["/catalog"]);
  }

  canRequestCancellation(order: OrderResponse): boolean {
    if (!order) return false;
    return (
      order.status === "confirmed" &&
      order.acceptance_status === "accepted" &&
      !order.cancellation_requested_by_customer
    );
  }

  openCancellationRequestModal(order: OrderResponse | null | undefined): void {
    if (!order) return;
    this.selectedOrder = order;
    this.cancellationRequestReason = "";
    this.showCancellationRequestModal = true;
  }

  openDetailsModal(order: OrderResponse): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  requestCancellation(): void {
    if (!this.selectedOrder || !this.selectedOrder.id) {
      this.toastService.error('Erro: ID do pedido não disponível para cancelamento.');
      return;
    }

    this.loadingCancellation = true;
    this.orderService
      .requestCancellation(
        this.selectedOrder.id,
        this.cancellationRequestReason
      )
      .pipe(
        catchError((error: any) => {
          console.error("Error requesting cancellation:", error);
          this.toastService.error(
            "Erro ao solicitar cancelamento: " +
              (error.error?.message || error.message),
          );
          return of(null);
        }),
        finalize(() => {
          this.loadingCancellation = false;
          this.showCancellationRequestModal = false;
          this.selectedOrder = null;
          this.cancellationRequestReason = "";
        }),
      )
      .subscribe((order: OrderResponse | null) => {
        if (order) {
          this.toastService.success(
            "Solicitação de cancelamento enviada com sucesso",
          );
          this.loadOrders();
        }
      });
  }

  getCancellationRequestStatusLabel(status: string | undefined | null): string {
    if (!status) return "Desconhecido";
    const labels: { [key: string]: string } = {
      pending: "Aguardando aprovação",
      approved: "Cancelamento aprovado",
      rejected: "Cancelamento rejeitado",
    };
    return labels[status] || status;
  }

  isRejectedOrCancelled(status: string | undefined): boolean {
    return status === "rejected" || status === "cancelled_by_company";
  }

  getAcceptanceStatusBorderClass(status: string | undefined): string {
    if (status === 'accepted') return 'border-l-4 border-success';
    if (status === 'pending') return 'border-l-4 border-warning';
    if (this.isRejectedOrCancelled(status)) return 'border-l-4 border-error';
    return 'border-l-4';
  }

  getRejectionCancellationBorderClass(order: OrderResponse): string {
    if (order.rejection_reason) return 'border-l-4 border-error';
    if (order.cancellation_reason) return 'border-l-4 border-warning';
    return 'border-l-4';
  }

  getSelectedOrderDisplay(): string {
    if (!this.selectedOrder) return 'N/A';
    if (this.selectedOrder.order_number) return this.selectedOrder.order_number;
    if (this.selectedOrder.id) return '#' + this.selectedOrder.id.substring(0, 8);
    return 'N/A';
  }

  getOrderDisplayNumber(order: OrderResponse | null | undefined): string {
    if (!order) return 'N/A';
    if (order.order_number) return order.order_number;
    if (order.id) return '#' + order.id.substring(0, 8);
    return 'N/A';
  }
}
