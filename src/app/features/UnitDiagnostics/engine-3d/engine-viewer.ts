import {
  Component,
  ElementRef,
  ViewChild,
  input,
  inject,
  OnDestroy,
  effect,
  signal,
} from '@angular/core';
import * as THREE from 'three';
import { ENGINE_PORT } from '../../../core/ports/output/engine.port';
import { SceneManager } from '../../../infrastructure/driven/ThreeJs/scene.manager';
import { EngineModelType } from '../../../shared/utils/genFleet';
import { PlatformAdapter } from '../../../infrastructure/driven/Platform/platform.adapter';

@Component({
  selector: 'app-engine-viewer',
  standalone: true,
  templateUrl: './engine-viewer.html',
  styleUrl: './engine-viewer.css',
})
export class EngineViewer implements OnDestroy {
  @ViewChild('rendererContainer', { static: true }) container!: ElementRef;

  private engine = inject(ENGINE_PORT);
  private platform = inject(PlatformAdapter);
  private sceneManager!: SceneManager;
  private currentModel?: THREE.Group;

  modelEngine = input.required<EngineModelType>();
  isCritical = input<boolean>(false);

  public isLoading = signal(true);
  public lastError = signal<{ code: string; desc: string } | null>(null);

  private intervalId: any;

  constructor() {
    effect(() => {
      const model = this.modelEngine();
      if (model && this.platform.isBrowser) {
        this.initViewer(model);
      }
    });
  }

  private async initViewer(modelName: EngineModelType) {
    this.sceneManager = new SceneManager(this.container.nativeElement);
    this.sceneManager.update();

    this.currentModel = await this.engine.loadModel(modelName);
    this.currentModel.name = 'currentEngine';
    this.sceneManager.scene.add(this.currentModel);
    
    this.isLoading.set(false);
    this.startLoop();
  }

  private startLoop() {
    if (this.intervalId) clearInterval(this.intervalId);

    this.intervalId = setInterval(() => {
      if (!this.currentModel) return;

      // Simulación lógica - Debería estar en un UseCase si crece
      const componentName = 'part_' + Math.floor(Math.random() * 5); 
      this.engine.highlightComponent(this.currentModel, componentName, 0xff0000);

      this.lastError.set({
        code: `ERR_${Math.random().toString(36).substring(7).toUpperCase()}`,
        desc: this.isCritical() ? 'Falla crítica detectada' : 'Aviso preventivo',
      });
    }, 4000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.sceneManager?.dispose();
  }
}
