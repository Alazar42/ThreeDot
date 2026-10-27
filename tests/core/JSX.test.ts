import { describe, it, expect, vi } from 'vitest';
import { createElement, instantiate } from '../../src/jsx';
import { Node } from '../../src/core/node/Node';
import { Node3D } from '../../src/nodes/3d/Node3D';
import { Button } from '../../src/nodes/ui/InteractiveControls';
import { Signal } from '../../src/core/signals/Signal';
import { SignalBus } from '../../src/core/signals/SignalBus';
import '../../src'; // registers standard node types

describe('JSX Runtime & Universal Signal Property Binding', () => {
  it('binds threedotSignal on UI widget tags (Button)', () => {
    const spy = vi.fn();
    const unsub = SignalBus.connect('button_clicked', spy);

    const btn = createElement(Button, {
      threedotSignal: 'button_clicked',
      threedotParams: ['val1', 42],
    }) as Button;

    btn.pressed.emit();
    expect(spy).toHaveBeenCalledWith('val1', 42);

    unsub();
  });

  it('binds threedotSignal on string HTML tags (e.g. "button")', () => {
    const spy = vi.fn();
    const unsub = SignalBus.connect('string_button_action', spy);

    // Using string tag 'button'
    const btn = createElement('button', {
      threedotSignal: 'string_button_action',
      threedotParams: [100],
    }) as any;

    expect(btn.pressed).toBeDefined();
    btn.pressed.emit();
    expect(spy).toHaveBeenCalledWith(100);

    unsub();
  });

  it('binds threedotSignal on string container tags (e.g. "div") with DOM event listener', () => {
    const spy = vi.fn();
    const unsub = SignalBus.connect('div_click_action', spy);

    const div = createElement('div', {
      threedotSignal: 'div_click_action',
      threedotParams: ['clicked_div'],
    }) as any;

    expect(div.element).toBeDefined();
    div.element.dispatchEvent(new MouseEvent('click'));

    expect(spy).toHaveBeenCalledWith('clicked_div');
    unsub();
  });

  it('binds threedotSignal on 3D node tags with threedotEvent', () => {
    const spy = vi.fn();
    const unsub = SignalBus.connect('custom_trigger', spy);

    class CustomActor extends Node3D {
      readonly hit = new Signal<[number]>('hit');
    }

    const actor = createElement(CustomActor, {
      threedotSignal: 'custom_trigger',
      threedotEvent: 'hit',
    }) as CustomActor;

    actor.hit.emit(99);
    expect(spy).toHaveBeenCalledWith(99);

    unsub();
  });

  it('binds threedotSignal on 3D node tags falling back to ready signal', () => {
    const spy = vi.fn();
    const unsub = SignalBus.connect('scene_loaded', spy);

    const node = createElement(Node3D, {
      threedotSignal: 'scene_loaded',
      threedotParams: ['main_level'],
    }) as Node3D;

    node.ready.emit();
    expect(spy).toHaveBeenCalledWith('main_level');

    unsub();
  });

  it('binds on[SignalName] and onClick on any tags', () => {
    const onReadySpy = vi.fn();
    const onClickSpy = vi.fn();
    const onPressedSpy = vi.fn();

    const node = createElement(Node3D, {
      onReady: onReadySpy,
    });
    node.ready.emit();
    expect(onReadySpy).toHaveBeenCalled();

    const btn = createElement(Button, {
      onPressed: onPressedSpy,
    }) as Button;
    btn.pressed.emit();
    expect(onPressedSpy).toHaveBeenCalled();

    // onClick alias on button
    const btn2 = createElement(Button, {
      onClick: onClickSpy,
    }) as Button;
    btn2.pressed.emit();
    expect(onClickSpy).toHaveBeenCalled();
  });

  it('instantiate compiles or passes through Node hierarchies', () => {
    const n = new Node({ name: 'Root' });
    expect(instantiate(n)).toBe(n);

    const created = instantiate(createElement(Node, { name: 'Instantiated' }));
    expect(created.name).toBe('Instantiated');
  });
});
