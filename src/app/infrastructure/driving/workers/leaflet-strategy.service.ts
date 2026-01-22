import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MapStrategy } from '../../../core/ports/output/map-strategy.port';

@Injectable({ providedIn: 'root' })
export class LeafletStrategyService implements MapStrategy {
  private map: any;
  private L: any; // Aquí guardaremos la instancia de Leaflet
  private markers = new Map<string, any>();
  private platformId = inject(PLATFORM_ID);

  async initialize(containerId: string, center: [number, number], zoom: number): Promise<void> {
    // 🛡️ Guardia de Seguridad: Solo ejecutar en el navegador
    if (!isPlatformBrowser(this.platformId)) return;

    // Carga dinámica de Leaflet
    this.L = await import('leaflet');

    // Inicializar el mapa
    this.map = this.L.map(containerId).setView(center, zoom);
    
    this.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO'
    }).addTo(this.map);
  }

  updateMarkers(locations: any[]): void {
    if (!this.map || !this.L) return;

    locations.forEach(loc => {
      const location = loc.location; // Ajustar según tu modelo
      if (this.markers.has(loc.id)) {
        this.markers.get(loc.id).setLatLng([location.lat, location.lng]);
      } else {
        const icon = this.L.divIcon({
          className: 'custom-radar-icon',
          html: `<div class="relative flex items-center justify-center">
                   <div class="absolute w-4 h-4 rounded-full bg-indigo-500 animate-ping opacity-75"></div>
                   <div class="relative w-3 h-3 rounded-full bg-indigo-400 border border-white"></div>
                 </div>`,
          iconSize: [20, 20]
        });

        const marker = this.L.marker([location.lat, location.lng], { icon }).addTo(this.map);
        this.markers.set(loc.id, marker);
      }
    });
  }

  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.markers.clear();
    }
  }
}