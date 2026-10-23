import { describe, it, expect, vi } from 'vitest';
import { Signal } from '../../src/core/signals/Signal';
import { SignalBus } from '../../src/core/signals/SignalBus';

describe('Signal System', () => {
  it('connects, emits, and disconnects callbacks', () => {
    const signal = new Signal<[number, string]>('test_signal');
    const spy = vi.fn();

    const connection = signal.connect(spy);
    expect(signal.isConnected(spy)).toBe(true);

    signal.emit(42, 'hello');
    expect(spy).toHaveBeenCalledWith(42, 'hello');
    expect(spy).toHaveBeenCalledTimes(1);

    // Disconnect via connection
    connection.disconnect();
    expect(signal.isConnected(spy)).toBe(false);

    signal.emit(99, 'world');
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('supports once connections that self-disconnect after first invocation', () => {
    const signal = new Signal<[string]>('single_event');
    const spy = vi.fn();

    signal.once(spy);
    expect(signal.isConnected(spy)).toBe(true);

    signal.emit('first');
    expect(spy).toHaveBeenCalledWith('first');
    expect(spy).toHaveBeenCalledTimes(1);

    signal.emit('second');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(signal.isConnected(spy)).toBe(false);
  });

  it('supports disconnecting by function reference and disconnectAll', () => {
    const signal = new Signal<[]>('multi_event');
    const spy1 = vi.fn();
    const spy2 = vi.fn();

    signal.connect(spy1);
    signal.connect(spy2);

    signal.disconnect(spy1);
    expect(signal.isConnected(spy1)).toBe(false);
    expect(signal.isConnected(spy2)).toBe(true);

    signal.emit();
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledTimes(1);

    signal.disconnectAll();
    expect(signal.isConnected(spy2)).toBe(false);
  });

  it('SignalBus emits and connects global signals across systems', () => {
    const spy = vi.fn();

    const disconnect = SignalBus.connect('player_score', spy);
    SignalBus.emit('player_score', 100, 'bonus');

    expect(spy).toHaveBeenCalledWith(100, 'bonus');
    disconnect();
  });

  it('SignalBus DOM bridge dispatches threedot-signal attributes from HTML elements', () => {
    const spy = vi.fn();

    SignalBus.connect('game_jump', spy);

    const div = document.createElement('div');
    const btn = document.createElement('button');
    btn.setAttribute('threedot-signal', 'game_jump');
    btn.setAttribute('threedot-params', '["super", 25]');
    div.appendChild(btn);
    document.body.appendChild(div);

    SignalBus.initDOMBridge(document);

    btn.click();
    expect(spy).toHaveBeenCalledWith('super', 25);

    document.body.removeChild(div);
  });
});
