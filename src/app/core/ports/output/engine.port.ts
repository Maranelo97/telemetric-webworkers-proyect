import { InjectionToken } from '@angular/core';
import * as THREE from 'three';

export interface EnginePort {
  loadModel(modelName: string): Promise<THREE.Group>;
  highlightComponent(model: THREE.Group, componentName: string, color: number): void;
  resetModelVisuals(model: THREE.Group): void;
}

export const ENGINE_PORT = new InjectionToken<EnginePort>('EnginePort');