/**
 * Node3D — Base 3D node with transform hierarchy
 *
 * Wraps a THREE.Object3D and synchronizes ThreeDot node transforms
 * with the Three.js scene graph. Provides position, rotation, scale,
 * and local/global transform access.
 */

import * as THREE from 'three';
import { Node, NodeOptions } from '../../core/node/Node';

export interface Node3DOptions extends NodeOptions {
  position?: THREE.Vector3 | { x: number; y: number; z: number };
  rotation?: THREE.Euler | { x: number; y: number; z: number };
  scale?: THREE.Vector3 | { x: number; y: number; z: number };
  visible?: boolean;
}

/**
 * Base class for all 3D nodes. Wraps a THREE.Object3D.
 */
export class Node3D extends Node {
  /** The underlying Three.js Object3D */
  object3D: THREE.Object3D;

  /** Reference to the Three.js scene this node renders into */
  private _threeScene: THREE.Scene | null = null;

  /** The Three.js Scene this node belongs to, if attached */
  get threeScene(): THREE.Scene | null {
    return this._threeScene;
  }

  /** Whether this node should be visible */
  private _visible = true;

  constructor(options?: Node3DOptions) {
    super(options);
    this.object3D = this._createObject3D();
    this.object3D.name = this.name;

    if (options?.position) {
      const p = options.position;
      this.object3D.position.set(
        'x' in p ? p.x : 0,
        'y' in p ? p.y : 0,
        'z' in p ? p.z : 0
      );
    }
    if (options?.rotation) {
      const r = options.rotation;
      if (r instanceof THREE.Euler) {
        this.object3D.rotation.copy(r);
      } else {
        this.object3D.rotation.set(r.x, r.y, r.z);
      }
    }
    if (options?.scale) {
      const s = options.scale;
      this.object3D.scale.set(
        'x' in s ? s.x : 1,
        'y' in s ? s.y : 1,
        'z' in s ? s.z : 1
      );
    }
    if (options?.visible !== undefined) {
      this._visible = options.visible;
      this.object3D.visible = options.visible;
    }
  }

  /**
   * Override in subclasses to create a specific Three.js object type.
   */
  protected _createObject3D(): THREE.Object3D {
    return new THREE.Object3D();
  }

  // ── Transform Accessors ──

  get position(): THREE.Vector3 {
    return this.object3D.position;
  }

  set position(p: THREE.Vector3 | { x: number; y: number; z: number }) {
    this.object3D.position.set(p.x, p.y, p.z);
  }

  get rotation(): THREE.Euler {
    return this.object3D.rotation;
  }

  set rotation(r: THREE.Euler | { x: number; y: number; z: number }) {
    this.object3D.rotation.set(r.x, r.y, r.z);
  }

  get quaternion(): THREE.Quaternion {
    return this.object3D.quaternion;
  }

  get scale(): THREE.Vector3 {
    return this.object3D.scale;
  }

  set scale(s: THREE.Vector3 | { x: number; y: number; z: number }) {
    this.object3D.scale.set(s.x, s.y, s.z);
  }

  /**
   * Get the global (world) position.
   */
  get globalPosition(): THREE.Vector3 {
    this.object3D.updateWorldMatrix(true, false);
    const pos = new THREE.Vector3();
    this.object3D.getWorldPosition(pos);
    return pos;
  }

  /**
   * Set the global position.
   */
  set globalPosition(worldPos: THREE.Vector3) {
    if (this.object3D.parent) {
      const inverseParent = new THREE.Matrix4();
      inverseParent.copy(this.object3D.parent.matrixWorld).invert();
      const localPos = worldPos.clone().applyMatrix4(inverseParent);
      this.object3D.position.copy(localPos);
    } else {
      this.object3D.position.copy(worldPos);
    }
  }

  /**
   * Get the global quaternion.
   */
  get globalRotation(): THREE.Quaternion {
    this.object3D.updateWorldMatrix(true, false);
    const quat = new THREE.Quaternion();
    this.object3D.getWorldQuaternion(quat);
    return quat;
  }

  /**
   * Get the global scale.
   */
  get globalScale(): THREE.Vector3 {
    const scale = new THREE.Vector3();
    this.object3D.getWorldScale(scale);
    return scale;
  }

  /**
   * Get the forward direction vector (negative Z in local space).
   */
  get forward(): THREE.Vector3 {
    const dir = new THREE.Vector3(0, 0, -1);
    dir.applyQuaternion(this.object3D.quaternion);
    return dir;
  }

