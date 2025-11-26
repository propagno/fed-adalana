import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SubscriptionClubService, SubscriptionClub } from '../../../core/services/subscription-club.service';
import { CustomerClubSubscriptionService } from '../../../core/services/customer-club-subscription.service';
import { CatalogService, Product } from '../../../core/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';
import { FormatUtil } from '../../../shared/utils/format.util';
import { ToastService } from '../../../shared/services/toast.service';
import { PixQrCodeService, PixQrCodeResponse } from '../../../core/services/pix-qrcode.service';
import { MarketplaceNavbarComponent } from '../../../shared/components/navbar/marketplace-navbar.component';
import { CardComponent } from '../../../shared/components/design-system/card/card.component';
import { ButtonComponent } from '../../../shared/components/design-system/button/button.component';
import { BadgeComponent } from '../../../shared/components/design-system/badge/badge.component';
import { SkeletonLoaderComponent } from '../../../shared/components/skeleton/skeleton-loader.component';
import { LazyImageDirective } from '../../../shared/directives/lazy-image.directive';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ClubProduct extends Product {
  originalPrice: number;
  discountedPrice: number;
  savings: number;
}

interface FAQItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-club-subscribe',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MarketplaceNavbarComponent,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    SkeletonLoaderComponent,
    LazyImageDirective
  ],
  template: `
    <div class="min-h-screen bg-background pb-24 md:pb-8">
      <!-- Marketplace Navbar -->
      <app-marketplace-navbar></app-marketplace-navbar>
      
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-6">
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
          <app-skeleton-loader type="card"></app-skeleton-loader>
        </div>

        <!-- Content -->
        <div *ngIf="!loading && club" class="space-y-6 md:space-y-8">
          <!-- Progress Indicator - Enhanced -->
          <div class="mb-6 md:mb-8">
            <div class="flex items-center justify-between mb-4">
              <div *ngFor="let step of steps; let i = index" 
                   class="flex-1 flex items-center"
                   [class.flex-1]="i < steps.length - 1">
                <!-- Step Circle -->
                <div class="flex flex-col items-center flex-1" 
                     [class.flex-1]="i < steps.length - 1">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 shadow-md"
                       [ngClass]="{
                         'bg-success text-white shadow-success/30': i < currentStep,
                         'bg-primary text-white shadow-primary/30': i === currentStep,
                         'bg-gray-200 text-gray-500': i > currentStep
                       }">
                    <span *ngIf="i < currentStep" class="text-xl">✓</span>
                    <span *ngIf="i >= currentStep">{{ i + 1 }}</span>
                  </div>
                  <p class="text-xs text-center mt-2 font-medium max-w-[80px]"
                     [ngClass]="{
                       'text-success': i < currentStep,
                       'text-primary': i === currentStep,
                       'text-gray-500': i > currentStep
                     }">
                    {{ step.label }}
                  </p>
                </div>
                <!-- Connector Line -->
                <div *ngIf="i < steps.length - 1" 
                     class="flex-1 h-1.5 mx-2 rounded-full transition-all duration-300"
                     [ngClass]="{
                       'bg-success': i < currentStep,
                       'bg-primary': i === currentStep,
                       'bg-gray-200': i >= currentStep
                     }">
                </div>
              </div>
            </div>
          </div>

          <!-- Step 1: Resumo de Benefícios - ENHANCED -->
          <div *ngIf="currentStep === 0" class="space-y-6">
            <!-- Hero Card with Club Info -->
            <app-card variant="primary" [elevation]="2" padding="lg" customClass="relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div class="relative">
                <div class="text-center mb-6">
                  <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                    <span class="text-2xl">⭐</span>
                    <span class="text-sm font-semibold text-white">Clube VIP Premium</span>
                  </div>
                  <h2 class="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                    {{ club.name }}
                  </h2>
                  <div class="flex items-baseline justify-center gap-2">
                    <span class="text-5xl md:text-6xl font-display font-bold text-white">
                      {{ formatCurrency(club.monthlyFee) }}
                    </span>
                    <span class="text-xl text-white/80">/mês</span>
                  </div>
                  <p class="text-white/90 mt-3 text-sm md:text-base">
                    Cancele quando quiser • Sem taxas de cancelamento
                  </p>
                </div>
              </div>
            </app-card>

            <!-- Key Benefits Grid -->
            <app-card variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h2 font-display font-bold text-primary mb-6 flex items-center gap-2">
                <span class="text-2xl">🎁</span>
                Benefícios Exclusivos
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div *ngFor="let benefit of club.benefits" 
                     class="flex items-start gap-3 p-4 bg-gradient-to-br from-success/10 to-success/5 rounded-large border border-success/20 hover:shadow-md transition-all">
                  <span class="text-success text-2xl flex-shrink-0">✓</span>
                  <div class="flex-1">
                    <p class="text-body font-semibold text-gray-800">{{ benefit }}</p>
                  </div>
                </div>

                <!-- Discount Highlight -->
                <div *ngIf="club.discountPercentage > 0" 
                     class="flex items-start gap-3 p-4 bg-gradient-to-br from-accent/20 to-accent/10 rounded-large border-2 border-accent md:col-span-2">
                  <span class="text-3xl flex-shrink-0">🎉</span>
                  <div class="flex-1">
                    <p class="text-h4 font-bold text-primary mb-1">
                      {{ club.discountPercentage }}% de desconto em todos os produtos
                    </p>
                    <p class="text-body-sm text-gray-600">
                      Aplicado automaticamente no checkout • Economia garantida em cada compra!
                    </p>
                    <div *ngIf="estimatedSavings > 0" class="mt-3 p-3 bg-white/50 rounded-medium">
                      <p class="text-xs text-gray-600 mb-1">Economia estimada por mês:</p>
                      <p class="text-h3 font-bold text-success">{{ formatCurrency(estimatedSavings) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </app-card>

            <!-- Products Included Section -->
            <app-card *ngIf="clubProducts.length > 0" variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h2 font-display font-bold text-primary mb-4 flex items-center gap-2">
                <span class="text-2xl">📦</span>
                Produtos Incluídos no Clube
              </h3>
              <p class="text-body-sm text-gray-600 mb-6">
                Estes produtos terão desconto automático de {{ club.discountPercentage }}% em todas as compras
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let product of clubProducts" 
                     class="border border-gray-200 rounded-large p-4 hover:shadow-md transition-all bg-white">
                  <div *ngIf="product.image_url" class="mb-3">
                    <img [appLazyLoad]="getProductImageUrl(product.image_url)" 
                         [alt]="product.name"
                         class="w-full h-32 object-cover rounded-medium">
                  </div>
                  <h4 class="text-body font-semibold text-primary mb-2 line-clamp-2">{{ product.name }}</h4>
                  <div class="flex items-baseline gap-2 mb-2">
                    <span class="text-body-sm text-gray-500 line-through">
                      {{ formatCurrency(product.originalPrice) }}
                    </span>
                    <span class="text-h4 font-bold text-success">
                      {{ formatCurrency(product.discountedPrice) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <app-badge variant="success" size="sm" [label]="'Economia de ' + formatCurrency(product.savings)"></app-badge>
                  </div>
                </div>
              </div>
              <div *ngIf="clubProducts.length === 0 && loadingProducts" class="text-center py-8">
                <p class="text-body text-gray-500">Carregando produtos...</p>
              </div>
            </app-card>

            <!-- Value Proposition Card -->
            <app-card variant="highlighted" [elevation]="0" padding="lg" customClass="border-l-4 border-primary bg-gradient-to-r from-primary/5 to-transparent">
              <div class="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div class="flex-1">
                  <h4 class="text-h3 font-display font-bold text-primary mb-2">
                    Por que assinar o {{ club.name }}?
                  </h4>
                  <ul class="space-y-2 text-body-sm text-gray-700">
                    <li class="flex items-start gap-2">
                      <span class="text-success text-lg">✓</span>
                      <span>Frete grátis em todas as entregas</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-success text-lg">✓</span>
                      <span>Desconto automático de {{ club.discountPercentage }}% em todos os produtos</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-success text-lg">✓</span>
                      <span>Atendimento prioritário e suporte VIP</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-success text-lg">✓</span>
                      <span>Cancelamento a qualquer momento, sem burocracia</span>
                    </li>
                  </ul>
                </div>
                <div class="text-center md:text-right">
                  <p class="text-xs text-gray-500 mb-1">Economia estimada</p>
                  <p class="text-3xl font-bold text-success">{{ formatCurrency(estimatedSavings) }}</p>
                  <p class="text-xs text-gray-500 mt-1">por mês</p>
                </div>
              </div>
            </app-card>

            <!-- Description -->
            <app-card *ngIf="club.description" variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h3 font-display font-semibold text-primary mb-3 flex items-center gap-2">
                <span class="text-xl">ℹ️</span>
                Sobre o Clube
              </h3>
              <p class="text-body text-gray-700 leading-relaxed whitespace-pre-line">
                {{ club.description }}
              </p>
            </app-card>

            <!-- FAQ Section -->
            <app-card variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h2 font-display font-bold text-primary mb-6 flex items-center gap-2">
                <span class="text-2xl">❓</span>
                Perguntas Frequentes
              </h3>
              <div class="space-y-3">
                <div *ngFor="let faq of faqs" 
                     class="border border-gray-200 rounded-large overflow-hidden">
                  <button 
                    (click)="toggleFAQ(faq)"
                    class="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <span class="text-body font-semibold text-primary pr-4">{{ faq.question }}</span>
                    <span class="text-primary text-xl flex-shrink-0 transition-transform"
                          [class.rotate-180]="faq.expanded">▼</span>
                  </button>
                  <div *ngIf="faq.expanded" 
                       class="px-4 pb-4 text-body-sm text-gray-700 leading-relaxed border-t border-gray-100">
                    <p class="pt-4">{{ faq.answer }}</p>
                  </div>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Step 2: Termos e Condições - ENHANCED -->
          <div *ngIf="currentStep === 1" class="space-y-6">
            <app-card variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h2 font-display font-bold text-primary mb-6 flex items-center gap-2">
                <span class="text-2xl">📋</span>
                Termos e Condições
              </h3>
              <div class="prose prose-sm max-w-none text-gray-700 space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">1. Adesão ao Clube</h4>
                  <p class="mb-4">
                    Ao aderir ao <strong>{{ club.name }}</strong>, você concorda em pagar uma mensalidade de 
                    <strong>{{ formatCurrency(club.monthlyFee) }}</strong> que será cobrada automaticamente todo mês 
                    na mesma data da adesão. A primeira cobrança ocorre imediatamente após a confirmação.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">2. Benefícios e Descontos</h4>
                  <p class="mb-2">
                    Você terá acesso imediato a todos os benefícios do clube, incluindo:
                  </p>
                  <ul class="list-disc pl-6 space-y-1 mb-4">
                    <li *ngFor="let benefit of club.benefits">{{ benefit }}</li>
                    <li *ngIf="club.discountPercentage > 0">
                      <strong>{{ club.discountPercentage }}% de desconto</strong> aplicado automaticamente em todos os produtos do catálogo
                    </li>
                    <li>Frete grátis em todas as entregas</li>
                    <li>Atendimento prioritário</li>
                  </ul>
                  <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-medium">
                    <strong>Nota:</strong> Os descontos são aplicados automaticamente no checkout. Não é necessário inserir cupons ou códigos promocionais.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">3. Cancelamento</h4>
                  <p class="mb-2">
                    Você pode cancelar sua assinatura <strong>a qualquer momento</strong> através do seu painel de 
                    controle, sem taxas ou multas. O cancelamento terá efeito imediato e você perderá o acesso aos 
                    benefícios do clube a partir da próxima cobrança.
                  </p>
                  <p class="text-sm text-gray-600 bg-blue-50 p-3 rounded-medium border-l-4 border-primary">
                    <strong>Importante:</strong> Mesmo após o cancelamento, você continuará tendo acesso aos benefícios 
                    até o final do período já pago. Não há reembolso proporcional.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">4. Pagamento e Renovação</h4>
                  <p class="mb-2">
                    A cobrança da mensalidade será realizada automaticamente no método de pagamento cadastrado. 
                    A assinatura é renovada automaticamente todo mês, garantindo continuidade dos benefícios.
                  </p>
                  <p class="mb-2">
                    Caso o pagamento falhe, você terá <strong>5 dias</strong> para regularizar antes que sua assinatura 
                    seja suspensa. Durante esse período, você ainda terá acesso aos benefícios.
                  </p>
                  <p class="text-sm text-gray-600 bg-yellow-50 p-3 rounded-medium border-l-4 border-warning">
                    <strong>Atenção:</strong> Após 5 dias sem pagamento, sua assinatura será pausada automaticamente. 
                    Para reativar, será necessário quitar o pagamento pendente.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">5. Alterações nos Termos</h4>
                  <p>
                    Reservamo-nos o direito de alterar estes termos a qualquer momento. Você será 
                    notificado por email sobre quaisquer mudanças significativas com pelo menos 
                    <strong>30 dias de antecedência</strong>. Se não concordar com as alterações, 
                    você pode cancelar sua assinatura sem penalidades.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">6. Política de Privacidade</h4>
                  <p>
                    Seus dados pessoais serão tratados de acordo com nossa Política de Privacidade 
                    e a Lei Geral de Proteção de Dados (LGPD). Você pode solicitar a exclusão de 
                    seus dados a qualquer momento através do painel de controle.
                  </p>
                </section>

                <section>
                  <h4 class="font-bold text-primary text-lg mb-2">7. Suporte e Contato</h4>
                  <p>
                    Para dúvidas, sugestões ou problemas relacionados à sua assinatura, entre em contato 
                    através do suporte disponível no painel de controle ou pelo email de suporte da empresa.
                  </p>
                </section>
              </div>

              <!-- Acceptance Checkbox - Enhanced -->
              <div class="mt-6 p-5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-large border-2 border-primary/20">
                <label class="flex items-start gap-4 cursor-pointer">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="termsAccepted"
                    class="w-6 h-6 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary-light focus:ring-offset-2 mt-0.5 cursor-pointer flex-shrink-0">
                  <div class="flex-1">
                    <span class="text-body font-semibold text-primary block mb-1">
                      Li e concordo com os Termos e Condições
                    </span>
                    <span class="text-body-sm text-gray-700">
                      Estou ciente de que a mensalidade de <strong>{{ formatCurrency(club.monthlyFee) }}</strong> será 
                      cobrada mensalmente de forma automática. Posso cancelar a qualquer momento sem taxas.
                    </span>
                  </div>
                </label>
              </div>
            </app-card>
          </div>

          <!-- Step 3: Confirmação - ENHANCED -->
          <div *ngIf="currentStep === 2" class="space-y-6">
            <app-card variant="primary" [elevation]="2" padding="lg" customClass="text-center relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div class="relative">
                <div class="text-7xl mb-4">🎉</div>
                <h3 class="text-h1 font-display font-bold text-white mb-3">
                  Quase lá!
                </h3>
                <p class="text-body-lg text-white/90">
                  Confirme os detalhes da sua assinatura e comece a aproveitar os benefícios
                </p>
              </div>
            </app-card>

            <!-- Summary Card - Enhanced -->
            <app-card variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h2 font-display font-bold text-primary mb-6 flex items-center gap-2">
                <span class="text-2xl">📊</span>
                Resumo da Assinatura
              </h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center pb-4 border-b-2 border-gray-200">
                  <div>
                    <span class="text-body-sm text-gray-500 block mb-1">Clube</span>
                    <span class="text-h4 font-bold text-primary">{{ club.name }}</span>
                  </div>
                  <app-badge variant="accent" size="md" label="VIP"></app-badge>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div class="p-4 bg-gray-50 rounded-large">
                    <span class="text-body-sm text-gray-500 block mb-1">Mensalidade</span>
                    <span class="text-h3 font-bold text-primary-light">{{ formatCurrency(club.monthlyFee) }}</span>
                    <span class="text-body-sm text-gray-600">/mês</span>
                  </div>
                  <div class="p-4 bg-success/5 rounded-large border border-success/20">
                    <span class="text-body-sm text-gray-500 block mb-1">Desconto</span>
                    <span class="text-h3 font-bold text-success">{{ club.discountPercentage }}%</span>
                    <span class="text-body-sm text-gray-600">em todos os produtos</span>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-body text-gray-600">Primeira cobrança:</span>
                    <span class="text-body font-semibold text-primary">Imediata</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-body text-gray-600">Próximas cobranças:</span>
                    <span class="text-body font-semibold text-primary">Todo mês na mesma data</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-body text-gray-600">Renovação:</span>
                    <span class="text-body font-semibold text-success">Automática</span>
                  </div>
                </div>

                <!-- Estimated Savings -->
                <div *ngIf="estimatedSavings > 0" class="mt-6 p-5 bg-gradient-to-br from-success/10 to-success/5 rounded-large border-2 border-success/20">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-body-sm text-gray-600 mb-1">Economia estimada por mês</p>
                      <p class="text-h2 font-bold text-success">{{ formatCurrency(estimatedSavings) }}</p>
                    </div>
                    <span class="text-4xl">💰</span>
                  </div>
                </div>
              </div>
            </app-card>

            <!-- Benefits Reminder -->
            <app-card variant="highlighted" [elevation]="0" padding="lg" customClass="border-l-4 border-success bg-gradient-to-r from-success/5 to-transparent">
              <h4 class="text-h3 font-display font-semibold text-primary mb-4 flex items-center gap-2">
                <span class="text-2xl">✨</span>
                Você terá acesso imediato a:
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div *ngFor="let benefit of club.benefits" 
                     class="flex items-center gap-2 text-body-sm text-gray-700">
                  <span class="text-success text-lg">✓</span>
                  <span>{{ benefit }}</span>
                </div>
                <div *ngIf="club.discountPercentage > 0" 
                     class="flex items-center gap-2 text-body-sm text-gray-700">
                  <span class="text-success text-lg">✓</span>
                  <span>{{ club.discountPercentage }}% de desconto automático</span>
                </div>
              </div>
            </app-card>

            <!-- Payment Info - Enhanced -->
            <app-card variant="highlighted" [elevation]="0" padding="lg" customClass="border-l-4 border-warning bg-gradient-to-r from-warning/5 to-transparent">
              <div class="flex gap-4">
                <span class="text-3xl flex-shrink-0">ℹ️</span>
                <div class="flex-1">
                  <p class="text-body font-semibold text-primary mb-2">
                    Informações Importantes sobre Pagamento
                  </p>
                  <ul class="space-y-2 text-body-sm text-gray-700">
                    <li class="flex items-start gap-2">
                      <span class="text-warning">•</span>
                      <span>A cobrança será feita no mesmo método de pagamento usado em suas compras anteriores</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-warning">•</span>
                      <span>Você receberá um email de confirmação após a primeira cobrança</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-warning">•</span>
                      <span>Você pode gerenciar sua assinatura, alterar método de pagamento ou cancelar a qualquer momento no painel de controle</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-warning">•</span>
                      <span>Em caso de falha no pagamento, você terá 5 dias para regularizar antes da suspensão</span>
                    </li>
                  </ul>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Step 4: Pagamento PIX -->
          <div *ngIf="currentStep === 3" class="space-y-6">
            <!-- Success Card -->
            <app-card variant="primary" [elevation]="2" padding="lg" customClass="text-center relative overflow-hidden">
              <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div class="relative">
                <div class="text-6xl mb-4">🎉</div>
                <h3 class="text-h2 font-display font-bold text-white mb-2">
                  Assinatura Criada com Sucesso!
                </h3>
                <p class="text-body text-white/90">
                  Agora é só pagar a mensalidade para ativar seus benefícios.
                </p>
              </div>
            </app-card>

            <!-- PIX Payment Card -->
            <app-card variant="neutral" [elevation]="1" padding="lg">
              <h3 class="text-h3 font-display font-semibold text-primary mb-4 flex items-center gap-2">
                <span class="text-2xl">💳</span>
                Pagamento via PIX
              </h3>
              
              <!-- Loading State -->
              <div *ngIf="loadingPixQrCode" class="text-center py-8">
                <app-skeleton-loader type="card"></app-skeleton-loader>
                <p class="text-body-sm text-gray-600 mt-4">Gerando QR Code PIX...</p>
              </div>
              
              <!-- QR Code Display -->
              <div *ngIf="!loadingPixQrCode && pixQrCode && !qrCodeExpired" class="space-y-6">
                <!-- Amount Display -->
                <div class="text-center p-6 bg-gradient-to-br from-primary-light/10 to-primary/10 rounded-large border-2 border-primary/20">
                  <p class="text-body-sm text-gray-600 mb-2">Valor a pagar</p>
                  <p class="text-4xl font-display font-bold text-primary">
                    {{ formatCurrency(pixQrCode.amount) }}
                  </p>
                  <p class="text-body-sm text-gray-500 mt-2">
                    QR Code válido por: <strong>{{ getTimeUntilExpiration() }}</strong>
                  </p>
                </div>
                
                <!-- QR Code Image -->
                <div class="flex justify-center">
                  <div class="p-4 bg-white rounded-large border-2 border-gray-200 shadow-md">
                    <img [src]="'data:image/png;base64,' + pixQrCode.qr_code_image_base64" 
                         alt="QR Code PIX"
                         class="w-64 h-64">
                  </div>
                </div>
                
                <!-- Instructions -->
                <div class="bg-info/10 border border-info/20 rounded-large p-4">
                  <p class="text-body-sm text-gray-700 mb-2">
                    <strong>Como pagar:</strong>
                  </p>
                  <ol class="list-decimal list-inside space-y-1 text-body-sm text-gray-600">
                    <li>Abra o app do seu banco</li>
                    <li>Escaneie o QR Code acima ou copie o código abaixo</li>
                    <li>Confirme o pagamento</li>
                    <li>Seus benefícios serão ativados automaticamente após confirmação</li>
                  </ol>
                </div>
                
                <!-- Copy Code Section -->
                <div class="space-y-3">
                  <label class="block text-body-sm font-medium text-primary mb-2">
                    Código PIX (Copia e Cola)
                  </label>
                  <div class="flex gap-2">
                    <input 
                      type="text" 
                      [value]="pixQrCode.qr_code_string"
                      readonly
                      id="pix-code-input"
                      class="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-large text-body-sm font-mono text-gray-700 focus:outline-none focus:border-primary">
                    <app-button
                      [variant]="copiedToClipboard ? 'secondary' : 'primary'"
                      [label]="copiedToClipboard ? '✓ Copiado!' : '📋 Copiar'"
                      (clicked)="copyPixCode()">
                    </app-button>
                  </div>
                </div>
                
                <!-- Expiration Warning -->
                <div class="bg-warning/10 border border-warning/20 rounded-large p-3">
                  <p class="text-body-sm text-gray-700">
                    <strong>⏰ Atenção:</strong> Este QR Code expira em <strong>{{ getTimeUntilExpiration() }}</strong>. 
                    Após a expiração, você precisará gerar um novo código.
                  </p>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                  <app-button
                    variant="primary"
                    size="lg"
                    label="Já paguei, continuar"
                    [fullWidth]="true"
                    (clicked)="finishSubscription()">
                  </app-button>
                  <app-button
                    variant="secondary"
                    size="lg"
                    label="Pagar depois"
                    [fullWidth]="true"
                    (clicked)="finishSubscription()">
                  </app-button>
                </div>
              </div>
              
              <!-- Expired State -->
              <div *ngIf="!loadingPixQrCode && qrCodeExpired" class="text-center py-8 space-y-4">
                <div class="text-5xl mb-4">⏰</div>
                <p class="text-h4 font-semibold text-primary mb-2">
                  QR Code Expirado
                </p>
                <p class="text-body text-gray-600 mb-6">
                  O QR Code PIX expirou. Gere um novo código para continuar o pagamento.
                </p>
                <app-button
                  variant="primary"
                  size="lg"
                  label="Gerar Novo QR Code"
                  (clicked)="regenerateQrCode()">
                </app-button>
                <div class="pt-4">
                  <app-button
                    variant="secondary"
                    size="md"
                    label="Pagar depois"
                    (clicked)="finishSubscription()">
                  </app-button>
                </div>
              </div>
              
              <!-- Error State -->
              <div *ngIf="!loadingPixQrCode && !pixQrCode && !qrCodeExpired" class="text-center py-8 space-y-4">
                <div class="text-5xl mb-4">⚠️</div>
                <p class="text-h4 font-semibold text-primary mb-2">
                  Não foi possível gerar o QR Code PIX
                </p>
                <p class="text-body text-gray-600 mb-6">
                  Você pode continuar e pagar depois através do painel de gerenciamento da assinatura.
                </p>
                <app-button
                  variant="primary"
                  size="lg"
                  label="Tentar Novamente"
                  (clicked)="regenerateQrCode()">
                </app-button>
                <div class="pt-4">
                  <app-button
                    variant="secondary"
                    size="md"
                    label="Continuar mesmo assim"
                    (clicked)="finishSubscription()">
                  </app-button>
                </div>
              </div>
            </app-card>
          </div>

          <!-- Navigation Buttons - Fixed Bottom on Mobile -->
          <div class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:border-0 md:p-0 md:mt-8 shadow-lg md:shadow-none z-20">
            <div class="max-w-5xl mx-auto flex gap-3">
              <app-button 
                *ngIf="currentStep > 0"
                variant="secondary"
                size="lg"
                label="Voltar"
                [fullWidth]="true"
                (clicked)="previousStep()">
              </app-button>
              <app-button 
                *ngIf="currentStep < 2"
                variant="primary"
                size="lg"
                label="Continuar"
                [fullWidth]="true"
                [disabled]="currentStep === 1 && !termsAccepted"
                (clicked)="nextStep()">
              </app-button>
              <app-button 
                *ngIf="currentStep === 2"
                variant="primary"
                size="lg"
                label="Confirmar Assinatura"
                [fullWidth]="true"
                [loading]="submitting"
                (clicked)="confirmSubscription()">
              </app-button>
              <app-button 
                *ngIf="currentStep === 3"
                variant="secondary"
                size="lg"
                label="Voltar"
                [fullWidth]="true"
                (clicked)="previousStep()">
              </app-button>
            </div>
          </div>
        </div>

        <!-- Error State -->
        <div *ngIf="!loading && !club" class="text-center py-12">
          <div class="text-6xl mb-4">😕</div>
          <p class="text-h3 font-semibold text-primary mb-2">Clube não encontrado</p>
          <p class="text-body text-gray-600 mb-6">O clube que você está procurando não existe ou foi removido.</p>
          <app-button 
            variant="secondary"
            size="md"
            label="Voltar aos Clubes"
            (clicked)="goBack()">
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom scrollbar for terms */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #3b82f6;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #2563eb;
    }

    /* Line clamp for product names */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Prose styles for terms */
    .prose h4 {
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .prose p {
      margin-bottom: 1rem;
    }
    .prose ul {
      margin-bottom: 1rem;
    }
    .prose section {
      margin-bottom: 2rem;
    }
  `]
})
export class ClubSubscribeComponent implements OnInit, OnDestroy {
  club: SubscriptionClub | null = null;
  clubProducts: ClubProduct[] = [];
  loading = false;
  loadingProducts = false;
  submitting = false;
  currentStep = 0;
  termsAccepted = false;
  clubId: string = '';
  accountId: string = '';
  estimatedSavings = 0;
  
