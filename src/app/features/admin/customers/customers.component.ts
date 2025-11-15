import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../../core/services/customer.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { AdminService, LeadsMetrics } from '../../../core/services/admin.service';

type FilterType = 'all' | 'leads' | 'customers';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Clientes e Leads</h2>
          <p class="text-sm text-gray-600 mt-1">Gerencie leads e clientes da sua empresa</p>
        </div>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          {{ showCreateForm ? 'Cancelar' : '+ Novo Lead' }}
        </button>
      </div>

      <!-- Metrics Cards -->
      <div *ngIf="leadsMetrics" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card bg-gray-50">
          <h3 class="text-sm font-medium text-gray-600 mb-2">Total de Leads</h3>
          <p class="text-3xl font-bold text-gray-900">{{ leadsMetrics.total_leads }}</p>
        </div>
        <div class="card bg-primary-light text-white">
          <h3 class="text-sm font-medium text-white/90 mb-2">Total de Clientes</h3>
          <p class="text-3xl font-bold">{{ leadsMetrics.total_customers }}</p>
        </div>
        <div class="card bg-success text-white">
          <h3 class="text-sm font-medium text-white/90 mb-2">Leads Convertidos</h3>
          <p class="text-3xl font-bold">{{ leadsMetrics.converted_leads }}</p>
        </div>
        <div class="card bg-primary text-white">
          <h3 class="text-sm font-medium text-white/90 mb-2">Taxa de Conversão</h3>
          <p class="text-3xl font-bold">{{ formatPercentage(leadsMetrics.conversion_rate) }}</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="flex gap-2">
          <button 
            (click)="setFilter('all')" 
            [class]="activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'">
            Todos
          </button>
          <button 
            (click)="setFilter('leads')" 
            [class]="activeFilter === 'leads' ? 'btn-primary' : 'btn-secondary'">
            Apenas Leads
          </button>
          <button 
            (click)="setFilter('customers')" 
            [class]="activeFilter === 'customers' ? 'btn-primary' : 'btn-secondary'">
            Apenas Clientes
          </button>
        </div>
      </div>

      <!-- Create/Edit Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingCustomer ? 'Editar Cliente' : 'Novo Lead' }}
        </h3>
        <form (ngSubmit)="saveCustomer()" #customerForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nome *</label>
              <input [(ngModel)]="customerFormData.name" name="name" required class="input">
            </div>
            <div>
              <label class="label">Email *</label>
              <input type="email" [(ngModel)]="customerFormData.email" name="email" required class="input">
            </div>
            <div>
              <label class="label">Telefone *</label>
              <input [(ngModel)]="customerFormData.phone" name="phone" required class="input">
            </div>
            <div class="md:col-span-2">
              <label class="label">Endereço *</label>
              <textarea [(ngModel)]="customerFormData.address" name="address" required 
                        class="input" rows="3"></textarea>
            </div>
            <div>
              <label class="label">Dia Preferido de Entrega</label>
              <select [(ngModel)]="customerFormData.preferred_delivery_day" name="preferred_delivery_day" class="input">
                <option value="">Nenhum</option>
                <option value="mon">Segunda-feira</option>
                <option value="tue">Terça-feira</option>
                <option value="wed">Quarta-feira</option>
                <option value="thu">Quinta-feira</option>
                <option value="fri">Sexta-feira</option>
                <option value="sat">Sábado</option>
                <option value="sun">Domingo</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="label">Observações</label>
              <textarea [(ngModel)]="customerFormData.notes" name="notes" 
                        class="input" rows="2"></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="cancelForm()" class="btn-secondary">Cancelar</button>
            <button type="submit" [disabled]="saving" class="btn-primary">
              {{ saving ? 'Salvando...' : (editingCustomer ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
          <div *ngIf="error" class="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- Customers Table -->
      <div class="card">
        <div *ngIf="loading" class="text-center py-8 text-gray-500">Carregando clientes...</div>
        <div *ngIf="filteredCustomers && !loading">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-surface divide-y divide-gray-200">
                <tr *ngFor="let customer of filteredCustomers" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ customer.email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatPhone(customer.phone) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="getCustomerTypeClass(customer.customer_type)">
                      {{ getCustomerTypeLabel(customer.customer_type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="customer.active ? 'badge-success' : 'badge-error'">
                      {{ customer.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex justify-end gap-2">
                      <button 
                        *ngIf="customer.customer_type === 'LEAD'" 
                        (click)="promoteLead(customer)" 
                        class="text-primary hover:text-primary-dark">
                        Promover
                      </button>
                      <button (click)="editCustomer(customer)" class="text-primary hover:text-primary-dark">
                        Editar
                      </button>
                      <button (click)="deleteCustomer(customer)" class="text-error hover:text-error-dark">
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="filteredCustomers.length === 0" class="text-center py-8 text-gray-500">
            Nenhum {{ activeFilter === 'all' ? 'cliente' : activeFilter === 'leads' ? 'lead' : 'cliente' }} encontrado
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  editingCustomer: Customer | null = null;
  error: string | null = null;
  activeFilter: FilterType = 'all';
  leadsMetrics: LeadsMetrics | null = null;

  customerFormData: CreateCustomerRequest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    preferred_delivery_day: undefined,
    notes: undefined
  };

  constructor(
    private customerService: CustomerService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadLeadsMetrics();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.getCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading customers', err);
        this.error = 'Erro ao carregar clientes';
        this.loading = false;
      }
    });
  }

  loadLeadsMetrics(): void {
    this.adminService.getDashboardOverview().subscribe({
      next: (overview) => {
        if (overview.leads_metrics) {
          this.leadsMetrics = overview.leads_metrics;
        }
      },
      error: (err) => {
        console.error('Error loading leads metrics', err);
      }
    });
  }

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredCustomers = this.customers;
    } else if (this.activeFilter === 'leads') {
      this.filteredCustomers = this.customers.filter(c => c.customer_type === 'LEAD');
    } else if (this.activeFilter === 'customers') {
      this.filteredCustomers = this.customers.filter(c => c.customer_type === 'CUSTOMER');
    }
  }

  saveCustomer(): void {
    if (!this.customerFormData.name || !this.customerFormData.email || 
        !this.customerFormData.phone || !this.customerFormData.address) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.saving = true;
    this.error = null;

    if (this.editingCustomer) {
      const updateData: UpdateCustomerRequest = {
        name: this.customerFormData.name,
        email: this.customerFormData.email,
        phone: this.customerFormData.phone,
        address: this.customerFormData.address,
        preferred_delivery_day: this.customerFormData.preferred_delivery_day,
        notes: this.customerFormData.notes
      };
      this.customerService.updateCustomer(this.editingCustomer.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelForm();
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erro ao atualizar cliente';
        }
      });
    } else {
      this.customerService.createCustomer(this.customerFormData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelForm();
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erro ao criar cliente';
        }
      });
    }
  }

  editCustomer(customer: Customer): void {
    this.editingCustomer = customer;
    this.customerFormData = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      preferred_delivery_day: customer.preferred_delivery_day,
      notes: customer.notes
    };
    this.showCreateForm = true;
  }

  promoteLead(customer: Customer): void {
    if (confirm(`Tem certeza que deseja promover o lead ${customer.name} a cliente?`)) {
      this.customerService.promoteLeadToCustomer(customer.id).subscribe({
        next: () => {
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erro ao promover lead';
        }
      });
    }
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Tem certeza que deseja excluir o ${customer.customer_type === 'LEAD' ? 'lead' : 'cliente'} ${customer.name}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.error = err.error?.message || 'Erro ao excluir cliente';
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingCustomer = null;
    this.customerFormData = {
      name: '',
      email: '',
      phone: '',
      address: '',
      preferred_delivery_day: undefined,
      notes: undefined
    };
    this.error = null;
  }

  formatPhone(phone: string): string {
    return FormatUtil.formatPhone(phone);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getCustomerTypeLabel(type?: string): string {
    return type === 'LEAD' ? 'Lead' : type === 'CUSTOMER' ? 'Cliente' : 'N/A';
  }

  getCustomerTypeClass(type?: string): string {
    if (type === 'LEAD') {
      return 'badge badge-warning';
    } else if (type === 'CUSTOMER') {
      return 'badge badge-success';
    }
    return 'badge badge-secondary';
  }
}
