/**
 * ThreeDot Input System
 *
 * Unified input handling: keyboard, mouse, touch, gamepad, wheel.
 * Features action maps, pressed/released/just-pressed state, pointer lock, and cleanup.
 */

import { Signal } from '../signals/Signal';

/**
 * Input event types emitted by the InputManager.
 */
export type InputEventType =
  | 'key_down'
  | 'key_up'
  | 'mouse_down'
  | 'mouse_up'
  | 'mouse_move'
  | 'wheel'
  | 'touch_start'
  | 'touch_end'
  | 'touch_move'
  | 'gamepad_button_down'
  | 'gamepad_button_up'
  | 'gamepad_axis';

/**
 * Action binding types.
 */
export interface KeyBinding {
  type: 'key';
  code: string; // KeyboardEvent.code (e.g., 'KeyW', 'Space')
}

export interface MouseButtonBinding {
  type: 'mouse_button';
  button: number; // 0=left, 1=middle, 2=right
}

export interface GamepadButtonBinding {
  type: 'gamepad_button';
  buttonIndex: number;
  deadZone?: number;
}

export interface GamepadAxisBinding {
  type: 'gamepad_axis';
  axisIndex: number;
  direction: 1 | -1;
  deadZone?: number;
}

export type ActionBinding =
  | KeyBinding
  | MouseButtonBinding
  | GamepadButtonBinding
  | GamepadAxisBinding;

/**
 * An input event passed to nodes.
 */
export interface InputEvent {
  type: InputEventType;
  /** The action name, if this event matches an action binding */
  action?: string;
  /** Keyboard key code */
  keyCode?: string;
  /** Mouse button index */
  mouseButton?: number;
  /** Pointer position relative to the canvas */
  pointerX: number;
  pointerY: number;
  /** Pointer movement delta */
  deltaX: number;
  deltaY: number;
  /** Wheel delta */
  wheelDelta?: number;
  /** Whether this event has been consumed */
  consumed: boolean;
  /** Prevent further propagation */
  consume(): void;
  /** Original browser event if available */
  originalEvent?: Event;
  /** Gamepad button/axis index */
  gamepadIndex?: number;
  /** Axis value (-1 to 1) */
  axisValue?: number;
  /** Touch identifier */
  touchId?: number;
  /** Strength (for analog inputs, 0 to 1) */
  strength: number;
}

function createInputEvent(
  type: InputEventType,
  overrides: Partial<InputEvent> = {}
): InputEvent {
  const evt: InputEvent = {
    type,
    pointerX: 0,
    pointerY: 0,
    deltaX: 0,
    deltaY: 0,
    consumed: false,
    strength: 1,
    consume() {
      this.consumed = true;
    },
    ...overrides,
  };
  return evt;
}

/**
 * InputManager manages action maps, keyboard/mouse/touch/gamepad state,
 * and provides query methods for current input state.
 */
export class InputManager {
  /** Action name -> bindings */
  private actionMap: Map<string, ActionBinding[]> = new Map();

  /** Currently pressed keys (KeyboardEvent.code) */
  private keysPressed: Set<string> = new Set();
  /** Keys pressed this frame (cleared each frame) */
  private keysJustPressed: Set<string> = new Set();
  /** Keys released this frame */
  private keysJustReleased: Set<string> = new Set();

  /** Mouse buttons currently pressed */
  private mouseButtonsPressed: Set<number> = new Set();
  private mouseButtonsJustPressed: Set<number> = new Set();
  private mouseButtonsJustReleased: Set<number> = new Set();

  /** Current pointer position relative to canvas */
  private _pointerX = 0;
  private _pointerY = 0;
  private _pointerDeltaX = 0;
  private _pointerDeltaY = 0;

  /** Gamepad state */
  private gamepadButtons: Map<number, boolean> = new Map();
  private gamepadAxes: Map<number, number> = new Map();
  private gamepadButtonsJustPressed: Set<number> = new Set();
  private gamepadButtonsJustReleased: Set<number> = new Set();

  /** Whether pointer is locked */
  private _pointerLocked = false;

