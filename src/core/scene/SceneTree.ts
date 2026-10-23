/**
 * ThreeDot SceneTree
 *
 * Manages the root node, active scene, group registry, scene transitions,
 * and provides queries across the active tree.
 */

import { Node } from '../node/Node';
import { Signal } from '../signals/Signal';

/**
 * The SceneTree owns the root node and manages the active scene.
 */
export class SceneTree {
  /** The immutable root of the scene tree */
  readonly root: Node;

  /** Currently active scene (child of root) */
  private _currentScene: Node | null = null;

  /** Group registry: group name -> set of nodes */
  private _groups: Map<string, Set<Node>> = new Map();

  /** Whether the tree is paused */
  private _paused = false;

  /** Emitted when the current scene changes */
  readonly sceneChanged = new Signal<[Node | null, Node | null]>('scene_changed');

  /** Emitted when pause state changes */
  readonly pauseChanged = new Signal<[boolean]>('pause_changed');

  constructor() {
    this.root = new Node({ name: 'Root' });
    // Manually put root into tree
    this.root._propagateEnterTree(this);
  }

  /**
   * Get the current active scene.
   */
  get currentScene(): Node | null {
    return this._currentScene;
  }

  /**
   * Get/set pause state.
   */
  get paused(): boolean {
    return this._paused;
  }

  set paused(value: boolean) {
    if (this._paused !== value) {
      this._paused = value;
      this.pauseChanged.emit(value);
    }
  }

  /**
   * Set the active scene. Replaces the current scene.
   * The old scene is removed from the tree (but not disposed unless you do so manually).
   */
  changeScene(newScene: Node): void {
    const oldScene = this._currentScene;

    // Remove old scene
    if (oldScene) {
      this.root.removeChild(oldScene);
    }

    // Add new scene
    this._currentScene = newScene;
    this.root.addChild(newScene);

    this.sceneChanged.emit(newScene, oldScene);
  }

  /**
   * Change scene and dispose the old one.
   */
  changeSceneAndDispose(newScene: Node): void {
    const oldScene = this._currentScene;
    this.changeScene(newScene);
    if (oldScene) {
      oldScene.dispose();
    }
  }

  /**
   * Remove the current scene without replacing it.
   */
  clearScene(): void {
    if (this._currentScene) {
      const oldScene = this._currentScene;
      this.root.removeChild(oldScene);
      this._currentScene = null;
      this.sceneChanged.emit(null, oldScene);
    }
  }

  // ── Group Management ──

  /** @internal Register a node in a group */
  registerNodeInGroup(node: Node, group: string): void {
    let groupSet = this._groups.get(group);
    if (!groupSet) {
      groupSet = new Set();
      this._groups.set(group, groupSet);
    }
    groupSet.add(node);
  }

  /** @internal Unregister a node from a group */
  unregisterNodeFromGroup(node: Node, group: string): void {
    const groupSet = this._groups.get(group);
    if (groupSet) {
      groupSet.delete(node);
      if (groupSet.size === 0) {
        this._groups.delete(group);
      }
    }
  }

  /**
   * Get all nodes in a group.
   */
  getNodesInGroup(group: string): Node[] {
    const groupSet = this._groups.get(group);
    return groupSet ? Array.from(groupSet) : [];
  }

  /**
   * Check if a group has any members.
   */
  hasGroup(group: string): boolean {
    const groupSet = this._groups.get(group);
    return groupSet !== undefined && groupSet.size > 0;
  }

  /**
   * Call a method on all nodes in a group.
   */
  callGroup(group: string, method: string, ...args: unknown[]): void {
    const nodes = this.getNodesInGroup(group);
    for (const node of nodes) {
      const fn = (node as unknown as Record<string, unknown>)[method];
      if (typeof fn === 'function') {
        try {
          (fn as (...a: unknown[]) => void).call(node, ...args);
        } catch (err) {
          console.error(
            `[ThreeDot] Error calling "${method}" on "${node.name}" in group "${group}":`,
            err
          );
        }
      }
    }
  }

  // ── Tree-Wide Queries ──

  /**
   * Find a node by its absolute path from root.
   */
  getNodeByPath(path: string): Node | null {
    if (!path.startsWith('/')) {
      return this.root.getNode(path);
    }
    // Remove leading "/" and "Root/" prefix if present
    let resolved = path.substring(1);
    if (resolved.startsWith('Root/')) {
      resolved = resolved.substring(5);
    } else if (resolved === 'Root') {
      return this.root;
    }
    return this.root.getNode(resolved);
  }

  /**
   * Find the first node matching a predicate in the entire tree.
   */
  findNode(predicate: (node: Node) => boolean): Node | null {
    for (const node of this.root.traverse()) {
      if (predicate(node)) {
        return node;
      }
    }
    return null;
  }

  /**
   * Find all nodes matching a predicate.
   */
  findNodes(predicate: (node: Node) => boolean): Node[] {
    const result: Node[] = [];
    for (const node of this.root.traverse()) {
      if (predicate(node)) {
        result.push(node);
      }
    }
    return result;
  }

  // ── Processing ──

  /** @internal Process the entire tree */
  processTree(delta: number): void {
    this.root._propagateProcess(delta, this._paused);
  }

  /** Process the entire tree */
  process(delta: number): void {
    this.processTree(delta);
  }

  /** @internal Physics-process the entire tree */
  physicsProcessTree(delta: number): void {
    this.root._propagatePhysicsProcess(delta, this._paused);
  }

  /** Physics-process the entire tree */
  physicsProcess(delta: number): void {
    this.physicsProcessTree(delta);
  }

  // ── Cleanup ──

  /**
   * Dispose the entire scene tree.
   */
  dispose(): void {
    if (this._currentScene) {
      this._currentScene = null;
    }
    this.root.dispose();
    this._groups.clear();
    this.sceneChanged.dispose();
    this.pauseChanged.dispose();
  }
}
