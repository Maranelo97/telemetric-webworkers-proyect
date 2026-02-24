import {
  Component,
  inject,
  afterNextRender,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  ElementRef,
  OnDestroy,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  HISTORY_REPORTING_PORT,
  RADAR_CHARTING_PORT,
  WAVE_CHARTING_PORT,
  GFORCE_CHARTING_PORT,
  HISTORILINE_PORT,
} from '../../core/ports/visuals/charting.port';
import { TELEMETRY_PORT } from '../../core/ports/output/telemetry.port';
import { Vehicle } from '../../core/models/vehicle.model';
import { DriverBiometrics } from '../../core/models/biometrics.model';
import { DataLoader } from '../../shared/components/dataLoader/dataLoader';
import { DrawerService } from '../../infrastructure/ui/common/services/drawer';
import { UnitDiagnosticsUseCase } from '../../core/use-cases/Unit-diagnostics.usecase';

@Component({
  selector: 'app-unit-diagnostics',
  standalone: true,
  templateUrl: './UnitDiagnostics.html',
  styleUrl: './UnitDiagnostics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataLoader],
})
export class UnitDiagnostics implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chartingRadar = inject(RADAR_CHARTING_PORT);
  private chartingG = inject(GFORCE_CHARTING_PORT);
  private chartingHistoryLine = inject(HISTORILINE_PORT);
  private telemetry = inject(TELEMETRY_PORT);
  private drawerService = inject(DrawerService);
  private historyReporting = inject(HISTORY_REPORTING_PORT);
  private unitDiagnostics = inject(UnitDiagnosticsUseCase);

  isLoading = signal(true);
  isUnitCritical = signal(false);
  unitId = signal<string>(this.route.snapshot.paramMap.get('id') || 'UNKNOWN');
  vehicle = signal<Vehicle | null>(null);
  biometrics = signal<DriverBiometrics | null>(null);

  @ViewChild('radarContainer') radarContainer!: ElementRef;
  @ViewChild('gForceContainer') gForceContainer!: ElementRef;
  @ViewChild('historyChart') historyChartElement!: ElementRef;

  private subscriptions = new Subscription();

  constructor() {
    afterNextRender(() => {
      this.initDynamicVisuals();
      this.initHistoryChart();
    });
  }

  ngOnInit() {
    const id = this.unitId();

    this.unitDiagnostics.getUnitDetails(id).subscribe(({ vehicle, isCritical }) => {
      this.vehicle.set(vehicle);
      this.isUnitCritical.set(isCritical);
    });
    setTimeout(() => this.isLoading.set(false), 1800);
  }

  private initHistoryChart() {
    if (this.historyChartElement?.nativeElement) {
      this.subscriptions.add(
        this.historyReporting.getMetricHistory(this.unitId(), 'temp').subscribe((data) => {
          this.chartingHistoryLine.renderHistoryLine(this.historyChartElement.nativeElement, data);
        }),
      );
    }
  }

  private initDynamicVisuals() {
    // Radar
    this.subscriptions.add(
      this.telemetry.streamEngineHealth().subscribe((data) => {
        this.biometrics.set(data);
        const v = this.vehicle();
        const b = this.biometrics();
        if (b) {
          const stats = this.unitDiagnostics.getRadarStats(v, b);
          const { mainColor, areaColor } = this.unitDiagnostics.getRadarColors(v?.status);
          this.chartingRadar.renderRadar(
            this.radarContainer.nativeElement,
            stats,
            mainColor,
            areaColor,
          );
        }
      }),
    );

    // G-Force
    const gForce$ = this.unitDiagnostics.getGForceStream();
    this.subscriptions.add(
      this.chartingG.renderGForce(this.gForceContainer.nativeElement, gForce$),
    );
  }

  back() {
    this.router.navigate(['/allFleet']);
  }

  async openEngineDetails() {
    const v = this.vehicle();
    if (!v) return;
    const { EngineViewer } = await import('./engine-3d/engine-viewer');
    this.drawerService.open(EngineViewer, `Telemetry: ${v.id}`, {
      modelEngine: v.modelEngine as any,
      isCritical: this.isUnitCritical() as any,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
