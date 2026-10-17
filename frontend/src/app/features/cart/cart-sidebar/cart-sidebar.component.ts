import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStore } from '../cart.store';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';

import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [CommonModule, CurrencyCopPipe, DrawerModule, ButtonModule],
  template: `
    <p-drawer [(visible)]="visible" position="right" styleClass="cart-sidebar-panel" (onHide)="onHide()">
      <ng-template pTemplate="header">
        <div class="sidebar-header">
          <h2>Tu Carrito</h2>
          <span class="item-count">({{ cartStore.itemCount() }} items)</span>
        </div>
      </ng-template>

      @if (cartStore.isEmpty()) {
        <div class="empty-cart">
          <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #cbd5e1"></i>
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos para continuar.</p>
          <p-button label="Ver catálogo" (onClick)="cartStore.closePanel()"></p-button>
        </div>
      } @else {
        <div class="cart-lines">
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="cart-line">
              <img [src]="line.product.image" [alt]="line.product.name" class="line-img">
              <div class="line-details">
                <span class="line-name">{{ line.product.name }}</span>
                <span class="line-price">{{ line.product.price | currencyCop }} x {{ line.quantity }}</span>
              </div>
            </div>
          }
        </div>
        
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ cartStore.subtotal() | currencyCop }}</span>
          </div>
          <button pButton label="Ir al carrito completo" class="p-button-outlined w-full"></button>
        </div>
      }
    </p-drawer>
  `,
  styles: [`
    .sidebar-header { display: flex; align-items: baseline; gap: 0.5rem; }
    .sidebar-header h2 { margin: 0; font-size: 1.25rem; color: #0f172a; }
    .item-count { color: #64748b; font-size: 0.9rem; }
    .empty-cart { text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-cart h3 { margin: 0; color: #0f172a; }
    .empty-cart p { color: #64748b; margin: 0 0 1rem 0; }
    .cart-line { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; }
    .line-img { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; background: #f1f5f9; }
    .line-details { display: flex; flex-direction: column; justify-content: center; }
    .line-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    .line-price { color: #64748b; font-size: 0.85rem; }
    .cart-summary { margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; }
    .summary-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; margin-bottom: 1rem; color: #0f172a; }
  `]
})
export class CartSidebarComponent {
  public cartStore = inject(CartStore);

  get visible(): boolean {
    return this.cartStore.isOpen();
  }
  
  set visible(val: boolean) {
    if (val) {
      this.cartStore.openPanel();
    } else {
      this.cartStore.closePanel();
    }
  }

  onHide(): void {
    this.cartStore.closePanel();
  }
}