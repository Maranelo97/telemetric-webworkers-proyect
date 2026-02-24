import { InjectionToken } from '@angular/core';
import * as THREE from 'three';

export interface EnginePort {
  loadModel(modelName: string): Promise<THREE.Group>;
}

export const ENGINE_PORT = new InjectionToken<EnginePort>('EnginePort');