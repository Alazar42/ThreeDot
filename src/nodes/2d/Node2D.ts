/**
 * Node2D — Base 2D node with 2D transform hierarchy and z-ordering
 *
 * Positioned in the XY plane, with zIndex mapped to Z-depth and renderOrder.
 */

import * as THREE from 'three';
import { Node, NodeOptions } from '../../core/node/Node';

export interface Node2DOptions extends NodeOptions {
  position?: THREE.Vector2 | { x: number; y: number };
  rotation?: number; // radians
  scale?: THREE.Vector2 | { x: number; y: number };
  zIndex?: number;
  visible?: boolean;
}

export class Node2D extends Node {
  readonly object3D: THREE.Object3D;
  private _zIndex = 0;
  private _visible = true;

  constructor(options?: Node2DOptions) {
    super(options);
    this.object3D = this._createObject3D();
    this.object3D.name = this.name;

    if (options?.position) {
      this.position = new THREE.Vector2(options.position.x, options.position.y);
    }
    if (options?.rotation !== undefined) {
      this.rotation = options.rotation;
    }
    if (options?.scale) {
      this.scale = new THREE.Vector2(options.scale.x, options.scale.y);
    }
    if (options?.zIndex !== undefined) {
      this.zIndex = options.zIndex;
    }
    if (options?.visible !== undefined) {
      this.visible = options.visible;
    }
  }

  protected _createObject3D(): THREE.Object3D {
    return new THREE.Object3D();
  }

  // ── 2D Transform Accessors ──

  get position(): THREE.Vector2 {
    return new THREE.Vector2(this.object3D.position.x, this.object3D.position.y);
  }

  set position(pos: THREE.Vector2 | { x: number; y: number }) {
    this.object3D.position.x = pos.x;
    this.object3D.position.y = pos.y;
  }

  get rotation(): number {
    return this.object3D.rotation.z;
  }

  set rotation(rad: number) {
    this.object3D.rotation.z = rad;
  }

  get scale(): THREE.Vector2 {
    return new THREE.Vector2(this.object3D.scale.x, this.object3D.scale.y);
  }

  set scale(s: THREE.Vector2 | { x: number; y: number }) {
    this.object3D.scale.x = s.x;
    this.object3D.scale.y = s.y;
  }

  get zIndex(): number {
    return this._zIndex;
  }

  set zIndex(value: number) {
    this._zIndex = value;
    this.object3D.position.z = value * 0.001;
    this.object3D.renderOrder = value;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(v: boolean) {
    this._visible = v;
    this.object3D.visible = v;
  }

  get globalPosition(): THREE.Vector2 {
    this.object3D.updateWorldMatrix(true, false);
    const worldPos = new THREE.Vector3();
    this.object3D.getWorldPosition(worldPos);
    return new THREE.Vector2(worldPos.x, worldPos.y);
  }

  set globalPosition(worldPos: THREE.Vector2 | { x: number; y: number }) {
    if (this.object3D.parent) {
      const invParent = new THREE.Matrix4().copy(this.object3D.parent.matrixWorld).invert();
      const local = new THREE.Vector3(worldPos.x, worldPos.y, this.object3D.position.z).applyMatrix4(invParent);
      this.object3D.position.x = local.x;
      this.object3D.position.y = local.y;
    } else {
      this.object3D.position.x = worldPos.x;
      this.object3D.position.y = worldPos.y;
    }
  }

  get globalRotation(): number {
    this.object3D.updateWorldMatrix(true, false);
    const euler = new THREE.Euler();
    const quat = new THREE.Quaternion();
    this.object3D.getWorldQuaternion(quat);
    euler.setFromQuaternion(quat);
    return euler.z;
  }

  lookAt(target: THREE.Vector2 | { x: number; y: number }): void {
    const angle = Math.atan2(target.y - this.position.y, target.x - this.position.x);
    this.rotation = angle;
  }

  // ── Lifecycle & Three.js Hierarchy ──

  override addChild(child: import('../../core/node/Node').Node): void {
    super.addChild(child);
    if (child instanceof Node2D && child.object3D.parent !== this.object3D) {
      this.object3D.add(child.object3D);
    }
  }

  override removeChild(child: import('../../core/node/Node').Node): void {
    if (child instanceof Node2D && child.object3D.parent === this.object3D) {
      this.object3D.remove(child.object3D);
    }
    super.removeChild(child);
  }

  protected override _enterTree(): void {
    super._enterTree();
    this._attachToThreeParent();
  }

  protected override _exitTree(): void {
    this._detachFromThreeParent();
    super._exitTree();
  }

  protected override _destroy(): void {
    this._detachFromThreeParent();
    super._destroy();
  }

  private _attachToThreeParent(): void {
    const parentNode2D = this._findParentNode2D();
    if (parentNode2D) {
      parentNode2D.object3D.add(this.object3D);
    } else {
      const engine = this._findEngine();
      if (engine) {
        engine.threeScene.add(this.object3D);
      }
    }
  }

  private _detachFromThreeParent(): void {
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
  }

  private _findParentNode2D(): Node2D | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Node2D) return current;
      current = current.parent;
    }
    return null;
  }

  protected _findEngine(): import('../../core/engine/Engine').Engine | null {
    const root = this.getRoot();
    return root.getMeta<import('../../core/engine/Engine').Engine>('__engine') ?? null;
  }
}
