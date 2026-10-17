import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/order.model';

const ERROR_MESSAGES: Record<string, string> = {
  RECURSO_NO_ENCONTRADO: 'No encontramos lo que buscabas.',
  CUPON_INVALIDO: 'El código de cupón no es válido.',
  CUPON_VENCIDO: 'Este cupón ya no está vigente.',
  CUPON_MONTO_MINIMO: 'El subtotal no alcanza el mínimo para este cupón.',
  STOCK_INSUFICIENTE: 'No hay suficientes unidades disponibles.',
  TOTAL_INCORRECTO: 'Hubo un problema con los totales, intenta de nuevo.',
  CLIENTE_INCOMPLETO: 'Por favor completa todos tus datos.',
  ERROR_INTERNO: 'Tuvimos un problema en el servidor, intenta más tarde.'
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let userMessage = 'Ocurrió un error inesperado. Por favor intenta de nuevo.';
      let errorCode = 'UNKNOWN';

      // Si el backend respondió con nuestro formato ApiError
      if (error.error && typeof error.error === 'object' && 'error' in error.error) {
        const apiError = error.error as ApiError;
        errorCode = apiError.error;
        userMessage = ERROR_MESSAGES[apiError.error] || apiError.message;
      } else if (error.status === 0) {
        userMessage = 'No pudimos conectar con el servidor. Verifica tu conexión.';
        errorCode = 'NETWORK_ERROR';
      }

      // Retornamos el error cargado para que el componente sepa qué mostrar
      return throwError(() => ({
        code: errorCode,
        message: userMessage,
        status: error.status
      }));
    })
  );
};