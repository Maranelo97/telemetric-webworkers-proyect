// infrastructure/driven/threejs/scene.manager.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public controls: OrbitControls;
  private frameId: number | null = null;

  constructor(container: HTMLElement) {
    // 1. Escena
    this.scene = new THREE.Scene();

    // 2. Renderizador
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.offsetWidth, container.offsetHeight || 500);
    container.appendChild(this.renderer.domElement);

    // 3. Cámara
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.offsetWidth / (container.offsetHeight || 500),
      0.1,
      1000,
    );
    this.camera.position.set(1.2, 1.6, 5);

    // 4. Controles
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;
  }

  // Método para actualizar en cada frame
  public update(onUpdate?: () => void): void {
    const animate = () => {
      this.frameId = requestAnimationFrame(animate);
      this.controls.update();
      if (onUpdate) onUpdate();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  // Manejo de redimensionamiento (clave para una UI responsiva)
  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scene.clear();
  }
}
