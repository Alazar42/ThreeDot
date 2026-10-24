/**
 * ThreeDot Node — The foundational building block of the scene tree.
 *
 * Every entity in ThreeDot inherits from Node. It provides:
 * - Stable identity and editable name
 * - Parent/child hierarchy with ordered children
 * - Lifecycle hooks (enterTree, ready, exitTree, destroy)
 * - Process callbacks with priority
 * - Signal support
 * - Groups for categorization and querying
 * - Metadata storage
 * - Tree traversal and path-based lookup
 */

import { Signal } from '../signals/Signal';
import { NodeLifecycle, ProcessMode } from '../lifecycle/Lifecycle';

let nextNodeId = 1;

/**
 * Options for configuring a Node upon construction.
 */
export interface NodeOptions {
  name?: string;
  processMode?: ProcessMode;
  processPriority?: number;
}

/**
 * The base Node class. All ThreeDot objects inherit from this.
 */
export class Node {
  /** Unique numeric ID for this node instance */
  readonly id: number;

  /** User-assignable name. Used for path lookups. */
  name: string;

  /** Current lifecycle phase */
  private _lifecycle: NodeLifecycle = NodeLifecycle.Created;

  /** Parent node reference */
  private _parent: Node | null = null;

  /** Ordered child nodes */
  private _children: Node[] = [];

  /** Whether _ready has ever been called on this node */
  private _readyCalled = false;

  /** Processing mode */
  processMode: ProcessMode;

  /** Processing priority (lower values process first) */
  processPriority: number;

  /** Whether this node's _process callback is enabled */
  private _processing = true;

  /** Whether this node's _physicsProcess callback is enabled */
  private _physicsProcessing = true;

  /** Node groups for categorization */
  private _groups: Set<string> = new Set();

  /** Arbitrary metadata storage */
  private _metadata: Map<string, unknown> = new Map();

  /** Reference to the scene tree (set when entering tree) */
  private _tree: import('../scene/SceneTree').SceneTree | null = null;

  // ── Signals ──

  /** Emitted when this node enters the scene tree */
  readonly treeEntered = new Signal<[]>('tree_entered');

  /** Emitted when this node exits the scene tree */
  readonly treeExited = new Signal<[]>('tree_exited');

  /** Emitted when this node is ready */
  readonly ready = new Signal<[]>('ready');

  /** Emitted when a child is added */
  readonly childAdded = new Signal<[Node]>('child_added');

  /** Emitted when a child is removed */
  readonly childRemoved = new Signal<[Node]>('child_removed');

  /** Emitted when this node is reparented */
  readonly parentChanged = new Signal<[Node | null]>('parent_changed');

  /** Emitted when this node is renamed */
  readonly renamed = new Signal<[string]>('renamed');

  constructor(options?: NodeOptions | string) {
    this.id = nextNodeId++;
    const opts = typeof options === 'string' ? { name: options } : options;
    this.name = opts?.name ?? this.constructor.name;
    this.processMode = opts?.processMode ?? ProcessMode.Inherit;
    this.processPriority = opts?.processPriority ?? 0;
  }

  // ── Lifecycle State ──

  get lifecycle(): NodeLifecycle {
    return this._lifecycle;
  }

  get isInsideTree(): boolean {
    return (
      this._lifecycle === NodeLifecycle.InTree ||
      this._lifecycle === NodeLifecycle.Ready
    );
  }

  get isReady(): boolean {
    return this._lifecycle === NodeLifecycle.Ready;
  }

  get isDisposed(): boolean {
    return this._lifecycle === NodeLifecycle.Disposed;
  }

  // ── Parent / Children ──

  get parent(): Node | null {
    return this._parent;
  }

  get children(): ReadonlyArray<Node> {
    return this._children;
  }

  get childCount(): number {
    return this._children.length;
  }

  /**
   * Get the scene tree this node belongs to, if any.
   */
  get sceneTree(): import('../scene/SceneTree').SceneTree | null {
    return this._tree;
  }

  /**
   * Godot-compatible method to get the scene tree this node belongs to.
   */
  getTree(): import('../scene/SceneTree').SceneTree | null {
    return this._tree;
  }

  /**
   * Godot-compatible method to get all direct children as an array.
   */
  getChildren(): Node[] {
    return [...this._children];
  }

