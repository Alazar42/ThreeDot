/**
 * CharacterBody2D — Specialized 2D physics body for characters and platformers
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';
import { CollisionShape2D } from './CollisionShape2D';

export interface CharacterBody2DOptions extends Node2DOptions {
  upDirection?: THREE.Vector2 | { x: number; y: number };
  floorStopOnSlope?: boolean;
  maxSlopeAngle?: number;
}

export class CharacterBody2D extends Node2D {
  velocity: THREE.Vector2 = new THREE.Vector2();
  upDirection: THREE.Vector2 = new THREE.Vector2(0, 1);
  floorStopOnSlope: boolean;
  maxSlopeAngle: number;

  private _body: RAPIER2D.RigidBody | null = null;
  private _collider: RAPIER2D.Collider | null = null;
  private _controller: RAPIER2D.KinematicCharacterController | null = null;
  private _onFloor = false;
  private _onWall = false;
  private _onCeiling = false;

  constructor(options?: CharacterBody2DOptions) {
    super(options);
    if (options?.upDirection) {
      this.upDirection.set(options.upDirection.x, options.upDirection.y);
    }
    this.floorStopOnSlope = options?.floorStopOnSlope ?? true;
    this.maxSlopeAngle = options?.maxSlopeAngle ?? (Math.PI / 4);
  }

  get body(): RAPIER2D.RigidBody | null {
    return this._body;
  }

  isOnFloor(): boolean {
    return this._onFloor;
  }

  isOnWall(): boolean {
    return this._onWall;
  }

  isOnCeiling(): boolean {
    return this._onCeiling;
  }

  protected override _enterTree(): void {
    super._enterTree();
    this._initPhysics();
  }

  private _findPhysicsServer(): import('../../physics/2d/PhysicsServer2D').PhysicsServer2D | null {
    const root = this.getRoot();
    const engine = root.getMeta<import('../../core/engine/Engine').Engine>('__engine');
    return engine?.physics2D ?? null;
  }

  private async _initPhysics(): Promise<void> {
    const physics = this._findPhysicsServer();
    if (!physics) return;

    if (!physics.isInitialized) {
      await physics.initialize();
    }

    const world = physics.world;
    if (!world || this._body) return;

    const pos = this.globalPosition;
    const rot = this.globalRotation;

    const bodyDesc = RAPIER2D.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(pos.x, pos.y)
      .setRotation(rot);

    this._body = world.createRigidBody(bodyDesc);

    let shape: CollisionShape2D | null = null;
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape2D) {
        shape = child;
        break;
      }
    }

    if (shape) {
      this._collider = world.createCollider(shape.createColliderDesc(), this._body);
    } else {
      const desc = RAPIER2D.ColliderDesc.cuboid(0.4, 0.8);
      this._collider = world.createCollider(desc, this._body);
    }

    this._controller = world.createCharacterController(0.01);
    this._controller.setUp(new RAPIER2D.Vector2(this.upDirection.x, this.upDirection.y));
    this._controller.setMaxSlopeClimbAngle(this.maxSlopeAngle);
    this._controller.setMinSlopeSlideAngle(this.maxSlopeAngle);
    this._controller.enableAutostep(0.3, 0.2, true);
    this._controller.enableSnapToGround(0.3);
  }

  moveAndSlide(delta?: number): void {
    const dt = delta ?? (1 / 60);

    if (!this._body || !this._collider || !this._controller) {
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      return;
    }

    const movement = new RAPIER2D.Vector2(this.velocity.x * dt, this.velocity.y * dt);
    this._controller.computeColliderMovement(this._collider, movement);
    const corrected = this._controller.computedMovement();

    const cur = this._body.translation();
    const next = new RAPIER2D.Vector2(cur.x + corrected.x, cur.y + corrected.y);

    this._body.setNextKinematicTranslation(next);
    this._onFloor = this._controller.computedGrounded();

    this.globalPosition = new THREE.Vector2(next.x, next.y);
  }

  protected override _exitTree(): void {
    this._destroyPhysics();
    super._exitTree();
  }

  protected override _destroy(): void {
    this._destroyPhysics();
    super._destroy();
  }

  private _destroyPhysics(): void {
    const physics = this._findPhysicsServer();
    if (physics?.world) {
      if (this._controller) {
        physics.world.removeCharacterController(this._controller);
        this._controller = null;
      }
      if (this._body) {
        physics.world.removeRigidBody(this._body);
        this._body = null;
        this._collider = null;
      }
    }
  }
}
