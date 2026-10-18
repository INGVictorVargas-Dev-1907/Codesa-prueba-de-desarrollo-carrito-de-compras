import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CartStore } from '../../../features/cart/cart.store';
import { CartSidebarComponent } from '../../../features/cart/cart-sidebar/cart-sidebar.component';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive, FormsModule,
    CartSidebarComponent, CurrencyCopPipe, ButtonModule
  ],
  template: `
    <div class="layout">
      <!-- TOP BAR -->
      <div class="top-bar">
        <div class="top-bar-content">
          <span><strong>Envío gratis</strong> en compras superiores a $200.000 COP</span>
        </div>
      </div>

      <!-- HEADER PRINCIPAL -->
      <header class="header">
        <div class="header-content">
          <!-- Logo -->
          <a routerLink="/" class="logo">
            <div class="logo-icon"><i class="pi pi-box"></i></div>
            <div class="logo-text">
              <span class="logo-title">Codesa Shop</span>
              <span class="logo-subtitle">TECH STORE</span>
            </div>
          </a>

          <!-- Botón Menú Móvil -->
          <button class="mobile-menu-btn" (click)="toggleMobileMenu()" aria-label="Abrir menú">
            <i class="pi" [class.pi-bars]="!isMobileMenuOpen" [class.pi-times]="isMobileMenuOpen"></i>
          </button>

          <!-- Navegación Escritorio -->
          <nav class="main-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Catálogo</a>
            <a routerLink="/carrito" routerLinkActive="active">Carrito</a>
            <a routerLink="/checkout" routerLinkActive="active">Checkout</a>
          </nav>

          <!-- Navegación Móvil (Desplegable) -->
          @if (isMobileMenuOpen) {
            <nav class="mobile-nav">
              <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="isMobileMenuOpen = false">Catálogo</a>
              <a routerLink="/carrito" routerLinkActive="active" (click)="isMobileMenuOpen = false">Carrito</a>
              <a routerLink="/checkout" routerLinkActive="active" (click)="isMobileMenuOpen = false">Checkout</a>
            </nav>
          }

          <!-- Buscador con botón de limpiar -->
          <div class="search-container">
            <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
            />
            @if (searchQuery) {
              <button class="search-clear-btn" (click)="clearSearch()" aria-label="Limpiar búsqueda">
                <i class="pi pi-times"></i>
              </button>
            }
          </div>

          <!-- Mini Carrito -->
          <div class="mini-cart-container">
            <button class="mini-cart" (click)="cartStore.openPanel()">
              <div class="cart-icon-wrapper">
                <i class="pi pi-shopping-cart"></i>
                @if (cartStore.itemCount() > 0) {
                  <span class="cart-badge">{{ cartStore.itemCount() }}</span>
                }
              </div>
              <div class="cart-info">
                <span class="cart-label">Mi Carrito</span>
                <span class="cart-total">{{ cartStore.subtotal() | currencyCop }}</span>
              </div>
            </button>

            <!-- Dropdown Hover -->
            @if (!cartStore.isEmpty()) {
              <div class="mini-cart-dropdown">
                <div class="dropdown-header">
                  <span class="title">MINI CARRITO ({{ cartStore.itemCount() }} ÍTEMS)</span>
                  <span class="total">{{ cartStore.subtotal() | currencyCop }}</span>
                </div>
                <div class="dropdown-lines">
                  @for (line of cartStore.lines(); track line.product.id) {
                    <div class="dropdown-line">
                      <img [src]="line.product.image" [alt]="line.product.name">
                      <div class="dropdown-line-info">
                        <span class="name">{{ line.product.name }}</span>
                        <span class="qty">{{ line.quantity }} x {{ line.product.price | currencyCop }}</span>
                      </div>
                      <span class="line-total">{{ (line.product.price * line.quantity) | currencyCop }}</span>
                    </div>
                  }
                </div>
                <div class="dropdown-footer">
                  <button pButton label="Abrir" class="p-button-outlined p-button-sm" (click)="cartStore.openPanel()"></button>
                  <button pButton label="Ver todo" icon="pi pi-arrow-right" iconPos="right" class="p-button-sm" routerLink="/carrito"></button>
                </div>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- FOOTER PREMIUM (Agregado según lo solicitado) -->
      <footer class="main-footer">
        <div class="features-bar">
          <div class="feature"><i class="pi pi-truck"></i><div><strong>Envío Gratis desde $200.000</strong><span>Despachos rápidos a toda Colombia</span></div></div>
          <div class="feature"><i class="pi pi-shield"></i><div><strong>Garantía Directa 12 Meses</strong><span>Productos originales con factura</span></div></div>
          <div class="feature"><i class="pi pi-refresh"></i><div><strong>Devolución sin Complicaciones</strong><span>30 días de satisfacción total</span></div></div>
          <div class="feature"><i class="pi pi-credit-card"></i><div><strong>Múltiples Formas de Pago</strong><span>Tarjetas de crédito o contra entrega</span></div></div>
        </div>
        <div class="footer-content">
          <div class="footer-col brand-col">
            <div class="footer-logo"><div class="logo-icon"><i class="pi pi-box"></i></div><span>Codesa Shop</span></div>
            <p>Plataforma de comercio electrónico de tecnología desarrollada para la prueba técnica. Implementa arquitectura limpia, TypeScript estricto, Angular 20 Standalone con PrimeNG 20 y backend Spring Boot 3 sobre PostgreSQL.</p>
            <div class="status-indicator"><span class="dot"></span> PostgreSQL & Spring Boot REST API conectadas</div>
          </div>
          <div class="footer-col">
            <h3>CATEGORÍAS</h3>
            <ul>
              <li><a href="#">Audio de Alta Fidelidad</a></li>
              <li><a href="#">Periféricos Gaming & Pro</a></li>
              <li><a href="#">Cómputo & Laptops</a></li>
              <li><a href="#">Celulares & Accesorios</a></li>
            </ul>
          </div>
          <div class="footer-col coupons-col">
            <h3>CUPONES DISPONIBLES</h3>
            <div class="coupon-card"><strong class="coupon-code">CODESA10</strong><span>10% desc. en compras ≥ $100.000 (Tope $80.000)</span></div>
            <div class="coupon-card"><strong class="coupon-code-1">BIENVENIDO25</strong><span>25% desc. en compras ≥ $400.000</span></div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Codesa Shop. Prueba Técnica Take-Home.</span>
          <span>Cumplimiento 100% de especificaciones técnicas y principios SOLID.</span>
        </div>
      </footer>
    </div>

    <app-cart-sidebar></app-cart-sidebar>
  `,
  styles: [`
    .layout { display: flex; flex-direction: column; min-height: 100vh; background: #f8fafc; }
    
    /* TOP BAR */
    .top-bar { background: #0f172a; color: #94a3b8; font-size: 0.8rem; padding: 0.5rem 0; }
    .top-bar-content { max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; display: flex; justify-content: space-between; align-items: center; }
    .top-bar strong { color: #fbbf24; }
    .top-bar-links { display: flex; gap: 1.5rem; }
    .top-bar-links a { color: #94a3b8; text-decoration: none; display: flex; align-items: center; gap: 0.25rem; }
    .top-bar-links a:hover { color: white; }

    /* HEADER */
    .header { background: white; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; z-index: 100; }
    .header-content { max-width: 1280px; margin: 0 auto; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 2rem; }
    .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-icon { width: 40px; height: 40px; background: var(--primary-color); color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-title { font-size: 1.1rem; font-weight: 800; color: #0f172a; line-height: 1; }
    .logo-subtitle { font-size: 0.65rem; font-weight: 600; color: #64748b; letter-spacing: 0.1em; }
    .main-nav { display: flex; gap: 1.5rem; }
    .main-nav a { text-decoration: none; color: #475569; font-weight: 500; font-size: 0.95rem; transition: color 0.2s; }
    .main-nav a:hover, .main-nav a.active { color: var(--primary-color); }
     /* MENÚ MÓVIL */
    .mobile-menu-btn {
      display: none; /* Oculto por defecto en escritorio */
      background: none; border: none; font-size: 1.5rem; color: #0f172a;
      cursor: pointer; padding: 0.5rem;
    }
    .mobile-nav {
      display: flex; flex-direction: column; gap: 0.5rem;
      position: absolute; top: 100%; left: 0; right: 0;
      background: white; border-bottom: 1px solid #e2e8f0;
      padding: 1rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 100;
    }
    .mobile-nav a {
      text-decoration: none; color: #475569; font-weight: 500; font-size: 1rem;
      padding: 0.75rem 1rem; border-radius: 8px;
    }
    .mobile-nav a:hover, .mobile-nav a.active {
      background: #f8fafc; color: var(--primary-color);
    }

    @media (max-width: 992px) {
      .main-nav { display: none; }
      .mobile-menu-btn { display: block; }
      .header-content {
        position: relative;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .search-container {
        order: 4;
        max-width: 100%;
        flex-basis: 100%;
        margin-top: 0.5rem;
      }
      .mini-cart-container { margin-left: auto; }
    }

    @media (max-width: 480px) {
      .header-content { padding: 0.75rem 1rem; }
      .logo-title { font-size: 0.95rem; }
      .logo-subtitle { font-size: 0.55rem; }
      .cart-info { display: none; } /* Solo muestra el ícono en móviles muy pequeños */
      .top-bar-content span { font-size: 0.7rem; }
      .top-bar-links { display: none; } /* Oculta links de la top-bar en móviles */
    }

    /* BARRA DE BÚSQUEDA */
    .search-container { flex: 1; max-width: 350px; position: relative; }
    .search-container input {
      width: 100%; padding: 0.6rem 2.5rem 0.6rem 2.5rem;
      border-radius: 8px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a;
      outline: none; font-size: 0.9rem; transition: all 0.2s;
    }
    .search-container input:focus { border-color: var(--primary-color); background: white; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .search-icon { position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%); color: #64748b; }
    .search-clear-btn {
      position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%);
      background: #e2e8f0; border: none; border-radius: 50%; width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #475569; font-size: 0.65rem; transition: background 0.2s;
    }
    .search-clear-btn:hover { background: #cbd5e1; color: #0f172a; }

    /* MINI CARRITO */
    .mini-cart-container { position: relative; }
    .mini-cart { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
    .mini-cart:hover { border-color: var(--primary-color); background: white; }
    .cart-icon-wrapper { position: relative; color: #0f172a; font-size: 1.25rem; }
    .cart-badge { position: absolute; top: -6px; right: -8px; background: var(--primary-color); color: white; font-size: 0.65rem; font-weight: bold; border-radius: 99px; padding: 0.1rem 0.35rem; }
    .cart-info { display: flex; flex-direction: column; align-items: flex-start; }
    .cart-label { font-size: 0.7rem; color: #64748b; font-weight: 600; }
    .cart-total { font-size: 0.9rem; font-weight: 800; color: #0f172a; }

    /* DROPDOWN DEL MINI CARRITO */
    .mini-cart-dropdown { position: absolute; top: 100%; right: 0; width: 340px; margin-top: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); opacity: 0; visibility: hidden; transform: translateY(10px); transition: all 0.2s ease; z-index: 1000; }
    .mini-cart-container:hover .mini-cart-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
    .dropdown-header { display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #e2e8f0; font-size: 0.75rem; font-weight: 700; color: #64748b; }
    .dropdown-header .total { color: #4f46e5; font-size: 0.9rem; }
    .dropdown-lines { max-height: 250px; overflow-y: auto; padding: 1rem; }
    .dropdown-line { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: center; }
    .dropdown-line:last-child { margin-bottom: 0; }
    .dropdown-line img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }
    .dropdown-line-info { display: flex; flex-direction: column; flex: 1; }
    .dropdown-line-info .name { font-size: 0.8rem; font-weight: 600; color: #0f172a; line-height: 1.2; margin-bottom: 0.2rem; }
    .dropdown-line-info .qty { font-size: 0.75rem; color: #64748b; }
    .line-total { font-weight: 700; font-size: 0.85rem; color: #0f172a; }
    .dropdown-footer { padding: 1rem; border-top: 1px solid #e2e8f0; background: #f8fafc; border-radius: 0 0 12px 12px; display: flex; gap: 0.5rem; }
    .dropdown-footer button { flex: 1; padding: 0.5rem 0.75rem !important; font-size: 0.8rem !important; white-space: nowrap; height: auto !important; }
    .dropdown-footer .p-button-outlined { color: #4f46e5 !important; border-color: #4f46e5 !important; background: white !important; }

    .main-content { flex: 1; max-width: 1280px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem; }

    /* FOOTER PREMIUM */
    .main-footer { background: #0f172a; color: #94a3b8; margin-top: 3rem; }
    .features-bar { display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap; padding: 1.5rem; border-bottom: 1px solid #1e293b; background: #111827; }
    .feature { display: flex; align-items: center; gap: 0.75rem; }
    .feature i { font-size: 1.5rem; color: #6366f1; }
    .feature strong { display: block; color: white; font-size: 0.85rem; }
    .feature span { font-size: 0.75rem; color: #64748b; }
    .footer-content { max-width: 1280px; margin: 0 auto; padding: 3rem 1.5rem; display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 3rem; }
    .footer-logo { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
    .footer-logo .logo-icon { width: 32px; height: 32px; background: #4f46e5; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; }
    .footer-logo span { font-size: 1.2rem; font-weight: 800; color: white; }
    .brand-col p { font-size: 0.85rem; line-height: 1.6; margin-bottom: 1.5rem; }
    .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #10b981; }
    .status-indicator .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
    .footer-col h3 { color: white; font-size: 0.8rem; letter-spacing: 0.05em; margin-bottom: 1.25rem; font-weight: 700; }
    .footer-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
    .footer-col ul a { color: #94a3b8; text-decoration: none; font-size: 0.85rem; transition: color 0.2s; }
    .footer-col ul a:hover { color: white; }
    .coupon-card { background: #1e293b; border: 1px solid #334155; padding: 0.75rem; border-radius: 8px; margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .coupon-code { color: #818cf8; font-family: monospace; font-size: 0.85rem; }
    .coupon-code-1 { color: #10b981; font-family: monospace; font-size: 0.85rem; }
    .coupon-card span { font-size: 0.7rem; color: #94a3b8; }
    .footer-bottom { max-width: 1280px; margin: 0 auto; padding: 1.5rem; border-top: 1px solid #1e293b; display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; flex-wrap: wrap; gap: 1rem; }

    @media (max-width: 992px) {
      .main-nav { display: none; }
      .header-content { flex-wrap: wrap; }
      .search-container { order: 3; max-width: 100%; flex-basis: 100%; }
      .footer-content { grid-template-columns: 1fr; gap: 2rem; }
      .features-bar { gap: 1.5rem; flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class MainLayoutComponent implements OnDestroy {
  public cartStore = inject(CartStore);
  private router = inject(Router);
  
  isMobileMenuOpen = false;
  searchQuery = '';
  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.trim()) {
        this.router.navigate(['/'], { queryParams: { q: query.trim() } });
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchInput();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }
}