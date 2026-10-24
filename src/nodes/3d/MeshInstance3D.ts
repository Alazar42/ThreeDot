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
  shape?: PrimitiveShape;
  shapeArgs?: number[];
  material?: THREE.Material | THREE.Material[] | MaterialProperties;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * A 3D node that renders a mesh.
 */
export class MeshInstance3D extends Node3D {
  private _mesh: THREE.Mesh;

  constructor(nameOrOptions?: string | MeshInstance3DOptions, options?: MeshInstance3DOptions) {
    const opts: MeshInstance3DOptions | undefined =
      typeof nameOrOptions === 'string'
        ? { ...(options ?? {}), name: nameOrOptions }
        : nameOrOptions;
    super(opts);
    this._mesh = this.object3D as THREE.Mesh;

    const shapeType = (typeof opts?.geometry === 'string' ? opts.geometry : opts?.shape)?.toLowerCase();
    const args = opts?.shapeArgs ?? [];

    if (shapeType) {
      switch (shapeType) {
        case 'box':
        case 'cube':
          this._mesh.geometry = new THREE.BoxGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
          break;
        case 'sphere':
          this._mesh.geometry = new THREE.SphereGeometry(args[0] ?? 1, args[1] ?? 32, args[2] ?? 32);
          break;
        case 'plane':
          this._mesh.geometry = new THREE.PlaneGeometry(args[0] ?? 1, args[1] ?? 1);
          break;
        case 'cylinder':
          this._mesh.geometry = new THREE.CylinderGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 2, args[3] ?? 32);
          break;
        case 'cone':
          this._mesh.geometry = new THREE.ConeGeometry(args[0] ?? 1, args[1] ?? 2, args[2] ?? 32);
          break;
        case 'capsule':
          this._mesh.geometry = new THREE.CapsuleGeometry(args[0] ?? 0.5, args[1] ?? 1, args[2] ?? 16, args[3] ?? 32);
          break;
        case 'torus':
          this._mesh.geometry = new THREE.TorusGeometry(args[0] ?? 1, args[1] ?? 0.4, args[2] ?? 16, args[3] ?? 100);
          break;
        default:
          this._mesh.geometry = new THREE.BoxGeometry(args[0] ?? 1, args[1] ?? 1, args[2] ?? 1);
          break;
      }
    } else if (opts?.geometry instanceof THREE.BufferGeometry) {
      this._mesh.geometry = opts.geometry;
    } else {
      // Default fallback box geometry so mesh is never empty or invisible
      this._mesh.geometry = new THREE.BoxGeometry(1, 1, 1);
    }

    if (opts?.material) {
      if (opts.material instanceof THREE.Material || Array.isArray(opts.material)) {
        this._mesh.material = opts.material;
      } else {
        this._mesh.material = new THREE.MeshStandardMaterial(opts.material);
      }
    } else {
      this._mesh.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
    }
    if (opts?.castShadow !== undefined) {
      this._mesh.castShadow = opts.castShadow;
    }
    if (opts?.receiveShadow !== undefined) {
      this._mesh.receiveShadow = opts.receiveShadow;
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
