import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { InputComponent } from '../../../shared/components/design-system/input/input.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ToastService } from '../../../shared/services/toast.service';
import { AccountService } from '../../../core/services/account.service';
import { SubscriptionClubService, SubscriptionClub, CreateSubscriptionClubRequest, UpdateSubscriptionClubRequest } from '../../../core/services/subscription-club.service';
import { ProductService, Product } from '../../../core/services/product.service';

@Component({
  selector: 'app-subscription-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, CardComponent, BadgeComponent, InputComponent, ModalComponent],
  template: `
    <div class="container mx-auto px-4 py-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-h1 text-primary">Clubes de Assinatura</h1>
          <p class="text-body text-gray-600 mt-1">Gerencie os clubes VIP da sua empresa</p>
        </div>
        <app-button variant="primary" 
                    label="Criar Clube" 
                    (clicked)="showCreateModal = true">
        </app-button>
      </div>
      
      <!-- Lista de Clubes -->
      <div *ngIf="loading" class="text-center py-8 text-gray-500">
        Carregando clubes...
      </div>
      
      <div *ngIf="!loading && clubs.length === 0" class="text-center py-12">
        <p class="text-body text-gray-600 mb-4">Nenhum clube criado ainda.</p>
        <app-button variant="primary" 
                    label="Criar Primeiro Clube" 
                    (clicked)="showCreateModal = true">
        </app-button>
      </div>
      
      <div *ngIf="!loading && clubs.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <app-card *ngFor="let club of clubs" [elevation]="1" padding="lg">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-h3 text-primary mb-1">{{ club.name }}</h3>
              <app-badge [variant]="club.active ? 'success' : 'error'"
                         [label]="club.active ? 'Ativo' : 'Inativo'">
              </app-badge>
            </div>
            <div class="flex gap-2">
              <button (click)="editClub(club)"
                      class="p-2 text-primary-light hover:bg-primary-light/10 rounded-lg transition-colors"
                      aria-label="Editar clube">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button (click)="deleteClub(club)"
                      class="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      aria-label="Deletar clube">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button (click)="toggleClub(club)"
                      class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      [attr.aria-label]="club.active ? 'Desativar clube' : 'Ativar clube'">
                <svg *ngIf="club.active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <svg *ngIf="!club.active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <p class="text-body text-gray-600 mb-4">{{ club.description }}</p>
          
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-body-sm">
              <span class="text-gray-600">Taxa Mensal</span>
              <span class="font-medium">R$ {{ club.monthlyFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-body-sm">
              <span class="text-gray-600">Desconto</span>
              <span class="font-medium text-success">{{ club.discountPercentage }}%</span>
            </div>
            <div class="flex justify-between text-body-sm" *ngIf="club.subscribersCount !== undefined">
              <span class="text-gray-600">Assinantes</span>
              <span class="font-medium">{{ club.subscribersCount }}</span>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <p class="text-body-sm font-medium mb-2">Benefícios:</p>
            <ul class="space-y-1">
              <li *ngFor="let benefit of club.benefits" class="text-body-sm text-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>{{ benefit }}</span>
              </li>
            </ul>
          </div>
        </app-card>
      </div>
      
      <!-- Modal de Criação/Edição -->
      <app-modal [isOpen]="showCreateModal"
                 [title]="editingClub ? 'Editar Clube' : 'Criar Clube'"
                 [showFooter]="false"
                 (closed)="closeModal()">
        <form [formGroup]="clubForm" class="space-y-4" (ngSubmit)="saveClub()">
          <app-input formControlName="name"
                     label="Nome do Clube"
                     [required]="true"
                     [maxLength]="100"
                     placeholder="Ex: Clube VIP Padaria do João">
          </app-input>
          
          <div>
            <label class="block text-body font-medium mb-2">Descrição</label>
            <textarea formControlName="description"
                      rows="3"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                      placeholder="Descreva os benefícios do clube...">
            </textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <app-input formControlName="monthlyFee"
                       type="number"
                       label="Taxa Mensal (R$)"
                       [required]="true"
                       [min]="0"
                       [step]="0.01">
            </app-input>
            
            <app-input formControlName="discountPercentage"
                       type="number"
                       label="Desconto (%)"
                       [required]="true"
                       [min]="0"
                       [max]="100">
            </app-input>
          </div>
          
          <div>
            <label class="block text-body font-medium mb-2">Produtos do Clube</label>
            <p class="text-body-sm text-gray-600 mb-3">
              Selecione os produtos que serão incluídos automaticamente nas assinaturas deste clube
            </p>
            <div *ngIf="loadingProducts" class="text-body-sm text-gray-500 py-2">
              Carregando produtos...
            </div>
            <div *ngIf="!loadingProducts && availableProducts.length === 0" class="text-body-sm text-gray-500 py-2">
              Nenhum produto cadastrado. Cadastre produtos primeiro.
            </div>
            <div *ngIf="!loadingProducts && availableProducts.length > 0" 
                 class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              <label *ngFor="let product of availableProducts" 
                     class="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" 
                       [checked]="selectedProductIds.includes(product.id)"
                       (change)="toggleProduct(product.id)"
                       class="w-4 h-4 text-primary-light border-gray-300 rounded focus:ring-primary-light">
                <div class="flex-1">
                  <span class="text-body font-medium text-gray-800">{{ product.name }}</span>
                  <span class="text-body-sm text-gray-600 ml-2">
                    - {{ formatCurrency(product.price || (product.price_cents || 0) / 100) }}
                  </span>
                </div>
              </label>
            </div>
            <p *ngIf="selectedProductIds.length > 0" class="text-body-sm text-success mt-2">
              {{ selectedProductIds.length }} produto(s) selecionado(s)
            </p>
          </div>
          
          <div>
            <label class="block text-body font-medium mb-2">Benefícios</label>
            <div *ngFor="let benefit of clubBenefits; let i = index" class="flex gap-2 mb-2">
              <input [(ngModel)]="clubBenefits[i]"
                     [ngModelOptions]="{standalone: true}"
                     class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-light focus:border-transparent"
                     placeholder="Ex: Frete grátis" />
              <button type="button" 
                      (click)="removeBenefit(i)" 
                      class="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                      aria-label="Remover benefício">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <app-button variant="outline" 
                        size="sm"
                        label="Adicionar Benefício" 
                        type="button"
                        (clicked)="addBenefit()">
            </app-button>
          </div>
          
          <div class="flex justify-end gap-3 pt-4 border-t">
            <app-button variant="outline" 
                        label="Cancelar" 
                        type="button"
                        (clicked)="closeModal()">
            </app-button>
            <app-button variant="primary" 
                        label="Salvar" 
                        type="submit"
                        [disabled]="clubForm.invalid || saving">
            </app-button>
          </div>
        </form>
      </app-modal>
    </div>
  `,
  styles: []
})
export class SubscriptionClubsComponent implements OnInit {
  clubs: SubscriptionClub[] = [];
  loading = false;
  showCreateModal = false;
  editingClub: SubscriptionClub | null = null;
  saving = false;
  clubForm: FormGroup;
  clubBenefits: string[] = [];
  accountId: string | null = null;
  availableProducts: Product[] = [];
  selectedProductIds: string[] = [];
  loadingProducts = false;

