import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../cart.store';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyCopPipe, ButtonModule],
  template: `
    <div class="page-header">
      <h1>Tu Carrito</h1>
      <p>Revisa tus productos antes de pagar</p>
    </div>

    @if (cartStore.isEmpty()) {
      <div class="empty-page">
        <i class="pi pi-shopping-cart" style="font-size: 4rem; color: #cbd5e1;"></i>
        <h2>Tu carrito está vacío</h2>
        <p>Parece que aún no has agregado nada.</p>
        <button pButton label="Explorar productos" routerLink="/"></button>
      </div>
    } @else {
      <div class="cart-layout">
        <!-- Lista de productos -->
        <div class="cart-items">
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="cart-item">
              <img [src]="line.product.image" [alt]="line.product.name">
              <div class="item-info">
                <span class="brand">{{ line.product.brand }}</span>
                <h3>{{ line.product.name }}</h3>
                <span class="price">{{ line.product.price | currencyCop }}</span>
              </div>
              <div class="item-actions">
                <span class="line-total">{{ line.product.price * line.quantity | currencyCop }}</span>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-danger" (click)="cartStore.removeLine(line.product.id)"></button>
              </div>
            </div>
          }
        </div>

        <!-- Resumen -->
        <div class="cart-summary-panel">
          <h2>Resumen del pedido</h2>
          
          <div class="summary-row">
            <span>Subtotal ({{ cartStore.itemCount() }} items)</span>
            <span>{{ cartStore.subtotal() | currencyCop }}</span>
          </div>
          @if (cartStore.discount() > 0) {
            <div class="summary-row discount">
              <span>Descuento</span>
              <span>-{{ cartStore.discount() | currencyCop }}</span>
            </div>
          }
          <div class="summary-row">
            <span>Envío</span>
            <span>{{ cartStore.shipping() === 0 ? 'Gratis' : (cartStore.shipping() | currencyCop) }}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>{{ cartStore.total() | currencyCop }}</span>
          </div>

          <button pButton label="Continuar al pago" icon="pi pi-arrow-right" iconPos="right" class="p-button-lg w-full checkout-btn" routerLink="/checkout"></button>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .page-header p { color: #64748b; margin: 0.25rem 0 0 0; }

    .empty-page { text-align: center; padding: 4rem 1rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; }
    .empty-page h2 { color: #0f172a; margin: 1rem 0 0.5rem; }
    .empty-page p { color: #64748b; margin-bottom: 1.5rem; }

    .cart-layout { display: grid; grid-template-columns: 1fr 350px; gap: 2rem; align-items: start; }
    
    .cart-items { background: white; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
    .cart-item { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
    .cart-item:last-child { border-bottom: none; }
    .cart-item img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
    .item-info { flex: 1; }
    .item-info .brand { text-transform: uppercase; color: #64748b; font-size: 0.75rem; font-weight: 600; }
    .item-info h3 { margin: 0.25rem 0 0.5rem; font-size: 1.1rem; color: #0f172a; }
    .item-info .price { color: #64748b; font-weight: 500; }
    
    .item-actions { display: flex; align-items: center; gap: 1.5rem; }
    .line-total { font-weight: 700; font-size: 1.1rem; color: #0f172a; }

    .cart-summary-panel { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.5rem; position: sticky; top: 100px; }
    .cart-summary-panel h2 { font-size: 1.25rem; margin: 0 0 1.5rem; color: #0f172a; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #475569; }
    .summary-row.discount { color: #16a34a; }
    .summary-row.total { font-weight: 800; font-size: 1.3rem; color: #0f172a; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px solid #e2e8f0; }
    .checkout-btn { margin-top: 1.5rem; }

    @media (max-width: 992px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-summary-panel { position: static; }
    }
    @media (max-width: 576px) {
      .cart-item { flex-direction: column; align-items: flex-start; }
      .item-actions { width: 100%; justify-content: space-between; margin-top: 1rem; }
    }
  `]
})
export class CartPageComponent {
  public cartStore = inject(CartStore);
}