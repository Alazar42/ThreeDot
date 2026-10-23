import { describe, it, expect } from 'vitest';
import { Node } from '../../src/core/node/Node';
import { PackedScene, registerNodeType } from '../../src/core/scene/PackedScene';

describe('PackedScene System', () => {
  it('packs a node hierarchy and instantiates new instances', () => {
    const root = new Node({ name: 'PlayerPrefab' });
    root.addToGroup('entities');

    const weapon = new Node({ name: 'Weapon' });
    weapon.addToGroup('items');
    root.addChild(weapon);

    const packed = new PackedScene();
    packed.pack(root);

    // Instantiate copy 1
    const instance1 = packed.instantiate<Node>();
    expect(instance1).not.toBe(root);
    expect(instance1.name).toBe('PlayerPrefab');
    expect(instance1.isInGroup('entities')).toBe(true);
    expect(instance1.childCount).toBe(1);

    const child1 = instance1.getChild(0);
    expect(child1?.name).toBe('Weapon');
    expect(child1?.isInGroup('items')).toBe(true);

    // Instantiate copy 2
    const instance2 = packed.instantiate<Node>();
    expect(instance2).not.toBe(instance1);
    expect(instance2.name).toBe('PlayerPrefab');
  });

  it('supports JSON roundtrip serialization', () => {
    const root = new Node({ name: 'LevelBlueprint' });
    root.setMeta('difficulty', 3);

    const spawner = new Node({ name: 'Spawner' });
    root.addChild(spawner);

    const scene = new PackedScene();
    scene.pack(root);

    const json = scene.toJSON();
    expect(typeof json).toBe('string');
    expect(json).toContain('LevelBlueprint');
    expect(json).toContain('Spawner');

    const restoredScene = PackedScene.fromJSON(json);
    const restoredRoot = restoredScene.instantiate();

    expect(restoredRoot.name).toBe('LevelBlueprint');
    expect(restoredRoot.childCount).toBe(1);
    expect(restoredRoot.getChild(0)?.name).toBe('Spawner');
  });
});
