/**
 * ThreeDot Engine
 *
 * The main entry point that coordinates: renderer, scene tree, camera,
 * input system, frame scheduler, resource management, and diagnostics.
 */

import * as THREE from 'three';
import { SceneTree } from '../scene/SceneTree';
import { InputManager } from '../input/InputManager';
import { ResourceManager } from '../resources/ResourceManager';
import { Signal } from '../signals/Signal';
import { SignalBus } from '../signals/SignalBus';
import { PhysicsServer3D } from '../../physics/3d/PhysicsServer3D';
import { PhysicsServer2D } from '../../physics/2d/PhysicsServer2D';

/**
 * Configuration options for the ThreeDot Engine.
 */
export interface EngineConfig {
  /** The container element to render into */
  container: HTMLElement;

  /** Renderer width (defaults to container width) */
  width?: number;

  /** Renderer height (defaults to container height) */
  height?: number;

  /** Device pixel ratio (defaults to window.devicePixelRatio) */
  pixelRatio?: number;

  /** Enable antialiasing (default: true) */
  antialias?: boolean;

  /** Enable shadows (default: false) */
  shadows?: boolean;

  /** Shadow map type (default: PCFSoftShadowMap) */
  shadowMapType?: THREE.ShadowMapType;

  /** Tone mapping (default: ACESFilmicToneMapping) */
  toneMapping?: THREE.ToneMapping;

  /** Tone mapping exposure (default: 1) */
  toneMappingExposure?: number;

  /** Background color (default: 0x1a1a2e) */
  backgroundColor?: THREE.ColorRepresentation;

  /** Output color space (default: SRGBColorSpace) */
  outputColorSpace?: THREE.ColorSpace;

  /** Alpha (transparent background) (default: false) */
  alpha?: boolean;

  /** Physics timestep in seconds (default: 1/60) */
  physicsTimestep?: number;

  /** Maximum delta time cap (default: 0.1s) */
  maxDelta?: number;

  /** Auto-start the engine loop (default: true) */
  autoStart?: boolean;

  /** Auto-resize on window resize (default: true) */
  autoResize?: boolean;
}

/**
 * Engine diagnostics and performance metrics.
 */
export interface EngineDiagnostics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  nodeCount: number;
  frameCount: number;
  elapsedTime: number;
}

/**
 * The ThreeDot Engine class. Create one per application.
 */
export class Engine {
  /** Three.js WebGL renderer */
  readonly renderer: THREE.WebGLRenderer;

  /** The scene tree */
  readonly sceneTree: SceneTree;

  /** The Three.js scene used for rendering */
  readonly threeScene: THREE.Scene;

  /** The input manager */
  readonly input: InputManager;

  /** The resource manager */
  readonly resources: ResourceManager;
  readonly physics3D = new PhysicsServer3D();
  readonly physics2D = new PhysicsServer2D();

  /** The main camera (settable) */
  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;

  /** The container element */
  readonly container: HTMLElement;

  /** The canvas element */
  readonly canvas: HTMLCanvasElement;

  // ── Timing ──
  private _running = false;
  private _animationFrameId: number | null = null;
  private _lastTime = 0;
  private _elapsedTime = 0;
  private _frameCount = 0;
  private _physicsAccumulator = 0;
  private _physicsTimestep: number;
  private _maxDelta: number;

  // ── FPS tracking ──
  private _fpsFrames = 0;
  private _fpsLastTime = 0;
  private _currentFps = 0;

  // ── Resize ──
  private _autoResize: boolean;
  private _resizeObserver: ResizeObserver | null = null;

  // ── Visibility ──
  private _visibilityHandler: (() => void) | null = null;
  private _wasRunningBeforeHidden = false;

  // ── Signals ──
  readonly started = new Signal<[]>('engine_started');
  readonly stopped = new Signal<[]>('engine_stopped');
  readonly resized = new Signal<[number, number]>('engine_resized');
  readonly frameProcessed = new Signal<[number]>('frame_processed');

