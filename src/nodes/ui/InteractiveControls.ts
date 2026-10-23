/**
 * Interactive Controls — Button, CheckBox, RadioButton, LineEdit, TextEdit, ProgressBar, Slider, MenuButton, OptionButton
 */

import * as THREE from 'three';
import { Control, ControlOptions } from './Control';
import { Signal } from '../../core/signals/Signal';

// ── Button ──

export interface ButtonOptions extends ControlOptions {
  text?: string;
  disabled?: boolean;
  toggleMode?: boolean;
  pressed?: boolean;
}

export class Button extends Control {
  readonly pressed = new Signal<[]>('pressed');
  readonly buttonDown = new Signal<[]>('button_down');
  readonly buttonUp = new Signal<[]>('button_up');
  readonly toggled = new Signal<[boolean]>('toggled');

  private _text = '';
  private _disabled = false;
  private _toggleMode = false;
  private _isPressed = false;
  private _buttonElement: HTMLButtonElement;

  constructor(options?: ButtonOptions) {
    super(options);

    this._buttonElement = document.createElement('button');
    this._buttonElement.style.width = '100%';
    this._buttonElement.style.height = '100%';
    this._buttonElement.style.cursor = 'pointer';
    this._buttonElement.style.fontFamily = this.theme.fontFamily;
    this._buttonElement.style.fontSize = `${this.theme.fontSize}px`;
    this._buttonElement.style.color = this.theme.colors.text;
    this.theme.buttonNormal.applyTo(this._buttonElement);

    this.element.appendChild(this._buttonElement);

    if (options?.text !== undefined) this.text = options.text;
    if (options?.disabled !== undefined) this.disabled = options.disabled;
    if (options?.toggleMode !== undefined) this.toggleMode = options.toggleMode;
    if (options?.pressed !== undefined) this.isPressed = options.pressed;

    this._setupButtonEvents();
  }

  private _setupButtonEvents(): void {
    this._buttonElement.addEventListener('mouseenter', () => {
      if (!this._disabled && !this._isPressed) {
        this.theme.buttonHover.applyTo(this._buttonElement);
      }
    });

    this._buttonElement.addEventListener('mouseleave', () => {
      if (!this._disabled && !this._isPressed) {
        this.theme.buttonNormal.applyTo(this._buttonElement);
      }
    });

    this._buttonElement.addEventListener('mousedown', () => {
      if (this._disabled) return;
      this.buttonDown.emit();
      if (!this._toggleMode) {
        this.theme.buttonPressed.applyTo(this._buttonElement);
      }
    });

    this._buttonElement.addEventListener('mouseup', () => {
      if (this._disabled) return;
      this.buttonUp.emit();
      if (!this._toggleMode) {
        this.theme.buttonHover.applyTo(this._buttonElement);
      }
    });

    this._buttonElement.addEventListener('click', () => {
      if (this._disabled) return;
      if (this._toggleMode) {
        this.isPressed = !this._isPressed;
        this.toggled.emit(this._isPressed);
      }
      this.pressed.emit();
    });
  }

  get text(): string {
    return this._text;
  }

  set text(val: string) {
    this._text = val;
    this._buttonElement.textContent = val;
    this.minimumSizeChanged.emit();
  }

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(val: boolean) {
    this._disabled = val;
    this._buttonElement.disabled = val;
    this._buttonElement.style.opacity = val ? '0.5' : '1.0';
    this._buttonElement.style.cursor = val ? 'not-allowed' : 'pointer';
  }

  get toggleMode(): boolean {
    return this._toggleMode;
  }

  set toggleMode(val: boolean) {
    this._toggleMode = val;
  }

  get isPressed(): boolean {
    return this._isPressed;
  }

  set isPressed(val: boolean) {
    this._isPressed = val;
    if (val) {
      this.theme.buttonPressed.applyTo(this._buttonElement);
      this._buttonElement.style.borderColor = this.theme.colors.primary;
    } else {
      this.theme.buttonNormal.applyTo(this._buttonElement);
    }
  }

  override getMinimumSize(): THREE.Vector2 {
    const textLen = this._text.length;
    const w = Math.max(64, textLen * (this.theme.fontSize * 0.6) + 24);
    const h = Math.max(32, this.theme.fontSize + 16);
    return new THREE.Vector2(w, h);
  }
}

// ── CheckBox ──

