import {
  Component,
  inject,
  afterNextRender,
  ChangeDetectionStrategy,
  signal,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CHARTING_PORT } from '../../core/ports/visuals/charting.port';
import { TELEMETRY_PORT } from '../../core/ports/output/telemetry.port';
import { Vehicle } from '../../core/models/vehicle.model';
import { DriverBiometrics } from '../../core/models/biometrics.model';
import { TelemetryStore } from '../telemetry-hub/state/telemetry.store';
import { DataLoader } from "../../shared/components/dataLoader/dataLoader";

@Component({
  selector: 'app-unit-diagnostics',
  standalone: true,
  templateUrl: './UnitDiagnostics.html',
  styleUrl: './UnitDiagnostics.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataLoader],
})
export class UnitDiagnostics implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private charting = inject(CHARTING_PORT);
  private telemetry = inject(TELEMETRY_PORT);
  private store = inject(TelemetryStore);
  isLoading = signal(true);
  isUnitCritical = signal(false);

  @ViewChild('radarContainer') radarContainer!: ElementRef;
  @ViewChild('gForceContainer') gForceContainer!: ElementRef;

  // Signals para la UI
  unitId = signal<string>(this.route.snapshot.paramMap.get('id') || 'UNKNOWN');
  vehicle = signal<Vehicle | null>(null);
  biometrics = signal<DriverBiometrics | null>(null);

  private subscriptions = new Subscription();

  constructor() {
    // 1. Cargar datos base del vehículo
    this.telemetry.getVehicleDetail(this.unitId()).subscribe((v) => this.vehicle.set(v));

    afterNextRender(() => {
      if (this.radarContainer?.nativeElement && this.gForceContainer?.nativeElement) {
        this.initDynamicVisuals();
      }
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    // Buscamos en el store si esta unidad es crítica
    const unit = this.store.fleet().find((u) => u.id === id);
    if (unit?.status === 'CRITICAL') {
      this.isUnitCritical.set(true);
    }

    setTimeout(() => {
      this.isLoading.set(false);
    }, 1800);
  }

  private initDynamicVisuals() {
    // 1. Radar Dinámico (Basado en el stream de biometría)
    const biometrics$ = this.telemetry.streamEngineHealth();

    this.subscriptions.add(
      biometrics$.subscribe((data) => {
        this.biometrics.set(data);

        // Mapeamos los datos dinámicos al Radar (Imagen 5: Performance Pillars)
        const v = this.vehicle();
        const dynamicStats = [
          { axis: 'Atención', value: data.attentionLevel / 100 },
          { axis: 'Frenado', value: (v?.metrics.brakingPrecision || 78) / 100 },
          { axis: 'Consumo', value: (v?.metrics.fuel || 92) / 100 },
          { axis: 'Estrés', value: data.stressZone === 'OPTIMAL' ? 0.9 : 0.4 },
          { axis: 'Salud', value: (v?.metrics.health || 85) / 100 },
        ];

        this.charting.renderRadar(this.radarContainer.nativeElement, dynamicStats);
      }),
    );

    // 2. G-Force (Inercia viva - Imagen 4: G-Force Vector)
    const gForce$ = this.telemetry.streamGForce();
    this.subscriptions.add(this.charting.renderGForce(this.gForceContainer.nativeElement, gForce$));
  }

  back() {
    this.router.navigate(['/allFleet']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
