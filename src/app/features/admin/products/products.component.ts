import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, CreateProductRequest, UpdateProductRequest } from '../../../core/services/product.service';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <!-- Header Actions -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">Produtos</h2>
          <p class="text-sm text-gray-600 mt-1">Gerencie os produtos da sua empresa</p>
        </div>
        <button (click)="showCreateForm = !showCreateForm" class="btn-primary">
          {{ showCreateForm ? 'Cancelar' : '+ Novo Produto' }}
        </button>
      </div>

      <!-- Create Form -->
      <div *ngIf="showCreateForm" class="card mb-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          {{ editingProduct ? 'Editar Produto' : 'Novo Produto' }}
        </h3>
        <form (ngSubmit)="saveProduct()" #productForm="ngForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">Nome *</label>
              <input [(ngModel)]="productFormData.name" name="name" required class="input">
            </div>
            <div>
              <label class="label">Código do Produto *</label>
              <input [(ngModel)]="productFormData.sku" name="sku" required class="input" 
                     pattern="^[A-Za-z0-9-_]+$"
                     placeholder="Ex: PROD-001">
            </div>
            <div>
              <label class="label">Preço (R$) *</label>
              <input type="number" [(ngModel)]="productFormData.price" name="price" 
                     required min="0" step="0.01" class="input">
            </div>
            <div>
              <label class="label">Intervalo de Entrega *</label>
              <select [(ngModel)]="productFormData.interval" name="interval" required class="input"
                      (change)="onIntervalChange()">
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quinzenal</option>
                <option value="monthly">Mensal</option>
                <option value="quarterly">Trimestral</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
            <div *ngIf="productFormData.interval === 'custom'">
              <label class="label">Dias Personalizados *</label>
              <input type="number" [(ngModel)]="productFormData.custom_interval_days" 
                     name="custom_interval_days" required min="1" max="365" class="input">
            </div>
            <div class="md:col-span-2">
              <label class="label">Informações Gerais</label>
              <textarea [(ngModel)]="productFormData.description" name="description" 
                        class="input" rows="4" placeholder="Descreva as características do produto..."></textarea>
            </div>
            <div>
              <label class="label">Tipo de Unidade</label>
              <input type="text" [(ngModel)]="productFormData.unit_type" name="unit_type" 
                     class="input" placeholder="Ex: Placa com 30 ovos">
            </div>
            <div class="md:col-span-2">
              <label class="label">Imagem do Produto</label>
              <div class="space-y-3">
                <input type="file" 
                       #imageInput
                       (change)="onImageSelected($event, imageInput)"
                       accept="image/*"
                       class="input">
                <div *ngIf="productImagePreview" class="mt-3">
                  <img [src]="productImagePreview" 
                       alt="Preview" 
                       class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300">
                  <button type="button" 
                          (click)="removeImage()" 
                          class="mt-2 text-sm text-red-600 hover:text-red-700">
                    Remover imagem
                  </button>
                </div>
                <div *ngIf="productFormData.image_url && !productImagePreview" class="mt-3">
                  <p class="text-sm text-gray-600">Imagem atual:</p>
                  <img [src]="getImageUrl(productFormData.image_url)" 
                       alt="Current image" 
                       class="w-32 h-32 object-cover rounded-lg border-2 border-gray-300 mt-2">
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" (click)="cancelForm()" class="btn-secondary">Cancelar</button>
            <button type="submit" [disabled]="saving" class="btn-primary">
              {{ saving ? 'Salvando...' : (editingProduct ? 'Atualizar' : 'Criar') }}
            </button>
          </div>
          <div *ngIf="error" class="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
            {{ error }}
          </div>
        </form>
      </div>

      <!-- Products List -->
      <div class="card">
        <div *ngIf="loading" class="text-center py-8 text-gray-500">Carregando produtos...</div>
        <div *ngIf="products && !loading">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Intervalo</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody class="bg-surface divide-y divide-gray-200">
                <tr *ngFor="let product of products" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ product.sku }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatPrice(product.price || (product.price_cents ? product.price_cents / 100 : 0)) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ getIntervalLabel(product.interval, product.custom_interval_days) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span [class]="product.active ? 'badge-success' : 'badge-error'">
                      {{ product.active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="editProduct(product)" class="text-primary hover:text-primary-dark mr-3">
                      Editar
                    </button>
                    <button (click)="toggleProductStatus(product)" 
                            [class]="product.active ? 'text-warning hover:text-warning-dark' : 'text-success hover:text-success-dark'">
                      {{ product.active ? 'Desativar' : 'Ativar' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="products.length === 0" class="text-center py-8 text-gray-500">
            Nenhum produto cadastrado
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  saving = false;
  showCreateForm = false;
  editingProduct: Product | null = null;
  error: string | null = null;
  productImagePreview: string | null = null;
  selectedImageFile: File | null = null;
  uploadingImage = false;

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
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Erro ao carregar produtos';
        this.loading = false;
      }
    });
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
          this.cancelForm();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.error = err.error?.message || 'Erro ao atualizar produto';
        }
      });
    } else {
      this.productService.createProduct(this.productFormData).subscribe({
        next: () => {
          this.saving = false;
          this.cancelForm();
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
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
    const action = product.active
      ? this.productService.deactivateProduct(product.id)
      : this.productService.activateProduct(product.id);

    action.subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao alterar status do produto';
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

