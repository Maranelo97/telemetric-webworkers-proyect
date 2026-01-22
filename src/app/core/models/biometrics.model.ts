export interface DriverBiometrics {
  driverId: string;
  attentionLevel: number;
  avgHRV: number;       
  blinkRate: number;  
  stressZone: 'LOW' | 'OPTIMAL' | 'HIGH';
}