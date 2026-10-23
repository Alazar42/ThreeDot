/**
 * ThreeDot Resource Manager
 *
 * Typed loading, caching, and lifecycle management for assets:
 * textures, materials, geometries, GLTF models, fonts, audio, animations.
 */

import * as THREE from 'three';
import { Signal } from '../signals/Signal';

/**
 * Supported resource types for the registry.
 */
export type ResourceType =
  | 'texture'
  | 'material'
  | 'geometry'
  | 'gltf'
  | 'audio'
  | 'font'
  | 'animation'
  | 'custom';

/**
 * A tracked resource entry.
 */
interface ResourceEntry<T = unknown> {
  type: ResourceType;
  path: string;
  resource: T;
  refCount: number;
  disposed: boolean;
}

/**
 * Progress information for loading operations.
 */
export interface LoadProgress {
  loaded: number;
  total: number;
  path: string;
  fraction: number;
}

/**
 * ResourceManager handles loading, caching, shared ownership,
 * and deterministic disposal of all game assets.
 */
export class ResourceManager {
  private cache: Map<string, ResourceEntry> = new Map();
  private loaders: Map<string, THREE.Loader> = new Map();

  /** Three.js LoadingManager for coordinating loads */
  readonly loadingManager: THREE.LoadingManager;

  /** Emitted when any resource starts loading */
  readonly loadStarted = new Signal<[string]>('load_started');

  /** Emitted with progress updates */
  readonly loadProgress = new Signal<[LoadProgress]>('load_progress');

  /** Emitted when a resource finishes loading */
  readonly loadCompleted = new Signal<[string]>('load_completed');

  /** Emitted on loading errors */
  readonly loadError = new Signal<[string, Error]>('load_error');

  constructor() {
    this.loadingManager = new THREE.LoadingManager(
      // onLoad
      () => {},
      // onProgress
      (url, loaded, total) => {
        this.loadProgress.emit({
          loaded,
          total,
          path: url,
          fraction: total > 0 ? loaded / total : 0,
        });
      },
      // onError
      (url) => {
        this.loadError.emit(url, new Error(`Failed to load: ${url}`));
      }
    );

    // Initialize standard loaders
    this.loaders.set('texture', new THREE.TextureLoader(this.loadingManager));
  }

  /**
   * Register a custom loader for a given extension.
   */
  registerLoader(extension: string, loader: THREE.Loader): void {
    this.loaders.set(extension, loader);
  }

