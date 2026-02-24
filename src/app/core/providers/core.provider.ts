import { makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MAP_STRATEGY } from '../ports/output/map-strategy.port';
import { LeafletStrategyService } from '../../infrastructure/driving/workers/leaflet-strategy.service';
import { TELEMETRY_PORT } from '../ports/output/telemetry.port';
import { SimulatedTelemetryAdapter } from '../../infrastructure/driven/http/simulated-telemetry.adapter';
import {
  GFORCE_CHARTING_PORT,
  HISTORILINE_PORT,
  RADAR_CHARTING_PORT,
  WAVE_CHARTING_PORT,
} from '../ports/visuals/charting.port';
import { D3ChartingEngine } from '../../infrastructure/driven/visualizations/d3-charting.engine';
import { HISTORY_REPORTING_PORT } from '../ports/visuals/charting.port';
import { GrafanaReportsAdapter } from '../../infrastructure/driven/visualizations/grafana-reports.adapter';
import { ENGINE_PORT } from '../ports/output/engine.port';
import { ThreeJsEngineAdapter } from '../../infrastructure/driven/ThreeJs/three-js-engine.adapter';

export const provideCore = () => {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch()),
    { provide: MAP_STRATEGY, useClass: LeafletStrategyService },
    { provide: TELEMETRY_PORT, useClass: SimulatedTelemetryAdapter },
    D3ChartingEngine,
    { provide: WAVE_CHARTING_PORT, useExisting: D3ChartingEngine },
    { provide: GFORCE_CHARTING_PORT, useExisting: D3ChartingEngine },
    { provide: HISTORILINE_PORT, useExisting: D3ChartingEngine },
    { provide: RADAR_CHARTING_PORT, useExisting: D3ChartingEngine },
    { provide: HISTORY_REPORTING_PORT, useClass: GrafanaReportsAdapter },
    { provide: ENGINE_PORT, useClass: ThreeJsEngineAdapter },
  ]);
};
