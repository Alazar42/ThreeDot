/**
 * Environment3D — Scene environment and rendering settings
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from './Node3D';

export interface Environment3DOptions extends Node3DOptions {
  /** Background color */
  backgroundColor?: THREE.ColorRepresentation;
  /** Fog color and density */
  fog?: { color: THREE.ColorRepresentation; near: number; far: number };
  /** Exponential fog */
  fogExp?: { color: THREE.ColorRepresentation; density: number };
  /** Ambient light color and intensity */
  ambientColor?: THREE.ColorRepresentation;
  ambientIntensity?: number;
  /** Environment map (for reflections) */
  environmentMap?: THREE.Texture;
}

/**
 * Configures the scene environment: background, fog, ambient light, environment map.
 */
export class Environment3D extends Node3D {
  private _backgroundColor: THREE.ColorRepresentation | null = null;
  private _fog: THREE.Fog | THREE.FogExp2 | null = null;
  private _ambientLight: THREE.AmbientLight | null = null;
  private _environmentMap: THREE.Texture | null = null;

  constructor(options?: Environment3DOptions) {
    super(options);

    if (options?.backgroundColor !== undefined) {
      this._backgroundColor = options.backgroundColor;
    }

    if (options?.fog) {
      this._fog = new THREE.Fog(
        options.fog.color,
        options.fog.near,
        options.fog.far
      );
    } else if (options?.fogExp) {
      this._fog = new THREE.FogExp2(
        options.fogExp.color,
        options.fogExp.density
      );
    }

    if (options?.ambientColor !== undefined) {
      this._ambientLight = new THREE.AmbientLight(
        options.ambientColor,
        options.ambientIntensity ?? 0.4
      );
    }

    if (options?.environmentMap) {
      this._environmentMap = options.environmentMap;
    }
  }

  protected override _enterTree(): void {
    super._enterTree();
    this._applyToScene();
  }

  protected override _exitTree(): void {
    this._removeFromScene();
    super._exitTree();
  }

  private _applyToScene(): void {
    const engine = this.getRoot().getMeta<import('../../core/engine/Engine').Engine>('__engine');
    if (!engine) return;

    const scene = engine.threeScene;

    if (this._backgroundColor !== null) {
      scene.background = new THREE.Color(this._backgroundColor);
    }

    if (this._fog) {
      scene.fog = this._fog;
    }

    if (this._ambientLight) {
      scene.add(this._ambientLight);
    }

    if (this._environmentMap) {
      scene.environment = this._environmentMap;
    }
  }

  private _removeFromScene(): void {
    const engine = this.getRoot().getMeta<import('../../core/engine/Engine').Engine>('__engine');
    if (!engine) return;

    const scene = engine.threeScene;

    if (this._ambientLight && this._ambientLight.parent === scene) {
      scene.remove(this._ambientLight);
    }
  }

  set backgroundColor(color: THREE.ColorRepresentation) {
    this._backgroundColor = color;
    if (this.isInsideTree) {
      const engine = this.getRoot().getMeta<import('../../core/engine/Engine').Engine>('__engine');
      if (engine) {
        engine.threeScene.background = new THREE.Color(color);
      }
    }
  }

  protected override _destroy(): void {
    this._ambientLight?.dispose();
    super._destroy();
  }
}

/**
 * WorldEnvironment is an alias for Environment3D — for Godot naming familiarity.
 */
export class WorldEnvironment extends Environment3D {}
