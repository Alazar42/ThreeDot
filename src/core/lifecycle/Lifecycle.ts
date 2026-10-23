/**
 * ThreeDot Node Lifecycle
 *
 * Defines lifecycle phases and processing contracts for nodes in the scene tree.
 */

/**
 * Lifecycle phase of a node.
 */
export enum NodeLifecycle {
  /** Node has been constructed but not added to any tree */
  Created = 'created',
  /** Node is entering the tree (parent assigned, about to call _enterTree) */
  EnteringTree = 'entering_tree',
  /** Node is in the tree and _enterTree has been called */
  InTree = 'in_tree',
  /** Node has been initialized and _ready has been called */
  Ready = 'ready',
  /** Node is being removed from the tree (_exitTree about to be called) */
  ExitingTree = 'exiting_tree',
  /** Node has been removed from tree */
  OutOfTree = 'out_of_tree',
  /** Node is being destroyed */
  Destroying = 'destroying',
  /** Node has been fully disposed */
  Disposed = 'disposed',
}

/**
 * Process mode determines when a node receives _process and _physicsProcess callbacks.
 */
export enum ProcessMode {
  /** Inherit process mode from parent. If no parent, defaults to Pausable. */
  Inherit = 'inherit',
  /** Always process, even when tree is paused */
  Always = 'always',
  /** Process only when tree is NOT paused (default behavior) */
  Pausable = 'pausable',
  /** Process only when tree IS paused */
  WhenPaused = 'when_paused',
  /** Never process */
  Disabled = 'disabled',
}

/**
 * Interface for objects that participate in the engine's frame loop.
 */
export interface IProcessable {
  /** Called every frame with the frame delta time in seconds */
  _process(delta: number): void;

  /** Called at fixed timestep intervals for physics updates */
  _physicsProcess(delta: number): void;
}

/**
 * Interface for objects with lifecycle hooks triggered by the scene tree.
 */
export interface ILifecycleHooks {
  /** Called when the node enters the scene tree */
  _enterTree(): void;

  /** Called once after the node and all its children have entered the tree for the first time */
  _ready(): void;

  /** Called when the node exits the scene tree */
  _exitTree(): void;

  /** Called when the node is being destroyed. Clean up resources here. */
  _destroy(): void;
}
