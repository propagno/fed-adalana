import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <h2>Bem-vindo ao Fale com Jesus</h2>
      <p>Esta é a aplicação frontend base desenvolvida com Angular 17+.</p>
      <div class="info-card">
        <h3>Status da Aplicação</h3>
        <p><strong>Status:</strong> <span class="status-ok">Online</span></p>
        <p><strong>Versão:</strong> 1.0.0</p>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 800px;
      margin: 0 auto;
    }
    h2 {
      color: #1976d2;
      margin-bottom: 1rem;
    }
    .info-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-top: 2rem;
    }
    .info-card h3 {
      margin-bottom: 1rem;
      color: #333;
    }
    .info-card p {
      margin: 0.5rem 0;
    }
    .status-ok {
      color: #4caf50;
      font-weight: bold;
    }
  `]
})
export class HomeComponent {
}

