import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  handleError(error: any, context?: string) {
    console.error(`[ErrorContext: ${context || 'General'}]`, error);
    // Aquí puedes integrar servicios de reporte como Sentry, logs, etc.
    // O manejar UI global mediante notificaciones (Toast)
  }
}
