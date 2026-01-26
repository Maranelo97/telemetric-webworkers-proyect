import { Vehicle } from '../../core/models/vehicle.model';
export type EngineModelType = 'generic' | 'mazda' | 'truck';
export const generateFleet = (count: number): Vehicle[] => {
  const availableModels: EngineModelType[] = ['generic', 'mazda', 'truck'];

  return Array.from({ length: count }, (_, i) => ({
    id: `VHL-${i}`,
    name: `Unit ${i}`,
    horsepower: 450 + i * 10,
    status: i % 5 === 0 ? 'CRITICAL' : 'OPTIMAL',
    powerLevel: 80 + i,
    modelEngine: availableModels[Math.floor(Math.random() * availableModels.length)],
    metrics: {
      fuel: Math.floor(Math.random() * 100),
      health: Math.floor(Math.random() * 100),
      rpm: 2000 + Math.random() * 500,
      speed: 60 + Math.random() * 20,
      temp: 90 + Math.random() * 30,
      brakingPrecision: 80,
    },
    location: {
      lat: 37.7749 + (Math.random() - 0.5) * 0.1,
      lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    },
  }));
};
