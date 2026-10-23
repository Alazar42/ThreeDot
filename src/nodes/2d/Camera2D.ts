/**
 * Camera2D — 2D viewport tracking and camera positioning
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface Camera2DOptions extends Node2DOptions {
  zoom?: number | THREE.Vector2 | { x: number; y: number };
  offset?: THREE.Vector2 | { x: number; y: number };
  positionSmoothingEnabled?: boolean;
  positionSmoothingSpeed?: number;
  limitLeft?: number;
  limitTop?: number;
  limitRight?: number;
  limitBottom?: number;
  current?: boolean;
}

export class Camera2D extends Node2D {
  private _camera: THREE.OrthographicCamera;
  private _zoom = new THREE.Vector2(1, 1);
  private _offset = new THREE.Vector2(0, 0);
  private _smoothingEnabled = false;
  private _smoothingSpeed = 5.0;
  private _targetPosition = new THREE.Vector2(0, 0);

  limitLeft: number = -Infinity;
  limitTop: number = Infinity;
  limitRight: number = Infinity;
  limitBottom: number = -Infinity;

  constructor(options?: Camera2DOptions) {
    super(options);

    // Default frustum size
    this._camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0.1, 1000);
    this._camera.position.set(0, 0, 10);
    this._camera.lookAt(0, 0, 0);

    if (options?.zoom !== undefined) {
      if (typeof options.zoom === 'number') {
        this.zoom = new THREE.Vector2(options.zoom, options.zoom);
      } else {
        this.zoom = new THREE.Vector2(options.zoom.x, options.zoom.y);
      }
    }

    if (options?.offset) {
      this._offset.set(options.offset.x, options.offset.y);
    }

    this._smoothingEnabled = options?.positionSmoothingEnabled ?? false;
    this._smoothingSpeed = options?.positionSmoothingSpeed ?? 5.0;

    if (options?.limitLeft !== undefined) this.limitLeft = options.limitLeft;
    if (options?.limitTop !== undefined) this.limitTop = options.limitTop;
    if (options?.limitRight !== undefined) this.limitRight = options.limitRight;
    if (options?.limitBottom !== undefined) this.limitBottom = options.limitBottom;

    if (options?.current) {
      this.makeCurrent();
    }
  }

  get camera(): THREE.OrthographicCamera {
    return this._camera;
  }

  get zoom(): THREE.Vector2 {
    return this._zoom.clone();
  }

  set zoom(val: THREE.Vector2 | { x: number; y: number } | number) {
    if (typeof val === 'number') {
      this._zoom.set(val, val);
    } else {
      this._zoom.set(val.x, val.y);
    }
    this._updateCameraFrustum();
  }

  get offset(): THREE.Vector2 {
    return this._offset.clone();
  }

  set offset(val: THREE.Vector2 | { x: number; y: number }) {
    this._offset.set(val.x, val.y);
  }

  get positionSmoothingEnabled(): boolean {
    return this._smoothingEnabled;
  }

  set positionSmoothingEnabled(val: boolean) {
    this._smoothingEnabled = val;
  }

  get positionSmoothingSpeed(): number {
    return this._smoothingSpeed;
  }

  set positionSmoothingSpeed(val: number) {
    this._smoothingSpeed = val;
  }

  makeCurrent(): void {
    const engine = this._findEngine();
    if (engine) {
      engine.camera = this._camera;
      this._updateCameraFrustum();
    }
  }

  protected override _process(delta: number): void {
    super._process(delta);

    const targetX = Math.max(this.limitLeft, Math.min(this.limitRight, this.globalPosition.x + this._offset.x));
    const targetY = Math.max(this.limitBottom, Math.min(this.limitTop, this.globalPosition.y + this._offset.y));

    if (this._smoothingEnabled) {
      const t = Math.min(1.0, this._smoothingSpeed * delta);
      this._targetPosition.x += (targetX - this._targetPosition.x) * t;
      this._targetPosition.y += (targetY - this._targetPosition.y) * t;
    } else {
      this._targetPosition.set(targetX, targetY);
    }

    this._camera.position.set(this._targetPosition.x, this._targetPosition.y, 10);
    this._camera.lookAt(this._targetPosition.x, this._targetPosition.y, 0);
  }

  private _updateCameraFrustum(): void {
    const engine = this._findEngine();
    const width = engine?.viewportSize.x ?? 10;
    const height = engine?.viewportSize.y ?? 10;
    const aspect = width / height;

    const baseHalfHeight = 5 / Math.max(0.001, this._zoom.y);
    const baseHalfWidth = (baseHalfHeight * aspect) / Math.max(0.001, this._zoom.x);

    this._camera.left = -baseHalfWidth;
    this._camera.right = baseHalfWidth;
    this._camera.top = baseHalfHeight;
    this._camera.bottom = -baseHalfHeight;
    this._camera.updateProjectionMatrix();
  }
}
