import { Injectable } from '@angular/core';
import { interval, map, Observable, of } from 'rxjs';
import { TelemetryPort } from '../../../core/ports/output/telemetry.port';
import { Vehicle } from '../../../core/models/vehicle.model';
import { DriverBiometrics } from '../../../core/models/biometrics.model';
import { generateFleet } from '../../../shared/utils/genFleet';

@Injectable({ providedIn: 'root' })
export class SimulatedTelemetryAdapter implements TelemetryPort {
  getFleetStream(): Observable<Vehicle[]> {
    return interval(6000).pipe(map(() => generateFleet(20)));
  }

  getVehicleDetail(id: string): Observable<Vehicle> {
    return of({
      id: id,
      name: `UNIT ${id} - STITCH CORE`,
      horsepower: 520,
      status: 'OPTIMAL',
      powerLevel: 88, // <-- Propiedad faltante añadida
      metrics: {
        fuel: 65,
        health: 88,
        rpm: 1850,
        speed: 45,
        temp: 1240, // Asegúrate de que tu interfaz tenga 'temp' o quítalo
        brakingPrecision: 78, // Asegúrate de que tu interfaz tenga esto
      },
      location: { lat: 37.7749, lng: -122.4194 },
    });
  }

  streamEngineHealth(): Observable<DriverBiometrics> {
    return interval(2000).pipe(
      map(() => ({
        driverId: 'DRV-STITCH-01',
        attentionLevel: Math.floor(80 + Math.random() * 20),
        avgHRV: Math.floor(65 + Math.random() * 15),
        blinkRate: Math.random() * 2,
        stressZone: Math.random() > 0.8 ? 'HIGH' : 'OPTIMAL',
        // 🔥 PROPIEDADES FALTANTES AÑADIDAS:
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
