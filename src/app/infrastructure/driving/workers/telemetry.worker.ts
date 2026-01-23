import { Vehicle } from '../../../core/models/vehicle.model';

addEventListener('message', ({ data }: { data: Vehicle[] }) => {
  const processed = data.map((v) => {
    return {
      ...v,
      metrics: {
        ...v.metrics,
        // Hacemos que los valores fluctúen para ver las barras moverse
        fuel: Math.floor(Math.random() * 100),
        health: Math.floor(Math.random() * 100),
        speed: Math.floor(Math.random() * 120),
      },
    };
  });

  postMessage({
    processedFleet: processed,
    alerts: [], // Aquí irían las alertas que definimos antes
  });
});
