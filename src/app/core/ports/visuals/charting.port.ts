import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';



export interface RadarChartPort {
  renderRadar(container: HTMLElement, data: any, mainColor: string, areaColor: string): void;
}

export interface WaveChartPort {
  renderWave(container: HTMLElement, stream$: Observable<any>): void;
}

export interface GForceChartPort {
  renderGForce(container: HTMLElement, data: any): void;
}

export interface ChartHistoryLinePort {
  renderHistoryLine(container: HTMLElement, data: { time: string; value: number }[]): void;
}

export interface HistoryReportingPort {
  // Solo nos da los datos de la "Caja Negra"
  getMetricHistory(unitId: string, metric: string): Observable<{ time: string; value: number }[]>;
}


export const RADAR_CHARTING_PORT = new InjectionToken<RadarChartPort>('RADAR_CHARTING_PORT');
export const WAVE_CHARTING_PORT = new InjectionToken<WaveChartPort>('WAVE_CHARTING_PORT');
export const GFORCE_CHARTING_PORT = new InjectionToken<GForceChartPort>('GFORCE_CHARTING_PORT');
export const HISTORILINE_PORT = new InjectionToken<ChartHistoryLinePort>('HISTORILINE_PORT');
export const HISTORY_REPORTING_PORT = new InjectionToken<HistoryReportingPort>(
  'HISTORY_REPORTING_PORT',
);
