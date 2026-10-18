import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../cart.store';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, CurrencyCopPipe,
    DrawerModule, ButtonModule, InputTextModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <!-- Toast personalizado para deshacer -->
    <p-toast position="bottom-center" key="undo">
      <ng-template let-message pTemplate="message">
        <div class="custom-toast-content">
          <span class="toast-text">{{ message.summary }}</span>
          <button class="undo-btn" (click)="performUndo()">
            <i class="pi pi-replay"></i> Deshacer
          </button>
          <button class="close-btn" (click)="messageService.clear('undo')"><i class="pi pi-times"></i></button>
        </div>
      </ng-template>
    </p-toast>
    
    <p-drawer [(visible)]="visible" position="right" styleClass="cart-sidebar-panel" (onHide)="onHide()" [showCloseIcon]="false">
      <ng-template pTemplate="header">
        <div class="sidebar-header">
          <div class="header-title">
            <div class="icon-box"><i class="pi pi-shopping-bag"></i></div>
            <div>
              <h2>Carrito de Compras</h2>
              <span class="item-count">{{ cartStore.itemCount() }} artículo(s)</span>
            </div>
          </div>
          <div class="header-actions">
            <button pButton icon="pi pi-trash" class="p-button-text p-button-secondary p-button-sm" (click)="clearCart()" aria-label="Vaciar carrito"></button>
            <button pButton icon="pi pi-times" class="p-button-text p-button-secondary p-button-sm" (click)="cartStore.closePanel()" aria-label="Cerrar"></button>
          </div>
        </div>
      </ng-template>

      @if (cartStore.isEmpty()) {
        <div class="empty-cart">
          <i class="pi pi-shopping-cart" style="font-size: 3rem; color: #cbd5e1"></i>
          <h3>Tu carrito está vacío</h3>
          <p>Explora nuestro catálogo de tecnología y encuentra los mejores audífonos, computadores y periféricos.</p>
          <button pButton label="Ver Catálogo de Productos" (click)="cartStore.closePanel()" routerLink="/"></button>
        </div>
      } @else {
        <!-- BARRA DE PROGRESO -->
        <div class="shipping-progress-section">
          @if (cartStore.shipping() > 0) {
            <div class="shipping-text">
              <i class="pi pi-truck"></i>
              <span>Faltan <strong>{{ cartStore.amountForFreeShipping() | currencyCop }}</strong> para envío gratis</span>
              <span class="progress-pct">{{ progressPercentage() }}%</span>
            </div>
          } @else {
            <div class="shipping-text success">
              <i class="pi pi-check-circle"></i>
              <span>¡Felicidades! Tienes <strong>envío gratis</strong>.</span>
              <span class="progress-pct">100%</span>
            </div>
          }
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="progressPercentage()"></div>
          </div>
        </div>

        <!-- LÍNEAS DEL CARRITO -->
        <div class="cart-lines">
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="cart-line">
              <img [src]="line.product.image" [alt]="line.product.name" class="line-img">
              <div class="line-details">
                <span class="line-brand">{{ line.product.brand | uppercase }} · {{ line.product.category | uppercase }}</span>
                <span class="line-name">{{ line.product.name }}</span>
                <span class="line-price">{{ line.product.price | currencyCop }}</span>
                
                <div class="line-actions">
                  <div class="qty-selector">
                    <button (click)="updateQty(line.product.id, line.quantity - 1)" [disabled]="line.quantity <= 1">−</button>
                    <span>{{ line.quantity }}</span>
                    <button (click)="updateQty(line.product.id, line.quantity + 1)" [disabled]="line.quantity >= maxQty(line.product.stock)">+</button>
                  </div>
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-secondary p-button-sm" (click)="removeLine(line.product.id)"></button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- RESUMEN -->
        <div class="summary-box">
          <h3>Resumen del Pedido</h3>
          
          @if (cartStore.coupon()) {
            <div class="applied-coupon">
              <span><i class="pi pi-tag"></i> {{ cartStore.coupon()!.code }}</span>
              <button (click)="removeCoupon()">Quitar</button>
            </div>
          }

          <div class="summary-row">
            <span>Subtotal productos</span>
            <span>{{ cartStore.subtotal() | currencyCop }}</span>
          </div>
          @if (cartStore.discount() > 0) {
            <div class="summary-row discount">
              <span>Descuento</span>
              <span>- {{ cartStore.discount() | currencyCop }}</span>
            </div>
          }
          <div class="summary-row">
            <span>Envío a domicilio</span>
            <span>{{ cartStore.shipping() === 0 ? 'Gratis' : (cartStore.shipping() | currencyCop) }}</span>
          </div>
          
          <div class="summary-total">
            <span>Total</span>
            <span>{{ cartStore.total() | currencyCop }}</span>
          </div>
          <span class="tax-label">Precios con IVA incluido</span>
          
          @if (cartStore.shipping() > 0) {
            <div class="info-alert">
              <i class="pi pi-info-circle"></i>
              Agrega <strong>{{ cartStore.amountForFreeShipping() | currencyCop }}</strong> más para obtener envío gratis.
            </div>
          }
        </div>

        <!-- BOTONES -->
        <div class="sidebar-footer">
          <button pButton label="Ver carrito" class="p-button-outlined" routerLink="/carrito" (click)="cartStore.closePanel()"></button>
          <button pButton label="Checkout" icon="pi pi-arrow-right" iconPos="right" routerLink="/checkout" (click)="cartStore.closePanel()"></button>
        </div>
      }
    </p-drawer>
  `,
  styles: [`
    /* FORZAR MODO CLARO Y ANCHO */
    :host ::ng-deep .p-drawer {
      background-color: #ffffff !important;
      color: #0f172a !important;
      width: 500px !important; 
    }
    @media (max-width: 500px) { 
      :host ::ng-deep .p-drawer { width: 100% !important; } 
    }

    :host ::ng-deep .p-drawer .p-drawer-header {
      background-color: #ffffff !important;
      color: #0f172a !important;
      border-bottom: 1px solid #e2e8f0 !important;
      padding: 1.25rem 1.5rem !important;
    }
    :host ::ng-deep .p-drawer .p-drawer-content {
      background-color: #f8fafc !important;
      color: #0f172a !important;
      padding: 1.25rem !important;
    }

    /* HEADER */
    .sidebar-header { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .header-title { display: flex; align-items: center; gap: 0.75rem; }
    .icon-box { width: 36px; height: 36px; background: #e0e7ff; color: #4f46e5; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .header-title h2 { margin: 0; font-size: 1.1rem; color: #0f172a; font-weight: 700; }
    .item-count { font-size: 0.8rem; color: #64748b; }
    .header-actions { display: flex; gap: 0.25rem; }

    .empty-cart { text-align: center; padding: 3rem 1rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: #0f172a; }
    .empty-cart h3 { color: #0f172a; font-size: 1.2rem; margin: 0.5rem 0; }
    .empty-cart p { color: #64748b; margin-bottom: 1rem; }

    /* BARRA DE PROGRESO */
    .shipping-progress-section { margin: 0 0 1.25rem 0; padding: 0.875rem; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; }
    .shipping-text { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #4f46e5; margin-bottom: 0.6rem; font-weight: 500; }
    .shipping-text.success { color: #16a34a; }
    .progress-pct { margin-left: auto; font-weight: 700; font-size: 0.8rem; }
    .progress-bar-bg { height: 8px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
    .progress-bar-fill { height: 100%; background: #4f46e5; border-radius: 99px; transition: width 0.4s ease; }

    /* LÍNEAS */
    .cart-lines { flex: 1; overflow-y: auto; margin-bottom: 1.25rem; }
    .cart-line { display: flex; gap: 1rem; padding: 0.875rem; background: white; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
    .line-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; background: #f1f5f9; }
    .line-details { display: flex; flex-direction: column; flex: 1; }
    .line-brand { font-size: 0.65rem; color: #64748b; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .line-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; line-height: 1.3; margin-bottom: 0.25rem; }
    .line-price { color: #64748b; font-size: 0.8rem; margin-bottom: 0.5rem; }
    .line-actions { display: flex; align-items: center; justify-content: space-between; }

    .qty-selector { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
    .qty-selector button { background: white; border: none; width: 28px; height: 28px; cursor: pointer; color: #475569; font-size: 0.9rem; font-weight: bold; }
    .qty-selector button:hover:not(:disabled) { background: #f8fafc; }
    .qty-selector button:disabled { opacity: 0.5; cursor: not-allowed; }
    .qty-selector span { width: 28px; text-align: center; font-weight: 600; font-size: 0.85rem; color: #0f172a; }

    /* RESUMEN */
    .summary-box { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 1.25rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    .summary-box h3 { margin: 0 0 0.875rem 0; font-size: 0.95rem; color: #0f172a; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.6rem; font-size: 0.85rem; color: #475569; }
    .summary-row.discount { color: #16a34a; }
    .summary-total { display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 800; color: #4f46e5; margin: 0.875rem 0 0.25rem 0; }
    .tax-label { font-size: 0.7rem; color: #94a3b8; display: block; margin-bottom: 0.875rem; }
    
    .info-alert { background: #fffbeb; color: #b45309; padding: 0.6rem; border-radius: 8px; font-size: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem; border: 1px solid #fde68a; }
    .applied-coupon { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; color: #166534; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.875rem; }
    .applied-coupon button { background: none; border: none; color: #166534; text-decoration: underline; cursor: pointer; font-size: 0.75rem; }

    /* BOTONES */
    .sidebar-footer { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
    .sidebar-footer button { flex: 1; padding: 0.6rem 0.5rem; font-size: 0.85rem; white-space: nowrap; }

    /* ESTILOS DEL TOAST PERSONALIZADO (UNDO) */
    .custom-toast-content {
      display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      background: #0f172a; color: white; padding: 1rem 1.25rem;
      border-radius: 12px; width: 100%; min-width: 350px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      font-size: 0.9rem; font-weight: 500;
    }
    .toast-text { flex: 1; }
    .undo-btn {
      background: #4f46e5; color: white; border: none; padding: 0.4rem 0.8rem;
      border-radius: 6px; font-weight: 700; font-size: 0.8rem; cursor: pointer;
      display: flex; align-items: center; gap: 0.4rem; transition: background 0.2s;
    }
    .undo-btn:hover { background: #4338ca; }
    .close-btn {
      background: none; border: none; color: #94a3b8; cursor: pointer;
      font-size: 0.9rem; display: flex; align-items: center;
    }
    .close-btn:hover { color: white; }

    @media (max-width: 500px) {
      :host ::ng-deep .p-drawer { width: 100% !important; }
      .sidebar-footer { flex-direction: column; } /* Botones apilados */
      .header-title h2 { font-size: 1rem; }
    }
  `]
})
export class CartSidebarComponent {
  public cartStore = inject(CartStore);
  public messageService = inject(MessageService);
  private api = inject(ApiService);

  couponCode = '';
  couponError = signal<string | null>(null);
  isValidatingCoupon = signal<boolean>(false);

  get visible(): boolean { return this.cartStore.isOpen(); }
  set visible(val: boolean) { val ? this.cartStore.openPanel() : this.cartStore.closePanel(); }

  onHide(): void { this.cartStore.closePanel(); }

  maxQty(stock: number): number { return Math.min(stock, 10); }

  updateQty(id: number, qty: number): void {
    this.cartStore.updateQuantity(id, qty);
  }

  progressPercentage(): number {
    const sub = this.cartStore.subtotal();
    if (sub >= 200000) return 100;
    return Math.round((sub / 200000) * 100);
  }

  removeLine(id: number): void {
    const productName = this.cartStore.lines().find(l => l.product.id === id)?.product.name || 'Producto';
    this.cartStore.removeLine(id);
    
    // Disparamos el Toast con la plantilla personalizada
    this.messageService.add({
      key: 'undo',
      severity: 'info',
      summary: `Se eliminó "${productName}"`,
      life: 5000
    });
  }

  clearCart(): void {
    this.cartStore.clearCart();
    
    this.messageService.add({
      key: 'undo',
      severity: 'info',
      summary: 'Se vació el carrito de compras',
      life: 5000
    });
  }

  performUndo(): void {
    const action = this.cartStore.undoAction();
    if (action) {
      action.restore();
      this.cartStore.clearUndo();
      this.messageService.clear('undo');
    }
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.isValidatingCoupon.set(true);
    this.couponError.set(null);

    this.api.validateCoupon(this.couponCode).subscribe({
      next: (coupon) => {
        if (this.cartStore.subtotal() < coupon.minSubtotal) {
          this.couponError.set(`El subtotal mínimo para este cupón es ${coupon.minSubtotal}`);
        } else {
          this.cartStore.applyCoupon(coupon);
          this.couponCode = '';
          this.messageService.add({ severity: 'success', summary: 'Cupón aplicado', detail: `Descuento del ${coupon.percent}%` });
        }
        this.isValidatingCoupon.set(false);
      },
      error: (err) => {
        this.couponError.set(err.message);
        this.isValidatingCoupon.set(false);
      }
    });
  }

  removeCoupon(): void {
    this.cartStore.removeCoupon();
  }
}