import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="nf-container">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, el recurso que buscas no existe o fue movido.</p>
      <a routerLink="/" class="btn-home">Volver al catálogo</a>
    </div>
  `,
  styles: [`
    .nf-container { text-align: center; padding: 5rem 1rem; }
    h1 { font-size: 6rem; color: #e2e8f0; margin: 0; font-weight: 900; line-height: 1; }
    h2 { font-size: 1.5rem; color: #0f172a; margin: 1rem 0 0.5rem; }
    p { color: #64748b; margin-bottom: 2rem; }
    .btn-home {
      display: inline-block; background: var(--primary-color); color: white; 
      text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; 
      font-weight: 600; transition: opacity 0.2s;
    }
    .btn-home:hover { opacity: 0.9; }
  `]
})
export class NotFoundComponent {}