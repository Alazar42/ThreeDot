import type { ClassDoc } from '../types';

export const coreClasses: ClassDoc[] = [
  {
    name: 'Engine',
    category: 'Core Systems',
    brief: 'The primary runtime coordinator that hosts the WebGLRenderer, SceneTree, InputManager, physics servers, and the main animation loop.',
    description: `The Engine class is the root orchestrator of every ThreeDot application. It manages the Three.js WebGLRenderer, owns the top-level SceneTree instance, drives fixed-timestep physics updates, coordinates input polling, and manages resource lifetimes.

When initialized, the Engine attaches a WebGL canvas to the target HTML container, creates a default Three.js perspective camera, and initializes the root node of the SceneTree with internal engine metadata. The engine executes a deterministic game loop using requestAnimationFrame:
1. Calculates delta time and updates FPS statistics.
2. Polls connected gamepad hardware.
3. Steps physics servers (PhysicsServer3D and PhysicsServer2D) in fixed timesteps (default: 60 Hz).
4. Recursively calls _physicsProcess on all active nodes.
5. Recursively calls _process on all active nodes.
6. Renders the Three.js scene through the active camera.
7. Dispatches input cleanup at end-of-frame.
8. Emits the frameProcessed signal with frame delta.`,
    codeExample: `import { Engine, Camera3D, MeshInstance3D, THREE } from 'threedot';

// Initialize the ThreeDot Engine inside a DOM container
const container = document.getElementById('canvas-container')!;
const engine = new Engine({
  container,
  antialias: true,
  shadows: true,
  backgroundColor: 0x0f1217,
  physicsTimestep: 1 / 60,
  autoStart: true,
  autoResize: true,
});

// Configure camera and scene
const camera = new Camera3D({
  name: 'MainCamera',
  fov: 60,
  position: { x: 0, y: 5, z: 10 },
});
camera.lookAt(new THREE.Vector3(0, 0, 0));
engine.sceneTree.root.addChild(camera);
camera.makeCurrent();

// Listen to engine signals
engine.frameProcessed.connect((delta) => {
  // Executed after every rendered frame
});

// Pause / Resume scene execution
engine.sceneTree.paused = true;`,
    properties: [
      {
        name: 'renderer',
        type: 'THREE.WebGLRenderer',
        description: 'Direct reference to the underlying Three.js WebGLRenderer instance. Provides access to WebGL capabilities, shadow map configurations, and render metrics (draw calls, triangles).',
      },
      {
        name: 'sceneTree',
        type: 'SceneTree',
        description: 'The root hierarchical scene tree governing all nodes, lifecycle hooks, process loops, and pausing.',
      },
      {
        name: 'threeScene',
        type: 'THREE.Scene',
        description: 'The native Three.js Scene graph rendered by the WebGL renderer. All Node3D Object3D instances are attached here.',
      },
      {
        name: 'camera',
        type: 'THREE.PerspectiveCamera | THREE.OrthographicCamera',
        description: 'The currently active rendering camera. Setting this property automatically synchronizes the camera aspect ratio and updates its projection matrix based on current viewport dimensions.',
      },
      {
        name: 'input',
        type: 'InputManager',
        description: 'Engine-wide input subsystem mapping physical keys, mouse buttons, pointers, and gamepad axes into virtual semantic actions.',
      },
      {
        name: 'physics3D',
        type: 'PhysicsServer3D',
        description: '3D Rapier physics server managing rigid bodies, colliders, raycasts, and fixed-timestep simulation.',
      },
      {
        name: 'physics2D',
        type: 'PhysicsServer2D',
        description: '2D Rapier physics server managing 2D rigid bodies, kinematic colliders, and collision events.',
      },
      {
        name: 'resources',
        type: 'ResourceManager',
        description: 'Centralized asset cache and loader for textures, 3D models (GLTF/OBJ), audio clips, and fonts.',
      },
      {
        name: 'container',
        type: 'HTMLElement',
        description: 'The parent HTML container element hosting the canvas element.',
      },
      {
        name: 'canvas',
        type: 'HTMLCanvasElement',
        description: 'The WebGL canvas element created by the renderer.',
      },
      {
        name: 'fps',
        type: 'number',
        description: 'Current real-time frames per second, recalculated once every second.',
      },
      {
        name: 'elapsedTime',
        type: 'number',
        description: 'Total seconds elapsed since the engine loop started.',
      },
      {
        name: 'frameCount',
        type: 'number',
        description: 'Total number of frames rendered since initialization.',
      },
      {
        name: 'isRunning',
        type: 'boolean',
        description: 'True if the main animation loop is currently actively executing.',
      },
      {
        name: 'viewportSize',
        type: 'THREE.Vector2',
        description: 'Current renderer width and height in CSS pixels.',
      },
    ],
    methods: [
      {
        name: 'start',
        returns: 'void',
        params: [],
        description: 'Starts or resumes the engine animation loop. Triggers the started signal.',
      },
      {
        name: 'stop',
        returns: 'void',
        params: [],
        description: 'Pauses the animation loop and halts requestAnimationFrame callbacks. Triggers the stopped signal.',
      },
      {
        name: 'resize',
        returns: 'void',
        params: [
          { name: 'width', type: 'number', description: 'New width in pixels' },
          { name: 'height', type: 'number', description: 'New height in pixels' },
        ],
        description: 'Updates renderer canvas dimensions and updates camera aspect ratios and projection matrices. Triggers resized signal.',
      },
      {
        name: 'getDiagnostics',
        returns: 'EngineDiagnostics',
        params: [],
        description: 'Returns a complete snapshot of performance diagnostics: fps, frameTime, drawCalls, triangles, nodeCount, frameCount, and elapsedTime.',
      },
      {
        name: 'dispose',
        returns: 'void',
        params: [],
        description: 'Fully shuts down the engine, disconnects ResizeObservers, disposes physics servers, disposes all loaded Three.js geometries and materials, clears the SceneTree, and disposes the WebGLRenderer.',
      },
    ],
    signals: [
      {
        name: 'started',
        args: [],
        description: 'Emitted when the engine loop starts or resumes execution.',
      },
      {
        name: 'stopped',
        args: [],
        description: 'Emitted when the engine loop is halted via stop().',
      },
      {
        name: 'resized',
        args: [
          { name: 'width', type: 'number' },
          { name: 'height', type: 'number' },
        ],
        description: 'Emitted whenever the engine container dimensions change and the renderer is resized.',
      },
      {
        name: 'frameProcessed',
        args: [{ name: 'delta', type: 'number' }],
        description: 'Emitted on every frame after process ticks, physics steps, and WebGL rendering are finished.',
      },
    ],
  },
  {
    name: 'SceneTree',
    category: 'Core Systems',
    brief: 'The hierarchical manager of active nodes, responsible for node life cycle propagation, process loop dispatching, and scene pausing.',
    description: `SceneTree is the architectural spine of ThreeDot, mirroring Godot's SceneTree. It maintains the single root node of the application, traverses nodes for lifecycle transitions, and orchestrates process execution.

When paused is set to true on the SceneTree:
- Nodes with ProcessMode.Inherit or ProcessMode.Pausable stop receiving _process and _physicsProcess callbacks.
- Nodes with ProcessMode.WhenPaused or ProcessMode.Always continue processing unimpeded (ideal for pause menus, animations, and camera fly-modes).
- Child nodes of paused parents still receive process ticks if their own ProcessMode is configured to ProcessMode.Always.`,
    codeExample: `import { SceneTree, Node, ProcessMode } from 'threedot';

const tree = engine.sceneTree;

// Pause the entire game simulation
tree.paused = true;

// Create a pause menu node that can still process while paused
class PauseMenu extends Node {
  constructor() {
    super({ name: 'PauseMenu', processMode: ProcessMode.WhenPaused });
  }

  override _process(delta: number): void {
    // Executes ONLY while the game is paused!
  }
}

tree.root.addChild(new PauseMenu());

// Find nodes by group or predicate
const enemies = tree.getNodesInGroup('enemies');
const player = tree.findNode((n) => n.name === 'Player');`,
    properties: [
      {
        name: 'root',
        type: 'Node',
        description: 'The root Node of the active scene tree hierarchy.',
      },
      {
        name: 'paused',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether the scene tree is paused. Pauses process ticks on pausable nodes and emits pauseChanged.',
      },
      {
        name: 'currentScene',
        type: 'Node | null',
        description: 'Reference to the primary root scene node, if managed via changeSceneToFile or changeSceneToNode.',
      },
      {
        name: 'nodeCount',
        type: 'number',
        description: 'Total count of active nodes currently in the scene tree.',
      },
    ],
    methods: [
      {
        name: 'processTree',
        returns: 'void',
        params: [{ name: 'delta', type: 'number', description: 'Frame elapsed delta in seconds' }],
        description: 'Propagates process ticks throughout the node hierarchy according to node processPriority and processMode.',
      },
      {
        name: 'physicsProcessTree',
        returns: 'void',
        params: [{ name: 'delta', type: 'number', description: 'Fixed physics delta step in seconds' }],
        description: 'Propagates physicsProcess ticks through all eligible nodes in the tree hierarchy.',
      },
      {
        name: 'getNodesInGroup',
        returns: 'Node[]',
        params: [{ name: 'group', type: 'string', description: 'Group identifier tag' }],
        description: 'Returns a flat array of all nodes in the tree that are currently members of the specified group.',
      },
      {
        name: 'callGroup',
        returns: 'void',
        params: [
          { name: 'group', type: 'string', description: 'Target group name' },
          { name: 'method', type: 'string', description: 'Name of the method to invoke on matching nodes' },
          { name: '...args', type: 'unknown[]', description: 'Arguments passed to each invoked method' },
        ],
        description: 'Invokes a named method with provided arguments on all nodes belonging to the target group.',
      },
      {
        name: 'notifyGroup',
        returns: 'void',
        params: [
          { name: 'group', type: 'string', description: 'Target group name' },
          { name: 'notification', type: 'number', description: 'Numeric notification code' },
        ],
        description: 'Broadcasts a numeric notification code to all members of the specified group.',
      },
      {
        name: 'findNode',
        returns: 'Node | null',
        params: [{ name: 'predicate', type: '(node: Node) => boolean', description: 'Filter predicate function' }],
        description: 'Traverses the tree in depth-first order and returns the first node matching the predicate.',
      },
      {
        name: 'findNodes',
        returns: 'Node[]',
        params: [{ name: 'predicate', type: '(node: Node) => boolean', description: 'Filter predicate function' }],
        description: 'Traverses the tree and collects all nodes satisfying the predicate function.',
      },
      {
        name: 'changeSceneToNode',
        returns: 'void',
        params: [{ name: 'newScene', type: 'Node', description: 'The root node of the new scene to instantiate' }],
        description: 'Disposes the current active scene and attaches the newScene to tree.root.',
      },
      {
        name: 'reloadCurrentScene',
        returns: 'void',
        params: [],
        description: 'Reloads and re-instantiates the current scene from its registered PackedScene template.',
      },
      {
        name: 'dispose',
        returns: 'void',
        params: [],
        description: 'Recursively disposes all nodes in the tree and frees all listeners.',
      },
    ],
    signals: [
      {
        name: 'pauseChanged',
        args: [{ name: 'isPaused', type: 'boolean' }],
        description: 'Emitted whenever tree.paused changes state.',
      },
      {
        name: 'nodeAdded',
        args: [{ name: 'node', type: 'Node' }],
        description: 'Emitted whenever any node is added to the scene tree.',
      },
      {
        name: 'nodeRemoved',
        args: [{ name: 'node', type: 'Node' }],
        description: 'Emitted whenever any node is removed from the scene tree.',
      },
    ],
  },
  {
    name: 'Node',
    category: 'Core Systems',
    brief: 'The foundational base class for all elements in a ThreeDot scene tree. Implements hierarchical parenting, lifecycle hooks, process loops, groups, metadata, and signals.',
    description: `Node is the core abstraction in ThreeDot, directly modeled after Godot's Node class. Everything in a ThreeDot game or application—whether a 3D mesh, a light, a camera, a 2D sprite, a physics body, or a UI button—derives from Node.

Key capabilities of Node:
1. Hierarchical Parenting: Every node has at most one parent and zero or more children. Adding a child triggers automatic sibling name uniqueness (e.g., adding duplicate 'Player' names results in 'Player2', 'Player3').
2. Deterministic Lifecycle:
   - _enterTree(): Invoked when the node or its ancestor enters an active SceneTree.
   - _ready(): Invoked once when the node and all of its recursive children have entered the tree.
   - _process(delta): Invoked on every rendered frame with delta time in seconds.
   - _physicsProcess(delta): Invoked on fixed physics steps (default 60 Hz).
   - _exitTree(): Invoked when removed from the active SceneTree.
   - _destroy(): Invoked when dispose() is called to clean up resources.
3. Groups: Nodes can join multiple string groups for batch messaging and queries (e.g. 'enemies', 'interactives').
4. Metadata: Arbitrary key-value metadata storage using setMeta(), getMeta(), and hasMeta().
5. Process Priority: Controls order of execution for _process; nodes with lower priority values execute first.`,
    codeExample: `import { Node, ProcessMode, Signal } from 'threedot';

export class HealthBarController extends Node {
  maxHealth = 100;
  currentHealth = 100;

  // Custom typed signal
  readonly healthChanged = new Signal<[number, number]>('health_changed');

  constructor() {
    super({
      name: 'HealthBarController',
      processMode: ProcessMode.Inherit,
      processPriority: 0,
    });
  }

  protected override _ready(): void {
    // Called when this node and all its children have entered the active tree
    this.addToGroup('ui_controllers');
  }

  override _process(delta: number): void {
    // Frame update loop
  }

  takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.healthChanged.emit(this.currentHealth, this.maxHealth);
  }
}`,
    properties: [
      {
        name: 'id',
        type: 'number',
        description: 'Globally unique numeric identifier assigned sequentially to each node upon instantiation.',
      },
      {
        name: 'name',
        type: 'string',
        description: 'The name of this node. Sibling nodes must have unique names; duplicates are automatically suffixed (e.g., Node2, Node3).',
      },
      {
        name: 'parent',
        type: 'Node | null',
        description: 'The parent node of this node in the hierarchy, or null if it is the root or unparented.',
      },
      {
        name: 'processMode',
        type: 'ProcessMode',
        defaultValue: 'ProcessMode.Inherit',
        description: 'Determines whether and when this node receives _process and _physicsProcess callbacks: Inherit, Pausable, WhenPaused, Always, or Disabled.',
      },
      {
        name: 'processPriority',
        type: 'number',
        defaultValue: '0',
        description: 'Execution priority order. Lower numbers execute earlier in each frame.',
      },
      {
        name: 'isInsideTree',
        type: 'boolean',
        description: 'True if this node is currently part of an active SceneTree.',
      },
      {
        name: 'isReady',
        type: 'boolean',
        description: 'True if this node has completed its initial _ready() execution.',
      },
      {
        name: 'isDisposed',
        type: 'boolean',
        description: 'True if dispose() has been called on this node.',
      },
    ],
    methods: [
      {
        name: 'addChild',
        returns: 'void',
        params: [{ name: 'child', type: 'Node', description: 'The node to append as a child' }],
        description: 'Appends a child node to this node. Enforces sibling name uniqueness and propagates tree entry lifecycle.',
      },
      {
        name: 'removeChild',
        returns: 'void',
        params: [{ name: 'child', type: 'Node', description: 'The child node to detach' }],
        description: 'Detaches a direct child node from this node and propagates _exitTree().',
      },
      {
        name: 'getChildren',
        returns: 'Node[]',
        params: [],
        description: 'Returns a shallow copy array of all immediate child nodes.',
      },
      {
        name: 'getChildCount',
        returns: 'number',
        params: [],
        description: 'Returns the number of immediate child nodes.',
      },
      {
        name: 'getChild',
        returns: 'Node | null',
        params: [{ name: 'index', type: 'number', description: '0-based index' }],
        description: 'Returns the child node at the given index, or null if out of bounds.',
      },
      {
        name: 'getNode',
        returns: 'Node | null',
        params: [{ name: 'path', type: 'string', description: 'Node path (e.g., "../Player/Weapon")' }],
        description: 'Resolves a node by relative or absolute path in the hierarchy.',
      },
      {
        name: 'getPath',
        returns: 'string',
        params: [],
        description: 'Returns the absolute path of this node from the tree root (e.g., "/root/Player/Gun").',
      },
      {
        name: 'getTree',
        returns: 'SceneTree | null',
        params: [],
        description: 'Returns the active SceneTree this node belongs to, or null if unparented.',
      },
      {
        name: 'removeFromParent',
        returns: 'void',
        params: [],
        description: 'Convenience helper to remove this node from its parent if currently attached.',
      },
      {
        name: 'removeAllChildren',
        returns: 'void',
        params: [],
        description: 'Removes all child nodes from this node in reverse order.',
      },
      {
        name: 'addToGroup',
        returns: 'void',
        params: [{ name: 'group', type: 'string', description: 'Group name tag' }],
        description: 'Adds this node to a group. Emits groupChanged.',
      },
      {
        name: 'removeFromGroup',
        returns: 'void',
        params: [{ name: 'group', type: 'string', description: 'Group name tag' }],
        description: 'Removes this node from a group.',
      },
      {
        name: 'isInGroup',
        returns: 'boolean',
        params: [{ name: 'group', type: 'string', description: 'Group name tag' }],
        description: 'Returns true if this node is a member of the specified group.',
      },
      {
        name: 'getGroups',
        returns: 'ReadonlySet<string>',
        params: [],
        description: 'Returns a read-only Set of all groups this node belongs to.',
      },
      {
        name: 'setMeta',
        returns: 'void',
        params: [
          { name: 'key', type: 'string', description: 'Metadata key' },
          { name: 'value', type: 'unknown', description: 'Arbitrary value to store' },
        ],
        description: 'Sets a custom metadata entry on this node.',
      },
      {
        name: 'getMeta',
        returns: 'T | undefined',
        params: [
          { name: 'key', type: 'string', description: 'Metadata key' },
          { name: 'defaultValue?', type: 'T', description: 'Optional fallback value' },
        ],
        description: 'Retrieves a metadata value by key.',
      },
      {
        name: 'hasMeta',
        returns: 'boolean',
        params: [{ name: 'key', type: 'string', description: 'Metadata key' }],
        description: 'Returns true if metadata with the given key exists.',
      },
      {
        name: 'removeMeta',
        returns: 'boolean',
        params: [{ name: 'key', type: 'string', description: 'Metadata key' }],
        description: 'Deletes a metadata entry by key. Returns true if key was present.',
      },
      {
        name: 'duplicate',
        returns: 'Node',
        params: [],
        description: 'Creates a deep copy of this node, cloning its properties and group memberships.',
      },
      {
        name: 'dispose',
        returns: 'void',
        params: [],
        description: 'Cleans up this node and all of its descendants, disconnecting all signals and freeing resources.',
      },
    ],
    signals: [
      { name: 'treeEntered', args: [], description: 'Emitted when this node enters the active SceneTree.' },
      { name: 'treeExited', args: [], description: 'Emitted when this node exits the active SceneTree.' },
      { name: 'ready', args: [], description: 'Emitted once when this node and all descendants are ready.' },
      { name: 'childAdded', args: [{ name: 'child', type: 'Node' }], description: 'Emitted when a child node is added.' },
      { name: 'childRemoved', args: [{ name: 'child', type: 'Node' }], description: 'Emitted when a child node is removed.' },
      { name: 'parentChanged', args: [{ name: 'parent', type: 'Node | null' }], description: 'Emitted when this node is reparented.' },
      { name: 'renamed', args: [{ name: 'name', type: 'string' }], description: 'Emitted when this node is renamed.' },
    ],
    constants: [
      { name: 'ProcessMode.Inherit', value: '0', description: 'Inherits process behavior from parent node.' },
      { name: 'ProcessMode.Pausable', value: '1', description: 'Processes only when SceneTree is NOT paused.' },
      { name: 'ProcessMode.WhenPaused', value: '2', description: 'Processes ONLY when SceneTree is paused.' },
      { name: 'ProcessMode.Always', value: '3', description: 'Always processes regardless of scene paused state.' },
      { name: 'ProcessMode.Disabled', value: '4', description: 'Never processes; ticks are disabled.' },
    ],
  },
  {
    name: 'Signal',
    category: 'Core Systems',
    brief: 'A strongly typed, decoupled observer pattern implementation mirroring Godot signals. Enables nodes to broadcast events safely without tight coupling.',
    description: `Signals in ThreeDot provide a type-safe publish/subscribe messaging system modeled after Godot signals. Unlike standard event emitters, ThreeDot signals are strongly typed through generic tuples, ensuring that emit arguments match listener parameters at compile time.

Signal Binding Approaches in ThreeDot:

1. Properties-Based Signal Binding in JSX (on[SignalName]):
When building scene trees declaratively with ThreeDot's JSX runtime, you can bind signal listeners directly via component properties/props matching the 'on[SignalName]' convention. The JSX runtime automatically maps 'on<Event>' to the corresponding signal on the instantiated node (converting camelCase, e.g. onPressed -> instance.pressed, onReady -> instance.ready, onTreeEntered -> instance.treeEntered, onBodyEntered -> instance.bodyEntered, onValueChanged -> instance.valueChanged) and invokes signal.connect(callback):
- <Button text="Click Me" onPressed={() => handlePress()} />
- <Node3D name="World" onReady={() => console.log('Ready!')} />
- <Area3D onBodyEntered={(body) => onHazard(body)} />

2. Declarative SignalBus Props in JSX:
Interactive nodes in JSX also accept declarative SignalBus dispatch properties:
- threedotSignal="signal_name" (or 'threedot-signal')
- threedotParams={[...]} (or 'threedot-params')
When the button or interactive control is clicked or pressed, it automatically emits the named event with arguments onto the global SignalBus.

3. Imperative Signal Binding:
Connect directly to any signal instance on nodes or custom systems via code:
- node.ready.connect(() => { ... })
- button.pressed.connect(() => { ... })
- signal.connectOneShot(() => { ... }) (or signal.once(() => { ... }))
- await signal.wait() to asynchronously await the next emission.

4. HTML & JSX DOM Bridge via 'threedot-signal':
Standard HTML elements in HUD overlays (such as <button>, <input>, or React/Vue components) can declare:
- threedot-signal="signal_name": The name of the signal to execute when interacted with.
- threedot-params='["arg1", 42]': JSON-encoded or comma-separated parameters passed to the signal listener.
- threedot-event="click": Optional DOM event trigger (defaults to 'click').

When clicked or triggered, ThreeDot automatically routes the signal through SignalBus to any listening 3D nodes or controllers.

Features:
- Strong typing: Signal<[number, string]> enforces that emit(42, 'score') takes exactly a number and a string.
- Declarative JSX Properties: Bind event handlers directly with props like onPressed, onReady, onChildAdded, onBodyEntered.
- HTML / DOM Bridge: Connect standard UI buttons to 3D game logic with zero boilerplate event listeners.
- Connection Management: connect() returns a DisconnectFn callback for one-line unsubscriptions.
- One-shot Connections: connectOneShot() / once() automatically removes the listener after its first invocation.
- Async Support: wait() returns a Promise that resolves on the next emission.
- Automatic Cleanup: Calling disconnectAll() removes all registered listeners.`,
    codeExample: `import { Signal, SignalBus, Button, Node3D, Area3D } from 'threedot';

// ── 1. Properties-Based Signal Binding in JSX ──
// Any 'on<SignalName>' prop automatically connects to node.<signalName>:
const scene = (
  <Node3D name="World" onReady={() => console.log('World initialized!')}>
    {/* Local signal binding via onPressed prop -> Button.pressed.connect(...) */}
    <Button
      text="Fire Laser"
      onPressed={() => player.fire()}
    />

    {/* Global SignalBus dispatch via threedotSignal prop */}
    <Button
      text="Super Jump"
      threedotSignal="player_jump"
      threedotParams={[15]}
    />

    {/* Collision signal binding via onBodyEntered prop */}
    <Area3D
      name="HazardZone"
      onBodyEntered={(body) => player.takeDamage(10)}
    />
  </Node3D>
);

// ── 2. Imperative Signal Binding in Code ──
const scoreUpdated = new Signal<[number, number]>('score_updated');

const disconnect = scoreUpdated.connect((delta, total) => {
  console.log(\`Score changed by \${delta}. New total: \${total}\`);
});

scoreUpdated.emit(10, 100);
disconnect();

// ── 3. HTML / DOM Bridge ──
// In HTML HUD overlay:
// <button threedot-signal="player_jump" threedot-params="[15]">Jump</button>
SignalBus.connect('player_jump', (power: number) => {
  player.jump(power);
});`,
    properties: [
      {
        name: 'name',
        type: 'string',
        description: 'Optional debug name tag associated with the signal.',
      },
      {
        name: 'connectionCount',
        type: 'number',
        description: 'The number of active connected callback listeners.',
      },
      {
        name: 'hasConnections',
        type: 'boolean',
        description: 'True if at least one callback listener is currently connected.',
      },
    ],
    methods: [
      {
        name: 'connect',
        returns: '() => void',
        params: [
          { name: 'callback', type: '(...args: T) => void', description: 'Function to invoke when signal is emitted' },
          { name: 'options?', type: '{ oneShot?: boolean; target?: object }', description: 'Optional connection options' },
        ],
        description: 'Subscribes a callback to this signal. Returns a cleanup function that disconnects the callback when called.',
      },
      {
        name: 'connectOneShot',
        returns: '() => void',
        params: [
          { name: 'callback', type: '(...args: T) => void', description: 'Function invoked only on the next emission' },
        ],
        description: 'Connects a listener that automatically disconnects after receiving its first emission (alias: once).',
      },
      {
        name: 'once',
        returns: '() => void',
        params: [
          { name: 'callback', type: '(...args: T) => void', description: 'Function invoked only on the next emission' },
        ],
        description: 'Alias for connectOneShot. Automatically removes listener after first invocation.',
      },
      {
        name: 'wait',
        returns: 'Promise<T>',
        params: [],
        description: 'Returns a Promise that resolves with emission arguments the next time this signal is emitted.',
      },
      {
        name: 'disconnect',
        returns: 'void',
        params: [{ name: 'callback', type: '(...args: T) => void', description: 'The callback function to remove' }],
        description: 'Disconnects a previously registered callback.',
      },
      {
        name: 'disconnectTarget',
        returns: 'void',
        params: [{ name: 'target', type: 'object', description: 'Target object context to disconnect' }],
        description: 'Disconnects all listeners bound to a particular target object.',
      },
      {
        name: 'disconnectAll',
        returns: 'void',
        params: [],
        description: 'Removes all connected listeners from this signal.',
      },
      {
        name: 'emit',
        returns: 'void',
        params: [{ name: '...args', type: 'T', description: 'Arguments matching the signal generic signature' }],
        description: 'Synchronously invokes all connected listeners with the provided arguments.',
      },
      {
        name: 'isConnected',
        returns: 'boolean',
        params: [{ name: 'callback', type: '(...args: T) => void', description: 'Callback function to check' }],
        description: 'Returns true if the specified callback is currently connected to this signal.',
      },
    ],
    signals: [],
  },
  {
    name: 'SignalBus',
    category: 'Core Systems',
    brief: 'Global decoupled pub/sub event router and automatic HTML/JSX DOM signal bridge for ThreeDot.',
    description: `SignalBus acts as a centralized event broker that enables communication across isolated nodes, systems, and UI overlay elements.

SignalBus events can be dispatched in three ways:
1. Declarative JSX Properties: Interactive nodes like <Button threedotSignal="player_attack" threedotParams={["slash", 45]} /> automatically emit to SignalBus when pressed or clicked.
2. HTML / DOM Bridge: The automatic DOM bridge monitors clicks and inputs on HTML elements annotated with 'threedot-signal="player_attack"' and 'threedot-params='["slash", 45]''.
3. Programmatically in Code: Via SignalBus.emit('player_attack', 'slash', 45).

Usage:
1. In JSX scene tree or UI:
   <Button text="Attack" threedotSignal="player_attack" threedotParams={["heavy_slash", 45]} />

2. In HTML HUD overlay:
   <button threedot-signal="player_attack" threedot-params='["heavy_slash", 45]'>Attack</button>

3. In 3D player or game script:
   SignalBus.connect('player_attack', (attackType: string, power: number) => {
     player.performAttack(attackType, power);
   });`,
    codeExample: `import { SignalBus } from 'threedot';

// 1. Connect to a global signal in game code
const unsubscribe = SignalBus.connect('spawn_enemy', (enemyType: string, level: number) => {
  console.log(\`Spawning \${enemyType} at level \${level}\`);
});

// 2. Trigger via JSX component property:
// <Button text="Spawn Goblin" threedotSignal="spawn_enemy" threedotParams={['goblin', 3]} />

// 3. Trigger via HTML DOM overlay attribute:
// <button threedot-signal="spawn_enemy" threedot-params='["dragon", 50]'>Summon Boss</button>

// 4. Emit programmatically:
SignalBus.emit('spawn_enemy', 'orc', 5);`,
    properties: [],
    methods: [
      {
        name: 'connect',
        returns: '() => void',
        params: [
          { name: 'name', type: 'string', description: 'Name of the signal to subscribe to' },
          { name: 'listener', type: '(...args: any[]) => void', description: 'Callback function' },
        ],
        description: 'Subscribes a listener to the named global signal. Returns an unsubscription callback.',
      },
      {
        name: 'emit',
        returns: 'void',
        params: [
          { name: 'name', type: 'string', description: 'Name of the signal to emit' },
          { name: '...args', type: 'any[]', description: 'Arguments passed to listeners' },
        ],
        description: 'Emits the named global signal with the given arguments.',
      },
      {
        name: 'initDOMBridge',
        returns: 'void',
        params: [
          { name: 'root?', type: 'HTMLElement | Document', description: 'Optional root container to attach event listeners to' },
        ],
        description: 'Initializes delegated event listeners for elements containing threedot-signal and threedot-params attributes.',
      },
      {
        name: 'dispose',
        returns: 'void',
        params: [],
        description: 'Disposes all global signals and clears listener registrations.',
      },
    ],
    signals: [],
  },
  {
    name: 'InputManager',
    category: 'Core Systems',
    brief: 'A virtual action mapping system inspired by Godot InputMap. Maps keyboard, mouse, pointer, and gamepad inputs to semantic gameplay actions.',
    description: `InputManager abstracts raw physical hardware input into high-level semantic actions (e.g. 'jump', 'move_left', 'fire'). Instead of checking event.code === 'KeyW' in game logic, nodes query input.isActionPressed('jump') or input.getVector('move_left', 'move_right', 'move_up', 'move_down').

Input features:
- Action Mapping: Map multiple keyboard keys, mouse buttons, and gamepad buttons/axes to a single action name.
- Just Pressed / Just Released: Accurate single-frame trigger detection.
- Vector & Axis Helpers: Built-in 2D normalized direction vector calculation (e.g. WASD or thumbstick).
- Gamepad Support: Full polling of standard Gamepad API axes and digital buttons.
- Mouse Position & Relative Delta: Tracks screen coordinates, canvas relative position, and mouse motion deltas.`,
    codeExample: `import { Engine } from 'threedot';

// Configure semantic actions
engine.input.configureActions({
  move_left: [{ type: 'key', code: 'KeyA' }, { type: 'key', code: 'ArrowLeft' }],
  move_right: [{ type: 'key', code: 'KeyD' }, { type: 'key', code: 'ArrowRight' }],
  move_up: [{ type: 'key', code: 'KeyW' }, { type: 'key', code: 'ArrowUp' }],
  move_down: [{ type: 'key', code: 'KeyS' }, { type: 'key', code: 'ArrowDown' }],
  jump: [{ type: 'key', code: 'Space' }, { type: 'gamepad-button', button: 0 }],
  fire: [{ type: 'mouse-button', button: 0 }],
});

// Inside a player node process loop:
class Player extends Node {
  override _process(delta: number): void {
    const input = this._findEngine()!.input;

    // Get 2D movement vector with automatic clamping to length 1.0
    const move = input.getVector('move_left', 'move_right', 'move_up', 'move_down');

    // Single-frame action detection
    if (input.isActionJustPressed('jump')) {
      // Trigger jump
    }
  }
}`,
    properties: [
      {
        name: 'mousePosition',
        type: 'THREE.Vector2',
        description: 'Current mouse pointer coordinates relative to the canvas element in pixels.',
      },
      {
        name: 'mouseDelta',
        type: 'THREE.Vector2',
        description: 'Mouse movement offset (dx, dy) registered during the current frame.',
      },
      {
        name: 'isMouseCaptured',
        type: 'boolean',
        description: 'True if PointerLock is currently active on the canvas element.',
      },
    ],
    methods: [
      {
        name: 'isActionPressed',
        returns: 'boolean',
        params: [{ name: 'action', type: 'string', description: 'Semantic action name' }],
        description: 'Returns true if the action is currently held down.',
      },
      {
        name: 'isActionJustPressed',
        returns: 'boolean',
        params: [{ name: 'action', type: 'string', description: 'Semantic action name' }],
        description: 'Returns true only during the exact frame in which the action was first pressed.',
      },
      {
        name: 'isActionJustReleased',
        returns: 'boolean',
        params: [{ name: 'action', type: 'string', description: 'Semantic action name' }],
        description: 'Returns true only during the exact frame in which the action was released.',
      },
      {
        name: 'getActionStrength',
        returns: 'number',
        params: [{ name: 'action', type: 'string', description: 'Semantic action name' }],
        description: 'Returns a floating point value between 0.0 and 1.0 representing analog trigger or button pressure.',
      },
      {
        name: 'getAxis',
        returns: 'number',
        params: [
          { name: 'negativeAction', type: 'string', description: 'Action mapping to -1.0' },
          { name: 'positiveAction', type: 'string', description: 'Action mapping to +1.0' },
        ],
        description: 'Calculates an axis value between -1.0 and 1.0 based on two opposing actions.',
      },
      {
        name: 'getVector',
        returns: 'THREE.Vector2',
        params: [
          { name: 'negX', type: 'string', description: 'Negative X action (e.g. move_left)' },
          { name: 'posX', type: 'string', description: 'Positive X action (e.g. move_right)' },
          { name: 'negY', type: 'string', description: 'Negative Y action (e.g. move_up)' },
          { name: 'posY', type: 'string', description: 'Positive Y action (e.g. move_down)' },
        ],
        description: 'Computes a 2D direction vector with magnitude clamped to a maximum length of 1.0.',
      },
      {
        name: 'configureActions',
        returns: 'void',
        params: [{ name: 'map', type: 'Record<string, InputAction[]>', description: 'Dictionary of action names and input bindings' }],
        description: 'Registers or replaces all semantic action configurations.',
      },
      {
        name: 'requestPointerLock',
        returns: 'Promise<void>',
        params: [],
        description: 'Requests browser pointer lock on the canvas element for first-person camera mouse look.',
      },
      {
        name: 'exitPointerLock',
        returns: 'void',
        params: [],
        description: 'Exits active browser pointer lock.',
      },
    ],
    signals: [
      { name: 'actionPressed', args: [{ name: 'action', type: 'string' }], description: 'Emitted when an action is pressed.' },
      { name: 'actionReleased', args: [{ name: 'action', type: 'string' }], description: 'Emitted when an action is released.' },
    ],
  },
  {
    name: 'PackedScene',
    category: 'Core Systems',
    brief: 'A serialized scene template representation mirroring Godot PackedScene (.tscn). Enables saving, caching, and instantiating reusable node subtrees.',
    description: `PackedScene serializes a node hierarchy and its configuration into a portable JSON structure. It enables developers to design complex scenes or prefabs once, cache them, and instantiate multiple identical copies on demand with full transform, property, and group replication.

Custom node types can be registered using registerNodeType(name, constructor) to ensure that custom subclasses deserialize correctly with their custom behaviors intact.`,
    codeExample: `import { PackedScene, MeshInstance3D, registerNodeType, THREE } from 'threedot';

// 1. Pack an existing live node tree into a template
const hero = new MeshInstance3D({
  name: 'EnemyPrefab',
  geometry: new THREE.SphereGeometry(1),
  material: new THREE.MeshStandardMaterial({ color: 0xff4757 }),
});
hero.addToGroup('enemies');
hero.setMeta('bounty', 50);

const packedEnemy = PackedScene.pack(hero);

// 2. Instantiate multiple instances from the template
const enemyA = packedEnemy.instantiate();
enemyA.position.set(-5, 0, 0);

const enemyB = packedEnemy.instantiate();
enemyB.position.set(5, 0, 0);

engine.sceneTree.root.addChild(enemyA);
engine.sceneTree.root.addChild(enemyB);`,
    properties: [],
    methods: [
      {
        name: 'pack',
        returns: 'PackedScene',
        params: [{ name: 'rootNode', type: 'Node', description: 'The root of the node subtree to serialize' }],
        description: 'Static factory that inspects a live node hierarchy and compiles a reusable PackedScene template.',
      },
      {
        name: 'instantiate',
        returns: 'Node',
        params: [],
        description: 'Instantiates and returns a brand-new live node subtree from the serialized template.',
      },
      {
        name: 'toJSON',
        returns: 'string',
        params: [],
        description: 'Serializes the PackedScene template into a portable JSON string.',
      },
      {
        name: 'fromJSON',
        returns: 'PackedScene',
        params: [{ name: 'json', type: 'string', description: 'JSON string produced by toJSON()' }],
        description: 'Static helper deserializing a JSON string into a PackedScene instance.',
      },
    ],
    signals: [],
  },
  {
    name: 'ResourceManager',
    category: 'Core Systems',
    brief: 'Centralized asset cache and loader for 3D models, textures, audio buffers, and fonts.',
    description: `ResourceManager prevents redundant network transfers and memory allocations by caching loaded assets by URL or unique key. It provides unified async loading APIs for textures (TextureLoader), 3D scenes (GLTFLoader), and audio files.`,
    codeExample: `import { Engine } from 'threedot';

const resources = engine.resources;

// Load texture asynchronously with automatic caching
const texture = await resources.loadTexture('/assets/textures/ground.png');

// Load audio clip
const sfx = await resources.loadAudio('/assets/sounds/jump.wav');

// Retrieve already cached asset synchronously
const cachedTex = resources.getTexture('/assets/textures/ground.png');`,
    properties: [],
    methods: [
      {
        name: 'loadTexture',
        returns: 'Promise<THREE.Texture>',
        params: [{ name: 'url', type: 'string', description: 'URL or path to image file' }],
        description: 'Loads a texture asynchronously via Three.js TextureLoader and caches the result.',
      },
      {
        name: 'loadAudio',
        returns: 'Promise<AudioBuffer>',
        params: [{ name: 'url', type: 'string', description: 'URL or path to audio file' }],
        description: 'Fetches and decodes an audio file into an AudioBuffer using Web Audio API.',
      },
      {
        name: 'clearCache',
        returns: 'void',
        params: [],
        description: 'Disposes all cached textures, audio buffers, and models, freeing GPU and system memory.',
      },
    ],
    signals: [],
  },
];