  /** Signals */
  readonly inputEvent = new Signal<[InputEvent]>('input_event');
  readonly actionPressed = new Signal<[string, number]>('action_pressed');
  readonly actionReleased = new Signal<[string]>('action_released');

  /** Reference to the target element */
  private _target: HTMLElement | null = null;

  /** Bound event handlers for cleanup */
  private _boundHandlers: Array<{ target: EventTarget; type: string; handler: EventListener }> = [];

  /**
   * Initialize the input system and bind to a DOM element.
   */
  initialize(target: HTMLElement): void {
    this._target = target;

    // Keyboard events on window
    this._bind(window, 'keydown', this._onKeyDown.bind(this) as EventListener);
    this._bind(window, 'keyup', this._onKeyUp.bind(this) as EventListener);

    // Mouse events on target
    this._bind(target, 'mousedown', this._onMouseDown.bind(this) as EventListener);
    this._bind(target, 'mouseup', this._onMouseUp.bind(this) as EventListener);
    this._bind(target, 'mousemove', this._onMouseMove.bind(this) as EventListener);
    this._bind(target, 'wheel', this._onWheel.bind(this) as EventListener, );
    this._bind(target, 'contextmenu', ((e: Event) => e.preventDefault()) as EventListener);

    // Touch events
    this._bind(target, 'touchstart', this._onTouchStart.bind(this) as EventListener);
    this._bind(target, 'touchend', this._onTouchEnd.bind(this) as EventListener);
    this._bind(target, 'touchmove', this._onTouchMove.bind(this) as EventListener);

    // Pointer lock
    this._bind(document, 'pointerlockchange', this._onPointerLockChange.bind(this));

    // Gamepad
    this._bind(window, 'gamepadconnected', this._onGamepadConnected.bind(this));
    this._bind(window, 'gamepaddisconnected', this._onGamepadDisconnected.bind(this));
  }

  private _bind(target: EventTarget, type: string, handler: EventListener): void {
    target.addEventListener(type, handler);
    this._boundHandlers.push({ target, type, handler });
  }

  // ── Action Map ──

  /**
   * Add an action with the given name.
   */
  addAction(name: string): void {
    if (!this.actionMap.has(name)) {
      this.actionMap.set(name, []);
    }
  }

  /**
   * Add a binding to an action.
   */
  addActionBinding(actionName: string, binding: ActionBinding): void {
    if (!this.actionMap.has(actionName)) {
      this.actionMap.set(actionName, []);
    }
    this.actionMap.get(actionName)!.push(binding);
  }

  /**
   * Remove all bindings for an action.
   */
  removeAction(name: string): void {
    this.actionMap.delete(name);
  }

  /**
   * Configure multiple actions at once.
   */
  configureActions(actions: Record<string, ActionBinding[]>): void {
    for (const [name, bindings] of Object.entries(actions)) {
      this.actionMap.set(name, bindings);
    }
  }

  // ── State Queries ──

  /**
   * Check if an action is currently pressed.
   */
  isActionPressed(action: string): boolean {
    const bindings = this.actionMap.get(action);
    if (!bindings) return false;

    for (const binding of bindings) {
      if (this._isBindingActive(binding)) return true;
    }
    return false;
  }

  /**
   * Check if an action was just pressed this frame.
   */
  isActionJustPressed(action: string): boolean {
    const bindings = this.actionMap.get(action);
    if (!bindings) return false;

    for (const binding of bindings) {
      if (this._isBindingJustPressed(binding)) return true;
    }
    return false;
  }

  /**
   * Check if an action was just released this frame.
   */
  isActionJustReleased(action: string): boolean {
    const bindings = this.actionMap.get(action);
    if (!bindings) return false;

    for (const binding of bindings) {
      if (this._isBindingJustReleased(binding)) return true;
    }
    return false;
  }

  /**
   * Get the strength of an action (0 for digital, 0-1 for analog).
   */
  getActionStrength(action: string): number {
    const bindings = this.actionMap.get(action);
    if (!bindings) return 0;

    let maxStrength = 0;
    for (const binding of bindings) {
      const strength = this._getBindingStrength(binding);
      if (strength > maxStrength) maxStrength = strength;
    }
    return maxStrength;
  }

