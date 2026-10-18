import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { Order } from '../../../core/models/order.model';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyCopPipe, ButtonModule, SkeletonModule],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <p-skeleton width="100%" height="300px" borderRadius="12px" />
      </div>
    } @else if (order()) {
      <div class="success-container">
        <div class="success-icon">
          <i class="pi pi-check"></i>
        </div>
        <h1>¡Gracias por tu compra!</h1>
        <p class="order-number">Número de pedido: <strong>{{ order()!.number }}</strong></p>
        <p class="order-date">Fecha: {{ order()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
        
        <div class="order-card">
          <h2>Detalles del pedido</h2>
          
          <div class="detail-row">
            <span>Cliente</span>
            <strong>{{ order()!.customer.fullName }}</strong>
          </div>
          <div class="detail-row">
            <span>Correo</span>
            <span>{{ order()!.customer.email }}</span>
          </div>
          <div class="detail-row">
            <span>Dirección</span>
            <span>{{ order()!.customer.address }}, {{ order()!.customer.city }}</span>
          </div>
          <div class="detail-row">
            <span>Método de pago</span>
            <span>{{ order()!.customer.paymentMethod === 'CARD' ? 'Tarjeta' : 'Efectivo' }}</span>
          </div>

          <div class="order-lines">
            <h3>Productos</h3>
            @for (line of order()!.lines; track line.productId) {
              <div class="line-item">
                <img [src]="line.productImage" [alt]="line.productName">
                <div class="line-info">
                  <span class="name">{{ line.productName }}</span>
                  <span class="qty">{{ line.quantity }} x {{ line.unitPrice | currencyCop }}</span>
                </div>
                <span class="line-total">{{ line.lineSubtotal | currencyCop }}</span>
              </div>
            }
          </div>

          <div class="order-totals">
            <div class="row"><span>Subtotal</span><span>{{ order()!.subtotal | currencyCop }}</span></div>
            @if (order()!.discount > 0) {
              <div class="row discount"><span>Descuento</span><span>- {{ order()!.discount | currencyCop }}</span></div>
            }
            <div class="row"><span>Envío</span><span>{{ order()!.shipping === 0 ? 'Gratis' : (order()!.shipping | currencyCop) }}</span></div>
            <div class="row total"><span>Total</span><span>{{ order()!.total | currencyCop }}</span></div>
          </div>
        </div>

        <div class="actions">
          <button pButton label="Seguir comprando" icon="pi pi-arrow-left" routerLink="/" class="p-button-outlined"></button>
        </div>
      </div>
    } @else {
      <div class="error-container">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <h2>Pedido no encontrado</h2>
        <p>No pudimos encontrar este pedido. Verifica el número o contáctanos.</p>
        <a routerLink="/" class="btn-home">Volver al catálogo</a>
      </div>
    }
  `,
  styles: [`
    .success-container { max-width: 700px; margin: 0 auto; text-align: center; padding: 2rem 1rem; }
    .success-icon { width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem; }
    h1 { font-size: 2rem; color: #0f172a; margin: 0 0 0.5rem; }
    .order-number { font-size: 1.1rem; color: #475569; }
    .order-date { color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }

    .order-card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 1.5rem; text-align: left; margin-bottom: 2rem; }
    .order-card h2 { font-size: 1.2rem; margin: 0 0 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.75rem; color: #0f172a; }
    .detail-row { display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 0.95rem; }
    .detail-row span:first-child { color: #64748b; }

    .order-lines { margin-top: 1.5rem; }
    .order-lines h3 { font-size: 1rem; margin-bottom: 1rem; color: #0f172a; }
    .line-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; }
    .line-item img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .line-info { flex: 1; display: flex; flex-direction: column; }
    .line-info .name { font-weight: 600; font-size: 0.9rem; color: #0f172a; }
    .line-info .qty { font-size: 0.85rem; color: #64748b; }
    .line-total { font-weight: 600; }

    .order-totals { margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; }
    .row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: #475569; }
    .row.discount { color: #16a34a; }
    .row.total { font-weight: 800; font-size: 1.25rem; color: #0f172a; margin-top: 0.75rem; }

    .error-container { text-align: center; padding: 4rem; }
    .error-icon { font-size: 4rem; color: #ef4444; margin-bottom: 1rem; }
    .btn-home { color: var(--primary-color); font-weight: 600; }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  order = signal<Order | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    // Escuchamos el parámetro :numero
    this.route.paramMap.subscribe(params => {
      const number = params.get('numero');
      if (number) {
        this.loadOrder(number);
      }
    });
  }

  loadOrder(number: string): void {
    this.isLoading.set(true);
    this.api.getOrder(number).subscribe({
      next: (order) => {
        this.order.set(order);
        this.isLoading.set(false);
      },
      error: () => {
        this.order.set(null);
        this.isLoading.set(false);
      }
    });
  }
}