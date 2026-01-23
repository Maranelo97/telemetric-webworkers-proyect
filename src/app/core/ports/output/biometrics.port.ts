import { Observable } from 'rxjs';
import { DriverBiometrics } from '../../models/biometrics.model';

export interface BiometricsPort {
  getLiveBiometrics(driverId: string): Observable<DriverBiometrics>;
}
