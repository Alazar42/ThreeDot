/**
 * MeshInstance3D — Renders a mesh with geometry and material
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export type PrimitiveShape =
  | 'box'
  | 'cube'
  | 'sphere'
  | 'plane'
  | 'cylinder'
  | 'cone'
  | 'capsule'
  | 'torus';

export interface MaterialProperties {
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  wireframe?: boolean;
  transparent?: boolean;
  opacity?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
}

export interface MeshInstance3DOptions extends Node3DOptions {
  geometry?: THREE.BufferGeometry | PrimitiveShape;
  material?: THREE.Material | THREE.Material[] | MaterialProperties;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * A 3D node that renders a mesh.
 */
export class MeshInstance3D extends Node3D {
  private _mesh: THREE.Mesh;

  constructor(options?: MeshInstance3DOptions) {
    super(options);
    this._mesh = this.object3D as THREE.Mesh;

    if (typeof options?.geometry === 'string') {
      switch (options.geometry.toLowerCase()) {
        case 'box':
        case 'cube':
          this._mesh.geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
        case 'sphere':
          this._mesh.geometry = new THREE.SphereGeometry(1, 32, 32);
          break;
        case 'plane':
          this._mesh.geometry = new THREE.PlaneGeometry(1, 1);
          break;
        case 'cylinder':
          this._mesh.geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
          break;
        case 'cone':
          this._mesh.geometry = new THREE.ConeGeometry(1, 2, 32);
          break;
        case 'capsule':
          this._mesh.geometry = new THREE.CapsuleGeometry(0.5, 1, 16, 32);
          break;
        case 'torus':
          this._mesh.geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
          break;
        default:
          this._mesh.geometry = new THREE.BoxGeometry(1, 1, 1);
          break;
      }
    } else if (options?.geometry) {
      this._mesh.geometry = options.geometry;
    }

    if (options?.material) {
      if (options.material instanceof THREE.Material || Array.isArray(options.material)) {
        this._mesh.material = options.material;
      } else {
        this._mesh.material = new THREE.MeshStandardMaterial(options.material);
      }
    }
    if (options?.castShadow !== undefined) {
      this._mesh.castShadow = options.castShadow;
    }
    if (options?.receiveShadow !== undefined) {
      this._mesh.receiveShadow = options.receiveShadow;
    }
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.Mesh();
  }

  get mesh(): THREE.Mesh {
    return this._mesh;
  }

  get geometry(): THREE.BufferGeometry {
    return this._mesh.geometry;
  }

  set geometry(geom: THREE.BufferGeometry) {
    this._mesh.geometry = geom;
  }

  get material(): THREE.Material | THREE.Material[] {
    return this._mesh.material;
  }

  set material(mat: THREE.Material | THREE.Material[]) {
    this._mesh.material = mat;
  }

  get castShadow(): boolean {
    return this._mesh.castShadow;
  }

  set castShadow(v: boolean) {
    this._mesh.castShadow = v;
  }

  get receiveShadow(): boolean {
    return this._mesh.receiveShadow;
  }

  set receiveShadow(v: boolean) {
    this._mesh.receiveShadow = v;
  }

  protected override _destroy(): void {
    // Geometry and materials are managed by ResourceManager, not auto-disposed here
    super._destroy();
  }
}
