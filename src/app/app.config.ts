import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

//TEMPORAL USAMO MAP STRATEGY AQUI, LUEGO ARMAMOS UN CORE PROVIDER QUE TENGA TODO E INYECTAMOS AQUI
import { MAP_STRATEGY } from './core/ports/output/map-strategy.port';
import { LeafletStrategyService } from './infrastructure/driving/workers/leaflet-strategy.service';
import { TELEMETRY_PORT } from './core/ports/output/telemetry.port';
import { SimulatedTelemetryAdapter } from './infrastructure/driven/http/simulated-telemetry.adapter';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    { provide: MAP_STRATEGY, useClass: LeafletStrategyService },
    { provide: TELEMETRY_PORT, useClass: SimulatedTelemetryAdapter }
  ],
};
