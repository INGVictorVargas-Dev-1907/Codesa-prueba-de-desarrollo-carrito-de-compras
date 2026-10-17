import { Routes } from '@angular/router';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>import('./features/shop/shop-page/shop-page.component').then(m => m.ShopPageComponent),
        title: 'Catálogo - Codesa Shop'
      },
      {
        path: 'producto/:id',
        loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
        title: 'Detalle de producto - Codesa Shop'

      },
      {
        path: 'carrito',
        loadComponent: () => import('./features/cart/cart-page/cart-page.component').then(m => m.CartPageComponent),
        title: 'Tu carrito - Codesa Shop'
      },
      {
        path: '**',
        loadComponent: () => import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
        title: 'No encontrado - Codesa Shop'
      }
    ]
  }
];