  // PIX Payment properties
  pixQrCode: PixQrCodeResponse | null = null;
  loadingPixQrCode = false;
  copiedToClipboard = false;
  qrCodeExpired = false;
  private countdownInterval: any = null;

  steps = [
    { label: 'Benefícios', key: 'benefits' },
    { label: 'Termos', key: 'terms' },
    { label: 'Confirmar', key: 'confirm' },
    { label: 'Pagamento', key: 'payment' }
  ];

  faqs: FAQItem[] = [
    {
      question: 'Como funciona a cobrança da mensalidade?',
      answer: 'A mensalidade é cobrada automaticamente todo mês na mesma data em que você assinou o clube. A primeira cobrança ocorre imediatamente após a confirmação da assinatura. Você receberá um email de confirmação a cada cobrança.',
      expanded: false
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Você pode cancelar sua assinatura a qualquer momento através do painel de controle, sem taxas ou multas. O cancelamento tem efeito imediato e você continuará tendo acesso aos benefícios até o final do período já pago.',
      expanded: false
    },
    {
      question: 'Como os descontos são aplicados?',
      answer: 'Os descontos são aplicados automaticamente no checkout. Você não precisa inserir cupons ou códigos promocionais. O desconto é válido em todos os produtos do catálogo.',
      expanded: false
    },
    {
      question: 'O que acontece se o pagamento falhar?',
      answer: 'Se o pagamento falhar, você terá 5 dias para regularizar. Durante esse período, você ainda terá acesso aos benefícios. Após 5 dias sem pagamento, a assinatura será pausada automaticamente. Para reativar, será necessário quitar o pagamento pendente.',
      expanded: false
    },
    {
      question: 'Posso pausar minha assinatura temporariamente?',
      answer: 'Sim! Você pode pausar sua assinatura por um período determinado através do painel de controle. Durante a pausa, você não será cobrado, mas também não terá acesso aos benefícios. Você pode retomar a assinatura a qualquer momento.',
      expanded: false
    },
    {
      question: 'Os benefícios são válidos imediatamente?',
      answer: 'Sim! Assim que sua assinatura for confirmada, você terá acesso imediato a todos os benefícios do clube, incluindo frete grátis, descontos e atendimento prioritário.',
      expanded: false
    }
  ];

