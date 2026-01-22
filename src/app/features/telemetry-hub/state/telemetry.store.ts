import { Injectable, signal, computed, inject } from '@angular/core';
import { MonitorFleetUsecase } from '../../../core/use-cases/monitor-fleet.usecase';
import { WidgetMapper } from '../../../shared/mappers/widget.mapper';
import { Vehicle } from '../../../core/models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class TelemetryStore {
  private monitorFleet = inject(MonitorFleetUsecase);
  private mapper = inject(WidgetMapper);

  readonly fleet = signal<Vehicle[]>([]);
  readonly alerts = signal<any[]>([]);
  readonly loading = signal<boolean>(true);

  readonly totalVehicles = computed(() => this.fleet().length);
  readonly criticalVehicles = computed(
    () => this.fleet().filter((v) => v.status === 'CRITICAL').length,
  );

  constructor() {
    this.monitorFleet.execute().subscribe();
    this.monitorFleet.getProcessedResults().subscribe((result) => {
      this.fleet.set(result.fleet);
      this.alerts.set(result.alerts);
      this.loading.set(false);
    });
  }

  readonly vehicleWidgets = computed(() =>
    this.fleet().map((v) => ({
      data: v,
      config: this.mapper.mapVehicleToWidget(v),
    })),
  );
  readonly kpiWidgets = computed(() =>
    this.mapper.mapFleetStats(this.totalVehicles(), this.alerts().length),
  );
}
