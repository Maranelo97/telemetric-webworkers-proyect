import { Provider, makeEnvironmentProviders } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MAP_STRATEGY } from '../ports/output/map-strategy.port';
import { LeafletStrategyService } from '../../infrastructure/driving/workers/leaflet-strategy.service';
import { TELEMETRY_PORT } from '../ports/output/telemetry.port';
import { SimulatedTelemetryAdapter } from '../../infrastructure/driven/http/simulated-telemetry.adapter';
import { CHARTING_PORT } from '../ports/visuals/charting.port';
import { D3ChartingEngine } from '../../infrastructure/driven/visualizations/d3-charting.engine';
export const provideCore = () => {
  return makeEnvironmentProviders([
    provideHttpClient(withFetch()),
    { provide: MAP_STRATEGY, useClass: LeafletStrategyService },
    { provide: TELEMETRY_PORT, useClass: SimulatedTelemetryAdapter },
    { provide: CHARTING_PORT, useClass: D3ChartingEngine },
  ]);
};
