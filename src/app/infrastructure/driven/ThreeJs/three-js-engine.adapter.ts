// src/app/infrastructure/driven/threejs/threejs-engine.adapter.ts
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EnginePort } from '../../../core/ports/output/engine.port';

@Injectable({ providedIn: 'root' })
export class ThreeJsEngineAdapter implements EnginePort {
  private cache = new Map<string, THREE.Group>();
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;

  constructor() {
    // 1. Instanciar
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();

    // 2. Configurar Draco (Asegúrate de que la carpeta exista en assets)
this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    
    // 3. Vincular
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  async loadModel(modelName: string): Promise<THREE.Group> {
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        `assets/enginesModels/${modelName}.glb`,
        (gltf) => {
          const model = gltf.scene;
          
          // Opcional: Normalizar escala aquí si no lo haces en el componente
          this.normalizeScale(model);

          this.cache.set(modelName, model.clone());
          resolve(model);
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            console.log(`📦 ${modelName}: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
          }
        },
        (error) => {
          console.error(`❌ Error en ThreeJsEngineAdapter para ${modelName}:`, error);
          reject(error);
        }
      );
    });
  }

    private normalizeScale(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z);
    model.scale.set(scale, scale, scale);
  }

  resetModelVisuals(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color.setHex(0x000000);
        (child.material as THREE.MeshBasicMaterial).opacity = 0.05;
      }
      if (child instanceof THREE.LineSegments) {
        (child.material as THREE.LineBasicMaterial).color.setHex(0xffffff);
        (child.material as THREE.LineBasicMaterial).opacity = 0.8;
      }
    });
  }

  highlightComponent(model: THREE.Group, componentName: string, color: number): void {
    this.resetModelVisuals(model);
    const target = model.getObjectByName(componentName);
    if (target instanceof THREE.Mesh) {
      (target.material as THREE.MeshBasicMaterial).color.setHex(color);
      (target.material as THREE.MeshBasicMaterial).opacity = 0.6;
    }
  }
}