import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <header class="app-header">
        <div class="container">
          <h1>Fale com Jesus</h1>
        </div>
      </header>
      <main class="app-main">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      <footer class="app-footer">
        <div class="container">
          <p>&copy; 2025 Propagno. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .app-header {
      background-color: #1976d2;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .app-header h1 {
      font-size: 1.5rem;
      font-weight: 500;
    }
    .app-main {
      flex: 1;
      padding: 2rem 0;
    }
    .app-footer {
      background-color: #f5f5f5;
      padding: 1rem 0;
      text-align: center;
      color: #666;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class AppComponent {
  title = 'fed-fale-com-jesus';
}

