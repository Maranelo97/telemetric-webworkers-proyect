import { Injectable } from '@angular/core';
import { interval, map, Observable, of } from 'rxjs';
import { TelemetryPort } from '../../../core/ports/output/telemetry.port';
import { Vehicle } from '../../../core/models/vehicle.model';
import { DriverBiometrics } from '../../../core/models/biometrics.model';
import { generateFleet } from '../../../shared/utils/genFleet';

@Injectable({ providedIn: 'root' })
export class SimulatedTelemetryAdapter implements TelemetryPort {
  // 1. GENERACIÓN DINÁMICA: Creamos la flota una sola vez para que sea persistente
  private readonly _fleet: Vehicle[] = generateFleet(20);

  getFleetStream(): Observable<Vehicle[]> {
    // Emitimos la flota almacenada (cada 6 segundos simula una actualización de red)
    return interval(6000).pipe(map(() => this._fleet));
  }

  getVehicleDetail(id: string): Observable<Vehicle> {
    // 2. BUSQUEDA DINÁMICA: Buscamos el vehículo real por ID en la flota generada
    const vehicle = this._fleet.find((v) => v.id === id);

    if (!vehicle) {
      // Si no existe (caso raro), lanzamos error para debuguear rápido
      throw new Error(`Vehicle with ID ${id} not found in Simulation Database`);
    }

    return of(vehicle);
  }

  streamEngineHealth(): Observable<DriverBiometrics> {
    return interval(2000).pipe(
      map(() => ({
        driverId: 'DRV-STITCH-01',
        attentionLevel: Math.floor(80 + Math.random() * 20),
        avgHRV: Math.floor(65 + Math.random() * 15),
        blinkRate: Math.random() * 2,
        stressZone: Math.random() > 0.8 ? 'HIGH' : 'OPTIMAL',
        gForce: { x: 0, y: 0 },
        postureScore: 95,
        cervicalLoad: 7.2,
      })),
    );
  }

  streamGForce(): Observable<{ x: number; y: number }> {
    return interval(2000).pipe(
      map(() => ({
        x: (Math.random() * 2 - 1) * 1.5,
        y: (Math.random() * 2 - 1) * 1.5,
      })),
    );
  }
}
