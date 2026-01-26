import { Injectable, inject } from '@angular/core';
import { MapStrategy } from '../../../core/ports/output/map-strategy.port';
import { PlatformAdapter } from '../../driven/Platform/platform.adapter';

@Injectable({ providedIn: 'root' })
export class LeafletStrategyService implements MapStrategy {
  private map?: any;
  private L: any;
  private markerLayer: any;
  private onMarkerClickCallback?: (id: string) => void;
  private platform = inject(PlatformAdapter);

  async initialize(containerId: string, center: [number, number], zoom: number) {
    if (this.platform.isBrowser) {
      // 1. Cargamos el módulo
      const LeafletModule = await import('leaflet');

      // 2. EXTRA: En entornos de producción (Vercel), Leaflet suele venir en .default
      // Si no existe .map en el objeto principal, lo buscamos en .default
      this.L = LeafletModule.default || LeafletModule;

      // Verificación de seguridad
      if (!this.L || !this.L.map) {
        console.error('❌ Leaflet no se cargó correctamente:', this.L);
        return;
      }

      this.map = this.L.map(containerId, {
        zoomControl: false,
        attributionControl: false,
      }).setView(center, zoom);

      this.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(
        this.map,
      );

      this.markerLayer = this.L.layerGroup().addTo(this.map);
    }
  }

  updateMarkers(locations: any[]): void {
    if (!this.map || !this.markerLayer) return;

    this.markerLayer.clearLayers();

    locations.forEach((loc) => {
      if (loc?.lat && loc?.lng) {
        // 1. Definir color según status para el "punch visual"
        const isCritical = loc.status === 'CRITICAL';
        const color = isCritical ? '#ff4757' : '#00ffcc';

        // 2. Crear el círculo táctico
        const dot = this.L.circleMarker([loc.lat, loc.lng], {
          radius: isCritical ? 8 : 6, // Más grande si es crítico
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.5,
          className: isCritical ? 'marker-pulse' : '', // Clase para CSS
        });

        dot.on('click', () => {
          if (this.onMarkerClickCallback) {
            this.onMarkerClickCallback(loc.id);
          }
        });
        // 3. Añadir el popup estilizado
        dot.bindPopup(`
        <div style="background: #0f172a; color: white; padding: 5px; font-family: monospace;">
          <b style="color: ${color}">// ${loc.name}</b><br>
          <span style="font-size: 10px; opacity: 0.6;">STATUS: ${loc.status}</span>
        </div>
      `);

        this.markerLayer.addLayer(dot);
      }
    });
  }

  onMarkerClick(callback: (id: string) => void) {
    this.onMarkerClickCallback = callback;
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }
}
