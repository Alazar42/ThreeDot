/**
 * AudioPlayer3D — Positional audio node using Three.js PositionalAudio
 * AudioPlayer — Non-positional (global) audio
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from '../3d/Node3D';
import { Node, NodeOptions } from '../../core/node/Node';
import { Signal } from '../../core/signals/Signal';

// ── Shared Audio Context ──

let sharedListener: THREE.AudioListener | null = null;

function getAudioListener(): THREE.AudioListener {
  if (!sharedListener) {
    sharedListener = new THREE.AudioListener();
  }
  return sharedListener;
}

/**
 * Attach the audio listener to a camera (must be done once).
 */
export function attachAudioListenerToCamera(camera: THREE.Camera): void {
  const listener = getAudioListener();
  if (!camera.children.includes(listener)) {
    camera.add(listener);
  }
}

// ── AudioPlayer (global/non-positional) ──

export interface AudioPlayerOptions extends NodeOptions {
  /** Path to audio file */
  src?: string;
  /** Volume (0-1) */
  volume?: number;
  /** Loop playback */
  loop?: boolean;
  /** Autoplay on entering tree */
  autoplay?: boolean;
}

/**
 * Non-positional (2D/global) audio player.
 */
export class AudioPlayer extends Node {
  private _audio: THREE.Audio | null = null;
  private _src: string;
  private _volume: number;
  private _loop: boolean;
  private _autoplay: boolean;
  private _buffer: AudioBuffer | null = null;

  readonly playbackFinished = new Signal<[]>('playback_finished');

  constructor(options?: AudioPlayerOptions) {
    super({ name: options?.name ?? 'AudioPlayer' });
    this._src = options?.src ?? '';
    this._volume = options?.volume ?? 1;
    this._loop = options?.loop ?? false;
    this._autoplay = options?.autoplay ?? false;
  }

  get src(): string {
    return this._src;
  }

  protected override _enterTree(): void {
    super._enterTree();
    const listener = getAudioListener();
    this._audio = new THREE.Audio(listener);
    this._audio.setVolume(this._volume);
    this._audio.setLoop(this._loop);

    if (this._buffer) {
      this._audio.setBuffer(this._buffer);
    }

    this._audio.onEnded = () => {
      this.playbackFinished.emit();
    };

    if (this._autoplay && this._buffer) {
      this._tryPlay();
    }
  }

  /**
   * Set the audio buffer directly.
   */
  setBuffer(buffer: AudioBuffer): void {
    this._buffer = buffer;
    if (this._audio) {
      this._audio.setBuffer(buffer);
    }
  }

