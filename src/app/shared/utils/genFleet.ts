import { Vehicle } from "../../core/models/vehicle.model";

export const generateFleet = (count: number): Vehicle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `VHL-${i}`,
    name: `Unit ${i}`,
    horsepower: 450 + (i * 10),
    status: i % 5 === 0 ? 'CRITICAL' : 'OPTIMAL',
    powerLevel: 80 + i,
    metrics: {
      fuel: Math.floor(Math.random() * 100),
      health: Math.floor(Math.random() * 100),
      rpm: 2000 + (Math.random() * 500),
      speed: 60 + (Math.random() * 20),
      temp: 90 + (Math.random() * 30),
      brakingPrecision: 80 
    },
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    }
  }));
};