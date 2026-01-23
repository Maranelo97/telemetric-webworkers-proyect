import { Injectable, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { isPlatformBrowser } from '@angular/common';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EngineModelType } from '../../../shared/utils/genFleet';

@Injectable({ providedIn: 'root' })
export class EngineService {
  private platformId = inject(PLATFORM_ID);
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private frameId: number | null = null;

  init(container: ElementRef): void {
    // CRUCIAL: Detener la ejecución si es el servidor
    if (!isPlatformBrowser(this.platformId)) return;

    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.nativeElement.offsetWidth, 500);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.nativeElement.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      45,
      container.nativeElement.offsetWidth / 500,
      0.1,
      1000,
    );
    this.camera.position.set(0, 3.5, 6);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.autoRotate = true;

    this.animate();
  }

  loadModel(modelName: EngineModelType, onLoad: () => void): void {
    const manager = new THREE.LoadingManager();
    manager.onLoad = onLoad;

    const loader = new GLTFLoader(manager);
    loader.load(`assets/enginesModels/${modelName}.glb`, (gltf) => {
      const model = gltf.scene;
      model.name = 'currentEngine';

      // Aplicamos escala y materiales base
      this.setupModel(model);
      this.scene.add(model);
    });
  }

  private setupModel(model: THREE.Group) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z);
    model.scale.set(scale, scale, scale);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        this.applyBlueprintMaterial(child);
      }
    });
  }

  private applyBlueprintMaterial(mesh: THREE.Mesh) {
    const edges = new THREE.EdgesGeometry(mesh.geometry, 15);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    );
    line.name = 'outline';
    mesh.material = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.05,
    });
    mesh.add(line);
  }

  simulateFailure() {
    if (!this.scene) return;
    const model = this.scene.getObjectByName('currentEngine');
    if (!model) return;

    const meshes: THREE.Mesh[] = [];
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
        // Resetear estado anterior
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

    if (meshes.length > 0) {
      const target = meshes[Math.floor(Math.random() * meshes.length)];
      console.log(`⚠️ FALLA EN: ${target.name}`);

      (target.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
      (target.material as THREE.MeshBasicMaterial).opacity = 0.6;

      target.children.forEach((c) => {
        if (c instanceof THREE.LineSegments) {
          (c.material as THREE.LineBasicMaterial).color.setHex(0xff0000);
          (c.material as THREE.LineBasicMaterial).opacity = 1.0;
        }
      });
    }
  }

  private animate = () => {
    this.frameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  destroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.renderer?.dispose();
  }
}
