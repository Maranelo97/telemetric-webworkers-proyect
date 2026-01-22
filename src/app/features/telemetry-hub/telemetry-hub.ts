import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TelemetryStore } from './state/telemetry.store';
import { CommonModule } from '@angular/common';
import { Widget } from '../../shared/components/widget/widget';
import { MapViewer } from '../../shared/components/map-viewer/map-viewer';
import { BiometricMonitor } from '../biometric-monitor/biometric-monitor';
import { Router } from '@angular/router';

@Component({
  selector: 'telemetry-hub',
  imports: [CommonModule, Widget, BiometricMonitor],
  templateUrl: './telemetry-hub.html',
  styleUrl: './telemetry-hub.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelemetryHub {
  protected store = inject(TelemetryStore);
  private router = inject(Router);

  goToFleetGrid() {
    this.router.navigate(['/allFleet']);
  }
}
