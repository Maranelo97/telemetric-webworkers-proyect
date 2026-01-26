import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { EngineMaterialStrategy } from '../../../core/models/engine-strategy.model';
export class ModelLoaderManager {
  private cache = new Map<string, THREE.Group>();
  private loader = new GLTFLoader();

  async load(modelName: string, strategy: EngineMaterialStrategy): Promise<THREE.Group> {
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName)!.clone();
    }

    return new Promise((resolve) => {
      this.loader.load(`assets/enginesModels/${modelName}.glb`, (gltf) => {
        const model = gltf.scene;
        this.normalizeScale(model);
        strategy.apply(model); // Aplicamos la estrategia elegida
        this.cache.set(modelName, model.clone());
        resolve(model);
      });
    });
  }

  private normalizeScale(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z);
    model.scale.set(scale, scale, scale);
  }
}
