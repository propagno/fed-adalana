import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center">
      <!-- Illustration -->
      <div class="mb-6">
        <div class="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <!-- Welcome Message -->
      <h2 class="text-3xl font-bold text-gray-900 mb-3">
        Bem-vindo, {{ name }}! 🎉
      </h2>
      <p class="text-gray-600 mb-8 text-lg">
        Sua conta foi criada com sucesso. Agora você pode explorar nosso catálogo e fazer seus pedidos!
      </p>

      <!-- Features List -->
      <div class="mb-8 text-left max-w-md mx-auto">
        <div class="space-y-4">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 class="font-semibold text-gray-900">Explore Produtos</h3>
              <p class="text-sm text-gray-600">Navegue pelo catálogo e descubra produtos incríveis</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 class="font-semibold text-gray-900">Assinaturas</h3>
              <p class="text-sm text-gray-600">Assine produtos para receber entregas regulares</p>
            </div>
          </div>
          
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 class="font-semibold text-gray-900">Acompanhe Pedidos</h3>
              <p class="text-sm text-gray-600">Monitore seus pedidos e assinaturas em tempo real</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          (click)="onExplore()"
          class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg">
          Explorar Catálogo
        </button>
        <button 
          (click)="onCompleteLater()"
          class="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
          Completar Perfil Depois
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterWelcomeComponent {
  @Input() name: string = '';
  @Output() explore = new EventEmitter<void>();
  @Output() completeLater = new EventEmitter<void>();

  onExplore(): void {
    this.explore.emit();
  }

  onCompleteLater(): void {
    this.completeLater.emit();
  }
}

