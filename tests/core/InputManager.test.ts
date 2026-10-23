import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager } from '../../src/core/input/InputManager';

describe('InputManager System', () => {
  let input: InputManager;
  let targetElement: HTMLElement;

  beforeEach(() => {
    input = new InputManager();
    targetElement = document.createElement('div');
  });

  afterEach(() => {
    input.dispose();
  });

  it('manages action mappings and bindings', () => {
    input.addAction('jump');
    input.addActionBinding('jump', { type: 'key', code: 'Space' });
    input.addActionBinding('jump', { type: 'gamepad_button', buttonIndex: 0 });

    input.configureActions({
      move_left: [{ type: 'key', code: 'KeyA' }, { type: 'key', code: 'ArrowLeft' }],
      move_right: [{ type: 'key', code: 'KeyD' }, { type: 'key', code: 'ArrowRight' }],
      move_up: [{ type: 'key', code: 'KeyW' }],
      move_down: [{ type: 'key', code: 'KeyS' }],
    });

    expect(input.isActionPressed('move_left')).toBe(false);
  });

  it('detects key actions and tracks pressed/just-pressed/just-released states', () => {
    input.initialize(targetElement);

    input.configureActions({
      jump: [{ type: 'key', code: 'Space' }],
    });

    const actionPressedSpy = vi.fn();
    const actionReleasedSpy = vi.fn();
    input.actionPressed.connect(actionPressedSpy);
    input.actionReleased.connect(actionReleasedSpy);

    // Simulate key down
    const keyDownEvent = new KeyboardEvent('keydown', { code: 'Space' });
    window.dispatchEvent(keyDownEvent);

    expect(input.isKeyPressed('Space')).toBe(true);
    expect(input.isKeyJustPressed('Space')).toBe(true);
    expect(input.isActionPressed('jump')).toBe(true);
    expect(input.isActionJustPressed('jump')).toBe(true);
    expect(input.getActionStrength('jump')).toBe(1);
    expect(actionPressedSpy).toHaveBeenCalledWith('jump', 1);

    // End frame clears just-pressed
    input.endFrame();
    expect(input.isActionPressed('jump')).toBe(true);
    expect(input.isActionJustPressed('jump')).toBe(false);

    // Simulate key up
    const keyUpEvent = new KeyboardEvent('keyup', { code: 'Space' });
    window.dispatchEvent(keyUpEvent);

    expect(input.isKeyPressed('Space')).toBe(false);
    expect(input.isActionPressed('jump')).toBe(false);
    expect(input.isActionJustReleased('jump')).toBe(true);
    expect(actionReleasedSpy).toHaveBeenCalledWith('jump');

    // End frame clears just-released
    input.endFrame();
    expect(input.isActionJustReleased('jump')).toBe(false);
  });

  it('computes directional axis and vector', () => {
    input.initialize(targetElement);

    input.configureActions({
      left: [{ type: 'key', code: 'KeyA' }],
      right: [{ type: 'key', code: 'KeyD' }],
      up: [{ type: 'key', code: 'KeyW' }],
      down: [{ type: 'key', code: 'KeyS' }],
    });

    expect(input.getAxis('left', 'right')).toBe(0);

    // Press right
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
    expect(input.getAxis('left', 'right')).toBe(1);

    // Also press up
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    const vec = input.getVector('left', 'right', 'down', 'up');

    // Vector with x=1, y=1 normalized to length 1 (1 / sqrt(2) ≈ 0.707)
    expect(vec.x).toBeCloseTo(0.7071, 3);
    expect(vec.y).toBeCloseTo(0.7071, 3);
  });

  it('cleans up event listeners on dispose', () => {
    input.initialize(targetElement);
    input.configureActions({ attack: [{ type: 'key', code: 'KeyF' }] });

    input.dispose();

    // After dispose, events are no longer captured
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyF' }));
    expect(input.isKeyPressed('KeyF')).toBe(false);
  });
});
