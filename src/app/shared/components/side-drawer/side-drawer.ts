import { ChangeDetectionStrategy, Component, EventEmitter, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-side-drawer',
  imports: [],
  templateUrl: './side-drawer.html',
  styleUrl: './side-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideDrawer {
  isOpen = signal(false); // Cambiado a signal para control directo del servicio
  title = signal('DIAGNOSTIC_PANEL');
  close = new EventEmitter<void>(); // Usamos EventEmitter tradicional para el Portal

  onClose() {
    this.isOpen.set(false);
    setTimeout(() => this.close.emit(), 300); // Esperamos a la animación
  }
}
