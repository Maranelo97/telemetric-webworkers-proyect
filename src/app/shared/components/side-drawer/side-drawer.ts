import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  output,
  signal,
} from '@angular/core';
import { PortalModule, Portal } from '@angular/cdk/portal';

@Component({
  selector: 'app-side-drawer',
  imports: [PortalModule],
  templateUrl: './side-drawer.html',
  styleUrl: './side-drawer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideDrawer {
  isOpen = signal(false);
  title = signal('PANEL');
  contentPortal = signal<Portal<any> | null>(null); // Signal para el contenido dinámico
  close = new EventEmitter<void>();

  onClose() {
    this.isOpen.set(false);
    setTimeout(() => this.close.emit(), 300);
  }
}
