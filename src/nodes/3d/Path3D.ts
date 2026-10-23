/**
 * Path3D and PathFollow3D — 3D path following
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export interface Path3DOptions extends Node3DOptions {
  /** Points defining the path */
  points?: THREE.Vector3[];
  /** Whether the path forms a closed loop */
  closed?: boolean;
  /** Curve tension (0-1, for CatmullRom) */
  tension?: number;
}

/**
 * Defines a 3D curve path that PathFollow3D nodes can traverse.
 */
export class Path3D extends Node3D {
  private _curve: THREE.CatmullRomCurve3;
  private _lineMesh: THREE.Line | null = null;

  constructor(options?: Path3DOptions) {
    super(options);
    const points = options?.points ?? [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 0, 0),
    ];
    this._curve = new THREE.CatmullRomCurve3(
      points,
      options?.closed ?? false,
      'catmullrom',
      options?.tension ?? 0.5
    );
  }

  get curve(): THREE.CatmullRomCurve3 {
    return this._curve;
  }

  get points(): THREE.Vector3[] {
    return this._curve.points;
  }

  set points(pts: THREE.Vector3[]) {
    this._curve.points = pts;
    this._updateVisualization();
  }

  get closed(): boolean {
    return this._curve.closed;
  }

  set closed(v: boolean) {
    this._curve.closed = v;
  }

  /**
   * Get a point on the path at parameter t (0-1).
   */
  getPoint(t: number): THREE.Vector3 {
    return this._curve.getPoint(t);
  }

  /**
   * Get the tangent direction at parameter t.
   */
  getTangent(t: number): THREE.Vector3 {
    return this._curve.getTangent(t);
  }

  /**
   * Get the total arc length of the path.
   */
  getLength(): number {
    return this._curve.getLength();
  }

  /**
   * Show/hide a debug visualization of the path.
   */
  setDebugVisible(visible: boolean): void {
    if (visible && !this._lineMesh) {
      this._updateVisualization();
    }
    if (this._lineMesh) {
      this._lineMesh.visible = visible;
    }
  }

  private _updateVisualization(): void {
    if (this._lineMesh) {
      this.object3D.remove(this._lineMesh);
      this._lineMesh.geometry.dispose();
      (this._lineMesh.material as THREE.Material).dispose();
    }

    const points = this._curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    this._lineMesh = new THREE.Line(geometry, material);
    this.object3D.add(this._lineMesh);
  }

  protected override _destroy(): void {
    if (this._lineMesh) {
      this._lineMesh.geometry.dispose();
      (this._lineMesh.material as THREE.Material).dispose();
    }
    super._destroy();
  }
}

export interface PathFollow3DOptions extends Node3DOptions {
  /** Progress along the path (0-1) */
  progress?: number;
  /** Movement speed (units per second) */
  speed?: number;
  /** Whether to loop when reaching the end */
  loop?: boolean;
  /** Whether to orient the node along the path tangent */
  rotateToFollow?: boolean;
}

/**
 * A node that follows a Path3D, updating its position each frame.
 */
export class PathFollow3D extends Node3D {
  private _progress = 0;
  private _speed: number;
  private _loop: boolean;
  private _rotateToFollow: boolean;

  constructor(options?: PathFollow3DOptions) {
    super(options);
    this._progress = options?.progress ?? 0;
    this._speed = options?.speed ?? 1;
    this._loop = options?.loop ?? true;
    this._rotateToFollow = options?.rotateToFollow ?? true;
  }

  get progress(): number { return this._progress; }
  set progress(v: number) { this._progress = Math.max(0, Math.min(1, v)); }

  get speed(): number { return this._speed; }
  set speed(v: number) { this._speed = v; }

  get loop(): boolean { return this._loop; }
  set loop(v: boolean) { this._loop = v; }

  get rotateToFollow(): boolean { return this._rotateToFollow; }
  set rotateToFollow(v: boolean) { this._rotateToFollow = v; }

  /**
   * Find the parent Path3D node.
   */
  getPathNode(): Path3D | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Path3D) return current;
      current = current.parent;
    }
    return null;
  }

  protected override _process(delta: number): void {
    const pathNode = this.getPathNode();
    if (!pathNode) return;

    const length = pathNode.getLength();
    if (length <= 0) return;

    // Advance progress
    this._progress += (this._speed * delta) / length;

    if (this._loop) {
      this._progress = this._progress % 1;
      if (this._progress < 0) this._progress += 1;
    } else {
      this._progress = Math.max(0, Math.min(1, this._progress));
    }

    // Update position
    const point = pathNode.getPoint(this._progress);
    this.position.copy(point);

    // Orient along path
    if (this._rotateToFollow) {
      const tangent = pathNode.getTangent(this._progress);
      const lookTarget = point.clone().add(tangent);
      this.object3D.lookAt(lookTarget);
    }
  }
}
