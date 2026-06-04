import { Injectable, inject, signal, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TELEMETRY_PORT } from '../../../core/ports/output/telemetry.port';
import { Vehicle } from '../../../core/models/vehicle.model';
import { DriverBiometrics } from '../../../core/models/biometrics.model';
import { Observable, switchMap, of, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UnitDiagnosticsService {
  private telemetry = inject(TELEMETRY_PORT);

  // State
  private vehicle = signal<Vehicle | null>(null);
  private biometrics = signal<DriverBiometrics | null>(null);
  
  // Public Read-only State
  readonly vehicle$ = this.vehicle.asReadonly();
  readonly biometrics$ = this.biometrics.asReadonly();
  readonly isCritical$ = computed(() => this.vehicle()?.status === 'CRITICAL');

  init(unitId: string): Observable<any> {
    // Orquestación de streams iniciales
    return this.telemetry.getVehicleDetail(unitId).pipe(
      map(vehicle => {
        this.vehicle.set(vehicle);
        return vehicle;
      }),
      switchMap(() => this.telemetry.streamEngineHealth()),
      map(biometrics => {
        this.biometrics.set(biometrics);
        return biometrics;
      })
    );
  }

  // Computed derived state
  getRadarStats = computed(() => {
    const v = this.vehicle();
    const b = this.biometrics();
    if (!v || !b) return [];
    
    return [
      { axis: 'Atención', value: b.attentionLevel / 100 },
      { axis: 'Frenado', value: (v.metrics.brakingPrecision || 78) / 100 },
      { axis: 'Consumo', value: (v.metrics.fuel || 92) / 100 },
      { axis: 'Estrés', value: b.stressZone === 'OPTIMAL' ? 0.9 : 0.4 },
      { axis: 'Salud', value: (v.metrics.health || 85) / 100 },
    ];
  });
}
