/**
 * CollisionShape2D — 2D collision shape definition for 2D bodies and areas
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface CircleShape2DConfig {
  type: 'circle';
  radius: number;
}

export interface RectangleShape2DConfig {
  type: 'rectangle';
  size: THREE.Vector2 | { x: number; y: number };
}

export interface CapsuleShape2DConfig {
  type: 'capsule';
  halfHeight: number;
  radius: number;
}

export type Shape2DConfig = CircleShape2DConfig | RectangleShape2DConfig | CapsuleShape2DConfig;

export interface CollisionShape2DOptions extends Node2DOptions {
  shape?: Shape2DConfig;
  debug?: boolean;
}

export class CollisionShape2D extends Node2D {
  private _shapeConfig: Shape2DConfig;
  private _debugLine: THREE.LineLoop | null = null;
  private _debug = false;

  constructor(options?: CollisionShape2DOptions) {
    super(options);
    this._shapeConfig = options?.shape ?? {
      type: 'rectangle',
      size: new THREE.Vector2(1, 1),
    };
    this._debug = options?.debug ?? false;
  }

  get shapeConfig(): Shape2DConfig {
    return this._shapeConfig;
  }

  set shapeConfig(config: Shape2DConfig) {
    this._shapeConfig = config;
    if (this._debug) {
      this._updateDebugLine();
    }
  }

  get debug(): boolean {
    return this._debug;
  }

  set debug(value: boolean) {
    this._debug = value;
    if (value) {
      this._updateDebugLine();
    } else if (this._debugLine) {
      this.object3D.remove(this._debugLine);
      this._debugLine.geometry.dispose();
      (this._debugLine.material as THREE.Material).dispose();
      this._debugLine = null;
    }
  }

  createColliderDesc(): RAPIER2D.ColliderDesc {
    let desc: RAPIER2D.ColliderDesc;

    switch (this._shapeConfig.type) {
      case 'circle':
        desc = RAPIER2D.ColliderDesc.ball(this._shapeConfig.radius);
        break;
      case 'rectangle': {
        const s = this._shapeConfig.size;
        desc = RAPIER2D.ColliderDesc.cuboid(s.x / 2, s.y / 2);
        break;
      }
      case 'capsule':
        desc = RAPIER2D.ColliderDesc.capsule(this._shapeConfig.halfHeight, this._shapeConfig.radius);
        break;
      default:
        desc = RAPIER2D.ColliderDesc.cuboid(0.5, 0.5);
    }

    desc.setTranslation(this.position.x, this.position.y);
    desc.setRotation(this.rotation);

    return desc;
  }

  private _updateDebugLine(): void {
    if (this._debugLine) {
      this.object3D.remove(this._debugLine);
      this._debugLine.geometry.dispose();
      (this._debugLine.material as THREE.Material).dispose();
      this._debugLine = null;
    }

    const points: THREE.Vector3[] = [];
    const mat = new THREE.LineBasicMaterial({ color: 0x00ff88 });

    if (this._shapeConfig.type === 'rectangle') {
      const w = this._shapeConfig.size.x / 2;
      const h = this._shapeConfig.size.y / 2;
      points.push(new THREE.Vector3(-w, -h, 0));
      points.push(new THREE.Vector3(w, -h, 0));
      points.push(new THREE.Vector3(w, h, 0));
      points.push(new THREE.Vector3(-w, h, 0));
    } else if (this._shapeConfig.type === 'circle') {
      const segs = 24;
      for (let i = 0; i < segs; i++) {
        const theta = (i / segs) * Math.PI * 2;
        points.push(
          new THREE.Vector3(
            Math.cos(theta) * this._shapeConfig.radius,
            Math.sin(theta) * this._shapeConfig.radius,
            0
          )
        );
      }
    } else {
      const r = this._shapeConfig.radius;
      const hh = this._shapeConfig.halfHeight;
      points.push(new THREE.Vector3(-r, -hh, 0));
      points.push(new THREE.Vector3(r, -hh, 0));
      points.push(new THREE.Vector3(r, hh, 0));
      points.push(new THREE.Vector3(-r, hh, 0));
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    this._debugLine = new THREE.LineLoop(geom, mat);
    this.object3D.add(this._debugLine);
  }

  protected override _destroy(): void {
    if (this._debugLine) {
      this._debugLine.geometry.dispose();
      (this._debugLine.material as THREE.Material).dispose();
      this._debugLine = null;
    }
    super._destroy();
  }
}
