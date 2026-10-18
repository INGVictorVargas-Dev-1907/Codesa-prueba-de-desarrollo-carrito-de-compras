import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { OrderRequest } from '../../../core/models/order.model';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../../cart/cart.store';

const DRAFT_KEY = 'codesa_checkout_draft';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, CurrencyCopPipe,
    ButtonModule, InputTextModule, RadioButtonModule, MessageModule, ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>

    <div class="page-header">
      <h1>Checkout</h1>
      <p>Completa tus datos para finalizar la compra</p>
    </div>

    <div class="checkout-layout">
      <!-- FORMULARIO IZQUIERDA -->
      <div class="checkout-form-container">
        <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
          
          <div class="form-section">
            <h2><i class="pi pi-user"></i> Datos de contacto</h2>
            
            <div class="field">
              <label for="fullName">Nombre completo *</label>
              <input pInputText id="fullName" formControlName="fullName" placeholder="Ej: Juan Pérez" />
              @if (isInvalid('fullName')) {
                <small class="p-error">El nombre es obligatorio.</small>
              }
            </div>

            <div class="field">
              <label for="email">Correo electrónico *</label>
              <input pInputText id="email" type="email" formControlName="email" placeholder="juan@ejemplo.com" />
              @if (isInvalid('email')) {
                <small class="p-error">Ingresa un correo válido.</small>
              }
            </div>

            <div class="field">
              <label for="phone">Teléfono *</label>
              <input pInputText id="phone" formControlName="phone" placeholder="3001234567" maxlength="10" />
              @if (isInvalid('phone')) {
                <small class="p-error">El teléfono debe tener entre 7 y 10 dígitos.</small>
              }
            </div>
          </div>

          <div class="form-section">
            <h2><i class="pi pi-map-marker"></i> Dirección de envío</h2>
            
            <div class="field">
              <label for="address">Dirección *</label>
              <input pInputText id="address" formControlName="address" placeholder="Calle 123 #45-67, Apto 101" />
              @if (isInvalid('address')) {
                <small class="p-error">La dirección es obligatoria.</small>
              }
            </div>

            <div class="field">
              <label for="city">Ciudad *</label>
              <input pInputText id="city" formControlName="city" placeholder="Bogotá" />
              @if (isInvalid('city')) {
                <small class="p-error">La ciudad es obligatoria.</small>
              }
            </div>
          </div>

          <div class="form-section">
            <h2><i class="pi pi-credit-card"></i> Método de pago</h2>
            <div class="payment-options">
              <div class="payment-option">
                <p-radioButton name="paymentMethod" value="CARD" formControlName="paymentMethod" inputId="payCard"></p-radioButton>
                <label for="payCard"><i class="pi pi-credit-card"></i> Tarjeta</label>
              </div>
              <div class="payment-option">
                <p-radioButton name="paymentMethod" value="CASH" formControlName="paymentMethod" inputId="payCash"></p-radioButton>
                <label for="payCash"><i class="pi pi-money-bill"></i> Efectivo</label>
              </div>
            </div>
          </div>

          <!-- Error global si falla el POST -->
          @if (globalError()) {
            <p-message severity="error" [text]="globalError()!" styleClass="w-full mb-4"></p-message>
          }

          <!-- Botón Submit -->
          <button
            pButton
            type="submit"
            label="Confirmar pedido"
            icon="pi pi-check"
            class="p-button-lg w-full"
            [loading]="isSubmitting()"
            [disabled]="checkoutForm.invalid || isSubmitting() || cartStore.isEmpty()">
          </button>
          <p class="secure-text"><i class="pi pi-lock"></i> Pago 100% seguro</p>
        </form>
      </div>

      <!-- RESUMEN DERECHA -->
      <div class="checkout-summary">
        <h2>Tu pedido</h2>
        <div class="summary-lines">
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="summary-line">
              <div class="line-info">
                <span class="qty">{{ line.quantity }}x</span>
                <span class="name">{{ line.product.name }}</span>
              </div>
              <span class="price">{{ line.product.price * line.quantity | currencyCop }}</span>
            </div>
          }
        </div>

        <div class="summary-totals">
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
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .page-header p { color: #64748b; margin: 0.25rem 0 0 0; }

    .checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; align-items: start; }
    
    .checkout-form-container { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .form-section { margin-bottom: 2.5rem; }
    .form-section h2 { font-size: 1.2rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
    .form-section h2 i { color: var(--primary-color); }

    .field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
    .field label { font-weight: 600; color: #334155; font-size: 0.9rem; }
    .field input { width: 100%; }
    .p-error { color: #ef4444; font-size: 0.8rem; }

    .payment-options { display: flex; gap: 2rem; }
    .payment-option { display: flex; align-items: center; gap: 0.5rem; }
    .payment-option label { font-weight: 500; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }

    .secure-text { text-align: center; color: #64748b; font-size: 0.85rem; margin-top: 1rem; }

    .checkout-summary { background: #f8fafc; border-radius: 12px; padding: 1.5rem; border: 1px solid #e2e8f0; position: sticky; top: 100px; }
    .checkout-summary h2 { font-size: 1.2rem; margin: 0 0 1.5rem; color: #0f172a; }
    .summary-lines { border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem; }
    .summary-line { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem; }
    .line-info { display: flex; gap: 0.5rem; }
    .qty { color: #64748b; font-weight: 600; }
    .name { color: #0f172a; }
    .price { font-weight: 600; color: #0f172a; }

    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #475569; font-size: 0.95rem; }
    .summary-row.discount { color: #16a34a; }
    .summary-row.total { font-weight: 800; font-size: 1.25rem; color: #0f172a; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #cbd5e1; }

    @media (max-width: 992px) {
      .checkout-layout { grid-template-columns: 1fr; }
      .checkout-summary { position: static; order: -1; }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  public cartStore = inject(CartStore);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  isSubmitting = signal<boolean>(false);
  globalError = signal<string | null>(null);

  checkoutForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    paymentMethod: ['CARD', [Validators.required]]
  });

  ngOnInit(): void {
    // 1. Redirigir si el carrito está vacío
    if (this.cartStore.isEmpty()) {
      this.router.navigate(['/carrito'], { queryParams: { empty: 'true' } });
      return;
    }

    // 2. Recuperar borrador de sessionStorage
    this.loadDraft();

    // 3. Guardar borrador automáticamente en cada cambio
    this.checkoutForm.valueChanges.subscribe(value => {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    });
  }

  isInvalid(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  loadDraft(): void {
    try {
      const draft = sessionStorage.getItem(DRAFT_KEY);
      if (draft) {
        this.checkoutForm.patchValue(JSON.parse(draft));
      }
    } catch {
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.globalError.set(null);
    this.checkoutForm.disable(); // Evita doble envío

    const formValue = this.checkoutForm.getRawValue();
    
    // Construir el Request DTO
    const orderRequest: OrderRequest = {
      customer: {
        fullName: formValue.fullName,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        city: formValue.city,
        paymentMethod: formValue.paymentMethod,
        couponCode: this.cartStore.coupon()?.code || null
      },
      items: this.cartStore.lines().map(line => ({
        productId: line.product.id,
        quantity: line.quantity
      }))
    };

    this.api.createOrder(orderRequest).subscribe({
      next: (order) => {
        // Éxito
        this.messageService.add({ severity: 'success', summary: 'Pedido creado', detail: `Orden ${order.number}` });
        
        // Limpiar todo
        sessionStorage.removeItem(DRAFT_KEY);
        this.cartStore.clearCart();
        
        // Navegar a confirmación
        this.router.navigate(['/pedido', order.number]);
      },
      error: (err) => {
        // Error: rehabilitar el formulario
        this.checkoutForm.enable();
        this.isSubmitting.set(false);
        
        // El interceptor ya tradujo el mensaje
        this.globalError.set(err.message);
        
        // Si fue un error de stock, refrescar el carrito (opcional)
        if (err.code === 'STOCK_INSUFICIENTE') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Stock cambiado',
            detail: 'Algún producto ya no tiene las unidades solicitadas.' 
          });
        }
      }
    });
  }
}