/**
 * PhysicsServer2D — Central Rapier2D physics simulation management
 */

import RAPIER2D from '@dimforge/rapier2d-compat';
import * as THREE from 'three';

export interface PhysicsServer2DOptions {
  gravity?: THREE.Vector2 | { x: number; y: number };
}

let rapier2DInitialized = false;

export async function initRapier2D(): Promise<void> {
  if (!rapier2DInitialized) {
    await RAPIER2D.init();
    rapier2DInitialized = true;
  }
}

export class PhysicsServer2D {
  private _world: RAPIER2D.World | null = null;
  private _gravity: RAPIER2D.Vector2 = new RAPIER2D.Vector2(0, -9.81);
  private _initialized = false;
  private _initPromise: Promise<void> | null = null;

  constructor(options?: PhysicsServer2DOptions) {
    if (options?.gravity) {
      const g = options.gravity;
      this._gravity = new RAPIER2D.Vector2(g.x, g.y);
    }
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      await initRapier2D();
      this._world = new RAPIER2D.World(this._gravity);
      this._initialized = true;
    })();

    return this._initPromise;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  get world(): RAPIER2D.World | null {
    return this._world;
  }

  get rapier(): typeof RAPIER2D {
    return RAPIER2D;
  }

  setGravity(gravity: THREE.Vector2 | { x: number; y: number }): void {
    this._gravity = new RAPIER2D.Vector2(gravity.x, gravity.y);
    if (this._world) {
      this._world.gravity = this._gravity;
    }
  }

  step(delta: number): void {
    if (!this._world) return;
    this._world.timestep = delta;
    this._world.step();
  }

  dispose(): void {
    if (this._world) {
      this._world.free();
      this._world = null;
    }
    this._initialized = false;
    this._initPromise = null;
  }
}
