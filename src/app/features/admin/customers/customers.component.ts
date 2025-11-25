import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, Customer, CreateCustomerRequest, UpdateCustomerRequest } from '../../../core/services/customer.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { AdminService, LeadsMetrics } from '../../../core/services/admin.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DataListComponent } from '../../../shared/components/design-system/data-list/data-list.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';

type FilterType = 'all' | 'leads' | 'customers';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataListComponent,
    ModalComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent
  ],
  templateUrl: './customers.component.html',
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
  searchTerm = '';

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
    private adminService: AdminService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
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
        this.applySearch();
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
    this.applySearch();
  }

  applyFilter(): void {
    this.applySearch();
  }

  applySearch(): void {
    let filtered = this.customers;

    // Apply type filter
    if (this.activeFilter === 'leads') {
      filtered = filtered.filter(c => c.customer_type === 'LEAD');
    } else if (this.activeFilter === 'customers') {
      filtered = filtered.filter(c => c.customer_type === 'CUSTOMER');
    }

    // Apply search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term))
      );
    }

    this.filteredCustomers = filtered;
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
          this.toastService.success('Cliente atualizado com sucesso!');
          this.cancelForm();
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao atualizar cliente');
          this.error = err.error?.message || 'Erro ao atualizar cliente';
        }
      });
    } else {
      this.customerService.createCustomer(this.customerFormData).subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Lead criado com sucesso!');
          this.cancelForm();
          this.loadCustomers();
          this.loadLeadsMetrics();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao criar cliente');
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
    this.confirmationService.confirm({
      title: 'Promover Lead',
      message: `Tem certeza que deseja promover o lead ${customer.name} a cliente?`,
      confirmLabel: 'Promover',
      cancelLabel: 'Cancelar',
      confirmVariant: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.customerService.promoteLeadToCustomer(customer.id).subscribe({
          next: () => {
            this.toastService.success('Lead promovido a cliente com sucesso!');
            this.loadCustomers();
            this.loadLeadsMetrics();
          },
          error: (err) => {
            this.toastService.error(err.error?.message || 'Erro ao promover lead');
            this.error = err.error?.message || 'Erro ao promover lead';
          }
        });
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    this.confirmationService.confirm({
      title: 'Excluir ' + (customer.customer_type === 'LEAD' ? 'Lead' : 'Cliente'),
      message: `Tem certeza que deseja excluir o ${customer.customer_type === 'LEAD' ? 'lead' : 'cliente'} ${customer.name}? Esta ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      confirmVariant: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.customerService.deleteCustomer(customer.id).subscribe({
          next: () => {
            this.toastService.success(`${customer.customer_type === 'LEAD' ? 'Lead' : 'Cliente'} excluído com sucesso!`);
            this.loadCustomers();
            this.loadLeadsMetrics();
          },
          error: (err) => {
            this.toastService.error(err.error?.message || 'Erro ao excluir cliente');
            this.error = err.error?.message || 'Erro ao excluir cliente';
          }
        });
      }
    });
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
}

