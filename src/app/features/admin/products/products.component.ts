import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, CreateProductRequest, UpdateProductRequest } from '../../../core/services/product.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';
import { ConfirmationService } from '../../../shared/services/confirmation.service';
import { ToastService } from '../../../shared/services/toast.service';
import { PageHeaderComponent } from '../../../shared/components/design-system/page-header/page-header.component';
import { DataListComponent } from '../../../shared/components/design-system/data-list/data-list.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    DataListComponent,
    ModalComponent,
    CardComponent,
    ButtonComponent
  ],
  templateUrl: './products.component.html',
  styles: []
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  editingProduct: Product | null = null;
  error: string | null = null;
  productImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  uploadingImage = false;
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  productFormData: CreateProductRequest = {
    name: '',
    sku: '',
    price: 0,
    interval: 'weekly',
    custom_interval_days: undefined,
    description: '',
    unit_type: ''
  };

  constructor(
    private productService: ProductService,
    private fileUploadService: FileUploadService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.toastService.error('Erro ao carregar produtos');
        this.error = 'Erro ao carregar produtos';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    let filtered = this.products;

    // Apply status filter
    if (this.statusFilter === 'active') {
      filtered = filtered.filter(p => p.active);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(p => !p.active);
    }

    // Apply search term
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term))
      );
    }

    this.filteredProducts = filtered;
  }

  setStatusFilter(filter: 'all' | 'active' | 'inactive'): void {
    this.statusFilter = filter;
    this.applySearch();
  }

  async saveProduct(): Promise<void> {
    if (!this.productFormData.name || !this.productFormData.sku || !this.productFormData.price || this.productFormData.price <= 0) {
      this.error = 'Por favor, preencha todos os campos obrigatórios';
      return;
    }

    this.saving = true;
    this.error = null;

    // Upload image first if selected
    if (this.selectedImageFile) {
      this.uploadingImage = true;
      try {
        const compressedFile = await this.fileUploadService.compressImage(this.selectedImageFile);
        this.fileUploadService.uploadImage(compressedFile, 'product').subscribe({
          next: (response) => {
            this.productFormData.image_url = response.url;
            this.uploadingImage = false;
            this.performSave();
          },
          error: (err) => {
            this.uploadingImage = false;
            this.error = 'Erro ao fazer upload da imagem: ' + (err.error?.error || 'Erro desconhecido');
            this.saving = false;
          }
        });
        return;
      } catch (err) {
        this.uploadingImage = false;
        this.error = 'Erro ao comprimir imagem';
        this.saving = false;
        return;
      }
    }

    this.performSave();
  }

  private performSave(): void {

    if (this.editingProduct) {
      const updateData: UpdateProductRequest = {
        name: this.productFormData.name,
        price: this.productFormData.price,
        interval: this.productFormData.interval,
        custom_interval_days: this.productFormData.custom_interval_days,
        description: this.productFormData.description,
        unit_type: this.productFormData.unit_type,
        image_url: this.productFormData.image_url
      };
      this.productService.updateProduct(this.editingProduct.id, updateData).subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Produto atualizado com sucesso!');
          this.cancelForm();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao atualizar produto');
          this.error = err.error?.message || 'Erro ao atualizar produto';
        }
      });
    } else {
      this.productService.createProduct(this.productFormData).subscribe({
        next: () => {
          this.saving = false;
          this.toastService.success('Produto criado com sucesso!');
          this.cancelForm();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.toastService.error(err.error?.message || 'Erro ao criar produto');
          this.error = err.error?.message || 'Erro ao criar produto';
        }
      });
    }
  }

  editProduct(product: Product): void {
    this.editingProduct = product;
    this.productFormData = {
      name: product.name,
      sku: product.sku,
      price: product.price || (product.price_cents ? product.price_cents / 100 : 0),
      interval: product.interval,
      custom_interval_days: product.custom_interval_days,
      description: product.description || '',
      unit_type: product.unit_type || '',
      image_url: product.image_url || ''
    };
    this.productImagePreview = null;
    this.selectedImageFile = null;
    this.showCreateForm = true;
  }

  toggleProductStatus(product: Product): void {
    const action = product.active ? 'desativar' : 'ativar';
    this.confirmationService.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Produto`,
      message: `Tem certeza que deseja ${action} o produto ${product.name}?`,
      confirmLabel: action.charAt(0).toUpperCase() + action.slice(1),
      cancelLabel: 'Cancelar',
      confirmVariant: product.active ? 'warning' : 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        const serviceAction = product.active
          ? this.productService.deactivateProduct(product.id)
          : this.productService.activateProduct(product.id);

        serviceAction.subscribe({
          next: () => {
            this.toastService.success(`Produto ${action === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
            this.loadProducts();
          },
          error: (err) => {
            this.toastService.error(err.error?.message || `Erro ao ${action} produto`);
            this.error = err.error?.message || `Erro ao ${action} produto`;
          }
        });
      }
    });
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.editingProduct = null;
    this.productFormData = {
      name: '',
      sku: '',
      price: 0,
      interval: 'weekly',
      custom_interval_days: undefined,
      description: '',
      unit_type: '',
      image_url: ''
    };
    this.productImagePreview = null;
    this.selectedImageFile = null;
    this.error = null;
  }

  onImageSelected(event: Event, input: HTMLInputElement): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'Por favor, selecione um arquivo de imagem';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      this.error = 'A imagem deve ter no máximo 5MB';
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.productImagePreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.productImagePreview = null;
    this.productFormData.image_url = '';
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBaseUrl = environment.apiUrl || 'http://localhost:8080';
    return `${apiBaseUrl}${imageUrl}`;
  }

  onIntervalChange(): void {
    if (this.productFormData.interval !== 'custom') {
      this.productFormData.custom_interval_days = undefined;
    }
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrency(value);
  }

  formatPrice(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getIntervalLabel(interval: string, customDays?: number): string {
    const labels: { [key: string]: string } = {
      daily: 'Diário',
      weekly: 'Semanal',
      biweekly: 'Quinzenal',
      monthly: 'Mensal',
      quarterly: 'Trimestral',
      custom: customDays ? `${customDays} dias` : 'Personalizado'
    };
    return labels[interval] || interval;
  }
}

