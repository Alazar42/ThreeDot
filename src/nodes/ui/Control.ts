/**
 * Control — Base UI node for the Godot-inspired UI system
 */

import * as THREE from 'three';
import { Node, NodeOptions } from '../../core/node/Node';
import { Signal } from '../../core/signals/Signal';
import {
  Rect2D,
  SizeFlags,
  MouseFilter,
  FocusMode,
  LayoutPreset,
} from './types';
import { Theme, defaultTheme } from './Theme';

export interface ControlOptions extends NodeOptions {
  position?: THREE.Vector2 | { x: number; y: number };
  size?: THREE.Vector2 | { x: number; y: number };
  customMinimumSize?: THREE.Vector2 | { x: number; y: number };
  minSize?: THREE.Vector2 | { x: number; y: number };
  anchorLeft?: number;
  anchorTop?: number;
  anchorRight?: number;
  anchorBottom?: number;
  offsetLeft?: number;
  offsetTop?: number;
  offsetRight?: number;
  offsetBottom?: number;
  sizeFlagsHorizontal?: SizeFlags | number;
  sizeFlagsVertical?: SizeFlags | number;
  mouseFilter?: MouseFilter;
  focusMode?: FocusMode;
  visible?: boolean;
  theme?: Theme;
}

export class Control extends Node {
  readonly element: HTMLElement;

  private _position = new THREE.Vector2(0, 0);
  private _size = new THREE.Vector2(0, 0);
  private _customMinimumSize = new THREE.Vector2(0, 0);

  anchorLeft = 0;
  anchorTop = 0;
  anchorRight = 0;
  anchorBottom = 0;

  offsetLeft = 0;
  offsetTop = 0;
  offsetRight = 0;
  offsetBottom = 0;

  sizeFlagsHorizontal: number = SizeFlags.FILL;
  sizeFlagsVertical: number = SizeFlags.FILL;

  mouseFilter: MouseFilter = MouseFilter.STOP;
  focusMode: FocusMode = FocusMode.NONE;

  private _visible = true;
  private _theme: Theme = defaultTheme;

  // ── Signals ──
  readonly guiInput = new Signal<[Event]>('gui_input');
  readonly mouseEntered = new Signal<[]>('mouse_entered');
  readonly mouseExited = new Signal<[]>('mouse_exited');
  readonly focusEntered = new Signal<[]>('focus_entered');
  readonly focusExited = new Signal<[]>('focus_exited');
  readonly resized = new Signal<[]>('resized');
  readonly minimumSizeChanged = new Signal<[]>('minimum_size_changed');

  constructor(options?: ControlOptions) {
    super(options);

    this.element = this._createElement();
    this.element.setAttribute('data-threedot-node', this.name);
    this._setupElementStyle();
    this._setupElementEvents();

    const min = options?.customMinimumSize ?? options?.minSize;
    if (min) {
      this.customMinimumSize = new THREE.Vector2(min.x, min.y);
    }
    if (options?.position) {
      this.position = new THREE.Vector2(options.position.x, options.position.y);
    }
    if (options?.size) {
      this.size = new THREE.Vector2(options.size.x, options.size.y);
    }

    if (options?.anchorLeft !== undefined) this.anchorLeft = options.anchorLeft;
    if (options?.anchorTop !== undefined) this.anchorTop = options.anchorTop;
    if (options?.anchorRight !== undefined) this.anchorRight = options.anchorRight;
    if (options?.anchorBottom !== undefined) this.anchorBottom = options.anchorBottom;

    if (options?.offsetLeft !== undefined) this.offsetLeft = options.offsetLeft;
    if (options?.offsetTop !== undefined) this.offsetTop = options.offsetTop;
    if (options?.offsetRight !== undefined) this.offsetRight = options.offsetRight;
    if (options?.offsetBottom !== undefined) this.offsetBottom = options.offsetBottom;

    if (options?.sizeFlagsHorizontal !== undefined) this.sizeFlagsHorizontal = options.sizeFlagsHorizontal;
    if (options?.sizeFlagsVertical !== undefined) this.sizeFlagsVertical = options.sizeFlagsVertical;

    if (options?.mouseFilter !== undefined) this.mouseFilter = options.mouseFilter;
    if (options?.focusMode !== undefined) this.focusMode = options.focusMode;
    if (options?.visible !== undefined) this.visible = options.visible;
    if (options?.theme) this._theme = options.theme;
  }

  protected _createElement(): HTMLElement {
    return document.createElement('div');
  }

