import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../cart.store';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-cart-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    CurrencyCopPipe,
    DrawerModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
  <p-toast position="top-right"></p-toast>
    
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
          <button pButton label="Ver catálogo" (click)="cartStore.closePanel()" routerLink="/"></button>
        </div>
      } @else {
        <!-- Alerta de envío gratis -->
        @if (cartStore.shipping() > 0) {
          <div class="shipping-alert">
            <i class="pi pi-truck"></i>
            <span>Te faltan <strong>{{ cartStore.amountForFreeShipping() | currencyCop }}</strong> para envío gratis.</span>
          </div>
        } @else {
          <div class="shipping-alert success">
            <i class="pi pi-check-circle"></i>
            <span>¡Felicidades! Tienes <strong>envío gratis</strong>.</span>
          </div>
        }

        <!-- Líneas del carrito -->
        <div class="cart-lines">
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="cart-line">
              <img [src]="line.product.image" [alt]="line.product.name" class="line-img">
              <div class="line-details">
                <span class="line-name">{{ line.product.name }}</span>
                <span class="line-price">{{ line.product.price | currencyCop }}</span>
                
                <div class="line-actions">
                  <p-inputNumber
                    [ngModel]="line.quantity"
                    (onInput)="updateQty(line.product.id, $event.value ?? 1)"
                    [min]="1"
                    [max]="maxQty(line.product.stock)"
                    [showButtons]="true"
                    buttonLayout="horizontal"
                    spinnerMode="horizontal"
                    styleClass="qty-input" />
                  <button pButton icon="pi pi-trash" class="p-button-text p-button-danger p-button-sm" (click)="removeLine(line.product.id)"></button>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Cupón -->
        <div class="coupon-section">
          @if (cartStore.coupon()) {
            <div class="applied-coupon">
              <span><i class="pi pi-tag"></i> {{ cartStore.coupon()!.code }} aplicado</span>
              <button pButton icon="pi pi-times" class="p-button-text p-button-sm" (click)="removeCoupon()"></button>
            </div>
          } @else {
            <div class="coupon-input">
              <input pInputText [(ngModel)]="couponCode" placeholder="Código de cupón" />
              <button pButton label="Aplicar" [loading]="isValidatingCoupon()" (click)="applyCoupon()"></button>
            </div>
            @if (couponError()) {
              <small class="error-text"><i class="pi pi-exclamation-circle"></i> {{ couponError() }}</small>
            }
          }
        </div>

        <!-- Resumen -->
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>{{ cartStore.subtotal() | currencyCop }}</span>
          </div>
          @if (cartStore.discount() > 0) {
            <div class="summary-row discount">
              <span>Descuento</span>
              <span>- {{ cartStore.discount() | currencyCop }}</span>
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
          
          <button pButton label="Ir al carrito completo" class="p-button-outlined w-full mt-2" routerLink="/carrito" (click)="cartStore.closePanel()"></button>
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

    .shipping-alert { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #eff6ff; color: #1e40af; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; }
    .shipping-alert.success { background: #f0fdf4; color: #166534; }

    .cart-line { display: flex; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; }
    .line-img { width: 70px; height: 70px; object-fit: cover; border-radius: 8px; background: #f1f5f9; }
    .line-details { display: flex; flex-direction: column; flex: 1; }
    .line-name { font-weight: 600; color: #0f172a; font-size: 0.9rem; }
    .line-price { color: #64748b; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .line-actions { display: flex; align-items: center; justify-content: space-between; }
    .qty-input { width: 100px; }

    .coupon-section { margin-top: 1rem; padding: 1rem 0; border-bottom: 1px solid #e2e8f0; }
    .coupon-input { display: flex; gap: 0.5rem; }
    .coupon-input input { flex: 1; }
    .error-text { color: #ef4444; display: block; margin-top: 0.5rem; }
    .applied-coupon { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; color: #166534; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600; }

    .cart-summary { margin-top: 1.5rem; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #475569; font-size: 0.95rem; }
    .summary-row.discount { color: #16a34a; }
    .summary-row.total { font-weight: 800; font-size: 1.25rem; color: #0f172a; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; }
  `]
})
export class CartSidebarComponent {
  public cartStore = inject(CartStore);
  private api = inject(ApiService);
  private messageService = inject(MessageService);

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

  removeLine(id: number): void {
    this.cartStore.removeLine(id);
    // Aquí podrías disparar un toast con el botón "Deshacer"
    this.messageService.add({ severity: 'info', summary: 'Eliminado', detail: 'Producto quitado del carrito' });
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