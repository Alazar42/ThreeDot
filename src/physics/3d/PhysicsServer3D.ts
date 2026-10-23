/**
 * PhysicsServer3D — Central Rapier3D physics simulation management
 */

import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

export interface PhysicsServer3DOptions {
  gravity?: THREE.Vector3 | { x: number; y: number; z: number };
}

let rapierInitialized = false;

export async function initRapier3D(): Promise<void> {
  if (!rapierInitialized) {
    await RAPIER.init();
    rapierInitialized = true;
  }
}

export class PhysicsServer3D {
  private _world: RAPIER.World | null = null;
  private _gravity: RAPIER.Vector3 = new RAPIER.Vector3(0, -9.81, 0);
  private _initialized = false;
  private _initPromise: Promise<void> | null = null;

  constructor(options?: PhysicsServer3DOptions) {
    if (options?.gravity) {
      const g = options.gravity;
      this._gravity = new RAPIER.Vector3(g.x, g.y, g.z);
    }
  }

  async initialize(): Promise<void> {
    if (this._initialized) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
      await initRapier3D();
      this._world = new RAPIER.World(this._gravity);
      this._initialized = true;
    })();

    return this._initPromise;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  get world(): RAPIER.World | null {
    return this._world;
  }

  get rapier(): typeof RAPIER {
    return RAPIER;
  }

  setGravity(gravity: THREE.Vector3 | { x: number; y: number; z: number }): void {
    this._gravity = new RAPIER.Vector3(gravity.x, gravity.y, gravity.z);
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
