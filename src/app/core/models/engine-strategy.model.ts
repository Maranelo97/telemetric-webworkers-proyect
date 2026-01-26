import * as THREE from 'three';
export interface EngineMaterialStrategy {
  apply(model: THREE.Group): void;
}

export class BlueprintStrategy implements EngineMaterialStrategy {
  apply(model: THREE.Group): void {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const edges = new THREE.EdgesGeometry(child.geometry, 15);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
        );
        line.name = 'outline';
        child.material = new THREE.MeshBasicMaterial({
          color: 0x000000,
          transparent: true,
          opacity: 0.05,
        });
        child.add(line);
      }
    });
  }
}
