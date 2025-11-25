import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/design-system/button/button.component';
import { CardComponent } from '../../shared/components/design-system/card/card.component';
import { MapPinIconComponent } from '../../shared/components/icons/map-pin-icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CardComponent, MapPinIconComponent],
  template: `
    <div class="min-h-screen bg-background">
      <!-- Hero Section -->
      <section class="relative bg-gradient-hero text-white overflow-hidden min-h-screen flex items-center">
        <!-- Background animated -->
        <div class="absolute inset-0 opacity-20">
          <div class="absolute top-20 left-10 w-96 h-96 bg-primary-light rounded-full blur-3xl animate-float"></div>
          <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float" style="animation-delay: 1s;"></div>
        </div>
        
        <!-- Grid pattern overlay -->
        <div class="absolute inset-0 opacity-5" style="background-image: linear-gradient(#4A9EFF 1px, transparent 1px), linear-gradient(90deg, #4A9EFF 1px, transparent 1px); background-size: 50px 50px;"></div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- Left Column - Content -->
            <div class="text-center lg:text-left animate-fade-in">
              <!-- Logo Adalana -->
              <div class="mb-8 flex justify-center lg:justify-start">
                <div class="flex items-center gap-1">
                  <div class="relative">
                    <span class="text-display font-display text-primary-light">A</span>
                    <app-map-pin-icon 
                      size="lg" 
                      variant="filled" 
                      color="text-primary"
                      class="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    </app-map-pin-icon>
                  </div>
                  <div class="flex items-baseline gap-1">
                    <span class="text-display font-display text-white">dalan</span>
                    <span class="text-display font-display text-secondary">A</span>
                  </div>
                </div>
              </div>
              
              <h1 class="text-display font-display mb-6 text-white animate-slide-up">
                Entregas Inteligentes para o Seu Negócio
              </h1>
              
              <p class="text-body-lg mb-8 text-gray-200 max-w-xl mx-auto lg:mx-0 animate-slide-up" style="animation-delay: 0.1s;">
                Conecte-se com empresas locais, gerencie assinaturas e simplifique suas entregas. 
                Tudo em um só lugar, com a confiança e profissionalismo que seu negócio merece.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style="animation-delay: 0.2s;">
                <app-button 
                  variant="accent" 
                  size="lg"
                  label="Explorar Catálogo"
                  (clicked)="goToCatalog()"
                  [fullWidth]="true"
                  class="sm:w-auto">
                </app-button>
                <app-button 
                  variant="ghost" 
                  size="lg"
                  label="Saiba Mais"
                  (clicked)="scrollToFeatures()"
                  [fullWidth]="true"
                  class="sm:w-auto">
                </app-button>
              </div>
            </div>
            
            <!-- Right Column - Illustration -->
            <div class="hidden lg:block relative">
              <div class="relative z-10 animate-float">
                <!-- Pin de mapa grande como elemento decorativo -->
                <div class="flex flex-col items-center gap-8">
                  <app-map-pin-icon 
                    size="xl" 
                    variant="filled" 
                    color="text-primary-light"
                    class="animate-pulse-slow">
                  </app-map-pin-icon>
                  <div class="text-center glass-light rounded-large p-6">
                    <p class="text-h3 text-primary mb-2">Localização</p>
                    <p class="text-body text-gray-700">Entregas em toda a região</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-24 bg-background">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-h1 font-display text-primary mb-4">
              Como Funciona
            </h2>
            <p class="text-body-lg text-gray-600 max-w-2xl mx-auto">
              Uma plataforma completa para gerenciar entregas e assinaturas de forma profissional
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <app-card variant="interactive" [elevation]="1" padding="lg">
              <div class="text-center">
                <div class="w-16 h-16 bg-primary-light/10 rounded-large flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 class="text-h4 text-primary mb-2">Explore Empresas</h3>
                <p class="text-body text-gray-600">
                  Descubra empresas locais e seus produtos. Busque por categoria, localização ou tipo de serviço.
                </p>
              </div>
            </app-card>
            
            <!-- Feature 2 -->
            <app-card variant="interactive" [elevation]="1" padding="lg">
              <div class="text-center">
                <div class="w-16 h-16 bg-secondary/10 rounded-large flex items-center justify-center mx-auto mb-4">
                  <app-map-pin-icon size="lg" variant="filled" color="text-secondary"></app-map-pin-icon>
                </div>
                <h3 class="text-h4 text-primary mb-2">Assinaturas Inteligentes</h3>
                <p class="text-body text-gray-600">
                  Configure entregas regulares com calendário personalizado. Gerencie tudo em um só lugar.
                </p>
              </div>
            </app-card>
            
            <!-- Feature 3 -->
            <app-card variant="interactive" [elevation]="1" padding="lg">
              <div class="text-center">
                <div class="w-16 h-16 bg-primary/10 rounded-large flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="text-h4 text-primary mb-2">Acompanhe Entregas</h3>
                <p class="text-body text-gray-600">
                  Monitore seus pedidos em tempo real. Receba notificações e atualizações de status.
                </p>
              </div>
            </app-card>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-h1 font-display text-primary mb-6">
                Por Que Escolher Adalana?
              </h2>
              <div class="space-y-6">
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 bg-success/10 rounded-large flex items-center justify-center">
                    <svg class="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-h4 text-primary mb-2">Gestão Simplificada</h3>
                    <p class="text-body text-gray-600">
                      Interface intuitiva e profissional para gerenciar todas as suas entregas e assinaturas.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 bg-primary-light/10 rounded-large flex items-center justify-center">
                    <app-map-pin-icon size="md" variant="filled" color="text-primary-light"></app-map-pin-icon>
                  </div>
                  <div>
                    <h3 class="text-h4 text-primary mb-2">Cobertura Local</h3>
                    <p class="text-body text-gray-600">
                      Conecte-se com empresas da sua região. Entregas rápidas e confiáveis.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start gap-4">
                  <div class="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-large flex items-center justify-center">
                    <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-h4 text-primary mb-2">Preços Acessíveis</h3>
                    <p class="text-body text-gray-600">
                      Solução profissional a um preço justo. Ideal para pequenas e médias empresas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="relative">
              <app-card variant="highlighted" [elevation]="2" padding="lg">
                <div class="text-center">
                  <div class="w-24 h-24 bg-gradient-to-br from-primary-light to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                    <app-map-pin-icon size="xl" variant="filled" color="text-white"></app-map-pin-icon>
                  </div>
                  <h3 class="text-h3 text-primary mb-4">Comece Agora</h3>
                  <p class="text-body text-gray-600 mb-6">
                    Explore nosso catálogo e descubra como podemos ajudar seu negócio a crescer.
                  </p>
                  <app-button 
                    variant="primary" 
                    size="lg"
                    label="Ver Catálogo"
                    (clicked)="goToCatalog()"
                    [fullWidth]="true">
                  </app-button>
                </div>
              </app-card>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-gradient-primary text-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-h1 font-display mb-6">
            Pronto para Começar?
          </h2>
          <p class="text-body-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Junte-se a empresas que já confiam no Adalana para gerenciar suas entregas e assinaturas.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <app-button 
              variant="accent" 
              size="lg"
              label="Criar Conta"
              (clicked)="goToRegister()"
              class="sm:w-auto">
            </app-button>
            <app-button 
              variant="ghost" 
              size="lg"
              label="Fazer Login"
              (clicked)="goToLogin()"
              class="sm:w-auto text-white border-white hover:bg-white/10">
            </app-button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: []
})
export class HomeComponent {
  constructor(private router: Router) {}

  goToCatalog(): void {
    this.router.navigate(['/catalog']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  scrollToFeatures(): void {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
