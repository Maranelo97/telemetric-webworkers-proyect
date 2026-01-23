import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChartingPort {
  renderRadar(container: HTMLElement, data: any): void;
  renderWave(container: HTMLElement, stream$: Observable<any>): void;
  renderGForce(container: HTMLElement, data: any): void;
}

export const CHARTING_PORT = new InjectionToken<ChartingPort>('CHARTING_PORT');