  /**
   * Add a child node. The child's lifecycle hooks will be called
   * if this node is already in the tree.
   */
  addChild(child: Node): void {
    if (child === this) {
      throw new Error(`[ThreeDot] Cannot add node "${this.name}" as its own child.`);
    }
    if (child._parent === this) {
      return; // Already a child
    }
    if (this._isAncestorOf(child)) {
      // 'child' is actually our ancestor — would create a cycle
      throw new Error(
        `[ThreeDot] Cannot add "${child.name}" as child of "${this.name}" — it would create a cycle.`
      );
    }
    if (child.isDisposed) {
      throw new Error(`[ThreeDot] Cannot add disposed node "${child.name}".`);
    }

    // Remove from previous parent first
    if (child._parent) {
      child._parent.removeChild(child);
    }

    this._ensureUniqueChildName(child);
    child._parent = this;
    this._children.push(child);
    this.childAdded.emit(child);
    child.parentChanged.emit(this);

    // If we're in the tree, propagate tree entry to the new child
    if (this.isInsideTree && this._tree) {
      child._propagateEnterTree(this._tree);
    }
  }

  /**
   * Add a child at a specific index.
   */
  addChildAt(child: Node, index: number): void {
    if (child === this) {
      throw new Error(`[ThreeDot] Cannot add node "${this.name}" as its own child.`);
    }
    if (this._isAncestorOf(child)) {
      throw new Error(
        `[ThreeDot] Cannot add "${child.name}" as child of "${this.name}" — it would create a cycle.`
      );
    }
    if (child.isDisposed) {
      throw new Error(`[ThreeDot] Cannot add disposed node "${child.name}".`);
    }

    if (child._parent) {
      child._parent.removeChild(child);
    }

    this._ensureUniqueChildName(child);
    child._parent = this;
    const clampedIndex = Math.max(0, Math.min(index, this._children.length));
    this._children.splice(clampedIndex, 0, child);
    this.childAdded.emit(child);
    child.parentChanged.emit(this);

    if (this.isInsideTree && this._tree) {
      child._propagateEnterTree(this._tree);
    }
  }

  private _ensureUniqueChildName(child: Node): void {
    const existingNames = new Set(this._children.map(c => c.name));
    if (!existingNames.has(child.name)) {
      return;
    }

    const baseName = child.name.replace(/\d+$/, '');
    let counter = 2;
    let candidate = `${baseName}${counter}`;
    while (existingNames.has(candidate)) {
      counter++;
      candidate = `${baseName}${counter}`;
    }
    child.name = candidate;
  }

  /**
   * Remove a child node.
   */
  removeChild(child: Node): void {
    const idx = this._children.indexOf(child);
    if (idx === -1) {
      return;
    }

    // Propagate tree exit if in tree
    if (child.isInsideTree) {
      child._propagateExitTree();
    }

    this._children.splice(idx, 1);
    child._parent = null;
    this.childRemoved.emit(child);
    child.parentChanged.emit(null);
  }

  /**
   * Remove this node from its parent.
   */
  removeFromParent(): void {
    if (this._parent) {
      this._parent.removeChild(this);
    }
  }

  /**
   * Remove and dispose all children.
   */
  removeAllChildren(): void {
    // Work on a copy because removeChild mutates the array
    const childrenCopy = [...this._children];
    for (const child of childrenCopy) {
      this.removeChild(child);
    }
  }

  /**
   * Replace a child with another node.
   */
  replaceChild(oldChild: Node, newChild: Node): void {
    const idx = this._children.indexOf(oldChild);
    if (idx === -1) {
      throw new Error(
        `[ThreeDot] Node "${oldChild.name}" is not a child of "${this.name}".`
      );
    }

    this.removeChild(oldChild);
    this.addChildAt(newChild, idx);
  }

  /**
   * Move a child to a different index.
   */
  moveChild(child: Node, newIndex: number): void {
    const idx = this._children.indexOf(child);
    if (idx === -1) {
      throw new Error(
        `[ThreeDot] Node "${child.name}" is not a child of "${this.name}".`
      );
    }
    this._children.splice(idx, 1);
    const clampedIndex = Math.max(0, Math.min(newIndex, this._children.length));
    this._children.splice(clampedIndex, 0, child);
  }