  constructor(
    private subscriptionClubService: SubscriptionClubService,
    private accountService: AccountService,
    private productService: ProductService,
    private toastService: ToastService,
    private fb: FormBuilder
  ) {
    this.clubForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      monthlyFee: [0, [Validators.required, Validators.min(0)]],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadAccount();
  }

  loadAccount(): void {
    this.accountService.getMyAccount().subscribe({
      next: (account) => {
        this.accountId = account.id;
        this.loadClubs();
        this.loadProducts();
      },
      error: (err) => {
        console.error('Error loading account', err);
        this.toastService.error('Erro ao carregar informações da empresa');
      }
    });
  }

  loadProducts(): void {
    if (!this.accountId) return;
    
    this.loadingProducts = true;
    this.productService.getProductsByAccount(this.accountId).subscribe({
      next: (products) => {
        this.availableProducts = products.filter(p => p.active);
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.loadingProducts = false;
      }
    });
  }

  toggleProduct(productId: string): void {
    const index = this.selectedProductIds.indexOf(productId);
    if (index > -1) {
      this.selectedProductIds.splice(index, 1);
    } else {
      this.selectedProductIds.push(productId);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  loadClubs(): void {
    if (!this.accountId) return;
    
    this.loading = true;
    this.subscriptionClubService.getClubs(this.accountId).subscribe({
      next: (clubs) => {
        this.clubs = clubs;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading clubs', err);
        this.toastService.error('Erro ao carregar clubes');
        this.loading = false;
      }
    });
  }

  editClub(club: SubscriptionClub): void {
    this.editingClub = club;
    this.clubForm.patchValue({
      name: club.name,
      description: club.description,
      monthlyFee: club.monthlyFee,
      discountPercentage: club.discountPercentage
    });
    this.clubBenefits = [...club.benefits];
    this.selectedProductIds = [...(club.productIds || [])];
    this.showCreateModal = true;
  }

  toggleClub(club: SubscriptionClub): void {
    if (!this.accountId) return;
    
    const newStatus = !club.active;
    const operation = newStatus 
      ? this.subscriptionClubService.activateClub(this.accountId, club.id)
      : this.subscriptionClubService.deactivateClub(this.accountId, club.id);
    
    operation.subscribe({
      next: (updatedClub) => {
        club.active = updatedClub.active;
        this.toastService.success(`Clube ${newStatus ? 'ativado' : 'desativado'} com sucesso!`);
        // Atualizar outros campos se necessário
        Object.assign(club, updatedClub);
      },
      error: (err) => {
        console.error('Error toggling club', err);
        this.toastService.error('Erro ao alterar status do clube');
      }
    });
  }

  addBenefit(): void {
    this.clubBenefits.push('');
  }

  removeBenefit(index: number): void {
    this.clubBenefits.splice(index, 1);
  }

  deleteClub(club: SubscriptionClub): void {
    if (!this.accountId) return;
    
    if (!confirm(`Tem certeza que deseja deletar o clube "${club.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    this.subscriptionClubService.deleteClub(this.accountId, club.id).subscribe({
      next: () => {
        this.toastService.success('Clube deletado com sucesso!');
        this.loadClubs();
      },
      error: (err) => {
        console.error('Error deleting club', err);
        this.toastService.error('Erro ao deletar clube');
      }
    });
  }

  closeModal(): void {
    this.showCreateModal = false;
    this.editingClub = null;
    this.clubForm.reset();
    this.clubBenefits = [];
    this.selectedProductIds = [];
  }

  saveClub(): void {
    if (!this.accountId || this.clubForm.invalid) return;
    
    this.saving = true;
    const formValue = this.clubForm.value;
    const filteredBenefits = this.clubBenefits.filter(b => b.trim().length > 0);
    
    if (this.editingClub) {
      // Update existing club
      const updateRequest: UpdateSubscriptionClubRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        monthlyFee: formValue.monthlyFee,
        discountPercentage: formValue.discountPercentage,
        productIds: this.selectedProductIds.length > 0 ? this.selectedProductIds : undefined,
        benefits: filteredBenefits.length > 0 ? filteredBenefits : undefined
      };
      
      this.subscriptionClubService.updateClub(this.accountId, this.editingClub.id, updateRequest).subscribe({
        next: (updatedClub) => {
          this.toastService.success('Clube atualizado com sucesso!');
          this.saving = false;
          this.closeModal();
          this.loadClubs();
        },
        error: (err) => {
          console.error('Error updating club', err);
          this.toastService.error('Erro ao atualizar clube');
          this.saving = false;
        }
      });
    } else {
      // Create new club
      const createRequest: CreateSubscriptionClubRequest = {
        name: formValue.name,
        description: formValue.description || undefined,
        monthlyFee: formValue.monthlyFee,
        discountPercentage: formValue.discountPercentage,
        productIds: this.selectedProductIds.length > 0 ? this.selectedProductIds : undefined,
        benefits: filteredBenefits.length > 0 ? filteredBenefits : undefined
      };
      
      this.subscriptionClubService.createClub(this.accountId, createRequest).subscribe({
        next: () => {
          this.toastService.success('Clube criado com sucesso!');
          this.saving = false;
          this.closeModal();
          this.loadClubs();
        },
        error: (err) => {
          console.error('Error creating club', err);
          this.toastService.error('Erro ao criar clube');
          this.saving = false;
        }
      });
    }
  }
}

