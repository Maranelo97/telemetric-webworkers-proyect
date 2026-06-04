import { Injectable, inject } from '@angular/core';
import { SimulatedTelemetryAdapter } from '../../infrastructure/driven/http/simulated-telemetry.adapter';
import { WorkerProxyService } from '../../infrastructure/driving/workers/worker-proxy.service';
import { WidgetMapper } from '../../shared/mappers/widget.mapper';
import { Vehicle } from '../models/vehicle.model';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitorFleetUsecase {
  private telemetryAdapter = inject(SimulatedTelemetryAdapter);
  private workerProxy = inject(WorkerProxyService);
  private mapper = inject(WidgetMapper);

  execute() {
    return this.telemetryAdapter
      .getFleetStream()
      .pipe(tap((data) => this.workerProxy.processData(data)));
  }

  getProcessedResults() {
    return this.workerProxy.getProcessedData();
  }

  getLocations(fleet: Vehicle[]) {
    return fleet
      .map((v) => ({
        id: v.id,
        name: v.name,
        lat: v.location?.lat,
        lng: v.location?.lng,
        status: v.status,
      }))
      .filter((loc) => loc.lat !== undefined && loc.lng !== undefined);
  }

  getVehicleWidgets(fleet: Vehicle[]) {
    return fleet.map((v) => ({
      data: v,
      config: this.mapper.mapVehicleToWidget(v),
    }));
  }
}