  /**
   * Get axis input between a negative and positive action (-1 to +1).
   */
  getAxis(negativeAction: string, positiveAction: string): number {
    return this.getActionStrength(positiveAction) - this.getActionStrength(negativeAction);
  }

  /**
   * Get a 2D directional input vector from four actions, clamped/normalized if length > 1.
   */
  getVector(
    negativeX: string,
    positiveX: string,
    negativeY: string,
    positiveY: string
  ): { x: number; y: number } {
    const x = this.getAxis(negativeX, positiveX);
    const y = this.getAxis(negativeY, positiveY);
    const len = Math.sqrt(x * x + y * y);
    if (len > 1) {
      return { x: x / len, y: y / len };
    }
    return { x, y };
  }

  /**
   * Check if a specific key is pressed.
   */
  isKeyPressed(code: string): boolean {
    return this.keysPressed.has(code);
  }

  /**
   * Check if a specific key was just pressed this frame.
   */
  isKeyJustPressed(code: string): boolean {
    return this.keysJustPressed.has(code);
  }

  /**
   * Check if a mouse button is pressed.
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonsPressed.has(button);
  }

  /**
   * Get the current pointer position.
   */
  get pointerPosition(): { x: number; y: number } {
    return { x: this._pointerX, y: this._pointerY };
  }

  /**
   * Get the pointer movement delta since last frame.
   */
  get pointerDelta(): { x: number; y: number } {
    return { x: this._pointerDeltaX, y: this._pointerDeltaY };
  }

  /**
   * Get whether pointer is locked.
   */
  get isPointerLocked(): boolean {
    return this._pointerLocked;
  }

  /**
   * Request pointer lock on the target element.
   */
  requestPointerLock(): void {
    if (this._target) {
      this._target.requestPointerLock();
    }
  }

  /**
   * Exit pointer lock.
   */
  exitPointerLock(): void {
    document.exitPointerLock();
  }

  // ── Frame Update ──

  /**
   * Call at the end of each frame to clear just-pressed/released state.
   * @internal
   */
  endFrame(): void {
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseButtonsJustReleased.clear();
    this.gamepadButtonsJustPressed.clear();
    this.gamepadButtonsJustReleased.clear();
    this._pointerDeltaX = 0;
    this._pointerDeltaY = 0;
  }