export interface CheckBoxOptions extends ControlOptions {
  text?: string;
  checked?: boolean;
}

export class CheckBox extends Control {
  readonly toggled = new Signal<[boolean]>('toggled');

  private _input: HTMLInputElement;
  private _label: HTMLLabelElement;

  constructor(options?: CheckBoxOptions) {
    super(options);

    this._label = document.createElement('label');
    this._label.style.display = 'inline-flex';
    this._label.style.alignItems = 'center';
    this._label.style.gap = '8px';
    this._label.style.cursor = 'pointer';
    this._label.style.userSelect = 'none';

    this._input = document.createElement('input');
    this._input.type = 'checkbox';
    this._input.style.accentColor = this.theme.colors.primary;
    this._input.checked = options?.checked ?? false;

    this._input.addEventListener('change', () => {
      this.toggled.emit(this._input.checked);
    });

    const span = document.createElement('span');
    span.textContent = options?.text ?? '';

    this._label.appendChild(this._input);
    this._label.appendChild(span);
    this.element.appendChild(this._label);
  }

  get checked(): boolean {
    return this._input.checked;
  }

  set checked(val: boolean) {
    this._input.checked = val;
  }

  get text(): string {
    return this._label.querySelector('span')?.textContent ?? '';
  }

  set text(val: string) {
    const span = this._label.querySelector('span');
    if (span) span.textContent = val;
  }

  override getMinimumSize(): THREE.Vector2 {
    const textLen = this.text.length;
    return new THREE.Vector2(Math.max(24, textLen * 8 + 32), 24);
  }
}

// ── RadioButton ──

export interface RadioButtonOptions extends ControlOptions {
  text?: string;
  groupName?: string;
  checked?: boolean;
}

export class RadioButton extends Control {
  readonly toggled = new Signal<[boolean]>('toggled');

  private _input: HTMLInputElement;
  private _label: HTMLLabelElement;

  constructor(options?: RadioButtonOptions) {
    super(options);

    this._label = document.createElement('label');
    this._label.style.display = 'inline-flex';
    this._label.style.alignItems = 'center';
    this._label.style.gap = '8px';
    this._label.style.cursor = 'pointer';

    this._input = document.createElement('input');
    this._input.type = 'radio';
    this._input.name = options?.groupName ?? 'default-radio-group';
    this._input.style.accentColor = this.theme.colors.primary;
    this._input.checked = options?.checked ?? false;

    this._input.addEventListener('change', () => {
      this.toggled.emit(this._input.checked);
    });

    const span = document.createElement('span');
    span.textContent = options?.text ?? '';

    this._label.appendChild(this._input);
    this._label.appendChild(span);
    this.element.appendChild(this._label);
  }

  get checked(): boolean {
    return this._input.checked;
  }

  set checked(val: boolean) {
    this._input.checked = val;
  }

  override getMinimumSize(): THREE.Vector2 {
    const span = this._label.querySelector('span');
    const textLen = span?.textContent?.length ?? 0;
    return new THREE.Vector2(Math.max(24, textLen * 8 + 32), 24);
  }
}

// ── LineEdit ──

export interface LineEditOptions extends ControlOptions {
  text?: string;
  placeholderText?: string;
  secret?: boolean;
}

export class LineEdit extends Control {
  readonly textChanged = new Signal<[string]>('text_changed');
  readonly textSubmitted = new Signal<[string]>('text_submitted');

  private _input: HTMLInputElement;

  constructor(options?: LineEditOptions) {
    super(options);

    this._input = document.createElement('input');
    this._input.type = (options?.secret ?? false) ? 'password' : 'text';
    this._input.style.width = '100%';
    this._input.style.height = '100%';
    this._input.style.boxSizing = 'border-box';
    this._input.style.backgroundColor = this.theme.colors.surface;
    this._input.style.border = `1px solid ${this.theme.colors.border}`;
    this._input.style.borderRadius = '4px';
    this._input.style.padding = '6px 10px';
    this._input.style.color = this.theme.colors.text;
    this._input.style.fontFamily = this.theme.fontFamily;
    this._input.style.fontSize = `${this.theme.fontSize}px`;
    this._input.style.outline = 'none';

    if (options?.text !== undefined) this._input.value = options.text;
    if (options?.placeholderText) this._input.placeholder = options.placeholderText;

    this._input.addEventListener('input', () => {
      this.textChanged.emit(this._input.value);
    });

    this._input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.textSubmitted.emit(this._input.value);
      }
    });

    this.element.appendChild(this._input);
  }

  get text(): string {
    return this._input.value;
  }

  set text(val: string) {
    this._input.value = val;
  }

  get placeholderText(): string {
    return this._input.placeholder;
  }

  set placeholderText(val: string) {
    this._input.placeholder = val;
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(100, 32);
  }
}

