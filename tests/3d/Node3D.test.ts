import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Node3D } from '../../src/nodes/3d/Node3D';
import { MeshInstance3D } from '../../src/nodes/3d/MeshInstance3D';
import { Camera3D } from '../../src/nodes/3d/Camera3D';
import { DirectionalLight3D, PointLight3D } from '../../src/nodes/3d/Light3D';

describe('3D Node System', () => {
  it('manages 3D local and global transforms', () => {
    const parent3D = new Node3D({
      name: 'Parent3D',
      position: { x: 10, y: 0, z: 0 },
    });

    const child3D = new Node3D({
      name: 'Child3D',
      position: { x: 5, y: 2, z: 0 },
    });

    parent3D.addChild(child3D);

    expect(parent3D.position.x).toBe(10);
    expect(child3D.position.x).toBe(5);

    // Global position accounts for hierarchy
    const globalPos = child3D.globalPosition;
    expect(globalPos.x).toBe(15);
    expect(globalPos.y).toBe(2);
    expect(globalPos.z).toBe(0);

    // Translate and rotate
    parent3D.translate(0, 10, 0);
    expect(parent3D.position.y).toBe(10);

    parent3D.scale = new THREE.Vector3(2, 2, 2);
    expect(parent3D.scale.x).toBe(2);
  });

  it('manages MeshInstance3D geometry and material', () => {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const meshNode = new MeshInstance3D({
      name: 'Cube',
      geometry: geom,
      material: mat,
    });

    expect(meshNode.mesh).toBeDefined();
    expect(meshNode.geometry).toBe(geom);
    expect(meshNode.material).toBe(mat);
    expect(meshNode.castShadow).toBe(false);

    meshNode.castShadow = true;
    expect(meshNode.castShadow).toBe(true);
    expect(meshNode.mesh.castShadow).toBe(true);
  });

  it('configures perspective and orthographic Camera3D', () => {
    const perspCamera = new Camera3D({
      name: 'MainCamera',
      fov: 60,
      near: 0.5,
      far: 500,
      orthographic: false,
    });

    expect(perspCamera.fov).toBe(60);
    expect(perspCamera.threeCamera).toBeInstanceOf(THREE.PerspectiveCamera);

    const orthoCamera = new Camera3D({
      name: 'OrthoCamera',
      orthographic: true,
      orthographicSize: 20,
    });

    expect(orthoCamera.threeCamera).toBeInstanceOf(THREE.OrthographicCamera);
  });

  it('creates directional and point lights with proper parameters', () => {
    const dirLight = new DirectionalLight3D({
      name: 'Sun',
      color: 0xffffff,
      intensity: 2.5,
    });

    expect(dirLight.light.intensity).toBe(2.5);
    expect(dirLight.color.getHex()).toBe(0xffffff);

    const pointLight = new PointLight3D({
      name: 'Torch',
      color: 0xffaa00,
      intensity: 1.5,
      distance: 25,
      decay: 2,
    });

    expect(pointLight.light.distance).toBe(25);
    expect(pointLight.light.decay).toBe(2);
  });

  it('supports lookAt with coordinates, object literal, or Vector3', () => {
    const cam = new Camera3D('MainCam');
    cam.position.set(0, 5, 10);

    // 1. Triple numbers (x, y, z)
    expect(() => cam.lookAt(0, 0, 0)).not.toThrow();

    // 2. Object literal { x, y, z }
    expect(() => cam.lookAt({ x: 1, y: 2, z: 3 })).not.toThrow();

    // 3. Three.js Vector3
    expect(() => cam.lookAt(new THREE.Vector3(0, 0, 0))).not.toThrow();
  });

  it('supports string name arguments in 3D constructors', () => {
    const node = new Node3D('MyWorld');
    expect(node.name).toBe('MyWorld');

    const cam = new Camera3D('PlayerCamera');
    expect(cam.name).toBe('PlayerCamera');

    const mesh = new MeshInstance3D('HeroCube', { geometry: 'box' });
    expect(mesh.name).toBe('HeroCube');
    expect(mesh.geometry).toBeInstanceOf(THREE.BoxGeometry);

    const dirLight = new DirectionalLight3D('SunLight', 3.0);
    expect(dirLight.name).toBe('SunLight');
    expect(dirLight.intensity).toBe(3.0);
  });
});
