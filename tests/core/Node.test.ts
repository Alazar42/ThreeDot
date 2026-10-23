import { describe, it, expect, vi } from 'vitest';
import { Node } from '../../src/core/node/Node';
import { SceneTree } from '../../src/core/scene/SceneTree';
import { NodeLifecycle, ProcessMode } from '../../src/core/lifecycle/Lifecycle';

describe('Node Core System', () => {
  it('initializes with default properties and unique id', () => {
    const nodeA = new Node();
    const nodeB = new Node({ name: 'CustomNode' });

    expect(nodeA.id).toBeDefined();
    expect(nodeB.id).toBeDefined();
    expect(nodeA.id).not.toBe(nodeB.id);
    expect(nodeA.name).toBe('Node');
    expect(nodeB.name).toBe('CustomNode');
    expect(nodeA.parent).toBeNull();
    expect(nodeA.children.length).toBe(0);
    expect(nodeA.isInsideTree).toBe(false);
  });

  it('manages parent-child hierarchy properly', () => {
    const parent = new Node({ name: 'Parent' });
    const child1 = new Node({ name: 'Child1' });
    const child2 = new Node({ name: 'Child2' });

    parent.addChild(child1);
    parent.addChild(child2);

    expect(parent.childCount).toBe(2);
    expect(parent.children.length).toBe(2);
    expect(child1.parent).toBe(parent);
    expect(child2.parent).toBe(parent);

    expect(parent.getChild(0)).toBe(child1);
    expect(parent.getChild(1)).toBe(child2);
    expect(parent.getChildIndex(child2)).toBe(1);

    const children = parent.getChildren();
    expect(children).toHaveLength(2);
    expect(children[0]).toBe(child1);

    // Reposition child
    parent.moveChild(child2, 0);
    expect(parent.getChild(0)).toBe(child2);
    expect(parent.getChild(1)).toBe(child1);

    // Remove child
    parent.removeChild(child1);
    expect(parent.childCount).toBe(1);
    expect(child1.parent).toBeNull();
  });

  it('prevents cyclic hierarchies', () => {
    const nodeA = new Node({ name: 'A' });
    const nodeB = new Node({ name: 'B' });

    nodeA.addChild(nodeB);

    // Cannot add self
    expect(() => nodeA.addChild(nodeA)).toThrow();

    // Cannot add ancestor as child
    expect(() => nodeB.addChild(nodeA)).toThrow();
  });

  it('supports reparenting', () => {
    const parent1 = new Node({ name: 'Parent1' });
    const parent2 = new Node({ name: 'Parent2' });
    const child = new Node({ name: 'Child' });

    parent1.addChild(child);
    expect(child.parent).toBe(parent1);

    child.reparent(parent2);
    expect(child.parent).toBe(parent2);
    expect(parent1.childCount).toBe(0);
    expect(parent2.childCount).toBe(1);
  });

  it('handles name collision by auto-renaming siblings', () => {
    const parent = new Node({ name: 'Parent' });
    const childA = new Node({ name: 'Player' });
    const childB = new Node({ name: 'Player' });
    const childC = new Node({ name: 'Player' });

    parent.addChild(childA);
    parent.addChild(childB);
    parent.addChild(childC);

    expect(childA.name).toBe('Player');
    expect(childB.name).toBe('Player2');
    expect(childC.name).toBe('Player3');
  });

  it('finds children by name and predicate', () => {
    const root = new Node({ name: 'Root' });
    const child = new Node({ name: 'Child' });
    const grandChild = new Node({ name: 'GrandChild' });

    root.addChild(child);
    child.addChild(grandChild);

    expect(root.getChildByName('Child')).toBe(child);
    expect(root.findChild('GrandChild')).toBe(grandChild);
    expect(root.findChild('NonExistent')).toBeUndefined();

    const matches = root.findChildren(n => n.name.includes('Child'));
    expect(matches).toHaveLength(2);
  });

  it('resolves node paths via getNode', () => {
    const root = new Node({ name: 'Root' });
    const arm = new Node({ name: 'Arm' });
    const hand = new Node({ name: 'Hand' });
    const sword = new Node({ name: 'Sword' });
    const leg = new Node({ name: 'Leg' });

    root.addChild(arm);
    arm.addChild(hand);
    hand.addChild(sword);
    root.addChild(leg);

    expect(root.getPath()).toBe('/Root');
    expect(arm.getPath()).toBe('/Root/Arm');
    expect(sword.getPath()).toBe('/Root/Arm/Hand/Sword');

    // Direct descent
    expect(root.getNode('Arm/Hand/Sword')).toBe(sword);
    expect(root.getNode('Arm/Hand')).toBe(hand);

    // Relative traversal with ..
    expect(sword.getNode('../..')).toBe(arm);
    expect(arm.getNode('../Leg')).toBe(leg);
    expect(sword.getNode('.')).toBe(sword);
  });

  it('manages groups and meta tags', () => {
    const node = new Node({ name: 'Hero' });

    node.addToGroup('players');
    node.addToGroup('damageable');
    expect(node.isInGroup('players')).toBe(true);
    expect(node.isInGroup('enemies')).toBe(false);
    expect(node.getGroups().has('players')).toBe(true);

    node.removeFromGroup('players');
    expect(node.isInGroup('players')).toBe(false);

    node.setMeta('health', 100);
    node.setMeta('speed', 5.5);
    expect(node.hasMeta('health')).toBe(true);
    expect(node.getMeta('health')).toBe(100);
    expect(node.getMetaList()).toEqual(['health', 'speed']);

    node.removeMeta('health');
    expect(node.hasMeta('health')).toBe(false);
  });

  it('triggers lifecycle signals upon entering and exiting scene tree', () => {
    const tree = new SceneTree();
    const parent = new Node({ name: 'Parent' });
    const child = new Node({ name: 'Child' });
    parent.addChild(child);

    const parentReadySpy = vi.fn();
    const childReadySpy = vi.fn();
    const parentExitSpy = vi.fn();

    parent.ready.connect(parentReadySpy);
    child.ready.connect(childReadySpy);
    parent.treeExited.connect(parentExitSpy);

    tree.root.addChild(parent);

    expect(parent.isInsideTree).toBe(true);
    expect(child.isInsideTree).toBe(true);
    expect(parent.lifecycle).toBe(NodeLifecycle.Ready);
    expect(child.lifecycle).toBe(NodeLifecycle.Ready);
    expect(parentReadySpy).toHaveBeenCalledTimes(1);
    expect(childReadySpy).toHaveBeenCalledTimes(1);

    // Unparenting from tree triggers exit
    parent.removeChild(child);
    expect(child.isInsideTree).toBe(false);
    expect(child.lifecycle).toBe(NodeLifecycle.OutOfTree);
  });

  it('duplicates nodes with duplicate()', () => {
    const parent = new Node({ name: 'Parent' });
    parent.setMeta('tag', 'original');
    parent.addToGroup('items');

    const copy = parent.duplicate();
    expect(copy).not.toBe(parent);
    expect(copy.name).toBe('Parent');
    expect(copy.getMeta('tag')).toBe('original');
    expect(copy.isInGroup('items')).toBe(true);
  });
});
