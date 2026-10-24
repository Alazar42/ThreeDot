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

  constructor(
    nameOrOptions?: string | DirectionalLight3DOptions,
    intensityOrOptions?: number | DirectionalLight3DOptions
  ) {
    let opts: DirectionalLight3DOptions | undefined;
    if (typeof nameOrOptions === 'string') {
      if (typeof intensityOrOptions === 'number') {
        opts = { name: nameOrOptions, intensity: intensityOrOptions };
      } else {
        opts = { ...(intensityOrOptions ?? {}), name: nameOrOptions };
      }
    } else {
      opts = nameOrOptions;
    }
    super(opts);
    this._light = this.object3D as THREE.DirectionalLight;
    if (opts?.color !== undefined) this._light.color.set(opts.color);
    if (opts?.intensity !== undefined) this._light.intensity = opts.intensity;
    if (opts?.castShadow !== undefined) this._light.castShadow = opts.castShadow;
    if (opts?.shadowMapSize !== undefined) {
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

  constructor(
    nameOrOptions?: string | AmbientLight3DOptions,
    intensityOrOptions?: number | AmbientLight3DOptions
  ) {
    let opts: AmbientLight3DOptions | undefined;
    if (typeof nameOrOptions === 'string') {
      if (typeof intensityOrOptions === 'number') {
        opts = { name: nameOrOptions, intensity: intensityOrOptions };
      } else {
        opts = { ...(intensityOrOptions ?? {}), name: nameOrOptions };
      }
    } else {
      opts = nameOrOptions;
    }
    super(opts);
    this._light = this.object3D as THREE.AmbientLight;
    if (opts?.color !== undefined) this._light.color.set(opts.color);
    if (opts?.intensity !== undefined) this._light.intensity = opts.intensity;
  }

  protected override _createObject3D(): THREE.Object3D {
    return new THREE.AmbientLight(0xffffff, 0.4);
  }

  get light(): THREE.AmbientLight { return this._light; }
  get color(): THREE.Color { return this._light.color; }
  get intensity(): number { return this._light.intensity; }
  set intensity(v: number) { this._light.intensity = v; }
}
