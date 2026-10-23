/**
 * PackedScene — Reusable scene blueprint and prefab serialization system
 *
 * Allows packing a node hierarchy into a reusable scene, instantiating
 * new copies, and serializing/deserializing to JSON.
 */

import { Node } from '../node/Node';
import { ProcessMode } from '../lifecycle/Lifecycle';

export interface SerializedNodeData {
  type: string;
  name: string;
  processMode?: ProcessMode;
  processPriority?: number;
  groups?: string[];
  meta?: Record<string, any>;
  properties?: Record<string, any>;
  children?: SerializedNodeData[];
}

export type NodeConstructor = new (...args: any[]) => Node;

const nodeTypeRegistry = new Map<string, NodeConstructor>();

/**
 * Register a node class so it can be instantiated by type name during deserialization.
 */
export function registerNodeType(name: string, constructor: NodeConstructor): void {
  nodeTypeRegistry.set(name, constructor);
}

/**
 * Get a registered node constructor.
 */
export function getNodeType(name: string): NodeConstructor | undefined {
  return nodeTypeRegistry.get(name);
}

export class PackedScene {
  private _data: SerializedNodeData | null = null;

  constructor(data?: SerializedNodeData) {
    if (data) {
      this._data = JSON.parse(JSON.stringify(data));
    }
  }

  /**
   * Pack an existing node hierarchy into this PackedScene blueprint.
   */
  pack(rootNode: Node): void {
    this._data = this._serializeNode(rootNode);
  }

  /**
   * Instantiate a fresh copy of the packed scene tree.
   */
  instantiate<T extends Node = Node>(): T {
    if (!this._data) {
      throw new Error('PackedScene: Cannot instantiate an empty PackedScene. Call pack() first or pass data.');
    }
    return this._deserializeNode(this._data) as T;
  }

  /**
   * Serialize this PackedScene to a JSON string.
   */
  toJSON(): string {
    if (!this._data) {
      throw new Error('PackedScene: No data to serialize.');
    }
    return JSON.stringify(this._data, null, 2);
  }

  /**
   * Create a PackedScene from a JSON string.
   */
  static fromJSON(json: string): PackedScene {
    const data = JSON.parse(json) as SerializedNodeData;
    return new PackedScene(data);
  }

  private _serializeNode(node: Node): SerializedNodeData {
    const data: SerializedNodeData = {
      type: node.constructor.name,
      name: node.name,
      processMode: node.processMode,
      processPriority: node.processPriority,
      groups: [...node.getGroups()],
      children: [],
    };

    // Serialize 3D transforms if Node3D
    const nodeAny = node as any;
    if (nodeAny.object3D?.position) {
      data.properties = {
        position: { x: nodeAny.object3D.position.x, y: nodeAny.object3D.position.y, z: nodeAny.object3D.position.z },
        rotation: { x: nodeAny.object3D.rotation.x, y: nodeAny.object3D.rotation.y, z: nodeAny.object3D.rotation.z },
        scale: { x: nodeAny.object3D.scale.x, y: nodeAny.object3D.scale.y, z: nodeAny.object3D.scale.z },
        visible: nodeAny.visible ?? true,
      };
    }

    for (const child of node.getChildren()) {
      data.children!.push(this._serializeNode(child));
    }

    return data;
  }

  private _deserializeNode(data: SerializedNodeData): Node {
    const Constructor = nodeTypeRegistry.get(data.type) ?? Node;
    const instance = new Constructor({
      name: data.name,
      processMode: data.processMode,
      processPriority: data.processPriority,
    });

    if (data.groups) {
      for (const group of data.groups) {
        instance.addToGroup(group);
      }
    }

    if (data.properties) {
      const instAny = instance as any;
      if (instAny.position && data.properties.position) {
        if ('z' in instAny.position) {
          instAny.position.set(data.properties.position.x, data.properties.position.y, data.properties.position.z);
        } else {
          instAny.position.set(data.properties.position.x, data.properties.position.y);
        }
      }
      if (instAny.rotation && data.properties.rotation) {
        if (typeof instAny.rotation === 'number') {
          instAny.rotation = data.properties.rotation.z ?? 0;
        } else {
          instAny.rotation.set(data.properties.rotation.x, data.properties.rotation.y, data.properties.rotation.z);
        }
      }
      if (instAny.scale && data.properties.scale) {
        if ('z' in instAny.scale) {
          instAny.scale.set(data.properties.scale.x, data.properties.scale.y, data.properties.scale.z);
        } else {
          instAny.scale.set(data.properties.scale.x, data.properties.scale.y);
        }
      }
      if (data.properties.visible !== undefined && 'visible' in instAny) {
        instAny.visible = data.properties.visible;
      }
    }

    if (data.children) {
      for (const childData of data.children) {
        const childNode = this._deserializeNode(childData);
        instance.addChild(childNode);
      }
    }

    return instance;
  }
}
