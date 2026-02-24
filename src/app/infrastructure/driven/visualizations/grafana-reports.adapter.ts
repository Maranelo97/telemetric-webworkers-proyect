import { Injectable } from '@angular/core';
import {  HistoryReportingPort } from '../../../core/ports/visuals/charting.port';
import { of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GrafanaReportsAdapter implements HistoryReportingPort {
  private readonly GRAFANA_URL = '';

  renderHistoryReport(panelId: string, unitId: string): string {
    // Retornamos la URL construida
    return `${this.GRAFANA_URL}?panelId=${panelId}&var-unitId=${unitId}&theme=dark&kiosk`;
  }


  getMetricHistory(unitId: string, metric: string) {
    // Generamos 24 puntos de datos (uno por hora)
    const data = Array.from({length: 24}, (_, i) => ({
      time: `${i}:00`,
      value: 60 + Math.random() * 30 // Valores entre 60 y 90
    }));
    return of(data);
  }
}
