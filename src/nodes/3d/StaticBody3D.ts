/**
 * StaticBody3D — Static physics body node for immovable collision geometry
 */

import RAPIER from '@dimforge/rapier3d-compat';
import { Node3D, Node3DOptions } from './Node3D';
import { CollisionShape3D } from './CollisionShape3D';

export interface StaticBody3DOptions extends Node3DOptions {
  friction?: number;
  restitution?: number;
}

export class StaticBody3D extends Node3D {
  private _body: RAPIER.RigidBody | null = null;
  private _colliders: RAPIER.Collider[] = [];
  private _friction: number;
  private _restitution: number;

  constructor(options?: StaticBody3DOptions) {
    super(options);
    this._friction = options?.friction ?? 0.5;
    this._restitution = options?.restitution ?? 0.0;
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

    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(worldPos.x, worldPos.y, worldPos.z)
      .setRotation({ x: worldRot.x, y: worldRot.y, z: worldRot.z, w: worldRot.w });

    this._body = world.createRigidBody(bodyDesc);

    // Look for child CollisionShape3D nodes
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
      // Default box collider of size (1, 1, 1)
      const desc = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5)
        .setFriction(this._friction)
        .setRestitution(this._restitution);
      const col = world.createCollider(desc, this._body);
      this._colliders.push(col);
    } else {
      for (const shape of collisionShapes) {
        const desc = shape.createColliderDesc()
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
