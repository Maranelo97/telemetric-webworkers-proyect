// infrastructure/driven/platform/platform.adapter.ts
import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PlatformAdapter {
  private platformId = inject(PLATFORM_ID);

  // Exponemos la validación como una propiedad de solo lectura
  readonly isBrowser: boolean = isPlatformBrowser(this.platformId);

  // Helper para ejecutar lógica de forma segura
  runOnBrowser(callback: () => void): void {
    if (this.isBrowser) callback();
  }
}