  constructor(config: EngineConfig) {
    this.container = config.container;

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: config.antialias ?? true,
      alpha: config.alpha ?? false,
      powerPreference: 'high-performance',
    });

    this.canvas = this.renderer.domElement;

    // Configure renderer
    const width = config.width ?? (config.container.clientWidth > 0 ? config.container.clientWidth : (typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 800));
    const height = config.height ?? (config.container.clientHeight > 0 ? config.container.clientHeight : (typeof window !== 'undefined' && window.innerHeight > 0 ? window.innerHeight : 600));
    const pixelRatio = config.pixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio : 1);

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(pixelRatio);

    if (config.shadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = config.shadowMapType ?? THREE.PCFSoftShadowMap;
    }

    this.renderer.toneMapping = config.toneMapping ?? THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = config.toneMappingExposure ?? 1;
    this.renderer.outputColorSpace = config.outputColorSpace ?? THREE.SRGBColorSpace;

    // Append canvas to container
    config.container.appendChild(this.canvas);

    // Create Three.js scene
    this.threeScene = new THREE.Scene();
    if (config.backgroundColor !== undefined) {
      this.threeScene.background = new THREE.Color(config.backgroundColor);
    } else {
      this.threeScene.background = new THREE.Color(0x1a1a2e);
    }

    // Create default camera
    const aspect = height > 0 ? width / height : 1;
    this._camera = new THREE.PerspectiveCamera(
      75,
      aspect,
      0.1,
      1000
    );
    this._camera.position.set(0, 2, 5);

    // Initialize scene tree
    this.sceneTree = new SceneTree();
    this.sceneTree.root.setMeta('__engine', this);

    // Initialize input
    this.input = new InputManager();
    this.input.initialize(this.canvas);

    // Initialize resources
    this.resources = new ResourceManager();

    // Initialize HTML DOM Signal bridge
    SignalBus.initDOMBridge(config.container);

    // Timing config
    this._physicsTimestep = config.physicsTimestep ?? 1 / 60;
    this._maxDelta = config.maxDelta ?? 0.1;

    // Auto-resize
    this._autoResize = config.autoResize ?? true;
    if (this._autoResize) {
      this._setupResizeObserver();
    }

    // Visibility change handling
    this._setupVisibilityHandler();

    // Auto-start
    if (config.autoStart ?? true) {
      this.start();
    }
  }

  // ── Camera ──

  get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    return this._camera;
  }

  set camera(cam: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    this._camera = cam;
    const size = this.viewportSize;
    if (size.x > 0 && size.y > 0) {
      if (cam instanceof THREE.PerspectiveCamera) {
        cam.aspect = size.x / size.y;
        cam.updateProjectionMatrix();
      } else if (cam instanceof THREE.OrthographicCamera) {
        const aspect = size.x / size.y;
        const frustumHeight = cam.top - cam.bottom;
        cam.left = (-frustumHeight * aspect) / 2;
        cam.right = (frustumHeight * aspect) / 2;
        cam.updateProjectionMatrix();
      }
    }
  }

  get viewportSize(): THREE.Vector2 {
    const size = new THREE.Vector2();
    this.renderer.getSize(size);
    return size;
  }

  // ── Engine Control ──

  /**
   * Start the engine loop.
   */
  start(): void {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now() / 1000;
    this._fpsLastTime = this._lastTime;
    this._animationFrameId = requestAnimationFrame(this._loop);
    this.started.emit();
  }

  /**
   * Stop the engine loop.
   */
  stop(): void {
    if (!this._running) return;
    this._running = false;
    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
    this.stopped.emit();
  }

  /**
   * Whether the engine loop is currently running.
   */
  get isRunning(): boolean {
    return this._running;
  }

  /**
   * Get the elapsed time since engine started.
   */
  get elapsedTime(): number {
    return this._elapsedTime;
  }

  /**
   * Get the total frame count.
   */
  get frameCount(): number {
    return this._frameCount;
  }

  // ── Main Loop ──

  private _loop = (timestamp: number): void => {
    if (!this._running) return;

    this._animationFrameId = requestAnimationFrame(this._loop);

    const currentTime = timestamp / 1000;
    let delta = currentTime - this._lastTime;
    this._lastTime = currentTime;

    // Cap delta
    if (delta > this._maxDelta) {
      delta = this._maxDelta;
    }

    this._elapsedTime += delta;
    this._frameCount++;

    // FPS tracking
    this._fpsFrames++;
    if (currentTime - this._fpsLastTime >= 1.0) {
      this._currentFps = this._fpsFrames / (currentTime - this._fpsLastTime);
      this._fpsFrames = 0;
      this._fpsLastTime = currentTime;
    }

    // Poll gamepads
    this.input.pollGamepads();

    // Physics processing (fixed timestep)
    this._physicsAccumulator += delta;
    while (this._physicsAccumulator >= this._physicsTimestep) {
      if (this.physics3D.isInitialized) {
        this.physics3D.step(this._physicsTimestep);
      }
      if (this.physics2D.isInitialized) {
        this.physics2D.step(this._physicsTimestep);
      }
      this.sceneTree.physicsProcessTree(this._physicsTimestep);
      this._physicsAccumulator -= this._physicsTimestep;
    }

    // Frame processing
    this.sceneTree.processTree(delta);

    // Render
    this.renderer.render(this.threeScene, this._camera);

    // Clear per-frame input state
    this.input.endFrame();

    this.frameProcessed.emit(delta);
  };

  // ── Resize ──

  private _setupResizeObserver(): void {
    this._resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.container) {
          const { width, height } = entry.contentRect;
          this._handleResize(width, height);
        }
      }
    });
    this._resizeObserver.observe(this.container);
  }

  private _handleResize(width: number, height: number): void {
    if (width === 0 || height === 0) return;

    this.renderer.setSize(width, height);

    if (this._camera instanceof THREE.PerspectiveCamera) {
      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();
    } else if (this._camera instanceof THREE.OrthographicCamera) {
      const aspect = width / height;
      const frustumHeight = this._camera.top - this._camera.bottom;
      this._camera.left = (-frustumHeight * aspect) / 2;
      this._camera.right = (frustumHeight * aspect) / 2;
      this._camera.updateProjectionMatrix();
    }

    this.resized.emit(width, height);
  }

  /**
   * Manually trigger a resize.
   */
  resize(width: number, height: number): void {
    this._handleResize(width, height);
  }

  // ── Visibility ──

  private _setupVisibilityHandler(): void {
    this._visibilityHandler = () => {
      if (document.hidden) {
        this._wasRunningBeforeHidden = this._running;
        if (this._running) {
          this.stop();
        }
      } else {
        if (this._wasRunningBeforeHidden) {
          this.start();
        }
      }
    };
    document.addEventListener('visibilitychange', this._visibilityHandler);
  }

  // ── Diagnostics ──

  /**
   * Get current engine diagnostics.
   */
  getDiagnostics(): EngineDiagnostics {
    const info = this.renderer.info;
    let nodeCount = 0;
    for (const _node of this.sceneTree.root.traverse()) {
      nodeCount++;
    }
    return {
      fps: Math.round(this._currentFps),
      frameTime: this._currentFps > 0 ? 1000 / this._currentFps : 0,
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      nodeCount,
      frameCount: this._frameCount,
      elapsedTime: this._elapsedTime,
    };
  }

  // ── Cleanup ──

  /**
   * Dispose the entire engine and all managed resources.
   */
  dispose(): void {
    this.stop();

    // Remove resize observer
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // Remove visibility handler
    if (this._visibilityHandler) {
      document.removeEventListener('visibilitychange', this._visibilityHandler);
      this._visibilityHandler = null;
    }

    // Dispose subsystems
    this.physics3D.dispose();
    this.physics2D.dispose();
    this.input.dispose();
    this.resources.dispose();
    this.sceneTree.dispose();

    // Dispose Three.js scene contents
    this.threeScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose();
        if (Array.isArray(child.material)) {
          for (const mat of child.material) mat.dispose();
        } else if (child.material) {
          child.material.dispose();
        }
      }
    });
    this.threeScene.clear();

    // Dispose renderer
    this.renderer.dispose();

    // Remove canvas
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }

    // Dispose signals
    this.started.dispose();
    this.stopped.dispose();
    this.resized.dispose();
    this.frameProcessed.dispose();
  }
}
