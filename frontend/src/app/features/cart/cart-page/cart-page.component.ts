import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartStore } from '../cart.store';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';

// PrimeNG Imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CurrencyCopPipe,
    ButtonModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <!-- TOAST PERSONALIZADO PARA DESHACER -->
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
    
    <div class="cart-header-nav">
      <a routerLink="/" class="back-link"><i class="pi pi-arrow-left"></i> Continuar comprando en el catálogo</a>
    </div>

    <div class="page-header">
      <div>
        <h1>Carrito de Compras</h1>
        <p>Vista completa sincronizada en tiempo real con el panel lateral y el almacenamiento local.</p>
      </div>
      @if (!cartStore.isEmpty()) {
        <button pButton label="Vaciar Carrito" icon="pi pi-trash" class="p-button-danger p-button-outlined" (click)="clearCart()"></button>
      }
    </div>

    @if (cartStore.isEmpty()) {
      <div class="empty-page">
        <i class="pi pi-shopping-cart" style="font-size: 4rem; color: #cbd5e1;"></i>
        <h2>Tu carrito está vacío</h2>
        <p>Parece que aún no has agregado nada.</p>
        <button pButton label="Explorar productos" routerLink="/"></button>
      </div>
    } @else {
      <!-- BARRA PROGRESO GLOBAL -->
      <div class="shipping-banner">
        <div class="banner-text">
          <i class="pi pi-truck"></i>
          @if (cartStore.shipping() > 0) {
            <span>¡Faltan <strong>{{ cartStore.amountForFreeShipping() | currencyCop }}</strong> para obtener el envío gratis!</span>
          } @else {
            <span class="success"><i class="pi pi-check-circle"></i> ¡Tienes envío gratis!</span>
          }
        </div>
        <span class="banner-pct">{{ progressPercentage() }}%</span>
      </div>
      <div class="global-progress-bg">
        <div class="global-progress-fill" [style.width.%]="progressPercentage()"></div>
      </div>

      <div class="cart-layout">
        <!-- LISTA DE PRODUCTOS -->
        <div class="cart-items">
          <div class="items-header">
            <span>PRODUCTO</span>
            <span>CANTIDAD / SUBTOTAL</span>
          </div>
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="cart-item">
              <img [src]="line.product.image" [alt]="line.product.name">
              <div class="item-info">
                <span class="brand">{{ line.product.brand | uppercase }} · {{ line.product.category | uppercase }}</span>
                <h3>{{ line.product.name }}</h3>
                <span class="unit-price">Precio unitario: {{ line.product.price | currencyCop }}</span>
                <div class="item-qty">
                  <div class="qty-selector">
                    <button (click)="cartStore.updateQuantity(line.product.id, line.quantity - 1)" [disabled]="line.quantity <= 1">−</button>
                    <span>{{ line.quantity }}</span>
                    <button (click)="cartStore.updateQuantity(line.product.id, line.quantity + 1)" [disabled]="line.quantity >= maxQty(line.product.stock)">+</button>
                  </div>
                </div>
              </div>
              <div class="item-total">
                <span class="line-total-label">Subtotal</span>
                <span class="line-total">{{ line.product.price * line.quantity | currencyCop }}</span>
                <button pButton icon="pi pi-trash" class="p-button-text p-button-secondary p-button-sm" (click)="removeLine(line.product.id)"></button>
              </div>
            </div>
          }
        </div>

        <!-- PANEL DERECHO (CUPONES Y RESUMEN) -->
        <div class="cart-side-panel">
          
          <!-- CAJA DE CUPONES -->
          <div class="coupon-box">
            <div class="coupon-header">
              <i class="pi pi-ticket"></i>
              <h3>CUPÓN DE DESCUENTO</h3>
            </div>
            
            @if (cartStore.coupon()) {
              <div class="applied-coupon-box">
                <span><i class="pi pi-check-circle"></i> {{ cartStore.coupon()!.code }} aplicado</span>
                <button (click)="cartStore.removeCoupon()">Quitar</button>
              </div>
            } @else {
              <div class="coupon-input-group">
                <div class="input-wrapper">
                  <input pInputText [(ngModel)]="couponCode" placeholder="Ingresa código (ej. CODESA10)" />
                  @if (couponCode) {
                    <button class="clear-input-btn" (click)="clearCouponInput()" aria-label="Limpiar cupón">
                      <i class="pi pi-times"></i>
                    </button>
                  }
                </div>
                <button pButton label="Aplicar" [loading]="isValidatingCoupon()" (click)="applyCoupon()"></button>
              </div>
              
              @if (couponError()) {
                <div class="coupon-error-box">
                  <i class="pi pi-exclamation-circle"></i>
                  <span>{{ couponError() }}</span>
                </div>
              }
              
              <div class="coupon-suggestions">
                <span>Cupones disponibles para simular:</span>
                <div class="tags">
                  <span class="tag" (click)="fillCoupon('CODESA10')">CODESA10 (10%)</span>
                  <span class="tag" (click)="fillCoupon('BIENVENIDO25')">BIENVENIDO25 (25%)</span>
                  <span class="tag expired" (click)="fillCoupon('NAVIDAD2025')">NAVIDAD2025 (Vencido)</span>
                </div>
              </div>
            }
          </div>

          <!-- RESUMEN -->
          <div class="cart-summary-panel">
            <h2>Resumen del Pedido</h2>
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
            <div class="summary-row total">
              <span>Total</span>
              <span>{{ cartStore.total() | currencyCop }}</span>
            </div>
            <span class="tax-label">Precios con IVA incluido</span>
            
            <button pButton label="Continuar al checkout" icon="pi pi-arrow-right" iconPos="right" class="p-button-lg w-full checkout-btn" routerLink="/checkout"></button>
            <div class="secure-checkout"><i class="pi pi-lock"></i> Pago 100% seguro</div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .cart-header-nav { margin-bottom: 1rem; }
    .back-link { color: #64748b; text-decoration: none; font-size: 0.9rem; display: inline-flex; align-items: center; gap: 0.5rem; }
    .back-link:hover { color: var(--primary-color); }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
    .page-header h1 { font-size: 2.2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .page-header p { color: #64748b; margin: 0.25rem 0 0 0; font-size: 0.95rem; }

    /* PROGRESO GLOBAL */
    .shipping-banner { display: flex; justify-content: space-between; align-items: center; background: white; padding: 1rem 1.5rem; border: 1px solid #e2e8f0; border-bottom: none; border-radius: 12px 12px 0 0; font-size: 0.95rem; color: #4f46e5; font-weight: 500; }
    .shipping-banner .success { color: #16a34a; }
    .banner-pct { font-weight: 700; color: #64748b; font-size: 0.85rem; }
    .global-progress-bg { height: 10px; background: #e2e8f0; border-radius: 0 0 12px 12px; overflow: hidden; margin-bottom: 2rem; border: 1px solid #e2e8f0; border-top: none; }
    .global-progress-fill { height: 100%; background: #4f46e5; transition: width 0.4s ease; }

    .cart-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start; }
    
    /* LISTA ITEMS */
    .cart-items { background: white; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; }
    .items-header { display: flex; justify-content: space-between; padding: 1rem 1.5rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; }
    .cart-item { display: flex; gap: 1.5rem; padding: 1.5rem; border-bottom: 1px solid #f1f5f9; }
    .cart-item img { width: 100px; height: 100px; object-fit: cover; border-radius: 12px; }
    .item-info { flex: 1; display: flex; flex-direction: column; }
    .item-info .brand { font-size: 0.7rem; color: #64748b; font-weight: 700; margin-bottom: 0.25rem; }
    .item-info h3 { margin: 0 0 0.5rem; font-size: 1.05rem; color: #0f172a; line-height: 1.3; }
    .item-info .unit-price { color: #64748b; font-size: 0.85rem; margin-bottom: 1rem; }
    
    .qty-selector { display: inline-flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
    .qty-selector button { background: white; border: none; width: 32px; height: 32px; cursor: pointer; color: #475569; font-size: 1rem; font-weight: bold; }
    .qty-selector button:hover:not(:disabled) { background: #f8fafc; }
    .qty-selector button:disabled { opacity: 0.5; cursor: not-allowed; }
    .qty-selector span { width: 32px; text-align: center; font-weight: 600; font-size: 0.9rem; }

    .item-total { display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 0.5rem; }
    .line-total-label { font-size: 0.7rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
    .line-total { font-weight: 800; font-size: 1.1rem; color: #0f172a; }

    /* PANEL DERECHO */
    .cart-side-panel { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 100px; }
    
    /* CUPONES */
    .coupon-box { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; }
    .coupon-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #0f172a; }
    .coupon-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; letter-spacing: 0.02em; }
    .coupon-header i { color: #4f46e5; font-size: 1.2rem; }
    
    .coupon-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
    .input-wrapper { position: relative; flex: 1; }
    .input-wrapper input {
      width: 100%; padding: 0.5rem 2.5rem 0.5rem 0.5rem;
      border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; outline: none;
    }
    .input-wrapper input:focus { border-color: #4f46e5; }

    .clear-input-btn {
      position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
      background: #f1f5f9; border: none; border-radius: 50%; width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: #64748b; font-size: 0.65rem; transition: all 0.2s;
    }
    .clear-input-btn:hover { background: #e2e8f0; color: #0f172a; }

    .coupon-error-box {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 0.75rem; border-radius: 8px; font-size: 0.8rem;
      display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 1rem;
    }
    .coupon-error-box i { font-size: 1rem; margin-top: 1px; }

    .coupon-suggestions { font-size: 0.75rem; color: #64748b; }
    .coupon-suggestions > span { display: block; margin-bottom: 0.5rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag { background: #e0e7ff; color: #3730a3; padding: 0.2rem 0.4rem; border-radius: 4px; font-weight: 600; cursor: pointer; }
    .tag:hover { background: #c7d2fe; }
    .tag.expired { background: #f1f5f9; color: #64748b; }

    .applied-coupon-box { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; color: #166534; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }
    .applied-coupon-box button { background: none; border: none; color: #166534; text-decoration: underline; cursor: pointer; font-size: 0.8rem; }

    /* RESUMEN */
    .cart-summary-panel { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 1.5rem; }
    .cart-summary-panel h2 { font-size: 1.1rem; margin: 0 0 1.5rem; color: #0f172a; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 1rem; color: #475569; font-size: 0.95rem; }
    .summary-row.discount { color: #16a34a; }
    .summary-row.total { font-weight: 800; font-size: 1.5rem; color: #4f46e5; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 2px dashed #e2e8f0; }
    .tax-label { font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 1.5rem; }
    .checkout-btn { margin-bottom: 1rem; }
    .secure-checkout { text-align: center; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

    /* TOAST PERSONALIZADO (UNDO) */
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

    @media (max-width: 992px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-side-panel { position: static; }
      .cart-item { flex-direction: column; align-items: flex-start; }
      .item-total { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; }
      .items-header { display: none; } /* Oculta el header de la tabla en móvil */
    }
  `]
})
export class CartPageComponent {
  public cartStore = inject(CartStore);
  public messageService = inject(MessageService);
  private api = inject(ApiService);

  couponCode = '';
  couponError = signal<string | null>(null);
  isValidatingCoupon = signal<boolean>(false);

  progressPercentage(): number {
    const sub = this.cartStore.subtotal();
    if (sub >= 200000) return 100;
    return Math.round((sub / 200000) * 100);
  }

  maxQty(stock: number): number { return Math.min(stock, 10); }

  // --- LÓGICA DE DESHACER ---
  removeLine(id: number): void {
    const productName = this.cartStore.lines().find(l => l.product.id === id)?.product.name || 'Producto';
    this.cartStore.removeLine(id);
    
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

  // --- LÓGICA DE CUPONES ---
  clearCouponInput(): void {
    this.couponCode = '';
    this.couponError.set(null);
  }

  fillCoupon(code: string): void {
    this.couponCode = code;
    this.applyCoupon();
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