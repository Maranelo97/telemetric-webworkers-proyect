import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  effect,
  ViewChild,
} from '@angular/core';
import { RADAR_CHARTING_PORT } from '../../../../core/ports/visuals/charting.port';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { UnitDiagnosticsUseCase } from '../../../../core/use-cases/Unit-diagnostics.usecase';
import { DriverBiometrics } from '../../../../core/models/biometrics.model';

@Component({
  selector: 'app-skill-radar-display',
  standalone: true,
  imports: [],
  templateUrl: './SkillRadarDisplay.html',
  styleUrl: './SkillRadarDisplay.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkillRadarDisplay {
  vehicle = input.required<Vehicle>();
  biometricInput = input.required<DriverBiometrics>();

  private chartingRadar = inject(RADAR_CHARTING_PORT);
  private unitDiagnostics = inject(UnitDiagnosticsUseCase);

  @ViewChild('radarContainer') radarContainer!: ElementRef;

  constructor() {
    effect(() => {
      const v = this.vehicle();
      const b = this.biometricInput();
      if (this.radarContainer?.nativeElement && b) {
        this.updateRadar(v, b);
      }
    });

    afterNextRender(() => {
      this.updateRadar(this.vehicle(), this.biometricInput());
    });
  }

  private updateRadar(v: Vehicle, b: DriverBiometrics) {
    const stats = this.unitDiagnostics.getRadarStats(v, b);
    const { mainColor, areaColor } = this.unitDiagnostics.getRadarColors(v?.status);

    this.chartingRadar.renderRadar(this.radarContainer.nativeElement, stats, mainColor, areaColor);
  }
}