// ── TextEdit ──

export interface TextEditOptions extends ControlOptions {
  text?: string;
  placeholderText?: string;
}

export class TextEdit extends Control {
  readonly textChanged = new Signal<[string]>('text_changed');

  private _textarea: HTMLTextAreaElement;

  constructor(options?: TextEditOptions) {
    super(options);

    this._textarea = document.createElement('textarea');
    this._textarea.style.width = '100%';
    this._textarea.style.height = '100%';
    this._textarea.style.boxSizing = 'border-box';
    this._textarea.style.backgroundColor = this.theme.colors.surface;
    this._textarea.style.border = `1px solid ${this.theme.colors.border}`;
    this._textarea.style.borderRadius = '4px';
    this._textarea.style.padding = '8px 10px';
    this._textarea.style.color = this.theme.colors.text;
    this._textarea.style.fontFamily = this.theme.fontFamily;
    this._textarea.style.fontSize = `${this.theme.fontSize}px`;
    this._textarea.style.outline = 'none';
    this._textarea.style.resize = 'none';

    if (options?.text !== undefined) this._textarea.value = options.text;
    if (options?.placeholderText) this._textarea.placeholder = options.placeholderText;

    this._textarea.addEventListener('input', () => {
      this.textChanged.emit(this._textarea.value);
    });

    this.element.appendChild(this._textarea);
  }

  get text(): string {
    return this._textarea.value;
  }

  set text(val: string) {
    this._textarea.value = val;
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(120, 60);
  }
}

// ── ProgressBar ──

export interface ProgressBarOptions extends ControlOptions {
  value?: number;
  minValue?: number;
  maxValue?: number;
  showPercentage?: boolean;
}

export class ProgressBar extends Control {
  private _value = 0;
  private _minValue = 0;
  private _maxValue = 100;
  private _fillElement: HTMLDivElement;
  private _labelElement: HTMLDivElement;

  constructor(options?: ProgressBarOptions) {
    super(options);

    this.element.style.backgroundColor = this.theme.colors.surface;
    this.element.style.border = `1px solid ${this.theme.colors.border}`;
    this.element.style.borderRadius = '4px';
    this.element.style.overflow = 'hidden';
    this.element.style.position = 'relative';

    this._fillElement = document.createElement('div');
    this._fillElement.style.height = '100%';
    this._fillElement.style.backgroundColor = this.theme.colors.primary;
    this._fillElement.style.transition = 'width 0.1s ease';
    this.element.appendChild(this._fillElement);

    this._labelElement = document.createElement('div');
    this._labelElement.style.position = 'absolute';
    this._labelElement.style.top = '0';
    this._labelElement.style.left = '0';
    this._labelElement.style.width = '100%';
    this._labelElement.style.height = '100%';
    this._labelElement.style.display = 'flex';
    this._labelElement.style.alignItems = 'center';
    this._labelElement.style.justifyContent = 'center';
    this._labelElement.style.fontSize = '12px';
    this._labelElement.style.fontWeight = '600';
    this._labelElement.style.pointerEvents = 'none';
    this.element.appendChild(this._labelElement);

    if (options?.minValue !== undefined) this._minValue = options.minValue;
    if (options?.maxValue !== undefined) this._maxValue = options.maxValue;
    if (options?.value !== undefined) this.value = options.value;
  }

  get value(): number {
    return this._value;
  }

  set value(v: number) {
    this._value = Math.max(this._minValue, Math.min(this._maxValue, v));
    const pct = ((this._value - this._minValue) / (this._maxValue - this._minValue)) * 100;
    this._fillElement.style.width = `${pct}%`;
    this._labelElement.textContent = `${Math.round(pct)}%`;
  }

  get minValue(): number {
    return this._minValue;
  }

  set minValue(v: number) {
    this._minValue = v;
    this.value = this._value;
  }

