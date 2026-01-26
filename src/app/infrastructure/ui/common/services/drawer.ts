import { inject, Injectable, Type, ComponentRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { SideDrawer } from '../../../../shared/components/side-drawer/side-drawer';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private overlay = inject(Overlay);
  private overlayRef?: OverlayRef;
  private contentOverlayRef?: OverlayRef; // Guardamos referencia para limpiar bien

  open<T>(component: Type<T>, title: string, inputs: Partial<T>) {
    this.close(); // Limpiamos cualquier rastro anterior

    // 1. Crear el Overlay principal (SideDrawer)
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().right('0').top('0').bottom('0'),
      hasBackdrop: true,
      backdropClass: 'drawer-backdrop-portal',
    });

    const drawerPortal = new ComponentPortal(SideDrawer);
    const drawerRef = this.overlayRef.attach(drawerPortal);
    drawerRef.instance.title.set(title);

    // 2. Crear el Overlay para el contenido (EngineViewer)
    // Usamos un overlay básico para instanciar el componente
    this.contentOverlayRef = this.overlay.create();
    const contentRef = this.contentOverlayRef.attach(new ComponentPortal(component));

    // 3. Inyectar los Inputs (IMPORTANTE: Antes de mover el DOM)
    Object.entries(inputs).forEach(([key, value]) => {
      contentRef.setInput(key, value);
    });

    // 4. Mover el componente dentro del SideDrawer
    const drawerBody = drawerRef.location.nativeElement.querySelector('.drawer-body');
    if (drawerBody) {
      drawerBody.appendChild(contentRef.location.nativeElement);

      // Forzamos la detección de cambios para que los Signals (inputs) se activen
      contentRef.changeDetectorRef.detectChanges();
    }

    // 5. Animación de entrada
    setTimeout(() => drawerRef.instance.isOpen.set(true), 50);

    // 6. Lógica de cierre unificada
    drawerRef.instance.close.subscribe(() => this.close());
    this.overlayRef.backdropClick().subscribe(() => this.close());
  }

  close() {
    // Cerramos el contenido primero
    if (this.contentOverlayRef) {
      this.contentOverlayRef.dispose();
      this.contentOverlayRef = undefined;
    }
    // Cerramos el marco principal
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
  }
}
