/**
 * Label, ColorRect, TextureRect, Separator, HSeparator, VSeparator
 */

import * as THREE from 'three';
import { Control, ControlOptions } from './Control';
import { HorizontalAlignment, VerticalAlignment } from './types';

// ── Label ──

export interface LabelOptions extends ControlOptions {
  text?: string;
  horizontalAlignment?: HorizontalAlignment;
  verticalAlignment?: VerticalAlignment;
  autowrap?: boolean;
}

export class Label extends Control {
  private _text = '';
  private _horizontalAlignment: HorizontalAlignment = HorizontalAlignment.LEFT;
  private _verticalAlignment: VerticalAlignment = VerticalAlignment.TOP;
  private _autowrap = false;

  constructor(options?: LabelOptions) {
    super(options);
    this.element.style.display = 'flex';
    this.element.style.alignItems = 'flex-start';

    if (options?.text !== undefined) this.text = options.text;
    if (options?.horizontalAlignment) this.horizontalAlignment = options.horizontalAlignment;
    if (options?.verticalAlignment) this.verticalAlignment = options.verticalAlignment;
    if (options?.autowrap !== undefined) this.autowrap = options.autowrap;
  }

  get text(): string {
    return this._text;
  }

  set text(val: string) {
    this._text = val;
    this.element.textContent = val;
    this.minimumSizeChanged.emit();
  }

  get horizontalAlignment(): HorizontalAlignment {
    return this._horizontalAlignment;
  }

  set horizontalAlignment(align: HorizontalAlignment) {
    this._horizontalAlignment = align;
    if (align === HorizontalAlignment.CENTER) {
      this.element.style.justifyContent = 'center';
      this.element.style.textAlign = 'center';
    } else if (align === HorizontalAlignment.RIGHT) {
      this.element.style.justifyContent = 'flex-end';
      this.element.style.textAlign = 'right';
    } else {
      this.element.style.justifyContent = 'flex-start';
      this.element.style.textAlign = 'left';
    }
  }

  get verticalAlignment(): VerticalAlignment {
    return this._verticalAlignment;
  }

  set verticalAlignment(align: VerticalAlignment) {
    this._verticalAlignment = align;
    if (align === VerticalAlignment.CENTER) {
      this.element.style.alignItems = 'center';
    } else if (align === VerticalAlignment.BOTTOM) {
      this.element.style.alignItems = 'flex-end';
    } else {
      this.element.style.alignItems = 'flex-start';
    }
  }

  get autowrap(): boolean {
    return this._autowrap;
  }

  set autowrap(val: boolean) {
    this._autowrap = val;
    this.element.style.whiteSpace = val ? 'normal' : 'nowrap';
    this.element.style.wordBreak = val ? 'break-word' : 'normal';
  }

  override getMinimumSize(): THREE.Vector2 {
    const textLen = this._text.length;
    const approxW = textLen * (this.theme.fontSize * 0.6);
    const approxH = this.theme.fontSize * 1.4;
    return new THREE.Vector2(Math.max(20, approxW), Math.max(16, approxH));
  }
}

// ── ColorRect ──

export interface ColorRectOptions extends ControlOptions {
  color?: string;
}

export class ColorRect extends Control {
  private _color: string;

  constructor(options?: ColorRectOptions) {
    super(options);
    this._color = options?.color ?? '#4c6ef5';
    this.element.style.backgroundColor = this._color;
  }

  get color(): string {
    return this._color;
  }

  set color(val: string) {
    this._color = val;
    this.element.style.backgroundColor = val;
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(10, 10);
  }
}

// ── TextureRect ──

export type TextureStretchMode = 'scale' | 'keep' | 'keepCentered' | 'keepAspect';

export interface TextureRectOptions extends ControlOptions {
  textureUrl?: string;
  stretchMode?: TextureStretchMode;
}

export class TextureRect extends Control {
  private _img: HTMLImageElement;
  private _stretchMode: TextureStretchMode = 'scale';

  constructor(options?: TextureRectOptions) {
    super(options);
    this._img = document.createElement('img');
    this._img.style.width = '100%';
    this._img.style.height = '100%';
    this._img.style.display = 'block';
    this.element.appendChild(this._img);

    if (options?.textureUrl) {
      this.textureUrl = options.textureUrl;
    }
    if (options?.stretchMode) {
      this.stretchMode = options.stretchMode;
    }
  }

  get textureUrl(): string {
    return this._img.src;
  }

  set textureUrl(url: string) {
    this._img.src = url;
  }

  get stretchMode(): TextureStretchMode {
    return this._stretchMode;
  }

  set stretchMode(mode: TextureStretchMode) {
    this._stretchMode = mode;
    if (mode === 'keep') {
      this._img.style.objectFit = 'none';
    } else if (mode === 'keepCentered') {
      this._img.style.objectFit = 'none';
      this._img.style.objectPosition = 'center';
    } else if (mode === 'keepAspect') {
      this._img.style.objectFit = 'contain';
    } else {
      this._img.style.objectFit = 'fill';
    }
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(16, 16);
  }
}

// ── Separator, HSeparator, VSeparator ──

export class Separator extends Control {
  constructor(options?: ControlOptions) {
    super(options);
    this.mouseFilter = 2; // MouseFilter.IGNORE
  }
}

export class HSeparator extends Separator {
  constructor(options?: ControlOptions) {
    super(options);
    this.element.style.borderTop = `1px solid ${this.theme.colors.border}`;
    this.element.style.margin = '4px 0';
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(10, 4);
  }
}

export class VSeparator extends Separator {
  constructor(options?: ControlOptions) {
    super(options);
    this.element.style.borderLeft = `1px solid ${this.theme.colors.border}`;
    this.element.style.margin = '0 4px';
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(4, 10);
  }
}