  /**
   * Get the index of a child.
   */
  getChildIndex(child: Node): number {
    return this._children.indexOf(child);
  }

  /**
   * Get a child by index.
   */
  getChild(index: number): Node | undefined {
    return this._children[index];
  }

  /**
   * Reparent this node to a new parent.
   */
  reparent(newParent: Node): void {
    if (newParent === this._parent) {
      return;
    }
    if (this._parent) {
      this._parent.removeChild(this);
    }
    newParent.addChild(this);
  }

  // ── Tree Traversal ──

  /**
   * Find a direct child by name.
   */
  getChildByName(name: string): Node | undefined {
    return this._children.find(c => c.name === name);
  }

  /**
   * Find a descendant by name (depth-first search).
   */
  findChild(name: string, recursive = true): Node | undefined {
    for (const child of this._children) {
      if (child.name === name) {
        return child;
      }
      if (recursive) {
        const found = child.findChild(name, true);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Find a descendant by type.
   */
  findChildByType<T extends Node>(type: new (...args: unknown[]) => T): T | undefined {
    for (const child of this._children) {
      if (child instanceof type) {
        return child;
      }
      const found = child.findChildByType(type);
      if (found) return found;
    }
    return undefined;
  }

  /**
   * Find all descendants matching a predicate.
   */
  findChildren(predicate: (node: Node) => boolean, recursive = true): Node[] {
    const result: Node[] = [];
    for (const child of this._children) {
      if (predicate(child)) {
        result.push(child);
      }
      if (recursive) {
        result.push(...child.findChildren(predicate, true));
      }
    }
    return result;
  }

  /**
   * Find all descendants of a given type.
   */
  findChildrenByType<T extends Node>(type: new (...args: unknown[]) => T): T[] {
    const result: T[] = [];
    this._collectByType(type, result);
    return result;
  }

  private _collectByType<T extends Node>(
    type: new (...args: unknown[]) => T,
    result: T[]
  ): void {
    for (const child of this._children) {
      if (child instanceof type) {
        result.push(child);
      }
      child._collectByType(type, result);
    }
  }

  /**
   * Get a node by its path relative to this node.
   * Paths use "/" as separator. ".." refers to parent.
   */
  getNode(path: string): Node | null {
    if (!path) return null;

    const parts = path.split('/');
    let current: Node | null = this;

    for (const part of parts) {
      if (!current) return null;
      if (part === '' || part === '.') {
        continue;
      }
      if (part === '..') {
        current = current._parent;
      } else {
        current = current.getChildByName(part) ?? null;
      }
    }

    return current;
  }

  /**
   * Get the absolute path of this node in the tree.
   */
  getPath(): string {
    const parts: string[] = [];
    let current: Node | null = this;
    while (current) {
      parts.unshift(current.name);
      current = current._parent;
    }
    return '/' + parts.join('/');
  }

  /**
   * Iterate all descendants depth-first.
   */
  *traverse(): Generator<Node> {
    for (const child of this._children) {
      yield child;
      yield* child.traverse();
    }
  }

  /**
   * Iterate ancestors from parent to root.
   */
  *ancestors(): Generator<Node> {
    let current = this._parent;
    while (current) {
      yield current;
      current = current._parent;
    }
  }

  /**
   * Get the root of the tree this node belongs to.
   */
  getRoot(): Node {
    let current: Node = this;
    while (current._parent) {
      current = current._parent;
    }
    return current;
  }

  // ── Groups ──

  /**
   * Add this node to a named group.
   */
  addToGroup(group: string): void {
    this._groups.add(group);
    if (this._tree) {
      this._tree.registerNodeInGroup(this, group);
    }
  }

  /**
   * Remove this node from a named group.
   */
  removeFromGroup(group: string): void {
    this._groups.delete(group);
    if (this._tree) {
      this._tree.unregisterNodeFromGroup(this, group);
    }
  }

  /**
   * Check if this node belongs to a group.
   */
  isInGroup(group: string): boolean {
    return this._groups.has(group);
  }

  /**
   * Get all groups this node belongs to.
   */
  getGroups(): ReadonlySet<string> {
    return this._groups;
  }

  // ── Metadata ──

  /**
   * Set a metadata value.
   */
  setMeta(key: string, value: unknown): void {
    this._metadata.set(key, value);
  }

  /**
   * Get a metadata value.
   */
  getMeta<T = unknown>(key: string): T | undefined {
    return this._metadata.get(key) as T | undefined;
  }

  /**
   * Check if a metadata key exists.
   */
  hasMeta(key: string): boolean {
    return this._metadata.has(key);
  }

  /**
   * Delete a metadata entry.
   */
  deleteMeta(key: string): boolean {
    return this._metadata.delete(key);
  }

  /**
   * Remove a metadata entry (alias for deleteMeta).
   */
  removeMeta(key: string): boolean {
    return this.deleteMeta(key);
  }

  /**
   * Get all metadata keys stored on this node.
   */
  getMetaList(): string[] {
    return Array.from(this._metadata.keys());
  }

  // ── Processing ──

  /**
   * Enable or disable _process calls for this node.
   */
  setProcess(enabled: boolean): void {
    this._processing = enabled;
  }

  /**
   * Enable or disable _physicsProcess calls for this node.
   */
  setPhysicsProcess(enabled: boolean): void {
    this._physicsProcessing = enabled;
  }

  get isProcessing(): boolean {
    return this._processing;
  }

  get isPhysicsProcessing(): boolean {
    return this._physicsProcessing;
  }

  /**
   * Determine the effective process mode, resolving Inherit up the tree.
   */
  getEffectiveProcessMode(): ProcessMode {
    if (this.processMode !== ProcessMode.Inherit) {
      return this.processMode;
    }
    if (this._parent) {
      return this._parent.getEffectiveProcessMode();
    }
    return ProcessMode.Pausable;
  }

  /**
   * Check if this node should process given the current pause state.
   */
  canProcess(treePaused: boolean): boolean {
    const mode = this.getEffectiveProcessMode();
    switch (mode) {
      case ProcessMode.Always:
        return true;
      case ProcessMode.Pausable:
        return !treePaused;
      case ProcessMode.WhenPaused:
        return treePaused;
      case ProcessMode.Disabled:
        return false;
      default:
        return !treePaused;
    }
  }

  // ── Lifecycle Hooks (override in subclasses) ──

  /** Called when the node enters the scene tree. */
  protected _enterTree(): void {}

  /** Called once after the node and all children have entered the tree. */
  protected _ready(): void {}

  /** Called when the node exits the scene tree. */
  protected _exitTree(): void {}

  /** Called every frame. Override to add per-frame behavior. */
  protected _process(_delta: number): void {}

  /** Called at fixed timestep. Override for physics updates. */
  protected _physicsProcess(_delta: number): void {}

  /** Called when this node is being destroyed. Clean up resources. */
  protected _destroy(): void {}

  // ── Internal Lifecycle Management ──

  /** @internal Propagate enter-tree down the hierarchy */
  _propagateEnterTree(tree: import('../scene/SceneTree').SceneTree): void {
    if (this.isInsideTree) return;

    this._lifecycle = NodeLifecycle.EnteringTree;
    this._tree = tree;

    // Register groups
    for (const group of this._groups) {
      tree.registerNodeInGroup(this, group);
    }

    this._lifecycle = NodeLifecycle.InTree;

    try {
      this._enterTree();
    } catch (err) {
      console.error(`[ThreeDot] Error in _enterTree for "${this.name}":`, err);
    }

    this.treeEntered.emit();

    // Propagate to children
    for (const child of this._children) {
      child._propagateEnterTree(tree);
    }

    // Call _ready only on first entry
    if (!this._readyCalled) {
      this._readyCalled = true;
      this._lifecycle = NodeLifecycle.Ready;

      try {
        this._ready();
      } catch (err) {
        console.error(`[ThreeDot] Error in _ready for "${this.name}":`, err);
      }

      this.ready.emit();
    } else {
      this._lifecycle = NodeLifecycle.Ready;
    }
  }

  /** @internal Propagate exit-tree up from leaves */
  _propagateExitTree(): void {
    if (!this.isInsideTree) return;

    this._lifecycle = NodeLifecycle.ExitingTree;

    // Propagate to children first (leaves exit before parents)
    for (const child of this._children) {
      child._propagateExitTree();
    }

    try {
      this._exitTree();
    } catch (err) {
      console.error(`[ThreeDot] Error in _exitTree for "${this.name}":`, err);
    }

    // Unregister groups
    if (this._tree) {
      for (const group of this._groups) {
        this._tree.unregisterNodeFromGroup(this, group);
      }
    }

    this._tree = null;
    this._lifecycle = NodeLifecycle.OutOfTree;

    this.treeExited.emit();
  }

  /** @internal Process this node and its children */
  _propagateProcess(delta: number, treePaused: boolean): void {
    if (!this.isInsideTree) return;
    if (this.processMode === ProcessMode.Disabled) return;

    if (this.canProcess(treePaused) && this._processing) {
      try {
        this._process(delta);
      } catch (err) {
        console.error(`[ThreeDot] Error in _process for "${this.name}":`, err);
      }
    }

    for (const child of this._children) {
      child._propagateProcess(delta, treePaused);
    }
  }

  /** @internal Physics process this node and its children */
  _propagatePhysicsProcess(delta: number, treePaused: boolean): void {
    if (!this.isInsideTree) return;
    if (this.processMode === ProcessMode.Disabled) return;

    if (this.canProcess(treePaused) && this._physicsProcessing) {
      try {
        this._physicsProcess(delta);
      } catch (err) {
        console.error(
          `[ThreeDot] Error in _physicsProcess for "${this.name}":`,
          err
        );
      }
    }

    for (const child of this._children) {
      child._propagatePhysicsProcess(delta, treePaused);
    }
  }

  // ── Duplication ──

  /**
   * Create a shallow duplicate of this node (without children).
   */
  duplicate(): Node {
    const copy = new (this.constructor as new (options?: NodeOptions) => Node)({
      name: this.name,
      processMode: this.processMode,
      processPriority: this.processPriority,
    });
    // Copy metadata
    for (const [key, value] of this._metadata) {
      copy.setMeta(key, value);
    }
    // Copy groups
    for (const group of this._groups) {
      copy.addToGroup(group);
    }
    return copy;
  }

  /**
   * Create a deep duplicate including all descendants.
   */
  duplicateDeep(): Node {
    const copy = this.duplicate();
    for (const child of this._children) {
      copy.addChild(child.duplicateDeep());
    }
    return copy;
  }

  // ── Dispose ──

  /**
   * Destroy this node and all its children.
   * Removes from parent, cleans up signals, disposes resources.
   */
  dispose(): void {
    if (this._lifecycle === NodeLifecycle.Disposed) return;

    this._lifecycle = NodeLifecycle.Destroying;

    // Dispose children first
    const childrenCopy = [...this._children];
    for (const child of childrenCopy) {
      child.dispose();
    }
    this._children = [];

    // Remove from parent
    if (this._parent) {
      const idx = this._parent._children.indexOf(this);
      if (idx !== -1) {
        this._parent._children.splice(idx, 1);
        this._parent.childRemoved.emit(this);
      }
      this._parent = null;
    }

    // Call destroy hook
    try {
      this._destroy();
    } catch (err) {
      console.error(`[ThreeDot] Error in _destroy for "${this.name}":`, err);
    }

    // Clean up signals
    this.treeEntered.dispose();
    this.treeExited.dispose();
    this.ready.dispose();
    this.childAdded.dispose();
    this.childRemoved.dispose();
    this.parentChanged.dispose();
    this.renamed.dispose();

    // Clear metadata and groups
    this._metadata.clear();
    this._groups.clear();
    this._tree = null;

    this._lifecycle = NodeLifecycle.Disposed;
  }

  // ── Utility ──

  /**
   * Check if `possibleAncestor` is an ancestor of this node.
   */
  private _isAncestorOf(possibleAncestor: Node): boolean {
    let current: Node | null = this._parent;
    while (current) {
      if (current === possibleAncestor) {
        return true;
      }
      current = current._parent;
    }
    return false;
  }

  /**
   * Print a debug representation of the subtree.
   */
  printTree(indent = 0): string {
    const prefix = '  '.repeat(indent);
    let result = `${prefix}${this.name} [${this.constructor.name}] (${this._lifecycle})\n`;
    for (const child of this._children) {
      result += child.printTree(indent + 1);
    }
    return result;
  }

  toString(): string {
    return `[${this.constructor.name}:${this.name}#${this.id}]`;
  }
}
