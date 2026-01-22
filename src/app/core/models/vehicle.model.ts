export interface Vehicle {
  id: string;
  name: string;        
  horsepower: number;
  status: 'OPTIMAL' | 'CRITICAL' | 'ROUTING';
  metrics: {
    fuel: number;      
    health: number;      
    rpm: number;
    speed: number;
  };
  location: {
    lat: number;
    lng: number;
  };
}