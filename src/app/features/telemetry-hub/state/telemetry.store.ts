import { Injectable, signal, computed, inject } from '@angular/core';
import { MonitorFleetUsecase } from '../../../core/use-cases/monitor-fleet.usecase';
import { WidgetMapper } from '../../../shared/mappers/widget.mapper';
import { Vehicle } from '../../../core/models/vehicle.model';
import { DrawerService } from '../../../infrastructure/ui/common/services/drawer';

@Injectable({ providedIn: 'root' })
export class TelemetryStore {
  private monitorFleet = inject(MonitorFleetUsecase);
  private mapper = inject(WidgetMapper);
  private drawerService = inject(DrawerService);
  readonly drawerOpen = signal<boolean>(false);
  readonly selectedVehicleId = signal<string | null>(null);

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

  readonly locations = computed(
    () =>
      this.fleet()
        .map((v) => ({
          id: v.id,
          name: v.name,
          lat: v.location?.lat, // Usamos optional chaining por seguridad
          lng: v.location?.lng,
          status: v.status,
        }))
        .filter((loc) => loc.lat !== undefined && loc.lng !== undefined), // Limpiamos datos corruptos
  );

  readonly vehicleWidgets = computed(() =>
    this.fleet().map((v) => ({
      data: v,
      config: this.mapper.mapVehicleToWidget(v),
    })),
  );
  readonly kpiWidgets = computed(() =>
    this.mapper.mapFleetStats(this.totalVehicles(), this.alerts().length),
  );

  closeDrawer() {
    this.drawerOpen.set(false);
    this.selectedVehicleId.set(null);
  }
}
