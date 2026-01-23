import { inject, Injectable, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SideDrawer } from '../../../../shared/components/side-drawer/side-drawer';
@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;

  open(vehicleId: string) {
    // 1. Crear la estrategia de posición (derecha, toda la pantalla)
    const positionStrategy = this.overlay.position().global().right('0').top('0').bottom('0');

    // 2. Crear el Overlay
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'drawer-backdrop-portal', // Clase para tu CSS de desenfoque
      panelClass: 'drawer-panel',
    });

    // 3. Inyectar el componente en el Portal
    const portal = new ComponentPortal(SideDrawer);
    const componentRef = this.overlayRef.attach(portal);

    // 4. Pasar los datos manualmente al componente instanciado
    componentRef.instance.title.set(`Unit: ${vehicleId}`);
    componentRef.instance.isOpen.set(true);

    // 5. Escuchar el cierre
    componentRef.instance.close.subscribe(() => this.close());
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }
}
