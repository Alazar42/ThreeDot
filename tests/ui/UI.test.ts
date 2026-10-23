import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Control } from '../../src/nodes/ui/Control';
import { HBoxContainer, VBoxContainer } from '../../src/nodes/ui/BoxContainer';
import { MarginContainer, CenterContainer } from '../../src/nodes/ui/CommonContainers';
import { AnchorPreset, SizeFlags } from '../../src/nodes/ui/types';

describe('UI and Control System', () => {
  it('manages Control sizing, anchors, and offsets', () => {
    const parentControl = new Control({
      name: 'ParentUI',
      size: { x: 800, y: 600 },
    });

    const childControl = new Control({
      name: 'ChildUI',
      minSize: { x: 100, y: 50 },
    });

    parentControl.addChild(childControl);

    expect(parentControl.size.x).toBe(800);
    expect(parentControl.size.y).toBe(600);

    // Set full rect anchor preset
    childControl.setAnchorsPreset(AnchorPreset.FULL_RECT);
    expect(childControl.anchorLeft).toBe(0);
    expect(childControl.anchorTop).toBe(0);
    expect(childControl.anchorRight).toBe(1);
    expect(childControl.anchorBottom).toBe(1);
  });

  it('arranges children horizontally in HBoxContainer', () => {
    const hbox = new HBoxContainer({
      name: 'Toolbar',
      separation: 10,
      size: { x: 400, y: 50 },
    });

    const btn1 = new Control({ name: 'Btn1', size: { x: 60, y: 40 }, minSize: { x: 60, y: 40 } });
    const btn2 = new Control({ name: 'Btn2', size: { x: 80, y: 40 }, minSize: { x: 80, y: 40 } });
    const btn3 = new Control({ name: 'Btn3', size: { x: 50, y: 40 }, minSize: { x: 50, y: 40 } });

    hbox.addChild(btn1);
    hbox.addChild(btn2);
    hbox.addChild(btn3);

    // Trigger layout
    hbox._sortChildren();

    expect(btn1.position.x).toBe(0);
    // btn2 should be at btn1.width + separation (60 + 10 = 70)
    expect(btn2.position.x).toBe(70);
    // btn3 should be at 70 + 80 + 10 = 160
    expect(btn3.position.x).toBe(160);
  });

  it('arranges children vertically in VBoxContainer', () => {
    const vbox = new VBoxContainer({
      name: 'Menu',
      separation: 15,
      size: { x: 200, y: 500 },
    });

    const item1 = new Control({ name: 'Item1', size: { x: 180, y: 30 }, minSize: { x: 180, y: 30 } });
    const item2 = new Control({ name: 'Item2', size: { x: 180, y: 40 }, minSize: { x: 180, y: 40 } });

    vbox.addChild(item1);
    vbox.addChild(item2);

    vbox._sortChildren();

    expect(item1.position.y).toBe(0);
    expect(item2.position.y).toBe(45); // 30 + 15
  });

  it('applies margins in MarginContainer', () => {
    const marginContainer = new MarginContainer({
      name: 'PaddedBox',
      size: { x: 300, y: 200 },
      marginLeft: 20,
      marginTop: 15,
      marginRight: 20,
      marginBottom: 15,
    });

    const inner = new Control({ name: 'Inner' });
    marginContainer.addChild(inner);

    marginContainer._sortChildren();

    expect(inner.position.x).toBe(20);
    expect(inner.position.y).toBe(15);
    expect(inner.size.x).toBe(260); // 300 - 40
    expect(inner.size.y).toBe(170); // 200 - 30
  });

  it('centers content in CenterContainer', () => {
    const center = new CenterContainer({
      name: 'CenterBox',
      size: { x: 400, y: 300 },
    });

    const modal = new Control({
      name: 'Modal',
      size: { x: 200, y: 100 },
      minSize: { x: 200, y: 100 },
    });

    center.addChild(modal);
    center._sortChildren();

    expect(modal.position.x).toBe(100); // (400 - 200) / 2
    expect(modal.position.y).toBe(100); // (300 - 100) / 2
  });
});
