/**
 * StaticBody2D — Static 2D physics body node
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import { Node2D, Node2DOptions } from './Node2D';
import { CollisionShape2D } from './CollisionShape2D';

export interface StaticBody2DOptions extends Node2DOptions {
  friction?: number;
  restitution?: number;
}

export class StaticBody2D extends Node2D {
  private _body: RAPIER2D.RigidBody | null = null;
  private _colliders: RAPIER2D.Collider[] = [];
  private _friction: number;
  private _restitution: number;

  constructor(options?: StaticBody2DOptions) {
    super(options);
    this._friction = options?.friction ?? 0.5;
    this._restitution = options?.restitution ?? 0.0;
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

    const bodyDesc = RAPIER2D.RigidBodyDesc.fixed()
      .setTranslation(pos.x, pos.y)
      .setRotation(rot);

    this._body = world.createRigidBody(bodyDesc);

    // Look for child CollisionShape2D nodes
    const shapes: CollisionShape2D[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape2D) {
        shapes.push(child);
      }
    }

    if (shapes.length === 0) {
      const desc = RAPIER2D.ColliderDesc.cuboid(0.5, 0.5)
        .setFriction(this._friction)
        .setRestitution(this._restitution);
      const col = world.createCollider(desc, this._body);
      this._colliders.push(col);
    } else {
      for (const s of shapes) {
        const desc = s.createColliderDesc()
          .setFriction(this._friction)
          .setRestitution(this._restitution);
        const col = world.createCollider(desc, this._body);
        this._colliders.push(col);
      }
    }
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
