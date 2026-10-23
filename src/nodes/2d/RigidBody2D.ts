/**
 * RigidBody2D — Dynamic/Kinematic 2D physics body
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';
import { CollisionShape2D } from './CollisionShape2D';

export type RigidBody2DMode = 'dynamic' | 'kinematicPositionBased' | 'kinematicVelocityBased';

export interface RigidBody2DOptions extends Node2DOptions {
  mode?: RigidBody2DMode;
  mass?: number;
  friction?: number;
  restitution?: number;
  linearDamping?: number;
  angularDamping?: number;
  gravityScale?: number;
  lockRotation?: boolean;
}

export class RigidBody2D extends Node2D {
  private _body: RAPIER2D.RigidBody | null = null;
  private _colliders: RAPIER2D.Collider[] = [];
  private _mode: RigidBody2DMode;
  private _mass: number;
  private _friction: number;
  private _restitution: number;
  private _linearDamping: number;
  private _angularDamping: number;
  private _gravityScale: number;
  private _lockRotation: boolean;

  constructor(options?: RigidBody2DOptions) {
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

  get body(): RAPIER2D.RigidBody | null {
    return this._body;
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

    let bodyDesc: RAPIER2D.RigidBodyDesc;
    if (this._mode === 'dynamic') {
      bodyDesc = RAPIER2D.RigidBodyDesc.dynamic();
    } else if (this._mode === 'kinematicPositionBased') {
      bodyDesc = RAPIER2D.RigidBodyDesc.kinematicPositionBased();
    } else {
      bodyDesc = RAPIER2D.RigidBodyDesc.kinematicVelocityBased();
    }

    bodyDesc
      .setTranslation(pos.x, pos.y)
      .setRotation(rot)
      .setLinearDamping(this._linearDamping)
      .setAngularDamping(this._angularDamping)
      .setGravityScale(this._gravityScale);

    if (this._lockRotation) {
      bodyDesc.lockRotations();
    }

    this._body = world.createRigidBody(bodyDesc);

    const shapes: CollisionShape2D[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape2D) {
        shapes.push(child);
      }
    }

    if (shapes.length === 0) {
      const desc = RAPIER2D.ColliderDesc.cuboid(0.5, 0.5)
        .setFriction(this._friction)
        .setRestitution(this._restitution)
        .setDensity(this._mass);
      const col = world.createCollider(desc, this._body);
      this._colliders.push(col);
    } else {
      for (const s of shapes) {
        const desc = s.createColliderDesc()
          .setFriction(this._friction)
          .setRestitution(this._restitution)
          .setDensity(this._mass / shapes.length);
        const col = world.createCollider(desc, this._body);
        this._colliders.push(col);
      }
    }
  }

  protected override _physicsProcess(_delta: number): void {
    super._physicsProcess(_delta);
    if (!this._body) return;

    const t = this._body.translation();
    const r = this._body.rotation();

    this.globalPosition = new THREE.Vector2(t.x, t.y);
    this.rotation = r;
  }

  applyCentralImpulse(impulse: THREE.Vector2 | { x: number; y: number }): void {
    if (this._body) {
      this._body.applyImpulse(new RAPIER2D.Vector2(impulse.x, impulse.y), true);
    }
  }

  applyTorqueImpulse(torque: number): void {
    if (this._body) {
      this._body.applyTorqueImpulse(torque, true);
    }
  }

  setLinearVelocity(velocity: THREE.Vector2 | { x: number; y: number }): void {
    if (this._body) {
      this._body.setLinvel(new RAPIER2D.Vector2(velocity.x, velocity.y), true);
    }
  }

  getLinearVelocity(): THREE.Vector2 {
    if (this._body) {
      const v = this._body.linvel();
      return new THREE.Vector2(v.x, v.y);
    }
    return new THREE.Vector2();
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