  /**
   * Poll gamepads (must be called each frame).
   * @internal
   */
  pollGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (const gp of gamepads) {
      if (!gp) continue;

      // Buttons
      for (let i = 0; i < gp.buttons.length; i++) {
        const pressed = gp.buttons[i].pressed;
        const wasPressed = this.gamepadButtons.get(i) ?? false;

        if (pressed && !wasPressed) {
          this.gamepadButtonsJustPressed.add(i);
          this._emitGamepadInput('gamepad_button_down', i, gp.buttons[i].value);
        } else if (!pressed && wasPressed) {
          this.gamepadButtonsJustReleased.add(i);
          this._emitGamepadInput('gamepad_button_up', i, 0);
        }

        this.gamepadButtons.set(i, pressed);
      }

      // Axes
      for (let i = 0; i < gp.axes.length; i++) {
        this.gamepadAxes.set(i, gp.axes[i]);
      }
    }
  }

  // ── Private Binding Checks ──

  private _isBindingActive(binding: ActionBinding): boolean {
    switch (binding.type) {
      case 'key':
        return this.keysPressed.has(binding.code);
      case 'mouse_button':
        return this.mouseButtonsPressed.has(binding.button);
      case 'gamepad_button':
        return this.gamepadButtons.get(binding.buttonIndex) ?? false;
      case 'gamepad_axis': {
        const value = this.gamepadAxes.get(binding.axisIndex) ?? 0;
        const deadZone = binding.deadZone ?? 0.2;
        return (value * binding.direction) > deadZone;
      }
    }
  }

  private _isBindingJustPressed(binding: ActionBinding): boolean {
    switch (binding.type) {
      case 'key':
        return this.keysJustPressed.has(binding.code);
      case 'mouse_button':
        return this.mouseButtonsJustPressed.has(binding.button);
      case 'gamepad_button':
        return this.gamepadButtonsJustPressed.has(binding.buttonIndex);
      case 'gamepad_axis':
        return false; // Axes don't have just-pressed
    }
  }

  private _isBindingJustReleased(binding: ActionBinding): boolean {
    switch (binding.type) {
      case 'key':
        return this.keysJustReleased.has(binding.code);
      case 'mouse_button':
        return this.mouseButtonsJustReleased.has(binding.button);
      case 'gamepad_button':
        return this.gamepadButtonsJustReleased.has(binding.buttonIndex);
      case 'gamepad_axis':
        return false;
    }
  }

  private _getBindingStrength(binding: ActionBinding): number {
    switch (binding.type) {
      case 'key':
        return this.keysPressed.has(binding.code) ? 1 : 0;
      case 'mouse_button':
        return this.mouseButtonsPressed.has(binding.button) ? 1 : 0;
      case 'gamepad_button': {
        const pressed = this.gamepadButtons.get(binding.buttonIndex) ?? false;
        return pressed ? 1 : 0;
      }
      case 'gamepad_axis': {
        const value = this.gamepadAxes.get(binding.axisIndex) ?? 0;
        const deadZone = binding.deadZone ?? 0.2;
        const effective = value * binding.direction;
        return effective > deadZone ? Math.min((effective - deadZone) / (1 - deadZone), 1) : 0;
      }
    }
  }

  // ── Event Handlers ──

  private _onKeyDown(e: KeyboardEvent): void {
    if (this.keysPressed.has(e.code)) return; // Ignore repeat

    this.keysPressed.add(e.code);
    this.keysJustPressed.add(e.code);

    const action = this._findActionForKey(e.code);
    const evt = createInputEvent('key_down', {
      keyCode: e.code,
      action,
      originalEvent: e,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
    });

    this.inputEvent.emit(evt);

    if (action) {
      this.actionPressed.emit(action, 1);
    }
  }

  private _onKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.code);
    this.keysJustReleased.add(e.code);

    const action = this._findActionForKey(e.code);
    const evt = createInputEvent('key_up', {
      keyCode: e.code,
      action,
      originalEvent: e,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      strength: 0,
    });

    this.inputEvent.emit(evt);

    if (action) {
      this.actionReleased.emit(action);
    }
  }

  private _onMouseDown(e: MouseEvent): void {
    this.mouseButtonsPressed.add(e.button);
    this.mouseButtonsJustPressed.add(e.button);

    this._updatePointerFromMouse(e);

    const action = this._findActionForMouseButton(e.button);
    const evt = createInputEvent('mouse_down', {
      mouseButton: e.button,
      action,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      originalEvent: e,
    });

    this.inputEvent.emit(evt);

    if (action) {
      this.actionPressed.emit(action, 1);
    }
  }

  private _onMouseUp(e: MouseEvent): void {
    this.mouseButtonsPressed.delete(e.button);
    this.mouseButtonsJustReleased.add(e.button);

    this._updatePointerFromMouse(e);

    const action = this._findActionForMouseButton(e.button);
    const evt = createInputEvent('mouse_up', {
      mouseButton: e.button,
      action,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      originalEvent: e,
      strength: 0,
    });

    this.inputEvent.emit(evt);

    if (action) {
      this.actionReleased.emit(action);
    }
  }

  private _onMouseMove(e: MouseEvent): void {
    this._pointerDeltaX += e.movementX;
    this._pointerDeltaY += e.movementY;
    this._updatePointerFromMouse(e);

    const evt = createInputEvent('mouse_move', {
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      deltaX: e.movementX,
      deltaY: e.movementY,
      originalEvent: e,
    });

    this.inputEvent.emit(evt);
  }

  private _onWheel(e: WheelEvent): void {
    const evt = createInputEvent('wheel', {
      wheelDelta: e.deltaY,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      originalEvent: e,
    });

    this.inputEvent.emit(evt);
  }

  private _onTouchStart(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      const pos = this._getTouchPosition(touch);
      const evt = createInputEvent('touch_start', {
        pointerX: pos.x,
        pointerY: pos.y,
        touchId: touch.identifier,
        originalEvent: e,
      });
      this.inputEvent.emit(evt);
    }
  }

  private _onTouchEnd(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      const pos = this._getTouchPosition(touch);
      const evt = createInputEvent('touch_end', {
        pointerX: pos.x,
        pointerY: pos.y,
        touchId: touch.identifier,
        originalEvent: e,
        strength: 0,
      });
      this.inputEvent.emit(evt);
    }
  }

  private _onTouchMove(e: TouchEvent): void {
    for (const touch of Array.from(e.changedTouches)) {
      const pos = this._getTouchPosition(touch);
      const evt = createInputEvent('touch_move', {
        pointerX: pos.x,
        pointerY: pos.y,
        touchId: touch.identifier,
        originalEvent: e,
      });
      this.inputEvent.emit(evt);
    }
  }

  private _onPointerLockChange(): void {
    this._pointerLocked = document.pointerLockElement === this._target;
  }

  private _onGamepadConnected(_e: Event): void {
    // Gamepads are polled each frame, nothing special to do on connect
  }

  private _onGamepadDisconnected(_e: Event): void {
    this.gamepadButtons.clear();
    this.gamepadAxes.clear();
  }

  // ── Helpers ──

  private _updatePointerFromMouse(e: MouseEvent): void {
    if (this._target) {
      const rect = this._target.getBoundingClientRect();
      this._pointerX = e.clientX - rect.left;
      this._pointerY = e.clientY - rect.top;
    }
  }

  private _getTouchPosition(touch: Touch): { x: number; y: number } {
    if (this._target) {
      const rect = this._target.getBoundingClientRect();
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return { x: touch.clientX, y: touch.clientY };
  }

  private _findActionForKey(code: string): string | undefined {
    for (const [name, bindings] of this.actionMap) {
      for (const b of bindings) {
        if (b.type === 'key' && b.code === code) return name;
      }
    }
    return undefined;
  }

  private _findActionForMouseButton(button: number): string | undefined {
    for (const [name, bindings] of this.actionMap) {
      for (const b of bindings) {
        if (b.type === 'mouse_button' && b.button === button) return name;
      }
    }
    return undefined;
  }

  private _emitGamepadInput(type: InputEventType, index: number, value: number): void {
    const action = this._findActionForGamepadButton(index);
    const evt = createInputEvent(type, {
      gamepadIndex: index,
      axisValue: value,
      action,
      pointerX: this._pointerX,
      pointerY: this._pointerY,
      strength: value,
    });
    this.inputEvent.emit(evt);

    if (action) {
      if (type === 'gamepad_button_down') {
        this.actionPressed.emit(action, value);
      } else {
        this.actionReleased.emit(action);
      }
    }
  }

  private _findActionForGamepadButton(index: number): string | undefined {
    for (const [name, bindings] of this.actionMap) {
      for (const b of bindings) {
        if (b.type === 'gamepad_button' && b.buttonIndex === index) return name;
      }
    }
    return undefined;
  }

  // ── Cleanup ──

  /**
   * Remove all event listeners and clear state.
   */
  dispose(): void {
    for (const { target, type, handler } of this._boundHandlers) {
      target.removeEventListener(type, handler);
    }
    this._boundHandlers = [];

    this.keysPressed.clear();
    this.keysJustPressed.clear();
    this.keysJustReleased.clear();
    this.mouseButtonsPressed.clear();
    this.mouseButtonsJustPressed.clear();
    this.mouseButtonsJustReleased.clear();
    this.gamepadButtons.clear();
    this.gamepadAxes.clear();
    this.gamepadButtonsJustPressed.clear();
    this.gamepadButtonsJustReleased.clear();
    this.actionMap.clear();

    this.inputEvent.dispose();
    this.actionPressed.dispose();
    this.actionReleased.dispose();

    this._target = null;
  }
}
