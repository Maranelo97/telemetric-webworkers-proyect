import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  ChangeDetectionStrategy,
  NgZone,
  afterNextRender,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as d3 from 'd3';
import { TELEMETRY_PORT } from '../../core/ports/output/telemetry.port';

@Component({
  selector: 'biometric-monitor',
  standalone: true,
  templateUrl: './biometric-monitor.html',
  styleUrl: './biometric-monitor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BiometricMonitor {
  @ViewChild('waveContainer') container!: ElementRef;
  private platformId = inject(PLATFORM_ID);

  private telemetryPort = inject(TELEMETRY_PORT);
  private ngZone = inject(NgZone);

  private svg: any;
  private x: any;
  private y: any;
  private line: any;
  private data: number[] = Array(40).fill(60);

  constructor() {
    afterNextRender(() => {
      this.initD3Logic();
    });
  }


  private initD3Logic() {
    this.ngZone.runOutsideAngular(() => {
      this.setupCanvas();
      this.listenToBiometrics();
    });
  }

private setupCanvas() {
  const element = this.container.nativeElement;
  const width = element.offsetWidth || 600; 
  const height = element.offsetHeight || 400; // <-- CAPTURAMOS EL ALTO REAL

  // Limpiamos por si acaso hay un SVG viejo
  d3.select(element).select('svg').remove();

  this.svg = d3
    .select(element)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'none'); // Permite que se estire

  this.x = d3.scaleLinear().domain([0, 39]).range([0, width]);
  
  // Ajustamos el dominio para que la onda no se vea plana en un monitor alto
  this.y = d3.scaleLinear().domain([40, 120]).range([height - 20, 20]);

  this.line = d3
    .line<number>()
    .x((_, i) => this.x(i))
    .y((d) => this.y(d))
    .curve(d3.curveBasis); // CurveBasis es más suave, más "biométrica"

  this.svg
    .append('path')
    .attr('class', 'hrv-line')
    .attr('fill', 'none')
    .attr('stroke', '#00ffcc')
    .attr('stroke-width', 3);
}

private listenToBiometrics() {
  this.telemetryPort.streamEngineHealth().subscribe(biometrics => {
    if (isPlatformBrowser(this.platformId) && this.svg) {
      this.updateWave(biometrics.avgHRV, biometrics.stressZone);
    }
  });
}

  private updateWave(newHRV: number, zone: string) {
    this.data.push(newHRV);
    this.data.shift();

    const colorMap = {
      LOW: '#00d4ff',
      OPTIMAL: '#00ffcc',
      HIGH: '#ff4757',
    };

    const currentColor = colorMap[zone as keyof typeof colorMap] || colorMap['OPTIMAL'];

    this.svg
      .select('.hrv-line')
      .datum(this.data)
      .transition()
      .duration(200)
      .ease(d3.easeLinear)
      .attr('d', this.line)
      .attr('stroke', currentColor);


    d3.select('#hrv-number')
      .transition()
      .duration(200)
      .on('start', function () {
        d3.select(this).style('color', currentColor);
      })
      .tween('text', function () {
        const that = d3.select(this);
        const i = d3.interpolateRound(parseInt(that.text()) || 0, newHRV);
        return (t: number) => {
          that.text(i(t));
        };
      });
  }
}
