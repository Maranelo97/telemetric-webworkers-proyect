import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { TelemetryStore } from '../telemetry-hub/state/telemetry.store';
import { Router } from '@angular/router';
@Component({
  selector: 'app-fleet-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './FleetGrid.html',
  styleUrls: ['./FleetGrid.css'],
})
export class FleetGrid {
  public store = inject(TelemetryStore);
  private location = inject(Location);
  private router = inject(Router);
  goBack() {
     this.router.navigate(['/dashboard']);
  }

  viewDiagnostics(id: string) {
    this.router.navigate(['/diagnostics', id]);
  }
}
