import { InjectionToken } from '@angular/core';

export interface MapStrategy {
  initialize(containerId: string, center: [number, number], zoom: number): void;
  updateMarkers(
    locations: { id: string; lat: number; lng: number; label: string; status: string }[],
  ): void;
  destroy(): void;
}
export const MAP_STRATEGY = new InjectionToken<MapStrategy>('MAP_STRATEGY');
