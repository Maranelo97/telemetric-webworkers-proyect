export interface DriverBiometrics {
  driverId: string;
  attentionLevel: number;      // 85% Optimal (Imagen 4)
  avgHRV: number;              // 62 ms (Imagen 4)
  blinkRate: number;           // 12 bpm (Imagen 4)
  stressZone: 'LOW' | 'OPTIMAL' | 'HIGH';
  gForce: { x: number; y: number };
  postureScore: number;        // Para el "Physical Stress Zones" (Imagen 4)
  cervicalLoad: number;        // 7.2kg detectados (Imagen 4)
}