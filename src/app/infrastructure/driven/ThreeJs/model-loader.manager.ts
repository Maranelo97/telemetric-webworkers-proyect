import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import { EngineMaterialStrategy } from '../../../core/models/engine-strategy.model';

export class ModelLoaderManager {
  private cache = new Map<string, THREE.Group>();
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;

  constructor() {
    // 1. Inicializamos las instancias (sin declararlas doblemente arriba)
    this.loader = new GLTFLoader();
    this.dracoLoader = new DRACOLoader();

    // 2. Configuramos la ruta del decodificador
    // IMPORTANTE: Asegúrate de que esta ruta sea exacta en tus assets
    this.dracoLoader.setDecoderPath('assets/draco/gltf/');

    // 3. Vinculamos Draco al loader de GLTF
    this.loader.setDRACOLoader(this.dracoLoader);
  }

  async load(modelName: string, strategy: EngineMaterialStrategy): Promise<THREE.Group> {
    // 1. Verificar Cache
    if (this.cache.has(modelName)) {
      const cachedModel = this.cache.get(modelName)!.clone();
      strategy.apply(cachedModel); // Aplicamos estrategia aunque venga de cache
      return cachedModel;
    }

    return new Promise((resolve, reject) => {
      // 2. Cargamos usando el loader principal (GLTF)
      this.loader.load(
        `assets/enginesModels/${modelName}.glb`, 
        (gltf) => {
          const model = gltf.scene;
          this.normalizeScale(model);
          
          // Guardamos una copia limpia en cache antes de aplicar la estrategia
          this.cache.set(modelName, model.clone());
          
          // Aplicamos la estrategia de materiales
          strategy.apply(model); 
          
          resolve(model);
        },
        (xhr) => {
          if (xhr.lengthComputable) {
            const percent = (xhr.loaded / xhr.total) * 100;
            console.log(`📦 Cargando ${modelName}: ${Math.round(percent)}%`);
          }
        },
        (error) => {
          console.error(`❌ Error cargando ${modelName}:`, error);
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
    
    const center = box.getCenter(new THREE.Vector3());
    model.position.x -= center.x * scale;
    model.position.y -= center.y * scale;
    model.position.z -= center.z * scale;
  }
}