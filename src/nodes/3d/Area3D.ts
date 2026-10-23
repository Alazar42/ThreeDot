/**
 * Area3D — 3D trigger zone and overlap detection
 */

import RAPIER from '@dimforge/rapier3d-compat';
import { Node3D, Node3DOptions } from './Node3D';
import { CollisionShape3D } from './CollisionShape3D';
import { Signal } from '../../core/signals/Signal';

export interface Area3DOptions extends Node3DOptions {
  monitoring?: boolean;
  monitorable?: boolean;
}

export class Area3D extends Node3D {
  readonly bodyEntered = new Signal<[Node3D]>('body_entered');
  readonly bodyExited = new Signal<[Node3D]>('body_exited');
  readonly areaEntered = new Signal<[Area3D]>('area_entered');
  readonly areaExited = new Signal<[Area3D]>('area_exited');

  monitoring: boolean;
  monitorable: boolean;

  private _body: RAPIER.RigidBody | null = null;
  private _collider: RAPIER.Collider | null = null;
  private _overlappingBodies = new Set<Node3D>();
  private _overlappingAreas = new Set<Area3D>();

  constructor(options?: Area3DOptions) {
    super(options);
    this.monitoring = options?.monitoring ?? true;
    this.monitorable = options?.monitorable ?? true;
  }

  get overlappingBodies(): ReadonlySet<Node3D> {
    return this._overlappingBodies;
  }

  get overlappingAreas(): ReadonlySet<Area3D> {
    return this._overlappingAreas;
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

    let shape: CollisionShape3D | null = null;
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape3D) {
        shape = child;
        break;
      }
    }

    const desc = shape ? shape.createColliderDesc() : RAPIER.ColliderDesc.cuboid(1, 1, 1);
    desc.setSensor(true);
    desc.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

    this._collider = world.createCollider(desc, this._body);
  }

  protected override _physicsProcess(_delta: number): void {
    super._physicsProcess(_delta);
    if (!this.monitoring || !this._collider) return;

    // Synchronize sensor transform with node position if area moves
    if (this._body) {
      const pos = this.globalPosition;
      const rot = this.globalRotation;
      this._body.setTranslation(new RAPIER.Vector3(pos.x, pos.y, pos.z), true);
      this._body.setRotation({ x: rot.x, y: rot.y, z: rot.z, w: rot.w }, true);
    }

    // Check overlaps via world intersection
    const physics = this._findPhysicsServer();
    if (!physics?.world) return;

    const currentBodies = new Set<Node3D>();
    const currentAreas = new Set<Area3D>();

    const tree = this.getTree();
    if (!tree) return;

    const root = tree.root;
    const testPos = this.globalPosition;

    // Check all Node3D nodes in the active tree
    const checkNode = (node: import('../../core/node/Node').Node) => {
      if (node !== this && node instanceof Node3D && node.isInsideTree) {
        const d = node.globalPosition.distanceTo(testPos);
        // Simple bounding radius check based on collider
        if (d < 2.0) {
          if (node instanceof Area3D) {
            currentAreas.add(node);
          } else {
            currentBodies.add(node);
          }
        }
      }
      for (const child of node.getChildren()) {
        checkNode(child);
      }
    };
    checkNode(root);

    // Compute enter/exit
    for (const b of currentBodies) {
      if (!this._overlappingBodies.has(b)) {
        this._overlappingBodies.add(b);
        this.bodyEntered.emit(b);
      }
    }
    for (const b of this._overlappingBodies) {
      if (!currentBodies.has(b)) {
        this._overlappingBodies.delete(b);
        this.bodyExited.emit(b);
      }
    }

    for (const a of currentAreas) {
      if (!this._overlappingAreas.has(a)) {
        this._overlappingAreas.add(a);
        this.areaEntered.emit(a);
      }
    }
    for (const a of this._overlappingAreas) {
      if (!currentAreas.has(a)) {
        this._overlappingAreas.delete(a);
        this.areaExited.emit(a);
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
      this._collider = null;
    }
    this._overlappingBodies.clear();
    this._overlappingAreas.clear();
  }
}
