/**
 * RayCast3D — Raycasting node for 3D collision detection and picking
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export interface RayCast3DOptions extends Node3DOptions {
  /** Direction of the ray in local space (default: forward, 0,0,-1) */
  direction?: THREE.Vector3;
  /** Maximum ray distance (default: 100) */
  maxDistance?: number;
  /** Whether the ray is enabled */
  enabled?: boolean;
  /** Collision mask (bitmask) */
  collisionMask?: number;
}

export interface RayCastResult {
  colliding: boolean;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  distance: number;
  collider: THREE.Object3D | null;
}

/**
 * A node that casts a ray and reports intersections with Three.js objects.
 */
export class RayCast3D extends Node3D {
  private _raycaster: THREE.Raycaster;
  private _direction: THREE.Vector3;
  private _maxDistance: number;
  private _enabled: boolean;
  private _collisionMask: number;
  private _lastResult: RayCastResult;

  constructor(options?: RayCast3DOptions) {
    super(options);
    this._direction = options?.direction?.clone() ?? new THREE.Vector3(0, 0, -1);
    this._maxDistance = options?.maxDistance ?? 100;
    this._enabled = options?.enabled ?? true;
    this._collisionMask = options?.collisionMask ?? 0xffffffff;
    this._raycaster = new THREE.Raycaster();
    this._raycaster.far = this._maxDistance;

    this._lastResult = {
      colliding: false,
      point: new THREE.Vector3(),
      normal: new THREE.Vector3(),
      distance: Infinity,
      collider: null,
    };
  }

  get direction(): THREE.Vector3 { return this._direction; }
  set direction(dir: THREE.Vector3) { this._direction.copy(dir); }

  get maxDistance(): number { return this._maxDistance; }
  set maxDistance(d: number) {
    this._maxDistance = d;
    this._raycaster.far = d;
  }

  get enabled(): boolean { return this._enabled; }
  set enabled(v: boolean) { this._enabled = v; }

  get isColliding(): boolean { return this._lastResult.colliding; }
  get collisionPoint(): THREE.Vector3 { return this._lastResult.point; }
  get collisionNormal(): THREE.Vector3 { return this._lastResult.normal; }
  get collisionDistance(): number { return this._lastResult.distance; }
  get collider(): THREE.Object3D | null { return this._lastResult.collider; }

  /**
   * Force update the raycast.
   */
  forceUpdate(): RayCastResult {
    if (!this._enabled || !this.isInsideTree) {
      this._lastResult.colliding = false;
      return this._lastResult;
    }

    // Get world position and direction
    const origin = this.globalPosition;
    const worldDir = this._direction.clone().applyQuaternion(this.globalRotation).normalize();

    this._raycaster.set(origin, worldDir);

    // Get all scene objects to test against
    const engine = this.getRoot().getMeta<import('../../core/engine/Engine').Engine>('__engine');
    if (!engine) {
      this._lastResult.colliding = false;
      return this._lastResult;
    }

    const intersects = this._raycaster.intersectObjects(
      engine.threeScene.children,
      true
    );

    // Filter by collision mask (using Object3D.layers)
    const filtered = intersects.filter(
      (hit) => (hit.object.layers.mask & this._collisionMask) !== 0
    );

    if (filtered.length > 0) {
      const hit = filtered[0];
      this._lastResult.colliding = true;
      this._lastResult.point.copy(hit.point);
      if (hit.face) {
        this._lastResult.normal.copy(hit.face.normal);
      }
      this._lastResult.distance = hit.distance;
      this._lastResult.collider = hit.object;
    } else {
      this._lastResult.colliding = false;
      this._lastResult.point.set(0, 0, 0);
      this._lastResult.normal.set(0, 0, 0);
      this._lastResult.distance = Infinity;
      this._lastResult.collider = null;
    }

    return this._lastResult;
  }

  protected override _process(_delta: number): void {
    if (this._enabled) {
      this.forceUpdate();
    }
  }
}
