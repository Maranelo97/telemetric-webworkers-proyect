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
import { Router } from '@angular/router';

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
  private router = inject(Router);
  public locations = input<any[]>([]);
  private isMapReady = false;

  constructor() {
    effect(() => {
      const data = this.locations();
      // Solo ejecutamos si el mapa está inicializado y hay datos
      if (this.isMapReady && data && data.length > 0) {
        this.mapStrategy.updateMarkers(data);
      }
    });
  }

  ngAfterViewInit() {
    // Inicializar Leaflet
    this.mapStrategy.initialize('main-map', [37.7749, -122.4194], 13);

    if (this.mapStrategy.onMarkerClick) {
      this.mapStrategy.onMarkerClick((unitId: string) => {
        // Navegamos a la ruta de detalles usando el ID del vehículo
        this.router.navigate(['/diagnostics/', unitId]);
      });
    }

    // Pequeño timeout o microtask para asegurar que el motor de Leaflet pintó el contenedor
    setTimeout(() => {
      this.isMapReady = true;
      if (this.locations().length > 0) {
        this.mapStrategy.updateMarkers(this.locations());
      }
    }, 100);
  }

  ngOnDestroy() {
    this.mapStrategy.destroy();
  }
}
