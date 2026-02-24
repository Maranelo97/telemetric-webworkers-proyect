import { Injectable, inject } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { EnginePort } from '../../../core/ports/output/engine.port';

@Injectable({ providedIn: 'root' })
export class ThreeJsEngineAdapter implements EnginePort {
  private cache = new Map<string, THREE.Group>();
  private loader = new GLTFLoader();

  async loadModel(modelName: string): Promise<THREE.Group> {
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName)!.clone();
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        `assets/enginesModels/${modelName}.glb`,
        (gltf) => {
          const model = gltf.scene.clone();
          this.cache.set(modelName, model.clone());
          resolve(model);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }
}