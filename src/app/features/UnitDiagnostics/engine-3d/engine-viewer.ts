import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  input,
  inject,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import { EngineService } from './engine-viewer.service';
import { EngineModelType } from '../../../shared/utils/genFleet';
import { PlatformAdapter } from '../../../infrastructure/driven/Platform/platform.adapter';

@Component({
  selector: 'app-engine-viewer',
  standalone: true,
  templateUrl: './engine-viewer.html',
  styleUrl: './engine-viewer.css',
})
export class EngineViewer implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;

  private engineService = inject(EngineService);
  private platform = inject(PlatformAdapter);

  // Inputs reactivos
  modelEngine = input.required<EngineModelType>();
  isCritical = input<boolean>(false);

  // Estado de la UI
  public isLoading = signal(true);
  public lastError = signal<{ code: string; desc: string } | null>(null);

  private intervalId: any;

  constructor() {
    // El efecto reacciona automáticamente si el modelEngine cambia
    // sin necesidad de lógica extra en el ngOnInit
    effect(() => {
      const model = this.modelEngine();
      if (model && this.platform.isBrowser) {
        this.startEngineProcess(model);
      }
    });
  }

  ngOnInit() {}

  private async startEngineProcess(model: EngineModelType) {
    // Esperamos un frame para asegurar que el contenedor DOM esté listo
    setTimeout(async () => {
      if (!this.container?.nativeElement) return;

      // 1. Inicializamos la infraestructura (SceneManager interno)
      this.engineService.init(this.container);

      // 2. Cargamos el modelo usando la nueva lógica con caché y estrategia
      await this.engineService.loadEngine(model, () => {
        // 3. Finalizamos carga y arrancamos telemetría
        this.isLoading.set(false);
        this.startLoop();
      });
    }, 100);
  }

  private startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      // Ejecuta la representación visual de la falla en el 3D
      this.engineService.simulateFailure();

      // Actualiza el panel de diagnóstico (Placeholder dinámico)
      this.lastError.set({
        code: `ERR_${Math.random().toString(36).substring(7).toUpperCase()}`,
        desc: this.isCritical()
          ? 'Falla crítica detectada: Temperatura fuera de rango operativo.'
          : 'Aviso preventivo: Vibración inusual en el bloque del motor.',
      });
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    // Limpia memoria de Three.js y detiene el render loop
    this.engineService.destroy();
  }
}
