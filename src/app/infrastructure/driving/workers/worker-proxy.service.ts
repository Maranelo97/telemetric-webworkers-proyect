import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable } from 'rxjs';
import { Vehicle } from '../../../core/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class WorkerProxyService {
  private worker: Worker | null = null;
  private processedData$ = new Subject<{ fleet: Vehicle[]; alerts: any[] }>();
  
  // Inyectamos el ID de la plataforma
  private platformId = inject(PLATFORM_ID);

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    // Solo ejecutamos si estamos en el Navegador
    if (isPlatformBrowser(this.platformId)) {
      if (typeof Worker !== 'undefined') {
        try {
          this.worker = new Worker(new URL('./telemetry.worker', import.meta.url), {
            type: 'module'
          });

          this.worker.onmessage = ({ data }) => {
            this.processedData$.next({
              fleet: data.processedFleet,
              alerts: data.alerts
            });
          };

          this.worker.onerror = (err) => console.error('Worker Error:', err);
        } catch (e) {
          console.error('Worker initialization failed', e);
        }
      } else {
        console.warn('Web Workers no soportados en este navegador.');
      }
    }
  }

  processData(data: Vehicle[]): void {
    // Solo enviamos si el worker existe (evita errores en SSR)
    this.worker?.postMessage(data);
  }

  getProcessedData(): Observable<{ fleet: Vehicle[]; alerts: any[] }> {
    return this.processedData$.asObservable();
  }
}