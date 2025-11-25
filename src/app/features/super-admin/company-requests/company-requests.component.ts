import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { ToastService } from '../../../shared/services/toast.service';
import { CompanyRequestService, CompanyRegistrationRequest } from '../../../core/services/company-request.service';

@Component({
  selector: 'app-company-requests',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ModalComponent,
    EmptyStateComponent,
    SkeletonLoaderComponent
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Solicitações de Cadastro</h1>
        <app-button variant="ghost" (click)="loadRequests()">
          <span class="material-icons text-lg mr-2">refresh</span>
          Atualizar
        </app-button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-skeleton-loader *ngFor="let i of [1,2,3]" height="300px"></app-skeleton-loader>
      </div>

      <!-- Empty State -->
      <app-empty-state
        *ngIf="!loading && requests.length === 0"
        icon="business"
        title="Nenhuma solicitação pendente"
        message="Todas as solicitações foram revisadas"
      ></app-empty-state>

      <!-- Requests Grid -->
      <div *ngIf="!loading && requests.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <app-card *ngFor="let request of requests" class="hover:shadow-lg transition-shadow">
          <div class="flex flex-col h-full">
            <!-- Company Name -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-xl font-semibold text-gray-900 mb-1">{{ request.companyName }}</h3>
                <p *ngIf="request.tradeName" class="text-sm text-gray-600">{{ request.tradeName }}</p>
              </div>
              <app-badge [variant]="getStatusVariant(request.status)">
                {{ getStatusLabel(request.status) }}
              </app-badge>
            </div>

            <!-- Company Details -->
            <div class="space-y-2 mb-4 flex-grow">
              <div class="flex items-center text-sm text-gray-700">
                <span class="material-icons text-lg mr-2 text-gray-400">badge</span>
                <span class="font-medium">{{ request.documentType }}:</span>
                <span class="ml-2">{{ formatDocument(request.documentNumber, request.documentType) }}</span>
              </div>
              
              <div class="flex items-center text-sm text-gray-700">
                <span class="material-icons text-lg mr-2 text-gray-400">person</span>
                <span>{{ request.adminName }}</span>
              </div>
              
              <div class="flex items-center text-sm text-gray-700">
                <span class="material-icons text-lg mr-2 text-gray-400">email</span>
                <span>{{ request.email }}</span>
              </div>
              
              <div class="flex items-center text-sm text-gray-700">
                <span class="material-icons text-lg mr-2 text-gray-400">phone</span>
                <span>{{ request.phone }}</span>
              </div>
              
              <div *ngIf="request.category" class="flex items-center text-sm text-gray-700">
                <span class="material-icons text-lg mr-2 text-gray-400">category</span>
                <span>{{ request.category }}</span>
              </div>

              <div class="flex items-center text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200">
                <span class="material-icons text-lg mr-2">schedule</span>
                <span>{{ formatDate(request.createdAt) }}</span>
              </div>
            </div>

            <!-- Actions for Pending Requests -->
            <div *ngIf="request.status === 'PENDING'" class="flex gap-2 mt-4">
              <app-button
                variant="primary"
                size="sm"
                class="flex-1"
                (click)="approve(request)"
                [disabled]="processing"
              >
                <span class="material-icons text-sm mr-1">check_circle</span>
                Aprovar
              </app-button>
              
              <app-button
                variant="danger"
                size="sm"
                class="flex-1"
                (click)="openRejectModal(request)"
                [disabled]="processing"
              >
                <span class="material-icons text-sm mr-1">cancel</span>
                Rejeitar
              </app-button>
            </div>

            <!-- Info for Processed Requests -->
            <div *ngIf="request.status !== 'PENDING'" class="mt-4 p-3 rounded-lg" 
                 [ngClass]="{
                   'bg-green-50': request.status === 'APPROVED',
                   'bg-red-50': request.status === 'REJECTED'
                 }">
              <p class="text-sm font-medium" [ngClass]="{
                'text-green-800': request.status === 'APPROVED',
                'text-red-800': request.status === 'REJECTED'
              }">
                {{ request.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado' }} em {{ formatDate(request.reviewedAt) }}
              </p>
              <p *ngIf="request.rejectionReason" class="text-sm text-red-700 mt-1">
                Motivo: {{ request.rejectionReason }}
              </p>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Rejection Modal -->
      <app-modal [isOpen]="showRejectModal" (closed)="closeRejectModal()" title="Rejeitar Solicitação">
        <div class="space-y-4">
          <p class="text-gray-700">
            Você está prestes a rejeitar a solicitação de cadastro de <strong>{{ selectedRequest?.companyName }}</strong>.
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Rejeição *
            </label>
            <textarea
              [(ngModel)]="rejectionReason"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Explique o motivo da rejeição..."
            ></textarea>
          </div>

          <div class="flex gap-3 justify-end mt-6">
            <app-button
              variant="ghost"
              (click)="closeRejectModal()"
              [disabled]="processing"
            >
              Cancelar
            </app-button>
            
            <app-button
              variant="danger"
              (click)="confirmReject()"
              [disabled]="processing || !rejectionReason.trim()"
            >
              <span *ngIf="!processing">Confirmar Rejeição</span>
              <span *ngIf="processing">Rejeitando...</span>
            </app-button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
  styles: []
})
export class CompanyRequestsComponent implements OnInit {
  requests: CompanyRegistrationRequest[] = [];
  loading = true;
  processing = false;
  showRejectModal = false;
  selectedRequest: CompanyRegistrationRequest | null = null;
  rejectionReason = '';

  constructor(
    private companyRequestService: CompanyRequestService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.companyRequestService.listPending().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.loading = false;
      },
      error: (err) => {
        this.toastService.error('Não foi possível carregar as solicitações');
        this.loading = false;
      }
    });
  }

  approve(request: CompanyRegistrationRequest) {
    if (!confirm(`Tem certeza que deseja aprovar o cadastro de ${request.companyName}?`)) {
      return;
    }

    this.processing = true;
    this.companyRequestService.approve(request.id).subscribe({
      next: () => {
        this.toastService.success('Empresa aprovada e cadastrada com sucesso!');
        this.processing = false;
        this.loadRequests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Não foi possível aprovar a solicitação');
        this.processing = false;
      }
    });
  }

  openRejectModal(request: CompanyRegistrationRequest) {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectionReason = '';
  }

  confirmReject() {
    if (!this.selectedRequest || !this.rejectionReason.trim()) {
      return;
    }

    this.processing = true;
    this.companyRequestService.reject(this.selectedRequest.id, this.rejectionReason).subscribe({
      next: () => {
        this.toastService.success('Solicitação rejeitada');
        this.processing = false;
        this.closeRejectModal();
        this.loadRequests();
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Não foi possível rejeitar a solicitação');
        this.processing = false;
      }
    });
  }

  getStatusVariant(status: string): 'success' | 'error' | 'warning' | 'neutral' {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'Aprovado';
      case 'REJECTED':
        return 'Rejeitado';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  }

  formatDocument(doc: string, type: string): string {
    if (!doc) return '';
    const cleaned = doc.replace(/\D/g, '');
    
    if (type === 'CNPJ' && cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    } else if (type === 'CPF' && cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return doc;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
