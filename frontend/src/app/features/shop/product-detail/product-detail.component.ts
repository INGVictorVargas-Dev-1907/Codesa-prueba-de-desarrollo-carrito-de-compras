import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { SkeletonModule } from 'primeng/skeleton';
import { Product } from '../../../core/models/product.model';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../../cart/cart.store';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyCopPipe, RatingModule, InputNumberModule, ButtonModule, SkeletonModule],
  template: `
    @if (isLoading()) {
      <div class="detail-grid">
        <p-skeleton width="100%" height="400px" borderRadius="12px" />
        <div>
          <p-skeleton width="60%" height="2rem" styleClass="mb-3" />
          <p-skeleton width="40%" height="1.5rem" styleClass="mb-4" />
          <p-skeleton width="100%" height="100px" styleClass="mb-4" />
          <p-skeleton width="30%" height="3rem" />
        </div>
      </div>
    } @else if (product()) {
      <div class="detail-grid">
        <!-- Imagen -->
        <div class="image-container">
          <img [src]="product()!.image" [alt]="product()!.name" class="main-image" />
        </div>
        
        <!-- Info -->
        <div class="info-container">
          <span class="brand">{{ product()!.brand }}</span>
          <h1 class="title">{{ product()!.name }}</h1>
          
          <div class="rating-row">
            <p-rating [ngModel]="product()!.rating" [readonly]="true"/>
            <span class="rating-text">{{ product()!.rating }} ({{ product()!.stock }} disponibles)</span>
          </div>

          <div class="price-row">
            <span class="price">{{ product()!.price | currencyCop }}</span>
          </div>

          <p class="description">{{ product()!.description }}</p>

          <div class="actions-row">
            @if (product()!.stock === 0) {
              <div class="out-of-stock">Producto agotado</div>
            } @else {
              <div class="quantity-selector">
                <label>Cantidad:</label>
                <p-inputNumber
                  [(ngModel)]="quantity"
                  [min]="1"
                  [max]="maxQuantity()"
                  [showButtons]="true"
                  buttonLayout="horizontal"
                  spinnerMode="horizontal"
                  [step]="1"
                  styleClass="w-full md:w-8rem" />
              </div>
              <button
                pButton
                label="Agregar al carrito"
                icon="pi pi-cart-plus"
                class="p-button-lg add-btn"
                (click)="addToCart()">
              </button>
            }
          </div>
        </div>
      </div>
    } @else {
      <div class="error-state">
        <h2>Producto no encontrado</h2>
        <a routerLink="/" class="btn-home">Volver al catálogo</a>
      </div>
    }
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 2rem; }
    .image-container { background: #f8fafc; border-radius: 12px; overflow: hidden; aspect-ratio: 4/3; }
    .main-image { width: 100%; height: 100%; object-fit: cover; }
    
    .info-container { display: flex; flex-direction: column; justify-content: center; }
    .brand { text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.05em; font-size: 0.85rem; }
    .title { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0.5rem 0; line-height: 1.2; }
    .rating-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
    .rating-text { color: #64748b; font-size: 0.9rem; }
    .price-row { margin-bottom: 1.5rem; }
    .price { font-size: 2.5rem; font-weight: 800; color: #0f172a; }
    .description { color: #475569; line-height: 1.6; margin-bottom: 2rem; font-size: 1.05rem; }
    
    .actions-row { display: flex; align-items: flex-end; gap: 1rem; }
    .quantity-selector { display: flex; flex-direction: column; gap: 0.5rem; }
    .quantity-selector label { font-size: 0.9rem; font-weight: 600; color: #475569; }
    .add-btn { flex: 1; }
    .out-of-stock { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 8px; font-weight: 600; text-align: center; width: 100%; }

    .error-state { text-align: center; padding: 4rem; }
    .btn-home { color: var(--primary-color); text-decoration: underline; }

    @media (max-width: 768px) {
      .detail-grid { grid-template-columns: 1fr; gap: 1.5rem; }
      .title { font-size: 1.5rem; }
      .price { font-size: 2rem; }
      .actions-row { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cartStore = inject(CartStore);

  product = signal<Product | null>(null);
  isLoading = signal<boolean>(true);
  quantity = 1;

  ngOnInit(): void {
    // Escuchar cambios en el parámetro :id para recargar sin recargar la página
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number): void {
    this.isLoading.set(true);
    this.quantity = 1;
    this.api.getProduct(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.isLoading.set(false);
      },
      error: () => {
        this.product.set(null);
        this.isLoading.set(false);
      }
    });
  }

  maxQuantity(): number {
    const p = this.product();
    if (!p) return 1;
    return Math.min(p.stock, 10);
  }

  addToCart(): void {
    const p = this.product();
    if (p) {
      this.cartStore.addProduct(p, this.quantity);
      this.cartStore.openPanel();
    }
  }
}