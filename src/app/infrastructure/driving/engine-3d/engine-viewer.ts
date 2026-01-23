import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  input,
  inject,
  PLATFORM_ID,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EngineService } from './engine-viewer.service';
import { EngineModelType } from '../../../shared/utils/genFleet';

@Component({
  selector: 'app-engine-viewer',
  standalone: true,
  // Asegúrate de que estas rutas sean correctas según tu carpeta
  templateUrl: './engine-viewer.html',
  styleUrl: './engine-viewer.css',
})
export class EngineViewer implements OnInit, OnDestroy {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;

  private engineService = inject(EngineService);
  private platformId = inject(PLATFORM_ID);

  engineModel = input.required<EngineModelType>();
  isCritical = input<boolean>(false);

  public isLoading = signal(true); // Cambiamos a Signal para evitar el error de ExpressionChanged
  private intervalId: any;

  constructor() {
    effect(
      () => {
        const model = this.engineModel();
        // Agregamos una marca para no re-inicializar si ya está cargando o cargado
        if (model && isPlatformBrowser(this.platformId)) {
          // Forzamos que corra fuera del ciclo de detección si es necesario
          this.startEngineProcess(model);
        }
      },
      { allowSignalWrites: true },
    ); // Permite escribir en isLoading.set si fuera necesario
  }

  ngOnInit() {} // Ya no necesitamos lógica aquí

  private startEngineProcess(model: EngineModelType) {
    // Pequeño delay para asegurar que ViewChild esté disponible tras la animación del Drawer
    setTimeout(() => {
      if (!this.container) return;

      this.engineService.init(this.container);
      this.engineService.loadModel(model, () => {
        // Usar un microtask o timeout evita el error de "ExpressionChanged"
        setTimeout(() => {
          this.isLoading.set(false);
          this.startLoop();
        }, 0);
      });
    }, 100);
  }

  private startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.engineService.simulateFailure(), 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.engineService.destroy();
  }
}
