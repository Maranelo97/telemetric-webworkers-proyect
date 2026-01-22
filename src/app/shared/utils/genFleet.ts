import { Vehicle } from "../../core/models/vehicle.model";

export function generateFleet(count: number): Vehicle[] {
  const statuses: Vehicle['status'][] = ['OPTIMAL', 'ROUTING', 'CRITICAL'];

  return Array.from({ length: count }, (_, i) => ({
    id: `TRK-${800 + i}`,
    name: `HEAVY HAULER VH-${i.toString().padStart(2, '0')}`,
    horsepower: 450,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    metrics: {
      fuel: Math.floor(Math.random() * 100),
      health: Math.floor(90 + Math.random() * 10),
      rpm: Math.floor(1500 + Math.random() * 1000),
      speed: Math.floor(60 + Math.random() * 20)
    },
    location: {
      lat: 37.7749 + (Math.random() * 0.05),
      lng: -122.4194 + (Math.random() * 0.05)
    }
  }));
}