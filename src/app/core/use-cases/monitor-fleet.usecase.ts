import { Injectable, inject } from '@angular/core';
import { SimulatedTelemetryAdapter } from '../../infrastructure/driven/http/simulated-telemetry.adapter';
import { WorkerProxyService } from '../../infrastructure/driving/workers/worker-proxy.service';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MonitorFleetUsecase {
  private telemetryAdapter = inject(SimulatedTelemetryAdapter);
  private workerProxy = inject(WorkerProxyService);

  execute() {
    return this.telemetryAdapter
      .getFleetStream()
      .pipe(tap((data) => this.workerProxy.processData(data)));
  }

  getProcessedResults() {
    return this.workerProxy.getProcessedData();
  }
}
