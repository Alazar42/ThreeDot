/**
 * RigidBody3D — Dynamic/Kinematic 3D physics body
 */

import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';
import { CollisionShape3D } from './CollisionShape3D';

export type RigidBody3DMode = 'dynamic' | 'kinematicPositionBased' | 'kinematicVelocityBased';

export interface RigidBody3DOptions extends Node3DOptions {
  mode?: RigidBody3DMode;
  mass?: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
  lockRotation?: boolean;
}

export class RigidBody3D extends Node3D {
  private _body: RAPIER.RigidBody | null = null;
  private _colliders: RAPIER.Collider[] = [];
  private _mode: RigidBody3DMode;
  private _mass: number;
  private _friction: number;
  private _restitution: number;
  private _linearDamping: number;
  private _angularDamping: number;
  private _gravityScale: number;
  private _lockRotation: boolean;

  constructor(options?: RigidBody3DOptions) {
    super(options);
    this._mode = options?.mode ?? 'dynamic';
    this._mass = options?.mass ?? 1.0;
    this._friction = options?.friction ?? 0.5;
    this._restitution = options?.restitution ?? 0.0;
    this._linearDamping = options?.linearDamping ?? 0.0;
    this._angularDamping = options?.angularDamping ?? 0.0;
    this._gravityScale = options?.gravityScale ?? 1.0;
    this._lockRotation = options?.lockRotation ?? false;
  }

  get body(): RAPIER.RigidBody | null {
    return this._body;
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

    let bodyDesc: RAPIER.RigidBodyDesc;
    if (this._mode === 'dynamic') {
      bodyDesc = RAPIER.RigidBodyDesc.dynamic();
    } else if (this._mode === 'kinematicPositionBased') {
      bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased();
    } else {
      bodyDesc = RAPIER.RigidBodyDesc.kinematicVelocityBased();
    }

    bodyDesc
      .setTranslation(worldPos.x, worldPos.y, worldPos.z)
      .setRotation({ x: worldRot.x, y: worldRot.y, z: worldRot.z, w: worldRot.w })
      .setLinearDamping(this._linearDamping)
      .setAngularDamping(this._angularDamping)
      .setGravityScale(this._gravityScale);

    if (this._lockRotation) {
      bodyDesc.lockRotations();
    }

    this._body = world.createRigidBody(bodyDesc);

    // Create colliders
    this._createColliders(world);
  }

  private _createColliders(world: RAPIER.World): void {
    if (!this._body) return;

    const collisionShapes: CollisionShape3D[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape3D) {
        collisionShapes.push(child);
      }
    }

    if (collisionShapes.length === 0) {
      const desc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
        .setFriction(this._friction)
        .setRestitution(this._restitution)
        .setDensity(this._mass);
      const col = world.createCollider(desc, this._body);
      this._colliders.push(col);
    } else {
      for (const shape of collisionShapes) {
        const desc = shape.createColliderDesc()
          .setFriction(this._friction)
          .setRestitution(this._restitution)
          .setDensity(this._mass / collisionShapes.length);
        const col = world.createCollider(desc, this._body);
        this._colliders.push(col);
      }
    }
  }

  // ── Physics Processing — Sync Rapier Transform to Three.js ──

  protected override _physicsProcess(_delta: number): void {
    super._physicsProcess(_delta);
    if (!this._body) return;

    const translation = this._body.translation();
    const rotation = this._body.rotation();

    this.globalPosition = new THREE.Vector3(translation.x, translation.y, translation.z);
    this.object3D.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
  }

  // ── Forces and Velocities ──

  applyCentralImpulse(impulse: THREE.Vector3 | { x: number; y: number; z: number }): void {
    if (this._body) {
      this._body.applyImpulse(new RAPIER.Vector3(impulse.x, impulse.y, impulse.z), true);
    }
  }

  applyTorqueImpulse(torque: THREE.Vector3 | { x: number; y: number; z: number }): void {
    if (this._body) {
      this._body.applyTorqueImpulse(new RAPIER.Vector3(torque.x, torque.y, torque.z), true);
    }
  }

  setLinearVelocity(velocity: THREE.Vector3 | { x: number; y: number; z: number }): void {
    if (this._body) {
      this._body.setLinvel(new RAPIER.Vector3(velocity.x, velocity.y, velocity.z), true);
    }
  }

  getLinearVelocity(): THREE.Vector3 {
    if (this._body) {
      const v = this._body.linvel();
      return new THREE.Vector3(v.x, v.y, v.z);
    }
    return new THREE.Vector3();
  }

  setAngularVelocity(velocity: THREE.Vector3 | { x: number; y: number; z: number }): void {
    if (this._body) {
      this._body.setAngvel(new RAPIER.Vector3(velocity.x, velocity.y, velocity.z), true);
    }
  }

  getAngularVelocity(): THREE.Vector3 {
    if (this._body) {
      const v = this._body.angvel();
      return new THREE.Vector3(v.x, v.y, v.z);
    }
    return new THREE.Vector3();
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
    if (physics?.world && this._body) {
      physics.world.removeRigidBody(this._body);
      this._body = null;
      this._colliders = [];
    }
  }
}
