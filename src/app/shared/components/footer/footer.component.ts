import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MapPinIconComponent } from '../icons/map-pin-icon.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, MapPinIconComponent],
  template: `
    <footer class="bg-primary text-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Logo e Descrição -->
          <div class="md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="relative">
                <span class="text-h1 font-display text-primary-light">A</span>
                <app-map-pin-icon 
                  size="md" 
                  variant="filled" 
                  color="text-primary"
                  class="absolute -top-1 left-1/2 transform -translate-x-1/2">
                </app-map-pin-icon>
              </div>
              <div class="flex items-baseline gap-0.5">
                <span class="text-h1 font-display text-white">dalan</span>
                <span class="text-h1 font-display text-secondary">A</span>
              </div>
            </div>
            <p class="text-body text-gray-300 mb-4 max-w-md">
              Plataforma profissional de gestão de entregas e assinaturas. 
              Conecte-se com empresas locais e simplifique suas entregas.
            </p>
          </div>
          
          <!-- Links Rápidos -->
          <div>
            <h3 class="text-h4 font-display text-white mb-4">Links Rápidos</h3>
            <ul class="space-y-2">
              <li>
                <a routerLink="/catalog" class="text-body text-gray-300 hover:text-primary-light transition-colors">
                  Catálogo
                </a>
              </li>
              <li>
                <a routerLink="/login" class="text-body text-gray-300 hover:text-primary-light transition-colors">
                  Entrar
                </a>
              </li>
              <li>
                <a routerLink="/register" class="text-body text-gray-300 hover:text-primary-light transition-colors">
                  Criar Conta
                </a>
              </li>
            </ul>
          </div>
          
          <!-- Contato -->
          <div>
            <h3 class="text-h4 font-display text-white mb-4 flex items-center gap-2">
              <app-map-pin-icon size="sm" variant="filled" color="text-primary-light"></app-map-pin-icon>
              Contato
            </h3>
            <ul class="space-y-2">
              <li class="text-body text-gray-300">
                <a href="mailto:contato&#64;adalana.com" class="hover:text-primary-light transition-colors">
                  contato&#64;adalana.com
                </a>
              </li>
              <li class="text-body text-gray-300">
                Suporte 24/7
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-primary-dark mt-8 pt-8">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-body-sm text-gray-400">
              © {{ currentYear }} Adalana. Todos os direitos reservados.
            </p>
            <div class="flex gap-6">
              <a href="#" class="text-body-sm text-gray-400 hover:text-primary-light transition-colors">
                Termos de Uso
              </a>
              <a href="#" class="text-body-sm text-gray-400 hover:text-primary-light transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

