import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectionStrategy,
  NgZone,
  afterNextRender,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TELEMETRY_PORT } from '../../core/ports/output/telemetry.port';
import { CHARTING_PORT } from '../../core/ports/visuals/charting.port';
import { Subscription } from 'rxjs';

@Component({
  selector: 'biometric-monitor',
  standalone: true,
  templateUrl: './biometric-monitor.html',
  styleUrl: './biometric-monitor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometricMonitor implements OnDestroy {
  private charting = inject(CHARTING_PORT);
  private telemetry = inject(TELEMETRY_PORT);
  private sub = new Subscription();

  @ViewChild('waveContainer') container!: ElementRef;

  constructor() {
    afterNextRender(() => {
      // Pasamos el stream directamente al Engine
      const stream$ = this.telemetry.streamEngineHealth();
      this.sub.add(this.charting.renderWave(this.container.nativeElement, stream$));
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe(); // Limpieza de memoria (Zoneless friendly)
  }
}