  /**
   * Get the right direction vector (positive X).
   */
  get right(): THREE.Vector3 {
    const dir = new THREE.Vector3(1, 0, 0);
    dir.applyQuaternion(this.object3D.quaternion);
    return dir;
  }

  /**
   * Get the up direction vector (positive Y).
   */
  get up(): THREE.Vector3 {
    const dir = new THREE.Vector3(0, 1, 0);
    dir.applyQuaternion(this.object3D.quaternion);
    return dir;
  }

  /**
   * Make this node look at a target position.
   */
  lookAt(target: THREE.Vector3 | { x: number; y: number; z: number }): void {
    if (target instanceof THREE.Vector3) {
      this.object3D.lookAt(target);
    } else {
      this.object3D.lookAt(target.x, target.y, target.z);
    }
  }

  /**
   * Translate the node by an offset.
   */
  translate(x: number, y = 0, z = 0): void {
    this.object3D.position.x += x;
    this.object3D.position.y += y;
    this.object3D.position.z += z;
  }

  /**
   * Translate the node in local space.
   */
  translateLocal(offset: THREE.Vector3): void {
    this.object3D.translateX(offset.x);
    this.object3D.translateY(offset.y);
    this.object3D.translateZ(offset.z);
  }

  /**
   * Rotate around an axis by angle (radians).
   */
  rotateOnAxis(axis: THREE.Vector3, angle: number): void {
    this.object3D.rotateOnAxis(axis, angle);
  }

  /**
   * Rotate around local X axis by angle (radians).
   */
  rotateX(angle: number): void {
    this.object3D.rotateX(angle);
  }

  /**
   * Rotate around local Y axis by angle (radians).
   */
  rotateY(angle: number): void {
    this.object3D.rotateY(angle);
  }

  /**
   * Rotate around local Z axis by angle (radians).
   */
  rotateZ(angle: number): void {
    this.object3D.rotateZ(angle);
  }

  // ── Visibility ──

  get visible(): boolean {
    return this._visible;
  }

  set visible(v: boolean) {
    this._visible = v;
    this.object3D.visible = v;
  }

  // ── Lifecycle Hooks ──

  protected override _enterTree(): void {
    super._enterTree();
    // Attach to parent's Object3D or to the scene
    this._attachToThreeParent();
  }

  protected override _exitTree(): void {
    // Detach from Three.js parent
    this._detachFromThreeParent();
    super._exitTree();
  }

  protected override _destroy(): void {
    this._detachFromThreeParent();
    super._destroy();
  }

  /**
   * Attach this node's Object3D to the parent's Object3D or the Three.js scene.
   */
  private _attachToThreeParent(): void {
    const parentNode3D = this._findParentNode3D();
    if (parentNode3D) {
      parentNode3D.object3D.add(this.object3D);
    } else {
      // Find the Three.js scene from the engine
      const engine = this._findEngine();
      if (engine) {
        this._threeScene = engine.threeScene;
        engine.threeScene.add(this.object3D);
      }
    }
  }

  /**
   * Remove this node's Object3D from its Three.js parent.
   */
  private _detachFromThreeParent(): void {
    if (this.object3D.parent) {
      this.object3D.parent.remove(this.object3D);
    }
    this._threeScene = null;
  }

  /**
   * Walk up the tree to find the nearest Node3D ancestor.
   */
  private _findParentNode3D(): Node3D | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Node3D) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Walk up to root and find the engine.
   */
  protected _findEngine(): import('../../core/engine/Engine').Engine | null {
    // The engine reference is stored as metadata on the root node
    const root = this.getRoot();
    return root.getMeta<import('../../core/engine/Engine').Engine>('__engine') ?? null;
  }

  /**
   * Override addChild to also handle Three.js Object3D parenting.
   */
  override addChild(child: Node): void {
    super.addChild(child);
    if (child instanceof Node3D && child.object3D.parent !== this.object3D) {
      this.object3D.add(child.object3D);
    }
  }

  override removeChild(child: Node): void {
    if (child instanceof Node3D && child.object3D.parent === this.object3D) {
      this.object3D.remove(child.object3D);
    }
    super.removeChild(child);
  }

  /**
   * Duplicate with 3D transform data.
   */
  override duplicate(): Node3D {
    const copy = new (this.constructor as new (options?: Node3DOptions) => Node3D)({
      name: this.name,
      processMode: this.processMode,
      processPriority: this.processPriority,
      position: this.object3D.position.clone(),
      rotation: this.object3D.rotation.clone(),
      scale: this.object3D.scale.clone(),
      visible: this._visible,
    });
    // Copy metadata
    for (const group of this.getGroups()) {
      copy.addToGroup(group);
    }
    return copy;
  }
}
