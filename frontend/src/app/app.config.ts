import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';

import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    // Errores globales de ejecución.
    provideBrowserGlobalErrorListeners(),

    // Deteccion de cambios.
    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    // Navegación
    provideRouter(routes),

    // Peticiones HTTP y manejo centralizado de errores.
    provideHttpClient(withInterceptors([errorInterceptor])),

    // Animaciones PrimeNG
    provideAnimationsAsync(),

    // Formatos regionales de angular.
    { provide: LOCALE_ID, useValue: 'es-CO'},

    // Tema visual de PrimeNG
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode'
        }
      }
    })
  ]
}