import { inject, Injectable, Type, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SideDrawer } from '../../../../shared/components/side-drawer/side-drawer';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;

  open<T>(component: Type<T>, title: string, inputs: Partial<T>) {
    this.close(); // Limpiamos cualquier overlay anterior

    // 1. Crear el Overlay para el SideDrawer (el cascarón)
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().right('0').top('0').bottom('0'),
      hasBackdrop: true,
      backdropClass: 'drawer-backdrop-portal',
    });

    const drawerPortal = new ComponentPortal(SideDrawer);
    const drawerRef = this.overlayRef.attach(drawerPortal);
    drawerRef.instance.title.set(title);

    // 2. CREAR UN SEGUNDO PORTAL OUTLET PARA EL CONTENIDO
    // En lugar de usar el overlayRef de nuevo, creamos el componente manualmente
    // para poder moverlo dentro del drawer-body
    const contentPortal = new ComponentPortal(component);

    // Usamos el ApplicationRef o un ViewContainerRef, pero lo más simple es:
    // Crear un overlay secundario o simplemente instanciar el componente.

    // CAMBIO DE ESTRATEGIA: Para evitar el error de "Host already attached"
    // Vamos a crear el componente del motor usando el ViewContainerRef del SideDrawer
    // Pero para no complicarte, hagamos esto:

    const contentOverlayRef = this.overlay.create(); // Un overlay invisible temporal
    const contentRef = contentOverlayRef.attach(contentPortal);

    // Pasar inputs
    Object.entries(inputs).forEach(([key, value]) => {
      contentRef.setInput(key, value);
    });

    // Mover el DOM
    const drawerBody = drawerRef.location.nativeElement.querySelector('.drawer-body');
    if (drawerBody) {
      drawerBody.appendChild(contentRef.location.nativeElement);
    }

    // Animación
    setTimeout(() => drawerRef.instance.isOpen.set(true), 50);

    // Al cerrar, destruimos ambos
    drawerRef.instance.close.subscribe(() => {
      this.close();
      contentOverlayRef.dispose();
    });
  }
  close() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
