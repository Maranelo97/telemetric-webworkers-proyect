import { Injectable } from '@angular/core';
import { Vehicle } from '../../core/models/vehicle.model';
import { WidgetConfig } from '../components/models/widget.models';

@Injectable({ providedIn: 'root' })
export class WidgetMapper {
  mapVehicleToWidget(vehicle: Vehicle): WidgetConfig {
    const isOptimal = vehicle.status === 'OPTIMAL';

    return {
      label: `UNIT: ${vehicle.id}`,
      value: vehicle.name,
      colorScheme: isOptimal ? 'indigo' : 'rose',
      trend: {
        value: Math.floor(Math.random() * 10),
        isPositive: vehicle.metrics.health > 90,
      },
    };
  }

  mapFleetStats(total: number, alerts: number): WidgetConfig[] {
    return [
      { label: 'Total Fleet', value: total, colorScheme: 'indigo' },
      {
        label: 'Active Alerts',
        value: alerts,
        colorScheme: 'rose',
        trend: { value: 5, isPositive: false },
      },
      { label: 'System Status', value: 'LIVE', colorScheme: 'emerald' },
    ];
  }
}
