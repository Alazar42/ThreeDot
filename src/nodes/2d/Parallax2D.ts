/**
 * Parallax2D — Layered parallax scrolling node
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface Parallax2DOptions extends Node2DOptions {
  motionScale?: THREE.Vector2 | { x: number; y: number };
  motionOffset?: THREE.Vector2 | { x: number; y: number };
  repeatSize?: THREE.Vector2 | { x: number; y: number };
}

export class Parallax2D extends Node2D {
  motionScale: THREE.Vector2 = new THREE.Vector2(1, 1);
  motionOffset: THREE.Vector2 = new THREE.Vector2(0, 0);
  repeatSize: THREE.Vector2 = new THREE.Vector2(0, 0);

  private _initialPosition: THREE.Vector2;

  constructor(options?: Parallax2DOptions) {
    super(options);
    if (options?.motionScale) {
      this.motionScale.set(options.motionScale.x, options.motionScale.y);
    }
    if (options?.motionOffset) {
      this.motionOffset.set(options.motionOffset.x, options.motionOffset.y);
    }
    if (options?.repeatSize) {
      this.repeatSize.set(options.repeatSize.x, options.repeatSize.y);
    }
    this._initialPosition = this.position.clone();
  }

  protected override _process(_delta: number): void {
    super._process(_delta);

    // Track camera position
    const engine = this._findEngine();
    if (!engine) return;

    const camPos = engine.camera.position;

    let posX = this._initialPosition.x + (camPos.x * (1 - this.motionScale.x)) + this.motionOffset.x;
    let posY = this._initialPosition.y + (camPos.y * (1 - this.motionScale.y)) + this.motionOffset.y;

    if (this.repeatSize.x > 0) {
      posX = ((posX % this.repeatSize.x) + this.repeatSize.x) % this.repeatSize.x;
    }
    if (this.repeatSize.y > 0) {
      posY = ((posY % this.repeatSize.y) + this.repeatSize.y) % this.repeatSize.y;
    }

    this.position = new THREE.Vector2(posX, posY);
  }
}