  get maxValue(): number {
    return this._maxValue;
  }

  set maxValue(v: number) {
    this._maxValue = v;
    this.value = this._value;
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(100, 20);
  }
}

// ── Slider (HSlider, VSlider) ──

export interface SliderOptions extends ControlOptions {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
}

export abstract class Slider extends Control {
  readonly valueChanged = new Signal<[number]>('value_changed');
  protected _input: HTMLInputElement;

  constructor(options?: SliderOptions) {
    super(options);
    this._input = document.createElement('input');
    this._input.type = 'range';
    this._input.min = String(options?.min ?? 0);
    this._input.max = String(options?.max ?? 100);
    this._input.step = String(options?.step ?? 1);
    this._input.value = String(options?.value ?? 0);
    this._input.style.accentColor = this.theme.colors.primary;

    this._input.addEventListener('input', () => {
      this.valueChanged.emit(Number(this._input.value));
    });

    this.element.appendChild(this._input);
  }

  get value(): number {
    return Number(this._input.value);
  }

  set value(v: number) {
    this._input.value = String(v);
  }
}

export class HSlider extends Slider {
  constructor(options?: SliderOptions) {
    super(options);
    this._input.style.width = '100%';
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(80, 20);
  }
}

export class VSlider extends Slider {
  constructor(options?: SliderOptions) {
    super(options);
    this._input.style.writingMode = 'vertical-lr';
    this._input.style.height = '100%';
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(20, 80);
  }
}

// ── OptionButton ──

export interface OptionButtonOptions extends ControlOptions {
  items?: string[];
  selected?: number;
}

export class OptionButton extends Control {
  readonly itemSelected = new Signal<[number, string]>('item_selected');

  private _select: HTMLSelectElement;

  constructor(options?: OptionButtonOptions) {
    super(options);

    this._select = document.createElement('select');
    this._select.style.width = '100%';
    this._select.style.height = '100%';
    this._select.style.backgroundColor = this.theme.colors.surface;
    this._select.style.border = `1px solid ${this.theme.colors.border}`;
    this._select.style.borderRadius = '4px';
    this._select.style.color = this.theme.colors.text;
    this._select.style.padding = '4px 8px';
    this._select.style.outline = 'none';
    this._select.style.cursor = 'pointer';

    if (options?.items) {
      for (const it of options.items) {
        this.addItem(it);
      }
    }

    if (options?.selected !== undefined) {
      this._select.selectedIndex = options.selected;
    }

    this._select.addEventListener('change', () => {
      this.itemSelected.emit(this._select.selectedIndex, this._select.value);
    });

    this.element.appendChild(this._select);
  }

  addItem(label: string): void {
    const opt = document.createElement('option');
    opt.value = label;
    opt.textContent = label;
    this._select.appendChild(opt);
  }

  get selected(): number {
    return this._select.selectedIndex;
  }

  set selected(idx: number) {
    this._select.selectedIndex = idx;
  }

  override getMinimumSize(): THREE.Vector2 {
    return new THREE.Vector2(100, 32);
  }
}

// ── MenuButton ──

export class MenuButton extends Button {
  private _menu: HTMLDivElement;
  private _isOpen = false;

  constructor(options?: ButtonOptions) {
    super(options);

    this._menu = document.createElement('div');
    this._menu.style.position = 'absolute';
    this._menu.style.top = '100%';
    this._menu.style.left = '0';
    this._menu.style.backgroundColor = this.theme.colors.surface;
    this._menu.style.border = `1px solid ${this.theme.colors.border}`;
    this._menu.style.borderRadius = '4px';
    this._menu.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    this._menu.style.display = 'none';
    this._menu.style.zIndex = '1000';
    this._menu.style.minWidth = '120px';
    this.element.appendChild(this._menu);

    this.pressed.connect(() => {
      this._isOpen = !this._isOpen;
      this._menu.style.display = this._isOpen ? 'block' : 'none';
    });
  }

  addMenuItem(label: string, callback?: () => void): void {
    const item = document.createElement('div');
    item.textContent = label;
    item.style.padding = '8px 12px';
    item.style.cursor = 'pointer';
    item.style.color = this.theme.colors.text;

    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = this.theme.colors.surfaceVariant;
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      this._isOpen = false;
      this._menu.style.display = 'none';
      callback?.();
    });

    this._menu.appendChild(item);
  }
}