  private _setupElementStyle(): void {
    const s = this.element.style;
    s.position = 'absolute';
    s.boxSizing = 'border-box';
    s.userSelect = 'none';
    s.fontFamily = this._theme.fontFamily;
    s.fontSize = `${this._theme.fontSize}px`;
    s.color = this._theme.colors.text;
  }

  private _setupElementEvents(): void {
    this.element.addEventListener('pointerenter', () => this.mouseEntered.emit());
    this.element.addEventListener('pointerleave', () => this.mouseExited.emit());
    this.element.addEventListener('focus', () => this.focusEntered.emit());
    this.element.addEventListener('blur', () => this.focusExited.emit());
    this.element.addEventListener('pointerdown', (e) => this.guiInput.emit(e));
    this.element.addEventListener('keydown', (e) => this.guiInput.emit(e));
  }

  // ── Accessors ──

  get position(): THREE.Vector2 {
    return this._position.clone();
  }

  set position(pos: THREE.Vector2 | { x: number; y: number }) {
    if (this._position.x !== pos.x || this._position.y !== pos.y) {
      this._position.set(pos.x, pos.y);
      this.element.style.left = `${pos.x}px`;
      this.element.style.top = `${pos.y}px`;
    }
  }

  get size(): THREE.Vector2 {
    return this._size.clone();
  }

  set size(s: THREE.Vector2 | { x: number; y: number }) {
    const min = this.getCombinedMinimumSize();
    const w = Math.max(min.x, s.x);
    const h = Math.max(min.y, s.y);

    if (this._size.x !== w || this._size.y !== h) {
      this._size.set(w, h);
      this.element.style.width = `${w}px`;
      this.element.style.height = `${h}px`;
      this.resized.emit();
      this._onSizeChanged();
    }
  }

  get customMinimumSize(): THREE.Vector2 {
    return this._customMinimumSize.clone();
  }

  set customMinimumSize(min: THREE.Vector2 | { x: number; y: number }) {
    this._customMinimumSize.set(min.x, min.y);
    this.minimumSizeChanged.emit();
    // Re-enforce current size bounds
    this.size = this._size;
  }

  get minSize(): THREE.Vector2 {
    return this.customMinimumSize;
  }

  set minSize(min: THREE.Vector2 | { x: number; y: number }) {
    this.customMinimumSize = min;
  }

  get visible(): boolean {
    return this._visible;
  }

  set visible(val: boolean) {
    this._visible = val;
    this.element.style.display = val ? '' : 'none';
  }

  get theme(): Theme {
    return this._theme;
  }

  set theme(t: Theme) {
    this._theme = t;
    this._setupElementStyle();
  }

  // ── Minimum Size Calculation ──

  getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(0, 0);
  }

  getCombinedMinimumSize(): THREE.Vector2 {
    const intrinsic = this.getMinimumSize();
    return new THREE.Vector2(
      Math.max(this._customMinimumSize.x, intrinsic.x),
      Math.max(this._customMinimumSize.y, intrinsic.y)
    );
  }

  getGlobalRect(): Rect2D {
    const rect = this.element.getBoundingClientRect();
    return {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  // ── Layout Presets ──

  setAnchorsPreset(preset: LayoutPreset, keepOffsets = false): void {
    const prevPos = this.position;
    const prevSize = this.size;

    switch (preset) {
      case LayoutPreset.TOP_LEFT:
        this.anchorLeft = 0; this.anchorTop = 0; this.anchorRight = 0; this.anchorBottom = 0;
        break;
      case LayoutPreset.TOP_RIGHT:
        this.anchorLeft = 1; this.anchorTop = 0; this.anchorRight = 1; this.anchorBottom = 0;
        break;
      case LayoutPreset.BOTTOM_LEFT:
        this.anchorLeft = 0; this.anchorTop = 1; this.anchorRight = 0; this.anchorBottom = 1;
        break;
      case LayoutPreset.BOTTOM_RIGHT:
        this.anchorLeft = 1; this.anchorTop = 1; this.anchorRight = 1; this.anchorBottom = 1;
        break;
      case LayoutPreset.CENTER_LEFT:
        this.anchorLeft = 0; this.anchorTop = 0.5; this.anchorRight = 0; this.anchorBottom = 0.5;
        break;
      case LayoutPreset.CENTER_TOP:
        this.anchorLeft = 0.5; this.anchorTop = 0; this.anchorRight = 0.5; this.anchorBottom = 0;
        break;
      case LayoutPreset.CENTER_RIGHT:
        this.anchorLeft = 1; this.anchorTop = 0.5; this.anchorRight = 1; this.anchorBottom = 0.5;
        break;
      case LayoutPreset.CENTER_BOTTOM:
        this.anchorLeft = 0.5; this.anchorTop = 1; this.anchorRight = 0.5; this.anchorBottom = 1;
        break;
      case LayoutPreset.CENTER:
        this.anchorLeft = 0.5; this.anchorTop = 0.5; this.anchorRight = 0.5; this.anchorBottom = 0.5;
        break;
      case LayoutPreset.LEFT_WIDE:
        this.anchorLeft = 0; this.anchorTop = 0; this.anchorRight = 0; this.anchorBottom = 1;
        break;
      case LayoutPreset.TOP_WIDE:
        this.anchorLeft = 0; this.anchorTop = 0; this.anchorRight = 1; this.anchorBottom = 0;
        break;
      case LayoutPreset.RIGHT_WIDE:
        this.anchorLeft = 1; this.anchorTop = 0; this.anchorRight = 1; this.anchorBottom = 1;
        break;
      case LayoutPreset.BOTTOM_WIDE:
        this.anchorLeft = 0; this.anchorTop = 1; this.anchorRight = 1; this.anchorBottom = 1;
        break;
      case LayoutPreset.FULL_RECT:
        this.anchorLeft = 0; this.anchorTop = 0; this.anchorRight = 1; this.anchorBottom = 1;
        break;
    }

    if (!keepOffsets) {
      if (preset === LayoutPreset.FULL_RECT) {
        this.offsetLeft = 0; this.offsetTop = 0; this.offsetRight = 0; this.offsetBottom = 0;
      }
    } else {
      this.position = prevPos;
      this.size = prevSize;
    }

    this.updateLayout();
  }

  updateLayout(): void {
    const parentControl = this._findParentControl();
    let parentWidth = 0;
    let parentHeight = 0;

    if (parentControl) {
      parentWidth = parentControl.size.x;
      parentHeight = parentControl.size.y;
    } else {
      const engine = this._findEngine();
      if (engine) {
        parentWidth = engine.viewportSize.x;
        parentHeight = engine.viewportSize.y;
      }
    }

    if (parentWidth > 0 && parentHeight > 0) {
      const x = parentWidth * this.anchorLeft + this.offsetLeft;
      const y = parentHeight * this.anchorTop + this.offsetTop;
      const w = Math.max(0, parentWidth * this.anchorRight + this.offsetRight - x);
      const h = Math.max(0, parentHeight * this.anchorBottom + this.offsetBottom - y);

      if (this.anchorRight !== this.anchorLeft || this.anchorBottom !== this.anchorTop) {
        this.position = new THREE.Vector2(x, y);
        this.size = new THREE.Vector2(w, h);
      }
    }
  }

  protected _onSizeChanged(): void {
    // Override in subclasses (e.g. Containers) to lay out children
  }

  // ── Lifecycle & Hierarchy ──

  protected override _enterTree(): void {
    super._enterTree();
    this._attachToDOM();
    this.updateLayout();
  }

  protected override _exitTree(): void {
    this._detachFromDOM();
    super._exitTree();
  }

  protected override _destroy(): void {
    this._detachFromDOM();
    this.element.remove();
    super._destroy();
  }

  private _attachToDOM(): void {
    const parentControl = this._findParentControl();
    if (parentControl) {
      parentControl.element.appendChild(this.element);
    } else {
      const engine = this._findEngine();
      if (engine) {
        let uiRoot = engine.container.querySelector('.threedot-ui-root') as HTMLElement | null;
        if (!uiRoot) {
          uiRoot = document.createElement('div');
          uiRoot.className = 'threedot-ui-root';
          uiRoot.style.position = 'absolute';
          uiRoot.style.top = '0';
          uiRoot.style.left = '0';
          uiRoot.style.width = '100%';
          uiRoot.style.height = '100%';
          uiRoot.style.pointerEvents = 'none';
          uiRoot.style.overflow = 'hidden';
          engine.container.style.position = 'relative';
          engine.container.appendChild(uiRoot);
        }
        uiRoot.appendChild(this.element);
      }
    }
  }

  private _detachFromDOM(): void {
    if (this.element.parentElement) {
      this.element.parentElement.removeChild(this.element);
    }
  }

  private _findParentControl(): Control | null {
    let current = this.parent;
    while (current) {
      if (current instanceof Control) return current;
      current = current.parent;
    }
    return null;
  }

  private _findEngine(): import('../../core/engine/Engine').Engine | null {
    const root = this.getRoot();
    return root.getMeta<import('../../core/engine/Engine').Engine>('__engine') ?? null;
  }
}
