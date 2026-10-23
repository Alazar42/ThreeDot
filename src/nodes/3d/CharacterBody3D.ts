/**
 * CharacterBody3D — Specialized 3D physics body for characters and kinematic controllers
 *
 * Implements Godot's move_and_slide() behavior using Rapier's KinematicCharacterController.
 */

import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';
import { CollisionShape3D } from './CollisionShape3D';

export interface CharacterBody3DOptions extends Node3DOptions {
  upDirection?: THREE.Vector3 | { x: number; y: number; z: number };
  floorStopOnSlope?: boolean;
  maxSlopeAngle?: number; // radians
  snapToFloor?: boolean;
  offset?: number;
}

export class CharacterBody3D extends Node3D {
  velocity: THREE.Vector3 = new THREE.Vector3();
  upDirection: THREE.Vector3 = new THREE.Vector3(0, 1, 0);
  floorStopOnSlope: boolean;
  maxSlopeAngle: number;
  snapToFloor: boolean;

  private _body: RAPIER.RigidBody | null = null;
  private _collider: RAPIER.Collider | null = null;
  private _controller: RAPIER.KinematicCharacterController | null = null;
  private _onFloor = false;
  private _onWall = false;
  private _onCeiling = false;
  private _floorNormal = new THREE.Vector3(0, 1, 0);
  private _offset: number;

  constructor(options?: CharacterBody3DOptions) {
    super(options);
    if (options?.upDirection) {
      this.upDirection.set(options.upDirection.x, options.upDirection.y, options.upDirection.z);
    }
    this.floorStopOnSlope = options?.floorStopOnSlope ?? true;
    this.maxSlopeAngle = options?.maxSlopeAngle ?? (Math.PI / 4); // 45 deg default
    this.snapToFloor = options?.snapToFloor ?? true;
    this._offset = options?.offset ?? 0.01;
  }

  get body(): RAPIER.RigidBody | null {
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

  getFloorNormal(): THREE.Vector3 {
    return this._floorNormal.clone();
  }

  protected override _enterTree(): void {
    super._enterTree();
    this._initPhysics();
  }

  private _findPhysicsServer(): import('../../physics/3d/PhysicsServer3D').PhysicsServer3D | null {
    const root = this.getRoot();
    const engine = root.getMeta<import('../../core/engine/Engine').Engine>('__engine');
    return engine?.physics3D ?? null;
  }

  private async _initPhysics(): Promise<void> {
    const physics = this._findPhysicsServer();
    if (!physics) return;

    if (!physics.isInitialized) {
      await physics.initialize();
    }

    const world = physics.world;
    if (!world || this._body) return;

    const worldPos = this.globalPosition;
    const worldRot = this.globalRotation;

    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(worldPos.x, worldPos.y, worldPos.z)
      .setRotation({ x: worldRot.x, y: worldRot.y, z: worldRot.z, w: worldRot.w });

    this._body = world.createRigidBody(bodyDesc);

    // Look for child CollisionShape3D
    let shape: CollisionShape3D | null = null;
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape3D) {
        shape = child;
        break;
      }
    }

    if (shape) {
      this._collider = world.createCollider(shape.createColliderDesc(), this._body);
    } else {
      // Default capsule collider (height 1.8m, radius 0.4m)
      const desc = RAPIER.ColliderDesc.capsule(0.5, 0.4);
      this._collider = world.createCollider(desc, this._body);
    }

    // Create character controller
    this._controller = world.createCharacterController(this._offset);
    this._controller.setUp(new RAPIER.Vector3(this.upDirection.x, this.upDirection.y, this.upDirection.z));
    this._controller.setMaxSlopeClimbAngle(this.maxSlopeAngle);
    this._controller.setMinSlopeSlideAngle(this.maxSlopeAngle);
    this._controller.enableAutostep(0.3, 0.2, true);
    this._controller.enableSnapToGround(this.snapToFloor ? 0.3 : 0.0);
  }

  /**
   * Moves the body along its velocity vector and handles collisions.
   * Updates position, isOnFloor, isOnWall, isOnCeiling.
   */
  moveAndSlide(delta?: number): void {
    if (!this._body || !this._collider || !this._controller) {
      // If physics not yet initialized or unavailable, integrate locally
      const dt = delta ?? (1 / 60);
      this.position.x += this.velocity.x * dt;
      this.position.y += this.velocity.y * dt;
      this.position.z += this.velocity.z * dt;
      return;
    }

    const dt = delta ?? (1 / 60);
    const movement = new RAPIER.Vector3(
      this.velocity.x * dt,
      this.velocity.y * dt,
      this.velocity.z * dt
    );

    this._controller.computeColliderMovement(this._collider, movement);
    const corrected = this._controller.computedMovement();

    const currentPos = this._body.translation();
    const nextPos = new RAPIER.Vector3(
      currentPos.x + corrected.x,
      currentPos.y + corrected.y,
      currentPos.z + corrected.z
    );

    this._body.setNextKinematicTranslation(nextPos);

    this._onFloor = this._controller.computedGrounded();

    // Check collisions for wall / ceiling normals
    this._onWall = false;
    this._onCeiling = false;
    const numCollisions = this._controller.numComputedCollisions();
    for (let i = 0; i < numCollisions; i++) {
      const col = this._controller.computedCollision(i);
      if (col && col.normal2) {
        const n = col.normal2;
        const dot = n.x * this.upDirection.x + n.y * this.upDirection.y + n.z * this.upDirection.z;
        if (dot < -0.5) {
          this._onCeiling = true;
        } else if (Math.abs(dot) <= 0.5) {
          this._onWall = true;
        } else if (dot > 0.5) {
          this._floorNormal.set(n.x, n.y, n.z);
        }
      }
    }

    // Sync to Three.js Object3D
    this.globalPosition = new THREE.Vector3(nextPos.x, nextPos.y, nextPos.z);
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
