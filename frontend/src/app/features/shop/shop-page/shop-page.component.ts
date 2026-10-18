import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RatingModule } from 'primeng/rating';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Product } from '../../../core/models/product.model';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../../cart/cart.store';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, CurrencyCopPipe,
    SkeletonModule, SelectModule, RatingModule
  ],
  template: `
    <div class="catalog-header">
      <div>
        <h1 class="catalog-title">Catálogo</h1>
        <p class="catalog-subtitle">Descubre nuestra selección de tecnología</p>
      </div>
      
      <div class="filters">
        <p-select [options]="categories()" placeholder="Todas las categorías" [showClear]="true" [(ngModel)]="selectedCategory" (onChange)="applyFilters()" styleClass="w-full md:w-14rem"></p-select>
        <p-select [options]="sortOptions" optionLabel="label" optionValue="value" placeholder="Ordenar por" [showClear]="true" [(ngModel)]="selectedSort" (onChange)="applyFilters()" styleClass="w-full md:w-14rem"></p-select>
      </div>
    </div>

    <!-- BANNER HERO -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-text">
          <span class="hero-badge"><i class="pi pi-sparkles"></i> TECNOLOGÍA DE VANGUARDIA</span>
          <h1 class="hero-title">Descubre audio, cómputo y periféricos de nivel pro.</h1>
          <p class="hero-subtitle">Aprovecha despacho gratuito en pedidos desde $200.000 COP y cupones de descuento exclusivos.</p>
          
          <!-- CUPONES REDISEÑADOS -->
          <div class="hero-coupons">
            <span class="coupon-label">Prueba los cupones:</span>
            <div class="coupon-tags">
              <span class="coupon-tag">CODESA10</span>
              <span class="coupon-tag">BIENVENIDO25</span>
            </div>
          </div>
          
        </div>
        <div class="hero-card">
          <span class="hero-card-label">ENVÍO GRATIS</span>
          <span class="hero-card-price">$ 200.000</span>
          <span class="hero-card-desc">Acumula en tu carrito</span>
        </div>
      </div>
    </div>

    <!-- Estado de carga (Skeletons) -->
    @if (isLoading()) {
      <div class="products-grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <div class="product-card skeleton-card">
            <p-skeleton width="100%" height="200px" borderRadius="8px 8px 0 0" />
            <div class="card-content">
              <p-skeleton width="30%" height="0.8rem" styleClass="mb-2" />
              <p-skeleton width="80%" height="1.2rem" styleClass="mb-2" />
              <p-skeleton width="50%" height="1rem" styleClass="mb-3" />
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                <p-skeleton width="40%" height="1.5rem" />
                <p-skeleton width="2.5rem" height="2.5rem" borderRadius="50%" />
              </div>
            </div>
          </div>
        }
      </div>
    }
    <!-- Estado vacío -->
    @else if (products().length === 0) {
      <div class="empty-state">
        <i class="pi pi-search empty-icon"></i>
        <h2>No encontramos productos</h2>
        <p>Intenta con otros filtros o términos de búsqueda.</p>
        <button pButton label="Limpiar filtros" class="p-button-outlined" (click)="clearFilters()"></button>
      </div>
    }
    <!-- Estado con datos -->
    @else {
      <div class="products-grid">
        @for (product of products(); track product.id) {
          <div class="product-card" [routerLink]="['/producto', product.id]">
            <div class="image-wrapper">
              <img [src]="product.image" [alt]="product.name" loading="lazy" />
              <div class="image-overlay"><span class="btn-view-detail"><i class="pi pi-eye"></i> Ver detalle</span></div>
              @if (product.stock === 0) {
                <div class="badge-agotado">Agotado</div>
              } @else if (product.stock <= 2) {
                <div class="badge-low-stock">Últimas unidades</div>
              }
            </div>
            <div class="card-content">
              <span class="product-brand">{{ product.brand }}</span>
              <h3 class="product-name">{{ product.name }}</h3>
              <div class="product-rating">
                <p-rating [ngModel]="product.rating" [readonly]="true" />
                <span>({{ product.rating }})</span>
              </div>
              <div class="card-footer">
                <span class="product-price">{{ product.price | currencyCop }}</span>
                <button pButton icon="pi pi-plus" class="p-button-rounded p-button-outlined" [disabled]="product.stock === 0" (click)="addToCart($event, product)" aria-label="Agregar al carrito"></button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Paginación -->
      <div class="pagination-container">
        <button class="page-btn" [disabled]="page() === 0" (click)="changePage(page() - 1)">Anterior</button>
        <div class="page-numbers">
          <span class="page-current">{{ page() + 1 }}</span>
          <span class="page-total" *ngIf="totalPages() > 1">de {{ totalPages() }}</span>
        </div>
        <button class="page-btn" [disabled]="page() >= totalPages() - 1" (click)="changePage(page() + 1)">Siguiente</button>
      </div>
    }
  `,
  styles: [`
    .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .catalog-title { font-size: 2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .catalog-subtitle { color: #64748b; margin: 0.25rem 0 0 0; }
    .filters { display: flex; gap: 1rem; }
    
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
    .product-card { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
    
    /* BANNER HERO */
    .hero-banner { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); border-radius: 20px; padding: 3rem; margin-bottom: 3rem; color: white; overflow: hidden; position: relative; }
    .hero-banner::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 60%); pointer-events: none; }
    .hero-content { display: flex; justify-content: space-between; align-items: center; gap: 2rem; position: relative; z-index: 1; }
    .hero-text { max-width: 600px; }
    .hero-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 255, 255, 0.1); padding: 0.4rem 1rem; border-radius: 99px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; color: #a5b4fc; margin-bottom: 1.5rem; }
    .hero-title { font-size: 2.8rem; font-weight: 800; line-height: 1.1; margin: 0 0 1rem 0; }
    .hero-subtitle { font-size: 1.1rem; color: #cbd5e1; margin-bottom: 1.5rem; line-height: 1.5; }
    .hero-coupons { display: flex; flex-direction: column; gap: 0.5rem; }
    .coupon-label { font-size: 0.8rem; color: #94a3b8; }
    .coupon-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .coupon-tag {
      background: rgba(79, 70, 229, 0.3); border: 1px solid rgba(165, 180, 252, 0.3); color: #e0e7ff;  padding: 0.2rem 0.6rem;
      border-radius: 6px; font-family: monospace; font-weight: bold; font-size: 0.8rem;
    }
    .hero-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); padding: 2rem; border-radius: 16px; text-align: center; backdrop-filter: blur(10px); display: flex; flex-direction: column; gap: 0.5rem; min-width: 220px; }
    .hero-card-label { font-size: 0.8rem; font-weight: 700; color: #a5b4fc; letter-spacing: 0.05em; }
    .hero-card-price { font-size: 2rem; font-weight: 800; }
    .hero-card-desc { font-size: 0.85rem; color: #94a3b8; }

    @media (max-width: 768px) {
      .hero-banner { padding: 1.5rem; border-radius: 12px; }
      .hero-card { min-width: 100%; padding: 1.5rem; }
      .hero-title { font-size: 1.75rem; line-height: 1.2; }
      .hero-subtitle { font-size: 0.95rem; }
      .hero-coupons { align-items: center; text-align: center; }
      .coupon-tags { justify-content: center; }
      
      .products-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 1rem; }
      .card-content { padding: 0.75rem; }
      .product-name { font-size: 0.85rem; }
      .product-price { font-size: 1rem; }
      .catalog-header { flex-direction: column; align-items: flex-start; }
      .filters { width: 100%; flex-direction: column; }
      .filters .p-select { width: 100% !important; }
    }
    
    /* IMAGEN Y OVERLAY */
    .image-wrapper { position: relative; aspect-ratio: 1 / 1; background: #f8fafc; overflow: hidden; }
    .image-wrapper img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
    .image-overlay { position: absolute; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(2px); }
    .btn-view-detail { background: white; color: #0f172a; padding: 0.6rem 1.2rem; border-radius: 99px; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; transform: translateY(10px); transition: transform 0.3s ease; }
    .product-card:hover .image-overlay { opacity: 1; }
    .product-card:hover .btn-view-detail { transform: translateY(0); }
    .badge-agotado { position: absolute; top: 0.5rem; right: 0.5rem; background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .badge-low-stock { position: absolute; top: 0.5rem; right: 0.5rem; background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .product-card:hover .image-wrapper img { transform: scale(1.05); }
    
    .card-content { padding: 1rem; display: flex; flex-direction: column; flex: 1; }
    .product-brand { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; }
    .product-name { font-size: 1rem; font-weight: 600; margin: 0.25rem 0 0.5rem 0; color: #0f172a; flex: 1; }
    .product-rating { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; font-size: 0.8rem; color: #64748b; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
    .product-price { font-size: 1.25rem; font-weight: 800; color: #0f172a; }
    
    .empty-state { text-align: center; padding: 4rem 1rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
    .empty-icon { font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem; }
    .empty-state h2 { color: #0f172a; margin: 0 0 0.5rem 0; }
    .empty-state p { color: #64748b; margin-bottom: 1.5rem; }

    /* PAGINACIÓN */
    .pagination-container { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 3rem; }
    .page-btn { background: white; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 8px; color: #475569; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .page-btn:hover:not(:disabled) { border-color: #4f46e5; color: #4f46e5; background: #f8fafc; }
    .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .page-numbers { display: flex; align-items: baseline; gap: 0.25rem; }
    .page-current { background: #4f46e5; color: white; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }
    .page-total { font-size: 0.85rem; color: #64748b; }

    /* HOVER DE LOS SELECTS */
    :host ::ng-deep .p-select:hover {
      background-color: rgba(30, 27, 75, 0.05) !important;
      border-color: #1e1b4b !important;
    }
    :host ::ng-deep .p-select:hover .p-select-label,
    :host ::ng-deep .p-select:hover .p-select-dropdown-icon {
      color: #1e1b4b !important;
    }
    :host ::ng-deep .p-select-option:hover {
      background-color: rgba(30, 27, 75, 0.08) !important;
      color: #1e1b4b !important;
    }
  `]
})
export class ShopPageComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cartStore = inject(CartStore);

  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  isLoading = signal<boolean>(true);
  
  page = signal<number>(0);
  totalPages = signal<number>(1);

  selectedCategory: string | null = null;
  selectedSort: string | null = null;
  sortOptions = [
    { label: 'Precio: Menor a Mayor', value: 'price,asc' },
    { label: 'Precio: Mayor a Menor', value: 'price,desc' },
    { label: 'Nombre: A-Z', value: 'name,asc' },
    { label: 'Mejor calificados', value: 'rating,desc' }
  ];

  constructor() {
    effect(() => {
      this.route.queryParams.subscribe(params => {
        this.loadProducts(params);
      });
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.api.getCategories().subscribe(cats => this.categories.set(cats));
  }

  loadProducts(params: Record<string, string>): void {
    this.isLoading.set(true); // Activa skeletons al instante
    
    const page = params['page'] ? parseInt(params['page'], 10) : 0;
    const q = params['q'];
    const category = params['category'];
    const sort = params['sort'];
    
    this.page.set(page);
    this.selectedCategory = category || null;
    this.selectedSort = sort || null;

    this.api.getProducts({ q, category, sort: sort?.split(',')[0], order: sort?.split(',')[1], page, size: 8 })
      .subscribe({
        next: (res) => {
          this.products.set(res.items);
          this.totalPages.set(res.totalPages);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        }
      });
  }

  applyFilters(): void {
    const queryParams: Record<string, string | number> = {};
    if (this.selectedCategory) queryParams['category'] = this.selectedCategory;
    if (this.selectedSort) queryParams['sort'] = this.selectedSort;
    const q = this.route.snapshot.queryParams['q'];
    if (q) queryParams['q'] = q;
    this.router.navigate(['/'], { queryParams });
  }

  clearFilters(): void {
    this.router.navigate(['/']);
  }

  changePage(newPage: number): void {
    this.router.navigate(['/'], { queryParams: { ...this.route.snapshot.queryParams, page: newPage } });
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.cartStore.addProduct(product);
    this.cartStore.openPanel();
  }
}