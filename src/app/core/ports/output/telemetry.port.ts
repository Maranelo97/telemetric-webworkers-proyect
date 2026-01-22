import { Observable } from 'rxjs';
import { Vehicle } from '../../models/vehicle.model';
import { DriverBiometrics } from '../../models/biometrics.model';
import { InjectionToken } from '@angular/core';

export interface TelemetryPort {
  getFleetStream(): Observable<Vehicle[]>;
  getVehicleDetail(id: string): Observable<Vehicle>;
  streamEngineHealth(): Observable<DriverBiometrics>;
}

export const TELEMETRY_PORT = new InjectionToken<TelemetryPort>('TelemetryPort');