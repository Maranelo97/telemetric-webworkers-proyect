export interface Vehicle {
  id: string;
  name: string;
  status: 'OPTIMAL' | 'CRITICAL' | 'ROUTING';
  powerLevel: number;
  metrics: {
    fuel: number;
    health: number;
    rpm: number;
    speed: number;
    temp: number;
    brakingPrecision: number;
  };
  location: {
    lat: number;
    lng: number;
  };
}
