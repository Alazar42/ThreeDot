/**
 * RayCast2D — 2D raycasting node for 2D collision detection and picking
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface RayCast2DOptions extends Node2DOptions {
  targetPosition?: THREE.Vector2 | { x: number; y: number };
  enabled?: boolean;
}

export class RayCast2D extends Node2D {
  targetPosition: THREE.Vector2 = new THREE.Vector2(0, -50);
  enabled = true;

  private _isColliding = false;
  private _collisionPoint: THREE.Vector2 | null = null;
  private _collisionNormal: THREE.Vector2 | null = null;

  constructor(options?: RayCast2DOptions) {
    super(options);
    if (options?.targetPosition) {
      this.targetPosition.set(options.targetPosition.x, options.targetPosition.y);
    }
    this.enabled = options?.enabled ?? true;
  }

  isColliding(): boolean {
    return this._isColliding;
  }

  getCollisionPoint(): THREE.Vector2 | null {
    return this._collisionPoint ? this._collisionPoint.clone() : null;
  }

  getCollisionNormal(): THREE.Vector2 | null {
    return this._collisionNormal ? this._collisionNormal.clone() : null;
  }

  protected override _physicsProcess(_delta: number): void {
    super._physicsProcess(_delta);
    if (!this.enabled) return;

    this.forceRaycastUpdate();
  }

  forceRaycastUpdate(): void {
    const root = this.getRoot();
    const engine = root.getMeta<import('../../core/engine/Engine').Engine>('__engine');
    const world = engine?.physics2D?.world;

    if (!world) {
      this._isColliding = false;
      this._collisionPoint = null;
      this._collisionNormal = null;
      return;
    }

    const origin = this.globalPosition;
    const dir = this.targetPosition;
    const length = dir.length();
    if (length <= 0) {
      this._isColliding = false;
      return;
    }

    const ray = new RAPIER2D.Ray(
      new RAPIER2D.Vector2(origin.x, origin.y),
      new RAPIER2D.Vector2(dir.x / length, dir.y / length)
    );

    const hit = world.castRayAndGetNormal(ray, length, true);
    if (hit) {
      this._isColliding = true;
      const hitPoint = ray.pointAt(hit.timeOfImpact);
      this._collisionPoint = new THREE.Vector2(hitPoint.x, hitPoint.y);
      this._collisionNormal = new THREE.Vector2(hit.normal.x, hit.normal.y);
    } else {
      this._isColliding = false;
      this._collisionPoint = null;
      this._collisionNormal = null;
    }
  }
}
