import { describe, it, expect, vi } from 'vitest';
import { SceneTree } from '../../src/core/scene/SceneTree';
import { Node } from '../../src/core/node/Node';
import { ProcessMode } from '../../src/core/lifecycle/Lifecycle';

class TestProcessNode extends Node {
  processCount = 0;
  physicsProcessCount = 0;
  lastDelta = 0;

  override _process(delta: number): void {
    this.processCount++;
    this.lastDelta = delta;
  }

  override _physicsProcess(delta: number): void {
    this.physicsProcessCount++;
    this.lastDelta = delta;
  }

  customAction(amount: number): number {
    return amount * 2;
  }
}

describe('SceneTree System', () => {
  it('manages active scenes and transitions', () => {
    const tree = new SceneTree();
    const sceneA = new Node({ name: 'SceneA' });
    const sceneB = new Node({ name: 'SceneB' });

    const sceneChangedSpy = vi.fn();
    tree.sceneChanged.connect(sceneChangedSpy);

    tree.changeScene(sceneA);
    expect(tree.currentScene).toBe(sceneA);
    expect(sceneA.parent).toBe(tree.root);
    expect(sceneChangedSpy).toHaveBeenCalledWith(sceneA, null);

    tree.changeScene(sceneB);
    expect(tree.currentScene).toBe(sceneB);
    expect(sceneA.parent).toBeNull();
    expect(sceneB.parent).toBe(tree.root);
    expect(sceneChangedSpy).toHaveBeenCalledWith(sceneB, sceneA);

    tree.clearScene();
    expect(tree.currentScene).toBeNull();
  });

  it('handles pause states and notifies via pauseChanged', () => {
    const tree = new SceneTree();
    const pauseSpy = vi.fn();
    tree.pauseChanged.connect(pauseSpy);

    expect(tree.paused).toBe(false);

    tree.paused = true;
    expect(tree.paused).toBe(true);
    expect(pauseSpy).toHaveBeenCalledWith(true);

    tree.paused = false;
    expect(tree.paused).toBe(false);
    expect(pauseSpy).toHaveBeenCalledWith(false);
  });

  it('propagates callGroup to all nodes in registered group', () => {
    const tree = new SceneTree();
    const node1 = new TestProcessNode({ name: 'Enemy1' });
    const node2 = new TestProcessNode({ name: 'Enemy2' });
    const node3 = new TestProcessNode({ name: 'Civilian' });

    tree.root.addChild(node1);
    tree.root.addChild(node2);
    tree.root.addChild(node3);

    node1.addToGroup('enemies');
    node2.addToGroup('enemies');

    const spy1 = vi.spyOn(node1, 'customAction');
    const spy2 = vi.spyOn(node2, 'customAction');
    const spy3 = vi.spyOn(node3, 'customAction');

    tree.callGroup('enemies', 'customAction', 5);

    expect(spy1).toHaveBeenCalledWith(5);
    expect(spy2).toHaveBeenCalledWith(5);
    expect(spy3).not.toHaveBeenCalled();
  });

  it('respects ProcessMode flags when tree is paused', () => {
    const tree = new SceneTree();

    const pausableNode = new TestProcessNode({ name: 'Pausable', processMode: ProcessMode.Pausable });
    const alwaysNode = new TestProcessNode({ name: 'Always', processMode: ProcessMode.Always });
    const whenPausedNode = new TestProcessNode({ name: 'WhenPaused', processMode: ProcessMode.WhenPaused });
    const disabledNode = new TestProcessNode({ name: 'Disabled', processMode: ProcessMode.Disabled });

    tree.root.addChild(pausableNode);
    tree.root.addChild(alwaysNode);
    tree.root.addChild(whenPausedNode);
    tree.root.addChild(disabledNode);

    // Frame 1: unpaused
    tree.process(0.016);
    expect(pausableNode.processCount).toBe(1);
    expect(alwaysNode.processCount).toBe(1);
    expect(whenPausedNode.processCount).toBe(0);
    expect(disabledNode.processCount).toBe(0);

    // Pause tree
    tree.paused = true;

    // Frame 2: paused
    tree.process(0.016);
    expect(pausableNode.processCount).toBe(1); // Didn't increase
    expect(alwaysNode.processCount).toBe(2); // Increased
    expect(whenPausedNode.processCount).toBe(1); // Increased
    expect(disabledNode.processCount).toBe(0);

    // Physics process
    tree.physicsProcess(0.02);
    expect(pausableNode.physicsProcessCount).toBe(0);
    expect(alwaysNode.physicsProcessCount).toBe(1);
    expect(whenPausedNode.physicsProcessCount).toBe(1);
  });
});
