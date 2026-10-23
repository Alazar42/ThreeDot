/**
 * Light3D nodes — DirectionalLight3D, PointLight3D, SpotLight3D
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

// ── DirectionalLight3D ──

export interface DirectionalLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  castShadow?: boolean;
  shadowMapSize?: number;
}

export class DirectionalLight3D extends Node3D {
  private _light: THREE.DirectionalLight;

  constructor(options?: DirectionalLight3DOptions) {
    super(options);
    this._light = this.object3D as THREE.DirectionalLight;
    if (options?.color !== undefined) this._light.color.set(options.color);
    if (options?.intensity !== undefined) this._light.intensity = options.intensity;
    if (options?.castShadow !== undefined) this._light.castShadow = options.castShadow;
    if (options?.shadowMapSize !== undefined) {
      this._light.shadow.mapSize.setScalar(options.shadowMapSize);
    }
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.DirectionalLight(0xffffff, 1);
  }

  get light(): THREE.DirectionalLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
}

// ── PointLight3D ──

export interface PointLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  distance?: number;
  decay?: number;
  castShadow?: boolean;
}

export class PointLight3D extends Node3D {
  private _light: THREE.PointLight;

  constructor(options?: PointLight3DOptions) {
    super(options);
    this._light = this.object3D as THREE.PointLight;
    if (options?.color !== undefined) this._light.color.set(options.color);
    if (options?.intensity !== undefined) this._light.intensity = options.intensity;
    if (options?.distance !== undefined) this._light.distance = options.distance;
    if (options?.decay !== undefined) this._light.decay = options.decay;
    if (options?.castShadow !== undefined) this._light.castShadow = options.castShadow;
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.PointLight(0xffffff, 1);
  }

  get light(): THREE.PointLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
  get distance(): number { return this._light.distance; }
  set distance(v: number) { this._light.distance = v; }
}

// ── SpotLight3D ──

export interface SpotLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  distance?: number;
  angle?: number;
  penumbra?: number;
  decay?: number;
  castShadow?: boolean;
}

export class SpotLight3D extends Node3D {
  private _light: THREE.SpotLight;

  constructor(options?: SpotLight3DOptions) {
    super(options);
    this._light = this.object3D as THREE.SpotLight;
    if (options?.color !== undefined) this._light.color.set(options.color);
    if (options?.intensity !== undefined) this._light.intensity = options.intensity;
    if (options?.distance !== undefined) this._light.distance = options.distance;
    if (options?.angle !== undefined) this._light.angle = options.angle;
    if (options?.penumbra !== undefined) this._light.penumbra = options.penumbra;
    if (options?.decay !== undefined) this._light.decay = options.decay;
    if (options?.castShadow !== undefined) this._light.castShadow = options.castShadow;
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.SpotLight(0xffffff, 1);
  }

  get light(): THREE.SpotLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
  get angle(): number { return this._light.angle; }
  set angle(v: number) { this._light.angle = v; }
  get penumbra(): number { return this._light.penumbra; }
  set penumbra(v: number) { this._light.penumbra = v; }
}

// ── AmbientLight3D ──

export interface AmbientLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

export class AmbientLight3D extends Node3D {
  private _light: THREE.AmbientLight;

  constructor(options?: AmbientLight3DOptions) {
    super(options);
    this._light = this.object3D as THREE.AmbientLight;
    if (options?.color !== undefined) this._light.color.set(options.color);
    if (options?.intensity !== undefined) this._light.intensity = options.intensity;
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.AmbientLight(0xffffff, 0.4);
  }

  get light(): THREE.AmbientLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
}
