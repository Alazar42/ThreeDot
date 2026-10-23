/**
 * Area2D — 2D trigger zone and overlap detection
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import { Node2D, Node2DOptions } from './Node2D';
import { CollisionShape2D } from './CollisionShape2D';
import { Signal } from '../../core/signals/Signal';

export interface Area2DOptions extends Node2DOptions {
  monitoring?: boolean;
  monitorable?: boolean;
}

export class Area2D extends Node2D {
  readonly bodyEntered = new Signal<[Node2D]>('body_entered');
  readonly bodyExited = new Signal<[Node2D]>('body_exited');
  readonly areaEntered = new Signal<[Area2D]>('area_entered');
  readonly areaExited = new Signal<[Area2D]>('area_exited');

  monitoring: boolean;
  monitorable: boolean;

  private _body: RAPIER2D.RigidBody | null = null;
  private _collider: RAPIER2D.Collider | null = null;
  private _overlappingBodies = new Set<Node2D>();
  private _overlappingAreas = new Set<Area2D>();

  constructor(options?: Area2DOptions) {
    super(options);
    this.monitoring = options?.monitoring ?? true;
    this.monitorable = options?.monitorable ?? true;
  }

  get overlappingBodies(): ReadonlySet<Node2D> {
    return this._overlappingBodies;
  }

  get overlappingAreas(): ReadonlySet<Area2D> {
    return this._overlappingAreas;
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

    let shape: CollisionShape2D | null = null;
    for (const child of this.getChildren()) {
      if (child instanceof CollisionShape2D) {
        shape = child;
        break;
      }
    }

    const desc = shape ? shape.createColliderDesc() : RAPIER2D.ColliderDesc.cuboid(1, 1);
    desc.setSensor(true);
    desc.setActiveEvents(RAPIER2D.ActiveEvents.COLLISION_EVENTS);

    this._collider = world.createCollider(desc, this._body);
  }

  protected override _physicsProcess(_delta: number): void {
    super._physicsProcess(_delta);
    if (!this.monitoring || !this._collider) return;

    if (this._body) {
      const pos = this.globalPosition;
      this._body.setTranslation(new RAPIER2D.Vector2(pos.x, pos.y), true);
      this._body.setRotation(this.globalRotation, true);
    }

    const tree = this.getTree();
    if (!tree) return;

    const currentBodies = new Set<Node2D>();
    const currentAreas = new Set<Area2D>();
    const testPos = this.globalPosition;

    const checkNode = (node: import('../../core/node/Node').Node) => {
      if (node !== this && node instanceof Node2D && node.isInsideTree) {
        const d = node.globalPosition.distanceTo(testPos);
        if (d < 1.5) {
          if (node instanceof Area2D) {
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
    checkNode(tree.root);

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
