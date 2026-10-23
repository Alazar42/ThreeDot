/**
 * CollisionShape3D — Defines a 3D collision shape for physics bodies and areas
 */

import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export type Shape3DType = 'box' | 'sphere' | 'cylinder' | 'capsule';

export interface BoxShapeConfig {
  type: 'box';
  size: THREE.Vector3 | { x: number; y: number; z: number };
}

export interface SphereShapeConfig {
  type: 'sphere';
  radius: number;
}

export interface CylinderShapeConfig {
  type: 'cylinder';
  halfHeight: number;
  radius: number;
}

export interface CapsuleShapeConfig {
  type: 'capsule';
  halfHeight: number;
  radius: number;
}

export type Shape3DConfig = BoxShapeConfig | SphereShapeConfig | CylinderShapeConfig | CapsuleShapeConfig;

export interface CollisionShape3DOptions extends Node3DOptions {
  shape?: Shape3DConfig;
  debug?: boolean;
}

export class CollisionShape3D extends Node3D {
  private _shapeConfig: Shape3DConfig;
  private _debugMesh: THREE.LineSegments | null = null;
  private _debug = false;

  constructor(options?: CollisionShape3DOptions) {
    super(options);
    this._shapeConfig = options?.shape ?? {
      type: 'box',
      size: new THREE.Vector3(1, 1, 1),
    };
    this._debug = options?.debug ?? false;
  }

  get shapeConfig(): Shape3DConfig {
    return this._shapeConfig;
  }

  set shapeConfig(config: Shape3DConfig) {
    this._shapeConfig = config;
    if (this._debug) {
      this._updateDebugMesh();
    }
  }

  get debug(): boolean {
    return this._debug;
  }

  set debug(value: boolean) {
    this._debug = value;
    if (value) {
      this._updateDebugMesh();
    } else if (this._debugMesh) {
      this.object3D.remove(this._debugMesh);
      this._debugMesh.geometry.dispose();
      (this._debugMesh.material as THREE.Material).dispose();
      this._debugMesh = null;
    }
  }

  createColliderDesc(): RAPIER.ColliderDesc {
    let desc: RAPIER.ColliderDesc;

    switch (this._shapeConfig.type) {
      case 'box': {
        const s = this._shapeConfig.size;
        desc = RAPIER.ColliderDesc.cuboid(s.x / 2, s.y / 2, s.z / 2);
        break;
      }
      case 'sphere':
        desc = RAPIER.ColliderDesc.ball(this._shapeConfig.radius);
        break;
      case 'cylinder':
        desc = RAPIER.ColliderDesc.cylinder(this._shapeConfig.halfHeight, this._shapeConfig.radius);
        break;
      case 'capsule':
        desc = RAPIER.ColliderDesc.capsule(this._shapeConfig.halfHeight, this._shapeConfig.radius);
        break;
      default:
        desc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5);
    }

    // Set local translation/rotation relative to body
    desc.setTranslation(this.position.x, this.position.y, this.position.z);
    desc.setRotation({
      x: this.quaternion.x,
      y: this.quaternion.y,
      z: this.quaternion.z,
      w: this.quaternion.w,
    });

    return desc;
  }

  private _updateDebugMesh(): void {
    if (this._debugMesh) {
      this.object3D.remove(this._debugMesh);
      this._debugMesh.geometry.dispose();
      (this._debugMesh.material as THREE.Material).dispose();
      this._debugMesh = null;
    }

    let geom: THREE.BufferGeometry;
    const mat = new THREE.LineBasicMaterial({ color: 0x00ff88 });

    switch (this._shapeConfig.type) {
      case 'box': {
        const s = this._shapeConfig.size;
        geom = new THREE.WireframeGeometry(new THREE.BoxGeometry(s.x, s.y, s.z));
        break;
      }
      case 'sphere':
        geom = new THREE.WireframeGeometry(new THREE.SphereGeometry(this._shapeConfig.radius, 12, 12));
        break;
      case 'cylinder':
        geom = new THREE.WireframeGeometry(
          new THREE.CylinderGeometry(
            this._shapeConfig.radius,
            this._shapeConfig.radius,
            this._shapeConfig.halfHeight * 2,
            12
          )
        );
        break;
      case 'capsule':
        geom = new THREE.WireframeGeometry(
          new THREE.CapsuleGeometry(this._shapeConfig.radius, this._shapeConfig.halfHeight * 2, 4, 8)
        );
        break;
      default:
        geom = new THREE.WireframeGeometry(new THREE.BoxGeometry(1, 1, 1));
    }

    this._debugMesh = new THREE.LineSegments(geom, mat);
    this.object3D.add(this._debugMesh);
  }

  protected override _destroy(): void {
    if (this._debugMesh) {
      this._debugMesh.geometry.dispose();
      (this._debugMesh.material as THREE.Material).dispose();
      this._debugMesh = null;
    }
    super._destroy();
  }
}
