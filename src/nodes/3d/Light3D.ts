/**
 * Light3D nodes — DirectionalLight3D, PointLight3D, SpotLight3D
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';
function parseLightArgs<T extends Node3DOptions & { color?: THREE.ColorRepresentation; intensity?: number }>(
  arg1?: string | number | T,
  arg2?: number | T
): T {
  if (typeof arg1 === 'number') {
    return {
      color: arg1,
      intensity: typeof arg2 === 'number' ? arg2 : (arg2 as any)?.intensity,
      ...(typeof arg2 === 'object' && arg2 !== null ? arg2 : {}),
    } as T;
  }
  if (typeof arg1 === 'string') {
    if (typeof arg2 === 'number') {
      return { name: arg1, intensity: arg2 } as T;
    }
    return { ...(arg2 ?? {}), name: arg1 } as T;
  }
  return (arg1 ?? {}) as T;
}

// ── DirectionalLight3D ──

export interface DirectionalLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  castShadow?: boolean;
  shadowMapSize?: number;
}

export class DirectionalLight3D extends Node3D {
  private _light: THREE.DirectionalLight;

  constructor(
    nameOrColorOrOptions?: string | number | DirectionalLight3DOptions,
    intensityOrOptions?: number | DirectionalLight3DOptions
  ) {
    const opts = parseLightArgs<DirectionalLight3DOptions>(nameOrColorOrOptions, intensityOrOptions);
    super(opts);
    this._light = this.object3D as THREE.DirectionalLight;
    if (opts.color !== undefined) this._light.color.set(opts.color);
    if (opts.intensity !== undefined) this._light.intensity = opts.intensity;
    if (opts.castShadow !== undefined) this._light.castShadow = opts.castShadow;
    if (opts.shadowMapSize !== undefined) {
      this._light.shadow.mapSize.setScalar(opts.shadowMapSize);
    }
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.DirectionalLight(0xffffff, 1);
  }

  get light(): THREE.DirectionalLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
  get castShadow(): boolean { return this._light.castShadow; }
  set castShadow(v: boolean) { this._light.castShadow = v; }
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

  constructor(
    nameOrColorOrOptions?: string | number | PointLight3DOptions,
    intensityOrOptions?: number | PointLight3DOptions
  ) {
    const opts = parseLightArgs<PointLight3DOptions>(nameOrColorOrOptions, intensityOrOptions);
    super(opts);
    this._light = this.object3D as THREE.PointLight;
    if (opts.color !== undefined) this._light.color.set(opts.color);
    if (opts.intensity !== undefined) this._light.intensity = opts.intensity;
    if (opts.distance !== undefined) this._light.distance = opts.distance;
    if (opts.decay !== undefined) this._light.decay = opts.decay;
    if (opts.castShadow !== undefined) this._light.castShadow = opts.castShadow;
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
  get castShadow(): boolean { return this._light.castShadow; }
  set castShadow(v: boolean) { this._light.castShadow = v; }
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

  constructor(
    nameOrColorOrOptions?: string | number | SpotLight3DOptions,
    intensityOrOptions?: number | SpotLight3DOptions
  ) {
    const opts = parseLightArgs<SpotLight3DOptions>(nameOrColorOrOptions, intensityOrOptions);
    super(opts);
    this._light = this.object3D as THREE.SpotLight;
    if (opts.color !== undefined) this._light.color.set(opts.color);
    if (opts.intensity !== undefined) this._light.intensity = opts.intensity;
    if (opts.distance !== undefined) this._light.distance = opts.distance;
    if (opts.angle !== undefined) this._light.angle = opts.angle;
    if (opts.penumbra !== undefined) this._light.penumbra = opts.penumbra;
    if (opts.decay !== undefined) this._light.decay = opts.decay;
    if (opts.castShadow !== undefined) this._light.castShadow = opts.castShadow;
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
  get castShadow(): boolean { return this._light.castShadow; }
  set castShadow(v: boolean) { this._light.castShadow = v; }
}

// ── AmbientLight3D ──

export interface AmbientLight3DOptions extends Node3DOptions {
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

export class AmbientLight3D extends Node3D {
  private _light: THREE.AmbientLight;

  constructor(
    nameOrColorOrOptions?: string | number | AmbientLight3DOptions,
    intensityOrOptions?: number | AmbientLight3DOptions
  ) {
    const opts = parseLightArgs<AmbientLight3DOptions>(nameOrColorOrOptions, intensityOrOptions);
    super(opts);
    this._light = this.object3D as THREE.AmbientLight;
    if (opts.color !== undefined) this._light.color.set(opts.color);
    if (opts.intensity !== undefined) this._light.intensity = opts.intensity;
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.AmbientLight(0xffffff, 1);
  }

  get light(): THREE.AmbientLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
}
