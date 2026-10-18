import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Order } from '../../../core/models/order.model';
import { CurrencyCopPipe } from '../../../shared/pipes/currency-cop.pipe';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyCopPipe, ButtonModule, SkeletonModule],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <p-skeleton width="100%" height="400px" borderRadius="16px" />
      </div>
    } @else if (order()) {
      <div class="success-wrapper">
        <!-- TARJETA SUPERIOR DE ÉXITO -->
        <div class="success-card top-card">
          <div class="icon-container">
            <i class="pi pi-check"></i>
          </div>
          <div class="status-badge">¡PEDIDO CONFIRMADO CON ÉXITO!</div>
          <h1>Gracias por tu compra en Codesa Shop</h1>
          <p class="subtitle">Tu orden fue procesada y registrada en nuestra base de datos.<br>Se descontó el inventario correspondiente.</p>
          <div class="order-number-pill">
            Número de pedido: <strong>{{ order()!.number }}</strong>
          </div>
        </div>

        <!-- TARJETA INFERIOR DE DETALLES -->
        <div class="success-card details-card">
          <!-- Fila de metadatos -->
          <div class="meta-grid">
            <div class="meta-item">
              <i class="pi pi-calendar"></i>
              <div>
                <span class="meta-label">Fecha del pedido</span>
                <span class="meta-value">{{ order()!.createdAt | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="pi pi-wallet"></i>
              <div>
                <span class="meta-label">Método de pago</span>
                <span class="meta-value">{{ order()!.customer.paymentMethod === 'CARD' ? 'Tarjeta de Crédito' : 'Efectivo contra entrega' }}</span>
              </div>
            </div>
            <div class="meta-item">
              <i class="pi pi-box"></i>
              <div>
                <span class="meta-label">Estado en servidor</span>
                <span class="status-pill">CONFIRMADO</span>
              </div>
            </div>
          </div>

          <!-- Información de despacho -->
          <div class="dispatch-box">
            <span class="dispatch-title"><i class="pi pi-map-marker"></i> Información de despacho:</span>
            <p>{{ order()!.customer.phone }} · {{ order()!.customer.email }}<br>
              {{ order()!.customer.address }}, {{ order()!.customer.city }}, Colombia</p>
          </div>

          <!-- Productos -->
          <div class="products-section">
            <h3>PRODUCTOS COMPRADOS ({{ order()!.lines.length }})</h3>
            @for (line of order()!.lines; track line.productId) {
              <div class="product-line">
                <img [src]="line.productImage" [alt]="line.productName">
                <div class="prod-info">
                  <span class="name">{{ line.productName }}</span>
                  <span class="qty">{{ line.quantity }} x {{ line.unitPrice | currencyCop }}</span>
                </div>
                <span class="price">{{ line.lineSubtotal | currencyCop }}</span>
              </div>
            }
          </div>

          <!-- Totales -->
          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal</span>
              <span>{{ order()!.subtotal | currencyCop }}</span>
            </div>
            @if (order()!.discount > 0) {
              <div class="total-row discount">
                <span>Descuento</span>
                <span>- {{ order()!.discount | currencyCop }}</span>
              </div>
            }
            <div class="total-row">
              <span>Envío</span>
              <span>{{ order()!.shipping === 0 ? 'Gratis' : (order()!.shipping | currencyCop) }}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total Pagado</span>
              <span>{{ order()!.total | currencyCop }}</span>
            </div>
          </div>

          <!-- Acciones -->
          <div class="actions-row">
            <button pButton label="Revisar / Imprimir Comprobante" icon="pi pi-print" class="p-button-outlined"></button>
            <button pButton label="Seguir comprando en la tienda" icon="pi pi-shopping-bag" routerLink="/"></button>
          </div>
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
    .success-wrapper { max-width: 700px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; padding: 1rem 0; }
    
    .success-card { background: white; border-radius: 16px; border: 1px solid #e2e8f0; padding: 2rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    .top-card { text-align: center; }
    
    .icon-container {
      width: 64px; height: 64px; background: #f0fdf4; color: #16a34a;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 1.75rem; margin: 0 auto 1.25rem; border: 2px solid #dcfce7;
    }
    .status-badge {
      display: inline-block; background: #f0fdf4; color: #166534;
      font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em;
      padding: 0.35rem 0.85rem; border-radius: 99px; margin-bottom: 1rem;
    }
    .top-card h1 { font-size: 1.8rem; color: #0f172a; margin: 0 0 0.75rem; line-height: 1.2; font-weight: 800; }
    .subtitle { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .order-number-pill {
      display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0;
      padding: 0.6rem 1.25rem; border-radius: 8px; font-size: 0.9rem; color: #475569;
    }
    .order-number-pill strong { color: #4f46e5; }

    /* DETALLES */
    .meta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
    .meta-item { display: flex; align-items: flex-start; gap: 0.5rem; color: #64748b; }
    .meta-item i { font-size: 1rem; margin-top: 0.1rem; }
    .meta-item > div { display: flex; flex-direction: column; }
    .meta-label { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .meta-value { font-size: 0.85rem; color: #0f172a; font-weight: 500; }
    .status-pill { background: #dcfce7; color: #16a34a; font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; display: inline-block; width: fit-content; }

    .dispatch-box { background: #f8fafc; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.85rem; }
    .dispatch-title { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #0f172a; margin-bottom: 0.5rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.02em; }
    .dispatch-box p { margin: 0; color: #475569; line-height: 1.5; }

    .products-section h3 { font-size: 0.75rem; color: #64748b; letter-spacing: 0.05em; margin: 0 0 1rem 0; font-weight: 700; }
    .product-line { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .product-line img { width: 50px; height: 50px; object-fit: cover; border-radius: 6px; }
    .prod-info { flex: 1; display: flex; flex-direction: column; }
    .prod-info .name { font-size: 0.9rem; font-weight: 600; color: #0f172a; }
    .prod-info .qty { font-size: 0.8rem; color: #64748b; }
    .product-line .price { font-weight: 600; font-size: 0.9rem; color: #0f172a; }

    .totals-section { border-top: 1px solid #e2e8f0; padding-top: 1rem; margin-top: 1.5rem; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: #475569; }
    .total-row.discount { color: #16a34a; }
    .total-row.grand-total { font-weight: 800; font-size: 1.15rem; color: #0f172a; margin-top: 0.75rem; }

    .actions-row { display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; }
    
    @media (max-width: 600px) {
      .meta-grid { grid-template-columns: 1fr; }
      .actions-row { flex-direction: column; }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  order = signal<Order | null>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
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