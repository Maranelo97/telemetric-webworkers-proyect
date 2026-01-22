import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  input,
  effect,
  AfterViewInit,
} from '@angular/core';
import { MAP_STRATEGY } from '../../../core/ports/output/map-strategy.port';

@Component({
  selector: 'map-viewer',
  imports: [],
  templateUrl: './map-viewer.html',
  styleUrl: './map-viewer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class MapViewer implements AfterViewInit, OnDestroy {
  private mapStrategy = inject(MAP_STRATEGY);
  locations = input<any[]>([]);

  constructor() {
    effect(() => {
      this.mapStrategy.updateMarkers(this.locations());
    });
  }

  ngAfterViewInit() {
   this.mapStrategy.initialize('main-map', [37.7749, -122.4194], 13);
  }

  ngOnDestroy() {
    this.mapStrategy.destroy();
  }
}