  /**
   * Load a texture. Returns a cached version if already loaded.
   */
  async loadTexture(path: string): Promise<THREE.Texture> {
    const existing = this._getCached<THREE.Texture>(path);
    if (existing) {
      existing.refCount++;
      return existing.resource;
    }

    this.loadStarted.emit(path);

    return new Promise<THREE.Texture>((resolve, reject) => {
      const loader = this.loaders.get('texture') as THREE.TextureLoader;
      loader.load(
        path,
        (texture) => {
          this._store(path, 'texture', texture);
          this.loadCompleted.emit(path);
          resolve(texture);
        },
        undefined,
        (err) => {
          const error = err instanceof Error ? err : new Error(`Failed to load texture: ${path}`);
          this.loadError.emit(path, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load a GLTF model. Requires GLTFLoader to be registered.
   */
  async loadGLTF(path: string): Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[] }> {
    const existing = this._getCached<{ scene: THREE.Group; animations: THREE.AnimationClip[] }>(path);
    if (existing) {
      existing.refCount++;
      // Clone the scene for independent use
      return {
        scene: existing.resource.scene.clone(),
        animations: existing.resource.animations,
      };
    }

    this.loadStarted.emit(path);

    const loader = this.loaders.get('gltf');
    if (!loader) {
      throw new Error(
        `[ThreeDot] GLTFLoader not registered. Register it with: resourceManager.registerLoader('gltf', new GLTFLoader())`
      );
    }

    return new Promise((resolve, reject) => {
      (loader as THREE.Loader & { load: (url: string, onLoad: (gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] }) => void, onProgress?: (e: ProgressEvent) => void, onError?: (e: unknown) => void) => void }).load(
        path,
        (gltf: { scene: THREE.Group; animations: THREE.AnimationClip[] }) => {
          this._store(path, 'gltf', gltf);
          this.loadCompleted.emit(path);
          resolve({
            scene: gltf.scene.clone(),
            animations: gltf.animations,
          });
        },
        undefined,
        (err) => {
          const error = err instanceof Error ? err : new Error(`Failed to load GLTF: ${path}`);
          this.loadError.emit(path, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Load an audio buffer.
   */
  async loadAudio(path: string): Promise<AudioBuffer> {
    const existing = this._getCached<AudioBuffer>(path);
    if (existing) {
      existing.refCount++;
      return existing.resource;
    }

    this.loadStarted.emit(path);

    const audioLoader = new THREE.AudioLoader(this.loadingManager);
    return new Promise<AudioBuffer>((resolve, reject) => {
      audioLoader.load(
        path,
        (buffer) => {
          this._store(path, 'audio', buffer);
          this.loadCompleted.emit(path);
          resolve(buffer);
        },
        undefined,
        (err) => {
          const error = err instanceof Error ? err : new Error(`Failed to load audio: ${path}`);
          this.loadError.emit(path, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Store a pre-created resource (material, geometry, etc.) in the cache.
   */
  store<T>(path: string, type: ResourceType, resource: T): void {
    this._store(path, type, resource);
  }

  /**
   * Get a cached resource by path. Increments reference count.
   */
  get<T>(path: string): T | undefined {
    const entry = this._getCached<T>(path);
    if (entry) {
      entry.refCount++;
      return entry.resource;
    }
    return undefined;
  }

  /**
   * Release a reference to a resource. Disposes when refCount reaches 0.
   */
  release(path: string): void {
    const entry = this.cache.get(path);
    if (!entry) return;

    entry.refCount--;
    if (entry.refCount <= 0) {
      this._disposeEntry(entry);
      this.cache.delete(path);
    }
  }

  /**
   * Check if a resource is cached.
   */
  has(path: string): boolean {
    return this.cache.has(path) && !this.cache.get(path)!.disposed;
  }

  /**
   * Get the reference count for a cached resource.
   */
  getRefCount(path: string): number {
    return this.cache.get(path)?.refCount ?? 0;
  }

  /**
   * Force-dispose a specific resource regardless of reference count.
   */
  forceDispose(path: string): void {
    const entry = this.cache.get(path);
    if (entry) {
      if (entry.refCount > 0) {
        console.warn(
          `[ThreeDot] Force-disposing "${path}" with ${entry.refCount} active references.`
        );
      }
      this._disposeEntry(entry);
      this.cache.delete(path);
    }
  }

  /**
   * Dispose all cached resources.
   */
  disposeAll(): void {
    for (const entry of this.cache.values()) {
      this._disposeEntry(entry);
    }
    this.cache.clear();
  }

  /**
   * Dispose the resource manager and all resources.
   */
  dispose(): void {
    this.disposeAll();
    this.loaders.clear();

    this.loadStarted.dispose();
    this.loadProgress.dispose();
    this.loadCompleted.dispose();
    this.loadError.dispose();
  }

  // ── Private ──

  private _store<T>(path: string, type: ResourceType, resource: T): void {
    this.cache.set(path, {
      type,
      path,
      resource,
      refCount: 1,
      disposed: false,
    });
  }

  private _getCached<T>(path: string): ResourceEntry<T> | undefined {
    const entry = this.cache.get(path);
    if (entry && !entry.disposed) {
      return entry as ResourceEntry<T>;
    }
    return undefined;
  }

  private _disposeEntry(entry: ResourceEntry): void {
    if (entry.disposed) return;
    entry.disposed = true;

    const res = entry.resource;

    // Dispose Three.js resources that have a dispose method
    if (res && typeof res === 'object' && 'dispose' in res && typeof (res as { dispose: () => void }).dispose === 'function') {
      (res as { dispose: () => void }).dispose();
    }

    // For GLTF entries, traverse and dispose the scene
    if (entry.type === 'gltf' && res && typeof res === 'object' && 'scene' in res) {
      const gltfScene = (res as { scene: THREE.Object3D }).scene;
      gltfScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            for (const mat of child.material) {
              this._disposeMaterial(mat);
            }
          } else if (child.material) {
            this._disposeMaterial(child.material);
          }
        }
      });
    }
  }

  private _disposeMaterial(material: THREE.Material): void {
    material.dispose();
    // Dispose textures referenced by the material
    for (const key of Object.keys(material)) {
      const value = (material as unknown as Record<string, unknown>)[key];
      if (value instanceof THREE.Texture) {
        value.dispose();
      }
    }
  }
}