  constructor(
    private subscriptionClubService: SubscriptionClubService,
    private customerClubSubscriptionService: CustomerClubSubscriptionService,
    private catalogService: CatalogService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private pixQrCodeService: PixQrCodeService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.clubId = params['id'];
    });

    this.route.queryParams.subscribe(params => {
      this.accountId = params['accountId'];
    });

    if (this.clubId && this.accountId) {
      this.loadClub();
    }
  }

  loadClub(): void {
    this.loading = true;
    this.subscriptionClubService.getClubById(this.accountId, this.clubId).subscribe({
      next: (club) => {
        this.club = club;
        this.loading = false;
        
        // Update FAQ with club-specific discount
        this.faqs[2].answer = `Os descontos de ${club.discountPercentage}% são aplicados automaticamente no checkout. Você não precisa inserir cupons ou códigos promocionais. O desconto é válido em todos os produtos do catálogo.`;
        
        // Load products if available
        if (club.productIds && club.productIds.length > 0) {
          this.loadClubProducts(club.productIds);
        }
      },
      error: (err) => {
        console.error('Error loading club', err);
        this.toastService.error('Erro ao carregar informações do clube');
        this.loading = false;
      }
    });
  }

  loadClubProducts(productIds: string[]): void {
    this.loadingProducts = true;
    
    // Load all products in parallel
    const productObservables = productIds.map(id => 
      this.catalogService.getProductById(id).pipe(
        catchError(err => {
          console.warn(`Error loading product ${id}:`, err);
          return of(null);
        })
      )
    );

    forkJoin(productObservables).subscribe({
      next: (products) => {
        this.clubProducts = products
          .filter((p): p is Product => p !== null && p !== undefined)
          .map(product => {
            // Product interface has price_cents, not price
            const originalPrice = (product.price_cents || 0) / 100;
            const discountMultiplier = (100 - (this.club?.discountPercentage || 0)) / 100;
            const discountedPrice = originalPrice * discountMultiplier;
            const savings = originalPrice - discountedPrice;
            
            return {
              ...product,
              originalPrice,
              discountedPrice,
              savings
            };
          });
        
        // Calculate estimated savings (average of product savings)
        if (this.clubProducts.length > 0) {
          this.estimatedSavings = this.clubProducts.reduce((sum, p) => sum + p.savings, 0) / this.clubProducts.length;
        }
        
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading club products', err);
        this.loadingProducts = false;
      }
    });
  }

  toggleFAQ(faq: FAQItem): void {
    faq.expanded = !faq.expanded;
  }

  getProductImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const apiBaseUrl = 'http://localhost:8080';
    if (imageUrl.startsWith('/api/files/')) {
      return `${apiBaseUrl}${imageUrl}`;
    }
    return `${apiBaseUrl}/api/files/products/${imageUrl}`;
  }

  nextStep(): void {
    if (this.currentStep === 1 && !this.termsAccepted) {
      this.toastService.warning('Você precisa aceitar os termos e condições para continuar');
      return;
    }

    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  confirmSubscription(): void {
    if (!this.club || !this.accountId || !this.clubId) return;
    
    if (!this.termsAccepted) {
      this.toastService.warning('Você precisa aceitar os termos e condições para continuar');
      return;
    }

    this.submitting = true;

    const requestPayload = {
      acceptedTerms: Boolean(this.termsAccepted),
      autoRenew: true 
    };

    this.customerClubSubscriptionService.subscribeToClub(
      this.accountId,
      this.clubId,
      requestPayload
    ).subscribe({
      next: (subscription) => {
        this.toastService.success('Assinatura criada com sucesso! 🎉');
        this.submitting = false;
        
        // Avançar para etapa de pagamento primeiro
        this.currentStep = 3; // Etapa 4 (índice 3)
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Gerar QR Code PIX para pagamento (após mudar de etapa)
        setTimeout(() => {
          this.generatePixQrCode();
        }, 100);
      },
      error: (err) => {
        console.error('Error subscribing to club', err);
        
        if (err.status === 409) {
          this.toastService.error('Você já possui uma assinatura ativa neste clube');
        } else if (err.status === 400) {
          this.toastService.error('Dados inválidos. Verifique as informações e tente novamente.');
        } else {
          this.toastService.error('Erro ao realizar assinatura. Tente novamente mais tarde.');
        }
        
        this.submitting = false;
      }
    });
  }

  /**
   * Gera QR Code PIX para pagamento da mensalidade
   */
  generatePixQrCode(): void {
    if (!this.club || !this.accountId) {
      console.warn('Cannot generate PIX QR code: club or accountId is missing', { club: this.club, accountId: this.accountId });
      return;
    }
    
    // Validar monthlyFee antes de enviar
    if (!this.club.monthlyFee || this.club.monthlyFee <= 0) {
      console.error('Invalid monthlyFee:', this.club.monthlyFee);
      this.toastService.error('Erro: Mensalidade do clube não está configurada corretamente.');
      this.loadingPixQrCode = false;
      return;
    }
    
    console.log('Generating PIX QR code', { 
      accountId: this.accountId, 
      monthlyFee: this.club.monthlyFee,
      clubName: this.club.name 
    });
    
    this.loadingPixQrCode = true;
    this.qrCodeExpired = false;
    
    const request = {
      amount: Number(this.club.monthlyFee), // Garantir que é um número
      description: `Mensalidade do ${this.club.name}`
    };
    
    console.log('PIX QR Code request:', request);
    
    // Validação adicional antes de enviar
    if (!request.amount || request.amount <= 0 || isNaN(request.amount)) {
      console.error('Invalid amount in request:', request);
      this.toastService.error('Erro: Valor inválido para geração do QR Code PIX.');
      this.loadingPixQrCode = false;
      return;
    }
    
    this.pixQrCodeService.generateClubSubscriptionQrCode(this.accountId, request).subscribe({
      next: (response) => {
        console.log('PIX QR Code generated successfully', response);
        this.pixQrCode = response;
        this.loadingPixQrCode = false;
        
        // Garantir que estamos na etapa de pagamento
        if (this.currentStep !== 3) {
          this.currentStep = 3;
        }
        
        // Iniciar countdown em tempo real
        this.startCountdown();
      },
      error: (err) => {
        console.error('Error generating PIX QR code', err);
        console.error('Error details:', {
          status: err.status,
          message: err.message,
          error: err.error
        });
        
        if (err.status === 400 || err.message?.includes('Chave PIX não configurada') || err.error?.message?.includes('Chave PIX')) {
          this.toastService.warning('Chave PIX não configurada pela empresa. Você pode pagar depois.');
        } else {
          this.toastService.error('Erro ao gerar QR Code PIX. Você pode pagar depois.');
        }
        
        this.loadingPixQrCode = false;
        // Mesmo com erro, permite continuar
      }
    });
  }

  /**
   * Inicia countdown em tempo real (atualiza a cada segundo)
   */
  startCountdown(): void {
    // Limpar intervalo anterior se existir
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    // Atualizar countdown a cada segundo
    this.countdownInterval = setInterval(() => {
      if (!this.pixQrCode?.expires_at) {
        clearInterval(this.countdownInterval);
        return;
      }
      
      const expirationDate = new Date(this.pixQrCode.expires_at);
      const now = new Date();
      
      if (now >= expirationDate) {
        this.qrCodeExpired = true;
        this.toastService.warning('QR Code PIX expirado. Gere um novo código.');
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      
      // Forçar detecção de mudanças para atualizar o template
      // (Angular detecta mudanças automaticamente, mas garantimos)
    }, 1000); // Atualizar a cada segundo
  }
  
  /**
   * Para o countdown
   */
  stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Copia código PIX para área de transferência
   */
  copyPixCode(): void {
    if (!this.pixQrCode?.qr_code_string) return;
    
    navigator.clipboard.writeText(this.pixQrCode.qr_code_string).then(() => {
      this.copiedToClipboard = true;
      this.toastService.success('Código PIX copiado!');
      
      setTimeout(() => {
        this.copiedToClipboard = false;
      }, 3000);
    }).catch(err => {
      console.error('Error copying to clipboard', err);
      this.toastService.error('Erro ao copiar código. Tente selecionar manualmente.');
    });
  }

  /**
   * Gera novo QR Code (quando expira)
   */
  regenerateQrCode(): void {
    this.pixQrCode = null;
    this.generatePixQrCode();
  }

  /**
   * Finaliza fluxo e redireciona para página de gerenciamento
   */
  finishSubscription(): void {
    // Parar countdown antes de navegar
    this.stopCountdown();
    
    this.router.navigate(['/customer/my-club-subscription'], {
      queryParams: { accountId: this.accountId }
    });
  }

  /**
   * Formata tempo restante até expiração
   */
  getTimeUntilExpiration(): string {
    if (!this.pixQrCode?.expires_at) return '';
    
    const expirationDate = new Date(this.pixQrCode.expires_at);
    const now = new Date();
    const diff = expirationDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  formatCurrency(value: number): string {
    return FormatUtil.formatCurrencyFromReais(value);
  }

  goBack(): void {
    this.router.navigate(['/catalog/clubs'], {
      queryParams: { accountId: this.accountId }
    });
  }
  
  ngOnDestroy(): void {
    this.stopCountdown();
  }
}
