import { Injectable, ElementRef, inject } from '@angular/core';
import * as THREE from 'three';
import { EngineModelType } from '../../../shared/utils/genFleet';
import { BlueprintStrategy } from '../../../core/models/engine-strategy.model';
import { ModelLoaderManager } from '../../../infrastructure/driven/ThreeJs/model-loader.manager';
import { SceneManager } from '../../../infrastructure/driven/ThreeJs/scene.manager';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private sceneManager!: SceneManager;
  private modelLoader = new ModelLoaderManager();
  private strategy = new BlueprintStrategy();

  init(container: ElementRef): void {
    // Toda la infraestructura se inicializa en una línea
    this.sceneManager = new SceneManager(container.nativeElement);

    // El bucle de animación ahora es responsabilidad del manager
    this.sceneManager.update();
  }

  async loadEngine(modelName: EngineModelType, onLoad: () => void) {
    const model = await this.modelLoader.load(modelName, this.strategy);

    // El SceneManager nos da acceso limpio a la escena
    const oldModel = this.sceneManager.scene.getObjectByName('currentEngine');
    if (oldModel) this.sceneManager.scene.remove(oldModel);

    model.name = 'currentEngine';
    this.sceneManager.scene.add(model);
    onLoad();
  }

  simulateFailure() {
    if (!this.sceneManager) return;

    const model = this.sceneManager.scene.getObjectByName('currentEngine');
    if (!model) return;

    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);

        // Resetear visuales al estado base (Blueprint)
        (child.material as THREE.MeshBasicMaterial).color.setHex(0x000000);
        (child.material as THREE.MeshBasicMaterial).opacity = 0.05;

        child.children.forEach((c) => {
          if (c instanceof THREE.LineSegments) {
            (c.material as THREE.LineBasicMaterial).color.setHex(0xffffff);
            (c.material as THREE.LineBasicMaterial).opacity = 0.8;
          }
        });
      }
    });

    // Seleccionar una pieza aleatoria y marcarla en rojo
    if (meshes.length > 0) {
      const target = meshes[Math.floor(Math.random() * meshes.length)];

      (target.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
      (target.material as THREE.MeshBasicMaterial).opacity = 0.6;

      target.children.forEach((c) => {
        if (c instanceof THREE.LineSegments) {
          (c.material as THREE.LineBasicMaterial).color.setHex(0xff0000);
          (c.material as THREE.LineBasicMaterial).opacity = 1.0;
        }
      });

      console.log(`🔧 Simulación de fallo en componente: ${target.name}`);
    }
  }

  destroy() {
    this.sceneManager?.dispose();
  }
}
