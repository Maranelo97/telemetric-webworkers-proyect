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
    this.camera.position.set(4, 3, 6);
    this.camera.lookAt(0, 0, 0);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Bajamos un poco la ambiental
    this.scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    this.scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5); // Luz de relleno
    light2.position.set(-5, 2, -5);
    this.scene.add(light2);
    this.scene.add(directionalLight);

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

  public fitCameraToModel(model: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = this.camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2));

  cameraZ *= 2.5; // Factor de zoom (más alto = más lejos)
  this.camera.position.set(center.x + cameraZ, center.y + cameraZ / 2, center.z + cameraZ);
  
  this.controls.target.set(center.x, center.y, center.z);
  this.controls.update();
}

  public dispose(): void {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer.dispose();
    this.scene.clear();
  }
}
