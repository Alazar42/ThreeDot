/**
 * AnimatedSprite2D — Frame-based 2D sprite animation node
 */

import * as THREE from 'three';
import { Sprite2D, Sprite2DOptions, Rect2D } from './Sprite2D';
import { Signal } from '../../core/signals/Signal';

export interface SpriteAnimationFrame {
  texture?: THREE.Texture;
  regionRect?: Rect2D;
  duration?: number; // per-frame duration multiplier (default: 1.0)
}

export type SpriteAnimationFrameInput = THREE.Texture | SpriteAnimationFrame;

export interface SpriteAnimationInput {
  name?: string;
  fps?: number;
  loop?: boolean;
  frames: SpriteAnimationFrameInput[];
}

export interface SpriteAnimation {
  name: string;
  fps: number;
  loop: boolean;
  frames: SpriteAnimationFrame[];
}

export interface SpriteFrames {
  animations: Record<string, SpriteAnimationInput>;
}

export interface AnimatedSprite2DOptions extends Sprite2DOptions {
  animations?: Record<string, SpriteAnimationInput>;
  spriteFrames?: SpriteFrames;
  animation?: string;
  defaultAnimation?: string;
  autoplay?: boolean;
}

export class AnimatedSprite2D extends Sprite2D {
  readonly frameChanged = new Signal<[number]>('frame_changed');
  readonly animationFinished = new Signal<[string]>('animation_finished');

  private _animations: Map<string, SpriteAnimation> = new Map();
  private _currentAnimation: SpriteAnimation | null = null;
  private _currentFrameIndex = 0;
  private _frameTimer = 0;
  private _playing = false;
  private _speedScale = 1.0;

  constructor(options?: AnimatedSprite2DOptions) {
    super(options);

    const animMap = options?.animations ?? options?.spriteFrames?.animations;
    if (animMap) {
      for (const [key, anim] of Object.entries(animMap)) {
        this.addAnimation(key, anim);
      }
    }

    const defaultAnim = options?.animation ?? options?.defaultAnimation;
    if (defaultAnim && this._animations.has(defaultAnim)) {
      this.play(defaultAnim);
      if (!(options?.autoplay ?? false)) {
        this.pause();
      }
    }
  }

  addAnimation(name: string, animation: SpriteAnimationInput): void {
    const normalizedFrames: SpriteAnimationFrame[] = animation.frames.map(f => {
      if (f instanceof THREE.Texture) {
        return { texture: f };
      }
      return f;
    });

    this._animations.set(name, {
      name: animation.name ?? name,
      fps: animation.fps ?? 30,
      loop: animation.loop ?? true,
      frames: normalizedFrames,
    });
  }

  removeAnimation(name: string): void {
    this._animations.delete(name);
    if (this._currentAnimation?.name === name) {
      this.stop();
    }
  }

  hasAnimation(name: string): boolean {
    return this._animations.has(name);
  }

  get currentAnimation(): string | null {
    return this._currentAnimation?.name ?? null;
  }

  get frame(): number {
    return this._currentFrameIndex;
  }

  set frame(index: number) {
    if (!this._currentAnimation || this._currentAnimation.frames.length === 0) return;
    this._currentFrameIndex = Math.max(0, Math.min(index, this._currentAnimation.frames.length - 1));
    this._applyFrame();
    this.frameChanged.emit(this._currentFrameIndex);
  }

  get isPlaying(): boolean {
    return this._playing;
  }

  get speedScale(): number {
    return this._speedScale;
  }

  set speedScale(scale: number) {
    this._speedScale = scale;
  }

  play(animationName?: string): void {
    if (animationName) {
      const anim = this._animations.get(animationName);
      if (!anim) {
        console.warn(`AnimatedSprite2D: Animation "${animationName}" not found.`);
        return;
      }
      if (this._currentAnimation !== anim) {
        this._currentAnimation = anim;
        this._currentFrameIndex = 0;
        this._frameTimer = 0;
        this._applyFrame();
      }
    }
    this._playing = true;
  }

  pause(): void {
    this._playing = false;
  }

  stop(): void {
    this._playing = false;
    this._currentFrameIndex = 0;
    this._frameTimer = 0;
    this._applyFrame();
  }

  protected override _process(delta: number): void {
    super._process(delta);

    if (!this._playing || !this._currentAnimation || this._currentAnimation.frames.length <= 1) {
      return;
    }

    const anim = this._currentAnimation;
    const currentFrame = anim.frames[this._currentFrameIndex];
    const frameDuration = (1 / Math.max(0.001, anim.fps)) * (currentFrame?.duration ?? 1.0) / Math.max(0.001, this._speedScale);

    this._frameTimer += delta;

    if (this._frameTimer >= frameDuration) {
      this._frameTimer -= frameDuration;
      const nextIndex = this._currentFrameIndex + 1;

      if (nextIndex >= anim.frames.length) {
        if (anim.loop) {
          this._currentFrameIndex = 0;
          this._applyFrame();
          this.frameChanged.emit(0);
        } else {
          this._playing = false;
          this.animationFinished.emit(anim.name);
        }
      } else {
        this._currentFrameIndex = nextIndex;
        this._applyFrame();
        this.frameChanged.emit(nextIndex);
      }
    }
  }

  private _applyFrame(): void {
    if (!this._currentAnimation) return;
    const frame = this._currentAnimation.frames[this._currentFrameIndex];
    if (!frame) return;

    if (frame.texture) {
      this.texture = frame.texture;
    }
    if (frame.regionRect) {
      this.regionEnabled = true;
      this.regionRect = frame.regionRect;
    }
  }
}