  /**
   * Load and set audio from a URL via the resource manager.
   */
  async load(url: string): Promise<void> {
    this._src = url;
    return new Promise((resolve, reject) => {
      const loader = new THREE.AudioLoader();
      loader.load(
        url,
        (buffer) => {
          this.setBuffer(buffer);
          resolve();
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  play(): void {
    this._tryPlay();
  }

  stop(): void {
    if (this._audio?.isPlaying) {
      this._audio.stop();
    }
  }

  pause(): void {
    if (this._audio?.isPlaying) {
      this._audio.pause();
    }
  }

  get isPlaying(): boolean {
    return this._audio?.isPlaying ?? false;
  }

  get volume(): number { return this._volume; }
  set volume(v: number) {
    this._volume = v;
    this._audio?.setVolume(v);
  }

  get loop(): boolean { return this._loop; }
  set loop(v: boolean) {
    this._loop = v;
    this._audio?.setLoop(v);
  }

  private _tryPlay(): void {
    if (!this._audio || !this._buffer) return;

    // Handle browser autoplay restrictions
    const ctx = this._audio.context;
    if (ctx.state === 'suspended') {
      const resumeAndPlay = () => {
        ctx.resume().then(() => {
          if (this._audio && !this._audio.isPlaying) {
            this._audio.play();
          }
        });
        document.removeEventListener('click', resumeAndPlay);
        document.removeEventListener('keydown', resumeAndPlay);
      };
      document.addEventListener('click', resumeAndPlay, { once: true });
      document.addEventListener('keydown', resumeAndPlay, { once: true });
    } else {
      if (!this._audio.isPlaying) {
        this._audio.play();
      }
    }
  }

  protected override _exitTree(): void {
    this.stop();
    super._exitTree();
  }

  protected override _destroy(): void {
    if (this._audio) {
      if (this._audio.isPlaying) this._audio.stop();
      this._audio.disconnect();
    }
    this.playbackFinished.dispose();
    super._destroy();
  }
}

// ── AudioPlayer3D (positional) ──

export interface AudioPlayer3DOptions extends Node3DOptions {
  src?: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
  refDistance?: number;
  maxDistance?: number;
  rolloffFactor?: number;
}

/**
 * Positional 3D audio player — sound emanates from this node's position.
 */
export class AudioPlayer3D extends Node3D {
  private _positionalAudio: THREE.PositionalAudio | null = null;
  private _src: string;
  private _volume: number;
  private _loop: boolean;
  private _autoplay: boolean;
  private _refDistance: number;
  private _maxDistance: number;
  private _rolloffFactor: number;
  private _buffer: AudioBuffer | null = null;

  readonly playbackFinished = new Signal<[]>('playback_finished');

  constructor(options?: AudioPlayer3DOptions) {
    super(options);
    this._src = options?.src ?? '';
    this._volume = options?.volume ?? 1;
    this._loop = options?.loop ?? false;
    this._autoplay = options?.autoplay ?? false;
    this._refDistance = options?.refDistance ?? 1;
    this._maxDistance = options?.maxDistance ?? 100;
    this._rolloffFactor = options?.rolloffFactor ?? 1;
  }

  get src(): string {
    return this._src;
  }

  protected override _enterTree(): void {
    super._enterTree();
    const listener = getAudioListener();
    this._positionalAudio = new THREE.PositionalAudio(listener);
    this._positionalAudio.setVolume(this._volume);
    this._positionalAudio.setLoop(this._loop);
    this._positionalAudio.setRefDistance(this._refDistance);
    this._positionalAudio.setMaxDistance(this._maxDistance);
    this._positionalAudio.setRolloffFactor(this._rolloffFactor);

    this.object3D.add(this._positionalAudio);

    if (this._buffer) {
      this._positionalAudio.setBuffer(this._buffer);
    }

    this._positionalAudio.onEnded = () => {
      this.playbackFinished.emit();
    };

    if (this._autoplay && this._buffer) {
      this.play();
    }
  }

  setBuffer(buffer: AudioBuffer): void {
    this._buffer = buffer;
    if (this._positionalAudio) {
      this._positionalAudio.setBuffer(buffer);
    }
  }

  async load(url: string): Promise<void> {
    this._src = url;
    return new Promise((resolve, reject) => {
      const loader = new THREE.AudioLoader();
      loader.load(url, (buffer) => {
        this.setBuffer(buffer);
        resolve();
      }, undefined, (err) => reject(err));
    });
  }

  play(): void {
    if (!this._positionalAudio || !this._buffer) return;
    const ctx = this._positionalAudio.context;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (this._positionalAudio && !this._positionalAudio.isPlaying) {
          this._positionalAudio.play();
        }
      });
    } else if (!this._positionalAudio.isPlaying) {
      this._positionalAudio.play();
    }
  }

  stop(): void {
    if (this._positionalAudio?.isPlaying) {
      this._positionalAudio.stop();
    }
  }

  get isPlaying(): boolean {
    return this._positionalAudio?.isPlaying ?? false;
  }

  get volume(): number { return this._volume; }
  set volume(v: number) {
    this._volume = v;
    this._positionalAudio?.setVolume(v);
  }

  protected override _exitTree(): void {
    this.stop();
    if (this._positionalAudio) {
      this.object3D.remove(this._positionalAudio);
    }
    super._exitTree();
  }

  protected override _destroy(): void {
    if (this._positionalAudio) {
      if (this._positionalAudio.isPlaying) this._positionalAudio.stop();
      this._positionalAudio.disconnect();
    }
    this.playbackFinished.dispose();
    super._destroy();
  }
}
