import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Coupon } from '../../../core/models/coupon.model';
import { OrderRequest } from '../../../core/models/order.model';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { CartStore } from '../../cart/cart.store';

// PrimeNG
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';

const DRAFT_KEY = 'codesa_checkout_draft';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CurrencyCopPipe,
    ButtonModule,
    InputTextModule,
    RadioButtonModule,
    MessageModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <p-toast position="top-right"></p-toast>
    
    <div class="page-header">
      <h1>Finalizar Compra</h1>
      <p>Formulario reactivo estricto con validaciones por campo y persistencia automática en sessionStorage.</p>
    </div>

    <!-- STEPPER VISUAL -->
    <div class="stepper">
      <div class="step" [class.active]="currentStep() >= 1" (click)="goToStep(1)">
        <span class="step-num">1</span> Datos Personales
      </div>
      <div class="step" [class.active]="currentStep() >= 2" (click)="goToStep(2)">
        <span class="step-num">2</span> Dirección & Envío
      </div>
      <div class="step" [class.active]="currentStep() >= 3" (click)="goToStep(3)">
        <span class="step-num">3</span> Método de Pago
      </div>
    </div>

    <div class="checkout-layout">
      <!-- FORMULARIO IZQUIERDA -->
      <div class="checkout-form-container">
        <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
          
          <!-- PASO 1: DATOS PERSONALES -->
          @if (currentStep() === 1) {
            <div class="form-section fade-in">
              <h2><i class="pi pi-user"></i> 1. Datos Personales</h2>
              
              <div class="form-grid">
                <div class="field full-width">
                  <label for="fullName">Nombre completo *</label>
                  <input pInputText id="fullName" formControlName="fullName" placeholder="Ej: Carlos Mendoza" />
                  @if (isInvalid('fullName')) { <small class="p-error">El nombre es obligatorio.</small> }
                </div>

                <div class="field">
                  <label for="email">Correo electrónico *</label>
                  <input pInputText id="email" type="email" formControlName="email" placeholder="ejemplo@correo.com" />
                  @if (isInvalid('email')) { <small class="p-error">Ingresa un correo válido.</small> }
                </div>

                <div class="field">
                  <label for="phone">Teléfono móvil *</label>
                  <input pInputText id="phone" formControlName="phone" placeholder="3001234567" maxlength="10" />
                  @if (isInvalid('phone')) { <small class="p-error">Debe tener entre 7 y 10 dígitos.</small> }
                </div>
              </div>
              
              <div class="form-actions-right">
                <button pButton type="button" label="Continuar a Dirección & Envío" icon="pi pi-arrow-right" iconPos="right" (click)="nextStep()" [disabled]="!isStep1Valid()"></button>
              </div>
            </div>
          }

          <!-- PASO 2: DIRECCIÓN -->
          @if (currentStep() === 2) {
            <div class="form-section fade-in">
              <h2><i class="pi pi-map-marker"></i> 2. Dirección & Envío</h2>
              <div class="form-grid">
                <div class="field full-width">
                  <label for="address">Dirección *</label>
                  <input pInputText id="address" formControlName="address" placeholder="Calle 123 #45-67, Apto 101" />
                  @if (isInvalid('address')) { <small class="p-error">La dirección es obligatoria.</small> }
                </div>
                <div class="field">
                  <label for="city">Ciudad *</label>
                  <input pInputText id="city" formControlName="city" placeholder="Bogotá" />
                  @if (isInvalid('city')) { <small class="p-error">La ciudad es obligatoria.</small> }
                </div>
              </div>
              <div class="form-actions-between">
                <button pButton type="button" label="Atrás" icon="pi pi-arrow-left" class="p-button-outlined p-button-secondary" (click)="prevStep()"></button>
                <button pButton type="button" label="Continuar a Método de Pago" icon="pi pi-arrow-right" iconPos="right" (click)="nextStep()" [disabled]="!isStep2Valid()"></button>
              </div>
            </div>
          }

          <!-- PASO 3: PAGO -->
          @if (currentStep() === 3) {
            <div class="form-section fade-in">
              <h2><i class="pi pi-credit-card"></i> 3. Método de Pago</h2>
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

              @if (globalError()) {
                <p-message severity="error" [text]="globalError()!" styleClass="w-full mt-4"></p-message>
              }

              <div class="form-actions-between mt-4">
                <button pButton type="button" label="Atrás" icon="pi pi-arrow-left" class="p-button-outlined p-button-secondary" (click)="prevStep()"></button>
                <button
                  pButton
                  type="submit"
                  label="Confirmar y Pagar"
                  icon="pi pi-lock"
                  [loading]="isSubmitting()"
                  [disabled]="checkoutForm.invalid || isSubmitting() || cartStore.isEmpty()">
                </button>
              </div>
            </div>
          }

        </form>
      </div>

      <!-- RESUMEN DERECHA -->
      <div class="checkout-summary">
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
            
            <!-- MENSAJE DE ERROR EN ROJO -->
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

        <div class="summary-card">
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
        </div>

        <div class="summary-card">
          <h3 class="products-title">PRODUCTOS EN EL PEDIDO ({{ cartStore.itemCount() }})</h3>
          @for (line of cartStore.lines(); track line.product.id) {
            <div class="summary-product">
              <img [src]="line.product.image" [alt]="line.product.name">
              <div class="prod-info">
                <span class="name">{{ line.product.name }}</span>
                <span class="qty">{{ line.quantity }} unidad</span>
              </div>
              <span class="price">{{ line.product.price * line.quantity | currencyCop }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 2rem; font-weight: 800; margin: 0; color: #0f172a; }
    .page-header p { color: #64748b; margin: 0.25rem 0 0 0; font-size: 0.95rem; }

    /* STEPPER */
    .stepper { display: flex; gap: 2rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
    .step { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #94a3b8; font-size: 0.9rem; cursor: pointer; transition: color 0.2s; }
    .step.active { color: #4f46e5; }
    .step-num { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; color: #64748b; font-size: 0.75rem; }
    .step.active .step-num { background: #4f46e5; color: white; }

    .fade-in { animation: fadeIn 0.3s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .checkout-layout { display: grid; grid-template-columns: 1fr 400px; gap: 2rem; align-items: start; }
    
    .checkout-form-container { background: white; padding: 2rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .form-section { margin-bottom: 1rem; }
    .form-section h2 { font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.25rem; color: #0f172a; font-weight: 700; }
    .form-section h2 i { color: #4f46e5; }
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .full-width { grid-column: span 2; }
    .field { display: flex; flex-direction: column; gap: 0.4rem; }
    .field label { font-weight: 600; color: #334155; font-size: 0.85rem; }
    .field input { width: 100%; }
    .p-error { color: #ef4444; font-size: 0.75rem; }

    .form-actions-right { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
    .form-actions-between { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }

    .payment-options { display: flex; gap: 1.5rem; }
    .payment-option { display: flex; align-items: center; gap: 0.5rem; }
    .payment-option label { font-weight: 500; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }

    /* RESUMEN DERECHA */
    .checkout-summary { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 100px; }
    
    /* CUPONES */
    .coupon-box { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.25rem; }
    .coupon-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; color: #0f172a; }
    .coupon-header h3 { margin: 0; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.05em; }
    .coupon-header i { color: #4f46e5; }
    .coupon-input-group { display: flex; gap: 0.5rem; margin-bottom: 1rem; align-items: center; }
    
    .input-wrapper { position: relative; flex: 1; }
    .input-wrapper input {
      width: 100%; padding: 0.5rem 2.5rem 0.5rem 0.5rem;
      border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.85rem; 
    }
    .input-wrapper input:focus { border-color: #4f46e5; outline: none; }

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
    .tag.expired { background: #f1f5f9; color: #64748b; }
    .applied-coupon-box { display: flex; justify-content: space-between; align-items: center; background: #f0fdf4; color: #166534; padding: 0.6rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; }
    .applied-coupon-box button { background: none; border: none; color: #166534; text-decoration: underline; cursor: pointer; font-size: 0.75rem; }

    .summary-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.25rem; }
    .summary-card h2, .summary-card h3 { font-size: 1rem; margin: 0 0 1rem; color: #0f172a; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; margin-bottom: 0.6rem; color: #475569; font-size: 0.9rem; }
    .summary-row.discount { color: #16a34a; }
    .summary-row.total { font-weight: 800; font-size: 1.25rem; color: #4f46e5; margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #e2e8f0; }
    .tax-label { font-size: 0.7rem; color: #94a3b8; display: block; }
    
    .products-title { font-size: 0.75rem !important; color: #64748b !important; letter-spacing: 0.05em; margin-bottom: 1rem !important; }
    .summary-product { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .summary-product img { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; }
    .prod-info { flex: 1; display: flex; flex-direction: column; }
    .prod-info .name { font-size: 0.8rem; font-weight: 600; color: #0f172a; line-height: 1.2; margin-bottom: 0.1rem; }
    .prod-info .qty { font-size: 0.7rem; color: #64748b; }
    .summary-product .price { font-weight: 700; font-size: 0.85rem; color: #0f172a; }

    @media (max-width: 768px) {
      .stepper {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
      }
      .form-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
      .payment-options { flex-direction: column; gap: 1rem; }
      .form-actions-right, .form-actions-between {
        flex-direction: column;
        gap: 0.75rem;
      }
      .form-actions-right button, .form-actions-between button {
        width: 100%;
      }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  public cartStore = inject(CartStore);
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private messageService = inject(MessageService);

  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  globalError = signal<string | null>(null);

  couponCode = '';
  couponError = signal<string | null>(null);
  isValidatingCoupon = signal<boolean>(false);

  checkoutForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{7,10}$')]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['', [Validators.required]],
    paymentMethod: ['CARD', [Validators.required]]
  });

  ngOnInit(): void {
    if (this.cartStore.isEmpty()) {
      this.router.navigate(['/carrito'], { queryParams: { empty: 'true' } });
      return;
    }

    this.loadDraft();

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

  // --- LÓGICA DE PASOS ---
  nextStep(): void {
    if (this.currentStep() === 1 && this.isStep1Valid()) {
      this.currentStep.set(2);
      return;
    }
    if (this.currentStep() === 2 && this.isStep2Valid()) {
      this.currentStep.set(3);
      return;
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  goToStep(step: number): void {
    if (step === 1) this.currentStep.set(1);
    if (step === 2 && this.isStep1Valid()) this.currentStep.set(2);
    if (step === 3 && this.isStep1Valid() && this.isStep2Valid()) this.currentStep.set(3);
  }

  isStep1Valid(): boolean {
    const fullName = this.checkoutForm.get('fullName');
    const email = this.checkoutForm.get('email');
    const phone = this.checkoutForm.get('phone');
    
    return !!(
      fullName?.valid &&
      email?.valid &&
      phone?.valid
    );
  }

  isStep2Valid(): boolean {
    const address = this.checkoutForm.get('address');
    const city = this.checkoutForm.get('city');
    
    return !!(
      address?.valid &&
      city?.valid
    );
  }

  // --- LÓGICA DE CUPONES ---
  fillCoupon(code: string): void {
    this.couponCode = code;
    this.applyCoupon();
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    this.isValidatingCoupon.set(true);
    this.couponError.set(null);

    this.api.validateCoupon(this.couponCode).subscribe({
      next: (coupon: Coupon) => {
        if (this.cartStore.subtotal() < coupon.minSubtotal) {
          this.couponError.set(`El cupón ${coupon.code} exige un subtotal mínimo de $${coupon.minSubtotal}. Te faltan $${coupon.minSubtotal - this.cartStore.subtotal()}.`);
        } else {
          this.cartStore.applyCoupon(coupon);
          this.couponCode = '';
          this.messageService.add({ severity: 'success', summary: 'Cupón aplicado', detail: `Descuento del ${coupon.percent}%` });
        }
        this.isValidatingCoupon.set(false);
      },
      error: (err: any) => {
        this.couponError.set(err.message);
        this.isValidatingCoupon.set(false);
      }
    });
  }

  clearCouponInput(): void {
    this.couponCode = '';
    this.couponError.set(null);
  }

  // --- CREAR PEDIDO ---
  onSubmit(): void {
    if (this.checkoutForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.globalError.set(null);
    this.checkoutForm.disable();

    const formValue = this.checkoutForm.getRawValue();
    
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
        this.messageService.add({ severity: 'success', summary: 'Pedido creado', detail: `Orden ${order.number}` });
        sessionStorage.removeItem(DRAFT_KEY);
        this.cartStore.clearCart();
        this.router.navigate(['/pedido', order.number]);
      },
      error: (err: any) => {
        this.checkoutForm.enable();
        this.isSubmitting.set(false);
        this.globalError.set(err.message);
      }
    });
  }
}