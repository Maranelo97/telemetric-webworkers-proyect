import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MapStrategy } from '../../../core/ports/output/map-strategy.port';

@Injectable({ providedIn: 'root' })
export class LeafletStrategyService implements MapStrategy {
  private platformId = inject(PLATFORM_ID);
  private map?: any; // Usamos any para evitar que TS pida el import de L arriba
  private L: any;
  private markerLayer: any;
  private onMarkerClickCallback?: (id: string) => void;

  async initialize(containerId: string, center: [number, number], zoom: number) {
    // 🔥 SOLO ejecutar si estamos en el Navegador
    if (isPlatformBrowser(this.platformId)) {
      // Importación dinámica de Leaflet solo en el cliente
      this.L = await import('leaflet');

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
