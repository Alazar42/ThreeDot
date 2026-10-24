/**
 * Camera3D — Perspective and Orthographic camera nodes
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export interface Camera3DOptions extends Node3DOptions {
  fov?: number;
  near?: number;
  far?: number;
  orthographic?: boolean;
  orthographicSize?: number;
}

/**
 * A camera node. Can be perspective or orthographic.
 */
export class Camera3D extends Node3D {
  private _threeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private _isOrthographic: boolean;

  constructor(options?: Camera3DOptions | string) {
    const opts: Camera3DOptions | undefined =
      typeof options === 'string' ? { name: options } : options;
    super(opts);
    this._isOrthographic = opts?.orthographic ?? false;

    if (this._isOrthographic) {
      const size = opts?.orthographicSize ?? 10;
      this._threeCamera = new THREE.OrthographicCamera(
        -size,
        size,
        size,
        -size,
        opts?.near ?? 0.1,
        opts?.far ?? 1000
      );
    } else {
      this._threeCamera = new THREE.PerspectiveCamera(
        opts?.fov ?? 75,
        1, // Will be updated by engine
        opts?.near ?? 0.1,
        opts?.far ?? 1000
      );
    }

    // Set object3D directly to the camera instance
    this.object3D = this._threeCamera;

    // Apply any initial transforms from options to the camera
    if (opts?.position) {
      const p = opts.position;
      this.object3D.position.set(
        'x' in p ? p.x : 0,
        'y' in p ? p.y : 0,
        'z' in p ? p.z : 0
      );
    }
    if (opts?.rotation) {
      const r = opts.rotation;
      this.object3D.rotation.set(
        'x' in r ? r.x : 0,
        'y' in r ? r.y : 0,
        'z' in r ? r.z : 0
      );
    }
    if (opts?.scale) {
      const s = opts.scale;
      this.object3D.scale.set(
        'x' in s ? s.x : 1,
        'y' in s ? s.y : 1,
        'z' in s ? s.z : 1
      );
    }
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.Object3D();
  }

  /**
   * Get the underlying Three.js camera.
   */
  get threeCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this._threeCamera;
  }

  get isOrthographic(): boolean {
    return this._isOrthographic;
  }

  /**
   * Make this the active camera for the engine.
   */
  makeCurrent(): void {
    const engine = this._findEngine();
    if (engine) {
      engine.camera = this._threeCamera;
    }
  }

  get fov(): number {
    if (this._threeCamera instanceof THREE.PerspectiveCamera) {
      return this._threeCamera.fov;
    }
    return 0;
  }

  set fov(value: number) {
    if (this._threeCamera instanceof THREE.PerspectiveCamera) {
      this._threeCamera.fov = value;
      this._threeCamera.updateProjectionMatrix();
    }
  }

  get near(): number {
    return this._threeCamera.near;
  }

  set near(value: number) {
    this._threeCamera.near = value;
    this._threeCamera.updateProjectionMatrix();
  }

  get far(): number {
    return this._threeCamera.far;
  }

  set far(value: number) {
    this._threeCamera.far = value;
    this._threeCamera.updateProjectionMatrix();
  }
}
