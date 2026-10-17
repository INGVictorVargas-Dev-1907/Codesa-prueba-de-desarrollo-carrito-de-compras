import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Product } from '../../../core/models/product.model';
import { CartStore } from '../../cart/cart.store';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { RatingModule } from 'primeng/rating';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CurrencyCopPipe,
    SkeletonModule,
    SelectModule,
    RatingModule
  ],
  template: `
    <div class="catalog-header">
      <div>
        <h1 class="catalog-title">Catálogo</h1>
        <p class="catalog-subtitle">Descubre nuestra selección de tecnología</p>
      </div>
      
      <div class="filters">
        <p-select
          [options]="categories()"
          placeholder="Todas las categorías"
          [showClear]="true"
          [(ngModel)]="selectedCategory"
          (onChange)="applyFilters()"
          styleClass="w-full md:w-14rem">
        </p-select>

        <p-select
          [options]="sortOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Ordenar por"
          [showClear]="true"
          [(ngModel)]="selectedSort"
          (onChange)="applyFilters()"
          styleClass="w-full md:w-14rem">
        </p-select>
      </div>
    </div>

    <!-- Estado de carga -->
    @if (isLoading()) {
      <div class="products-grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <div class="product-card skeleton-card">
            <p-skeleton width="100%" height="200px" borderRadius="8px 8px 0 0" />
            <div class="card-content">
              <p-skeleton width="80%" height="1.2rem" styleClass="mb-2" />
              <p-skeleton width="50%" height="1rem" styleClass="mb-3" />
              <p-skeleton width="40%" height="1.5rem" />
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
                <button
                  pButton
                  icon="pi pi-plus"
                  class="p-button-rounded p-button-outlined"
                  [disabled]="product.stock === 0"
                  (click)="addToCart($event, product)"
                  aria-label="Agregar al carrito">
                </button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Paginación -->
      <div class="pagination">
        <button pButton icon="pi pi-chevron-left" class="p-button-text" [disabled]="page() === 0" (click)="changePage(page() - 1)"></button>
        <span>Página {{ page() + 1 }} de {{ totalPages() }}</span>
        <button pButton icon="pi pi-chevron-right" class="p-button-text" [disabled]="page() >= totalPages() - 1" (click)="changePage(page() + 1)"></button>
      </div>
    }
  `,
  styles: [`
    .catalog-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem; }
    .catalog-title { font-size: 2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .catalog-subtitle { color: #64748b; margin: 0.25rem 0 0 0; }
    .filters { display: flex; gap: 1rem; }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); 
      gap: 1.5rem;
    }
    .product-card {
      background: white; border-radius: 12px; overflow: hidden; 
      border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s;
      display: flex; flex-direction: column;
    }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
    
    .image-wrapper { position: relative; aspect-ratio: 4/3; background: #f8fafc; }
    .image-wrapper img { width: 100%; height: 100%; object-fit: cover; }
    .badge-agotado { position: absolute; top: 0.5rem; right: 0.5rem; background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    .badge-low-stock { position: absolute; top: 0.5rem; right: 0.5rem; background: #f59e0b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
    
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

    .pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 3rem; color: #64748b; font-weight: 500; }
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

  // Bindings para los filtros
  selectedCategory: string | null = null;
  selectedSort: string | null = null;
  sortOptions = [
    { label: 'Precio: Menor a Mayor', value: 'price,asc' },
    { label: 'Precio: Mayor a Menor', value: 'price,desc' },
    { label: 'Nombre: A-Z', value: 'name,asc' },
    { label: 'Mejor calificados', value: 'rating,desc' }
  ];

  constructor() {
    // Reaccionar a los cambios en los queryParams de la URL
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
    this.isLoading.set(true);
    
    const page = params['page'] ? parseInt(params['page'], 10) : 0;
    const q = params['q'];
    const category = params['category'];
    const sort = params['sort'];
    
    this.page.set(page);
    
    // Sincronizar UI con URL
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
    this.router.navigate(['/'], { 
      queryParams: { ...this.route.snapshot.queryParams, page: newPage } 
    });
  }

  addToCart(event: Event, product: Product): void {
    event.stopPropagation();
    this.cartStore.addProduct(product);
    this.cartStore.openPanel();
  }
}