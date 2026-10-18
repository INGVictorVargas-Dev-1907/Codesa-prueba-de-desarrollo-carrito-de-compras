import { computed, effect, Injectable, signal } from '@angular/core';
import { Coupon } from '../../core/models/coupon.model';
import { Product } from '../../core/models/product.model';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface StoredCart {
  lines: CartLine[];
  coupon: Coupon | null;
}

const STORAGE_KEY = 'codesa_cart_v1';
const MAX_UNITS_PER_LINE = 10;
const FREE_SHIPPING_THRESHOLD = 200_000;
const SHIPPING_COST = 12_900;

@Injectable({
  providedIn: 'root'
})
export class CartStore {
  // --- Estado Privado Mutable ---
  private readonly _lines = signal<CartLine[]>([]);
  private readonly _coupon = signal<Coupon | null>(null);
  private readonly _isOpen = signal<boolean>(false);
  private readonly _undoAction = signal<{ label: string; restore: () => void} | null>(null);

  // --- Readonly para los componentes ---
  readonly lines = this._lines.asReadonly();
  readonly coupon = this._coupon.asReadonly();
  readonly isOpen = this._isOpen.asReadonly();
  readonly undoAction = this._undoAction.asReadonly();

  // --- Totales Derivados (Computed) ---
  readonly subtotal = computed(() =>
    this._lines().reduce((acc, line) => acc + line.product.price * line.quantity, 0)
  );

  readonly discount = computed(() => {
    const c = this._coupon();
    if (!c) return 0;
    const raw = Math.round(this.subtotal() * (c.percent / 100));
    return c.maxDiscount ? Math.min(raw, c.maxDiscount) : raw;
  });

  readonly shipping = computed(() => {
    if (this._lines().length === 0) return 0;
    return this.subtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  });

  readonly total = computed(() =>
    this.subtotal() - this.discount() + this.shipping()
  );

  readonly itemCount = computed(() =>
    this._lines().reduce((acc, line) => acc + line.quantity, 0)
  );

  readonly amountForFreeShipping = computed(() =>
    Math.max(0, FREE_SHIPPING_THRESHOLD - this.subtotal())
  );

  readonly isEmpty = computed(() => this._lines().length === 0);

  constructor() {
    this.loadFromStorage();
    // Persistencia automática al cambiar
    effect(() => {
      const data: StoredCart = { lines: this._lines(), coupon: this._coupon() };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('Error guardando carrito', e);
      }
    });
  }

  // --- Acciones --
  togglePanel(): void {
    this._isOpen.update(v => !v);
  }

  openPanel(): void {
    this._isOpen.set(true);
  }

  closePanel(): void {
    this._isOpen.set(false);
  }

  addProduct(product: Product, quantity = 1): void {
    this._lines.update(lines => {
      const existing = lines.find(l => l.product.id === product.id);
      const maxAllowed = Math.min(product.stock, MAX_UNITS_PER_LINE);

      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxAllowed);
        return lines.map(l => l.product.id === product.id ? { ...l, quantity: newQty } : l);
      }

      if (maxAllowed <= 0) return lines;
      return [...lines, { product, quantity: Math.min(quantity, maxAllowed) }];
    });
    this._coupon.set(null); // Al agregar producto, invalidamos el cupón
  }

  updateQuantity(productId: number, quantity: number): void {
    this._lines.update(lines => lines.map(line => {
      if (line.product.id !== productId) return line;
      const maxAllowed = Math.min(line.product.stock, MAX_UNITS_PER_LINE);
      return { ...line, quantity: Math.max(1, Math.min(quantity, maxAllowed)) };
    }));
  }

  removeLine(productId: number): void {
    const previous = this._lines();
    this._lines.update(lines => lines.filter(l => l.product.id !== productId));
    
    // Guardamos el estado anterior para el Deshacer
    this._undoAction.set({
      label: 'Producto eliminado',
      restore: () => this._lines.set(previous)
    });
    
    this.checkCouponValidity();
  }

  clearCart(): void {
    const previous = this._lines();
    const previousCoupon = this._coupon();
    this._lines.set([]);
    this._coupon.set(null);
    
    // Guardamos el estado anterior para el Deshacer
    this._undoAction.set({
      label: 'Carrito vaciado',
      restore: () => {
        this._lines.set(previous);
        this._coupon.set(previousCoupon);
      }
    });
  }

  // Método para limpiar la acción de deshacer (cuando expira el toast)
  clearUndo(): void {
    this._undoAction.set(null);
  }

  applyCoupon(coupon: Coupon): void {
    this._coupon.set(coupon);
  }

  removeCoupon(): void {
    this._coupon.set(null);
  }

  private checkCouponValidity(): void {
    const c = this._coupon();
    if (c && this.subtotal() < c.minSubtotal) {
      this._coupon.set(null);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as StoredCart;

      if (Array.isArray(data.lines)) {
        // Validar y filtrar datos viejos/corruptos
        const validLines = data.lines.filter(
          l => l && l.product && typeof l.quantity === 'number' && l.quantity > 0
        );
        this._lines.set(validLines);
      }
      if (data.coupon) {
        this._coupon.set(data.coupon);
      }
    } catch {
      // Si está corrupto, limpiamos
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}