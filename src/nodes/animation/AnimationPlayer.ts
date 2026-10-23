/**
 * AnimationPlayer — Node-based animation control using Three.js AnimationMixer
 */

import * as THREE from 'three';
import { Node } from '../../core/node/Node';
import { Signal } from '../../core/signals/Signal';
import { Node3D } from '../3d/Node3D';

export interface AnimationPlayerOptions {
  name?: string;
  autoplay?: string;
  speed?: number;
}

/**
 * AnimationPlayer manages Three.js animation clips on a parent Node3D.
 */
export class AnimationPlayer extends Node {
  private _mixer: THREE.AnimationMixer | null = null;
  private _clips: Map<string, THREE.AnimationClip> = new Map();
  private _actions: Map<string, THREE.AnimationAction> = new Map();
  private _currentAction: THREE.AnimationAction | null = null;
  private _currentAnimationName = '';
  private _speed: number;
  private _autoplay: string;

  /** Emitted when an animation finishes */
  readonly animationFinished = new Signal<[string]>('animation_finished');

  /** Emitted when animation loops */
  readonly animationLooped = new Signal<[string]>('animation_looped');

  constructor(options?: AnimationPlayerOptions) {
    super({ name: options?.name ?? 'AnimationPlayer' });
    this._speed = options?.speed ?? 1;
    this._autoplay = options?.autoplay ?? '';
  }

  /**
   * Add an animation clip.
   */
  addAnimation(name: string, clip: THREE.AnimationClip): void {
    this._clips.set(name, clip);
    if (this._mixer) {
      this._createAction(name, clip);
    }
  }

  /**
   * Add multiple animation clips from a GLTF load result.
   */
  addAnimations(clips: THREE.AnimationClip[]): void {
    for (const clip of clips) {
      this.addAnimation(clip.name || `animation_${this._clips.size}`, clip);
    }
  }

  /**
   * Play an animation by name.
   */
  play(name: string, options?: {
    loop?: THREE.AnimationActionLoopStyles;
    crossFadeDuration?: number;
    reset?: boolean;
  }): void {
    const action = this._actions.get(name);
    if (!action) {
      console.warn(`[ThreeDot] AnimationPlayer: animation "${name}" not found.`);
      return;
    }

    if (options?.loop !== undefined) {
      action.loop = options.loop;
    }

    if (options?.reset !== false) {
      action.reset();
    }

    // Cross-fade from current
    if (this._currentAction && this._currentAction !== action) {
      const fadeDuration = options?.crossFadeDuration ?? 0.3;
      action.reset();
      action.play();
      this._currentAction.crossFadeTo(action, fadeDuration, true);
    } else {
      action.play();
    }

    this._currentAction = action;
    this._currentAnimationName = name;
  }

  /**
   * Stop the current animation.
   */
  stop(): void {
    if (this._currentAction) {
      this._currentAction.stop();
      this._currentAction = null;
      this._currentAnimationName = '';
    }
  }

  /**
   * Pause the current animation.
   */
  pause(): void {
    if (this._currentAction) {
      this._currentAction.paused = true;
    }
  }

  /**
   * Resume a paused animation.
   */
  resume(): void {
    if (this._currentAction) {
      this._currentAction.paused = false;
    }
  }

  /**
   * Seek to a specific time in the current animation.
   */
  seek(time: number): void {
    if (this._currentAction) {
      this._currentAction.time = time;
      this._mixer?.update(0);
    }
  }

  /**
   * Get the current animation name.
   */
  get currentAnimation(): string {
    return this._currentAnimationName;
  }

  /**
   * Get/set playback speed.
   */
  get speed(): number { return this._speed; }
  set speed(v: number) {
    this._speed = v;
    if (this._mixer) {
      this._mixer.timeScale = v;
    }
  }

  /**
   * Check if an animation is currently playing.
   */
  get isPlaying(): boolean {
    return this._currentAction !== null && this._currentAction.isRunning();
  }

  /**
   * Check if an animation exists.
   */
  hasAnimation(name: string): boolean {
    return this._clips.has(name);
  }

  /**
   * Check if the current animation is paused.
   */
  get isPaused(): boolean {
    return this._currentAction !== null && this._currentAction.paused;
  }

  /**
   * Get the list of available animation names.
   */
  get animationNames(): string[] {
    return Array.from(this._clips.keys());
  }

  /**
   * Get the list of available animation names.
   */
  getAnimationNames(): string[] {
    return Array.from(this._clips.keys());
  }

  /**
   * Get the duration of a clip by name.
   */
  getAnimationDuration(name: string): number {
    return this._clips.get(name)?.duration ?? 0;
  }

  protected override _enterTree(): void {
    super._enterTree();
    // Create mixer from parent Node3D's Object3D
    const parentNode3D = this._findParentNode3D();
    if (parentNode3D) {
      this._mixer = new THREE.AnimationMixer(parentNode3D.object3D);
      this._mixer.timeScale = this._speed;

      // Create actions for all clips
      for (const [name, clip] of this._clips) {
        this._createAction(name, clip);
      }

      // Setup event listener for finished animations
      this._mixer.addEventListener('finished', (e) => {
        const clip = (e as THREE.Event & { action: THREE.AnimationAction }).action.getClip();
        const name = this._findClipName(clip);
        if (name) {
          this.animationFinished.emit(name);
        }
      });

      this._mixer.addEventListener('loop', (e) => {
        const clip = (e as THREE.Event & { action: THREE.AnimationAction }).action.getClip();
        const name = this._findClipName(clip);
        if (name) {
          this.animationLooped.emit(name);
        }
      });

      // Autoplay
      if (this._autoplay) {
        this.play(this._autoplay);
      }
    }
  }

  protected override _exitTree(): void {
    if (this._mixer) {
      this._mixer.stopAllAction();
      this._mixer.uncacheRoot(this._mixer.getRoot());
    }
    this._mixer = null;
    this._actions.clear();
    this._currentAction = null;
    super._exitTree();
  }

  protected override _process(delta: number): void {
    if (this._mixer) {
      this._mixer.update(delta);
    }
  }

  protected override _destroy(): void {
    if (this._mixer) {
      this._mixer.stopAllAction();
    }
    this._clips.clear();
    this._actions.clear();
    this.animationFinished.dispose();
    this.animationLooped.dispose();
    super._destroy();
  }

  private _createAction(name: string, clip: THREE.AnimationClip): void {
    if (!this._mixer) return;
    const action = this._mixer.clipAction(clip);
    this._actions.set(name, action);
  }

  private _findClipName(clip: THREE.AnimationClip): string | undefined {
    for (const [name, c] of this._clips) {
      if (c === clip) return name;
    }
    return undefined;
  }

  private _findParentNode3D(): Node3D | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Node3D) return current;
      current = current.parent;
    }
    return null;
  }
}
