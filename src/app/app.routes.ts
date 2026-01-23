import { Routes } from '@angular/router';
import { UnitDiagnostics } from './features/UnitDiagnostics/UnitDiagnostics';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/telemetry-hub/telemetry-hub').then((m) => m.TelemetryHub),
  },

  {
    path: 'allFleet',
    loadComponent: () => import('./features/FleetGrid/FleetGrid').then((m) => m.FleetGrid),
  },
  {
    path: 'diagnostics/:id',
    loadComponent: () =>
      import('./features/UnitDiagnostics/UnitDiagnostics').then((m) => m.UnitDiagnostics),
  },
];
