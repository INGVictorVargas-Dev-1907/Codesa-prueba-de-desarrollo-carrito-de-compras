import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from  '@angular/router';
import { CartStore } from '../../../features/cart/cart.store';
import { CartSidebarComponent } from '../../../../app/features/cart/cart-sidebar/cart-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule, CartSidebarComponent],
  template: `
    <div class="layout">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <!-- Logo -->
            <a routerLink="/" class="logo">
              <i class="pi pi-box" style="font-size: 1.5rem; color: var(--primary-color)"></i>
              <span>Codesa Shop</span>
            </a>

            <!-- Buscador -->
            <div class="search-container">
              <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              pInputText
              placeholder="Buscar productos, marcas..."
              [(ngModel)]="searchQuery"
              (keyup.enter)="onSearch()"
              class="search-input"
            />
            </div>

            <!-- Acciones -->
            <div class=" header-actions">
              <button class="icon-btn" aria-label="Favoritos">
                <i class="pi pi-heart"></i>
              </button>
              <button class="icon-btn cart-btn" (click)="cartStore.openPanel()" aria-label="Abrir carrito">
                <i class="pi pi-shopping-cart" style="font-size: 1.2rem"></i>
                @if (cartStore.itemCount() > 0) {
                  <span class="cart-badge">{{ cartStore.itemCount() }}</span>
                }
              </button>
            </div>
        </div>
      </header>

      <!-- Contenido principal -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <p>&copy; 2026 Codesa Shop. Todos los derechos reservados.</p>
          <div class="footer-links">
            <a href="#">Términos</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
        </div>
      </footer>
    </div>

    <!-- Panel lateral del carrito -->
    <app-cart-sidebar></app-cart-sidebar>
  `,
  styles: [`
    .layout { display: flex; flex-direction: column; min-height: 100vh; }
    .header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-content {
      max-width: 1280px; margin: 0 auto; padding: 1rem 1.5rem;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
    }
    .logo {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 1.25rem; font-weight: 800; color: #0f172a; text-decoration: none;
    }
    .search-container {
      flex: 1; max-width: 500px; position: relative;
    }
    .search-input {
      width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem;
      border-radius: 99px; border: 1px solid #cbd5e1;
      background: #f8fafc; outline: none;
    }
    .search-input:focus { border-color: var(--primary-color); background: white; }
    .search-icon {
      position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%);
      color: #64748b;
    }
    .header-actions { display: flex; gap: 0.5rem; }
    .icon-btn {
      background: none; border: none; cursor: pointer; padding: 0.6rem;
      border-radius: 50%; color: #475569; position: relative;
      transition: background 0.2s;
    }
    .icon-btn:hover { background: #f1f5f9; }
    .cart-btn { color: #0f172a; }
    .cart-badge {
      position: absolute; top: 0; right: 0;
      background: var(--primary-color); color: white;
      font-size: 0.7rem; font-weight: bold;
      border-radius: 99px; padding: 0.1rem 0.4rem;
    }
    .main-content { flex: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem; }
    .footer { background: #0f172a; color: #94a3b8; padding: 2rem 1.5rem; text-align: center; }
    .footer-content { max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .footer-links { display: flex; gap: 1.5rem; }
    .footer-links a { color: #cbd5e1; text-decoration: none; font-size: 0.9rem; }
    .footer-links a:hover { color: white; }
    
    @media (max-width: 768px) {
      .header-content { flex-wrap: wrap; }
      .search-container { order: 3; max-width: 100%; flex-basis: 100%; }
      .footer-content { flex-direction: column; gap: 1rem; }
    }
  `]
})
export class MainLayoutComponent {
  public cartStore = inject(CartStore);
  private router = inject(Router);
  searchQuery = '';

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/'], { queryParams: { q: this.searchQuery } });
    } else {
      this.router.navigate(['/']);
    }
  }
}
