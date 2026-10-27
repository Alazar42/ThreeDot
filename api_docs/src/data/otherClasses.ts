import type { ClassDoc } from '../types';

export const otherClasses: ClassDoc[] = [
  // ── 2D Nodes ──
  {
    name: 'Node2D',
    category: '2D Nodes',
    inherits: 'Node',
    inheritedBy: ['Sprite2D', 'AnimatedSprite2D', 'Camera2D', 'Line2D', 'Polygon2D', 'TileMap2D', 'Parallax2D', 'RigidBody2D', 'CharacterBody2D', 'Area2D'],
    brief: 'A 2D game object with position, rotation, and scale in 2D pixel/world coordinates, rendered into Three.js orthogonal space.',
    description: `Node2D provides 2D spatial transformations for sprites, 2D tilemaps, and 2D physics. It maps 2D coordinates (X right, Y down or up) seamlessly into Three.js 3D space with an orthographic projection camera.`,
    codeExample: `import { Node2D } from 'threedot';

export class Player2D extends Node2D {
  speed = 250;

  override _process(delta: number): void {
    const input = this._findEngine()!.input;
    const move = input.getVector('move_left', 'move_right', 'move_up', 'move_down');
    this.position.x += move.x * this.speed * delta;
    this.position.y += move.y * this.speed * delta;
  }
}`,
    properties: [
      { name: 'position', type: 'THREE.Vector2', description: 'Local 2D position (x, y).' },
      { name: 'rotation', type: 'number', defaultValue: '0', description: 'Local 2D rotation angle in radians.' },
      { name: 'scale', type: 'THREE.Vector2', description: 'Local 2D scale factor.' },
      { name: 'globalPosition', type: 'THREE.Vector2', description: 'World space 2D position.' },
    ],
    methods: [
      {
        name: 'lookAt',
        returns: 'void',
        params: [{ name: 'target', type: 'THREE.Vector2', description: 'Target 2D position' }],
        description: 'Rotates the 2D node to point its positive X axis towards the target.',
      },
    ],
    signals: [],
  },
  {
    name: 'Sprite2D',
    category: '2D Nodes',
    inherits: 'Node2D',
    brief: 'Node that displays a 2D texture or spritesheet frame.',
    description: `Sprite2D renders a 2D quad texture. Supports offset centering, texture region clipping (for spritesheets), and flipH/flipV mirror flags.`,
    codeExample: `import { Sprite2D } from 'threedot';

const playerSprite = new Sprite2D({
  name: 'PlayerSprite',
  textureUrl: '/assets/sprites/hero.png',
  centered: true,
  regionEnabled: true,
  regionRect: { x: 0, y: 0, width: 32, height: 32 },
});`,
    properties: [
      { name: 'texture', type: 'THREE.Texture | null', description: 'The 2D texture displayed by the sprite.' },
      { name: 'centered', type: 'boolean', defaultValue: 'true', description: 'If true, texture is centered on the node position.' },
      { name: 'flipH', type: 'boolean', defaultValue: 'false', description: 'Mirrors the texture horizontally along X.' },
      { name: 'flipV', type: 'boolean', defaultValue: 'false', description: 'Mirrors the texture vertically along Y.' },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'AnimatedSprite2D',
    category: '2D Nodes',
    inherits: 'Node2D',
    brief: 'Displays frame-by-frame 2D sprite animations defined by SpriteFrames.',
    description: `AnimatedSprite2D plays multiple named animation sequences (e.g. 'idle', 'run', 'attack') from lists of textures at configurable frames per second.`,
    codeExample: `import { AnimatedSprite2D } from 'threedot';

const anim = new AnimatedSprite2D({
  spriteFrames: {
    idle: { fps: 8, loop: true, frames: [tex1, tex2, tex3, tex4] },
    run: { fps: 12, loop: true, frames: [run1, run2, run3, run4, run5, run6] },
  },
  animation: 'idle',
  autoPlay: true,
});`,
    properties: [
      { name: 'animation', type: 'string', description: 'Current active animation sequence name.' },
      { name: 'frame', type: 'number', description: 'Current active frame index.' },
      { name: 'speedScale', type: 'number', defaultValue: '1.0', description: 'Playback speed multiplier.' },
    ],
    methods: [
      { name: 'play', returns: 'void', params: [{ name: 'anim?', type: 'string' }], description: 'Plays the specified or current animation.' },
      { name: 'pause', returns: 'void', params: [], description: 'Pauses current animation playback.' },
      { name: 'stop', returns: 'void', params: [], description: 'Stops playback and resets frame to 0.' },
    ],
    signals: [
      { name: 'animationFinished', args: [], description: 'Emitted when a non-looping animation reaches its end.' },
      { name: 'frameChanged', args: [], description: 'Emitted when current frame index advances.' },
    ],
  },
  {
    name: 'Camera2D',
    category: '2D Nodes',
    inherits: 'Node2D',
    brief: 'A 2D orthographic camera with viewport centering, zoom, and target following.',
    description: `Camera2D centers the 2D view on its position. Supports zoom multipliers and smoothing limits.`,
    codeExample: `import { Camera2D } from 'threedot';

const cam2d = new Camera2D({ zoom: 1.5 });
player.addChild(cam2d);
cam2d.makeCurrent();`,
    properties: [
      { name: 'zoom', type: 'THREE.Vector2', defaultValue: 'Vector2(1, 1)', description: 'Camera zoom factor (higher = zoomed in).' },
    ],
    methods: [
      { name: 'makeCurrent', returns: 'void', params: [], description: 'Sets this camera as active for 2D rendering.' },
    ],
    signals: [],
  },

  // ── Physics 3D ──
  {
    name: 'PhysicsServer3D',
    category: '3D Physics',
    brief: 'Singleton 3D physics engine backed by Rapier3D physics simulator.',
    description: `PhysicsServer3D manages the fixed-timestep rigid-body simulation world, integration steps, gravity, collision detection, and raycast queries.`,
    codeExample: `import { Engine } from 'threedot';

const physics = engine.physics3D;
physics.gravity = new THREE.Vector3(0, -9.81, 0);

// Raycast against physics bodies
const hit = physics.raycast(origin, direction, 100);`,
    properties: [
      { name: 'gravity', type: 'THREE.Vector3', description: 'Global gravity vector (default: 0, -9.81, 0).' },
      { name: 'isInitialized', type: 'boolean', description: 'True once Rapier3D WASM physics server is initialized.' },
    ],
    methods: [
      { name: 'step', returns: 'void', params: [{ name: 'delta', type: 'number' }], description: 'Advances the physics world by fixed delta.' },
    ],
    signals: [],
  },
  {
    name: 'RigidBody3D',
    category: '3D Physics',
    inherits: 'Node3D',
    brief: 'A 3D physics body driven by forces, impulses, gravity, and collisions in the Rapier3D physics server.',
    description: `RigidBody3D automatically synchronizes its Node3D transform with the simulated physical body. Supports dynamic, kinematic, and static body types. Requires a child CollisionShape3D.`,
    codeExample: `import { RigidBody3D, CollisionShape3D, MeshInstance3D, THREE } from 'threedot';

const ball = new RigidBody3D({ mass: 2.5 });
ball.addChild(new CollisionShape3D({ shape: 'sphere', radius: 1.0 }));
ball.addChild(new MeshInstance3D({ geometry: new THREE.SphereGeometry(1.0) }));

engine.sceneTree.root.addChild(ball);

// Apply central physical impulse
ball.applyImpulse(new THREE.Vector3(0, 10, -5));`,
    properties: [
      { name: 'mass', type: 'number', defaultValue: '1.0', description: 'Mass of the rigid body in kilograms.' },
      { name: 'linearVelocity', type: 'THREE.Vector3', description: 'Current linear velocity vector.' },
      { name: 'angularVelocity', type: 'THREE.Vector3', description: 'Current rotational velocity vector.' },
    ],
    methods: [
      { name: 'applyForce', returns: 'void', params: [{ name: 'force', type: 'THREE.Vector3' }], description: 'Applies continuous force.' },
      { name: 'applyImpulse', returns: 'void', params: [{ name: 'impulse', type: 'THREE.Vector3' }], description: 'Applies instantaneous physical impulse.' },
    ],
    signals: [
      { name: 'bodyEntered', args: [{ name: 'body', type: 'Node3D' }], description: 'Emitted when colliding with another physics body.' },
    ],
  },
  {
    name: 'CharacterBody3D',
    category: '3D Physics',
    inherits: 'Node3D',
    brief: 'Kinematic 3D body specialized for player and NPC movement with built-in moveAndSlide() collision handling.',
    description: `CharacterBody3D is the primary node for player controllers. Unlike RigidBody3D, its motion is user-controlled via velocity and solved using moveAndSlide() which automatically slides along floors, walls, and slopes.`,
    codeExample: `import { CharacterBody3D, THREE } from 'threedot';

export class PlayerCharacter extends CharacterBody3D {
  speed = 6.0;
  gravity = 20.0;

  override _physicsProcess(delta: number): void {
    if (!this.isOnFloor()) {
      this.velocity.y -= this.gravity * delta;
    }

    const input = this._findEngine()!.input;
    const dir = input.getVector('move_left', 'move_right', 'move_up', 'move_down');
    this.velocity.x = dir.x * this.speed;
    this.velocity.z = dir.y * this.speed;

    // Slide along obstacles and stairs
    this.moveAndSlide();
  }
}`,
    properties: [
      { name: 'velocity', type: 'THREE.Vector3', description: 'Movement velocity vector applied by moveAndSlide().' },
    ],
    methods: [
      { name: 'moveAndSlide', returns: 'boolean', params: [], description: 'Moves the body based on velocity, resolving collisions by sliding along surfaces. Returns true if collision occurred.' },
      { name: 'isOnFloor', returns: 'boolean', params: [], description: 'True if colliding with a floor surface during the last moveAndSlide().' },
      { name: 'isOnWall', returns: 'boolean', params: [], description: 'True if colliding with a wall surface.' },
      { name: 'isOnCeiling', returns: 'boolean', params: [], description: 'True if colliding with a ceiling.' },
    ],
    signals: [],
  },
  {
    name: 'Area3D',
    category: '3D Physics',
    inherits: 'Node3D',
    brief: 'A non-solid 3D detection volume that detects bodies and areas entering or exiting its boundary.',
    description: `Area3D detects overlaps without physically blocking movement. Perfect for trigger zones, checkpoints, item pickups, and gravity wells.`,
    codeExample: `import { Area3D, CollisionShape3D } from 'threedot';

const checkpoint = new Area3D({ name: 'Checkpoint' });
checkpoint.addChild(new CollisionShape3D({ shape: 'box', extents: { x: 4, y: 3, z: 4 } }));

checkpoint.bodyEntered.connect((body) => {
  console.log('Player entered checkpoint trigger!', body.name);
});`,
    properties: [],
    methods: [
      { name: 'getOverlappingBodies', returns: 'Node3D[]', params: [], description: 'Returns all physics bodies currently overlapping this area.' },
    ],
    signals: [
      { name: 'bodyEntered', args: [{ name: 'body', type: 'Node3D' }], description: 'Emitted when a physics body enters this area volume.' },
      { name: 'bodyExited', args: [{ name: 'body', type: 'Node3D' }], description: 'Emitted when a physics body exits this area volume.' },
    ],
  },
  {
    name: 'CollisionShape3D',
    category: '3D Physics',
    inherits: 'Node3D',
    brief: 'Defines the geometric collision boundary for a parent physics body or Area3D.',
    description: `Must be a child of RigidBody3D, StaticBody3D, CharacterBody3D, or Area3D. Supports box, sphere, capsule, cylinder, and trimesh collision shapes.`,
    codeExample: `import { CollisionShape3D } from 'threedot';

const boxShape = new CollisionShape3D({
  shape: 'box',
  extents: { x: 2, y: 2, z: 2 },
});`,
    properties: [
      { name: 'shape', type: "'box' | 'sphere' | 'capsule' | 'cylinder'", description: 'Collision geometry primitive type.' },
    ],
    methods: [],
    signals: [],
  },

  // ── Animation & Audio & Navigation ──
  {
    name: 'AnimationPlayer',
    category: 'Animation & Audio',
    inherits: 'Node',
    brief: 'General-purpose keyframe-based property animation engine for 3D and 2D node graphs.',
    description: `AnimationPlayer animates arbitrary node properties (e.g. 'position:y', 'rotation:y', 'material:opacity') over time using linear, cubic, or stepped keyframe interpolation tracks.`,
    codeExample: `import { AnimationPlayer } from 'threedot';

const anim = new AnimationPlayer();
anim.addAnimation('bounce', {
  length: 1.0,
  loop: true,
  tracks: [
    {
      targetPath: '../PlayerCube',
      property: 'position:y',
      keyframes: [
        { time: 0.0, value: 1.0 },
        { time: 0.5, value: 3.5 },
        { time: 1.0, value: 1.0 },
      ],
    },
  ],
});
anim.play('bounce');`,
    properties: [
      { name: 'currentAnimation', type: 'string', description: 'Name of the currently playing animation.' },
      { name: 'playbackSpeed', type: 'number', defaultValue: '1.0', description: 'Speed multiplier for animation playback.' },
      { name: 'isPlaying', type: 'boolean', description: 'True if animation is currently advancing.' },
    ],
    methods: [
      { name: 'play', returns: 'void', params: [{ name: 'animName', type: 'string' }], description: 'Plays the named animation sequence.' },
      { name: 'pause', returns: 'void', params: [], description: 'Pauses playback at current position.' },
      { name: 'stop', returns: 'void', params: [], description: 'Halts playback and resets time to 0.0.' },
    ],
    signals: [
      { name: 'animationFinished', args: [{ name: 'animName', type: 'string' }], description: 'Emitted when animation reaches completion.' },
    ],
  },
  {
    name: 'AStar3D',
    category: 'Navigation',
    brief: 'Geometric A* pathfinding graph in 3D space for AI navigation, patrol routes, and grid pathfinding.',
    description: `AStar3D provides optimal path calculation between 3D points. Nodes add points with addPoint(id, position) and connect bidirectional or unidirectional edges with connectPoints(id1, id2). Calling getPointPath(from, to) returns the shortest path array of 3D coordinates.`,
    codeExample: `import { AStar3D, THREE } from 'threedot';

const astar = new AStar3D();
astar.addPoint(1, new THREE.Vector3(0, 0, 0));
astar.addPoint(2, new THREE.Vector3(5, 0, 0));
astar.addPoint(3, new THREE.Vector3(10, 0, 0));

astar.connectPoints(1, 2);
astar.connectPoints(2, 3);

// Calculate optimal 3D path
const path = astar.getPointPath(1, 3);
// Returns: [Vector3(0,0,0), Vector3(5,0,0), Vector3(10,0,0)]`,
    properties: [],
    methods: [
      { name: 'addPoint', returns: 'void', params: [{ name: 'id', type: 'number' }, { name: 'position', type: 'THREE.Vector3' }, { name: 'weightScale?', type: 'number' }], description: 'Adds a waypoint vertex to the pathfinding graph.' },
      { name: 'connectPoints', returns: 'void', params: [{ name: 'id1', type: 'number' }, { name: 'id2', type: 'number' }, { name: 'bidirectional?', type: 'boolean', defaultValue: 'true' }], description: 'Connects two waypoints with an edge.' },
      { name: 'getPointPath', returns: 'THREE.Vector3[]', params: [{ name: 'fromId', type: 'number' }, { name: 'toId', type: 'number' }], description: 'Computes and returns the shortest path of Vector3 points.' },
    ],
    signals: [],
  },

  // ── JSX Declarative Layer ──
  {
    name: 'JSX Declarative Syntax',
    category: 'JSX Layer',
    brief: 'Construct complete ThreeDot scene trees declaratively using standard React/TSX markup with automatic property-based signal binding.',
    description: `ThreeDot includes a first-class JSX runtime that allows developers to define scene trees declaratively in .tsx files instead of writing imperative addChild() chains. Every node type is available as a JSX tag (e.g. <Node3D>, <MeshInstance3D>, <Camera3D>, <HBoxContainer>, <Button>, <Area3D>), with props mapping directly to node options and nested tags mapping to children.

Properties-Based Signal Binding (on[SignalName]):
ThreeDot features declarative, props-based signal binding in JSX. Any prop whose name begins with 'on' followed by a capital letter (matching the pattern on[SignalName]) is automatically recognized as an event listener for the node's corresponding Signal:
- onPressed: Automatically connects to instance.pressed (e.g. Button.pressed.connect(callback))
- onReady: Automatically connects to instance.ready (Node.ready.connect(callback))
- onTreeEntered / onTreeExited: Connects to Node.treeEntered / Node.treeExited
- onChildAdded / onChildRemoved: Connects to Node.childAdded / Node.childRemoved
- onBodyEntered / onAreaEntered: Connects to Area3D / Area2D collision signals
- onValueChanged: Connects to Slider or Range control signals
- onTextChanged: Connects to LineEdit or Text input signals
- Custom signals: Any custom Signal declared on a node instance matching camelCase on<SignalName> is automatically connected.

Declarative SignalBus Dispatch (threedotSignal & threedotParams):
Interactive nodes (such as <Button>) also support declarative global event dispatch via props:
- threedotSignal (or 'threedot-signal'): The name of the SignalBus event to broadcast when clicked/pressed.
- threedotParams (or 'threedot-params'): Arguments passed to the SignalBus event (an array or a single value).
When the button or interactive node is triggered, the JSX runtime automatically connects its pressed/clicked signal to SignalBus.emit(signalName, ...params).

Node Props & Nesting:
All other props (such as name, position, rotation, scale, processMode, color, geometry, material) are passed directly to node constructors or option setters, and nested JSX child tags are recursively instantiated and appended to the parent node using addChild().`,
    codeExample: `/** @jsxImportSource threedot/jsx */
import { instantiate, THREE, SignalBus } from 'threedot';

// Build a full scene tree declaratively with properties-based signal binding
const scene = instantiate(
  <Node3D
    name="World"
    onReady={() => console.log('World node ready!')}
    onTreeEntered={() => console.log('World attached to scene tree')}
  >
    <Camera3D name="MainCam" position={{ x: 0, y: 5, z: 10 }} />
    <DirectionalLight3D name="Sun" intensity={1.8} position={{ x: 5, y: 10, z: 5 }} />
    <MeshInstance3D
      name="Ground"
      geometry={new THREE.PlaneGeometry(20, 20)}
      rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
    />

    {/* Area3D trigger with onBodyEntered property signal binding */}
    <Area3D
      name="Coin"
      position={{ x: 0, y: 1, z: 0 }}
      onBodyEntered={(body) => {
        console.log('Player touched coin:', body.name);
      }}
    />

    {/* UI Hierarchy with property-based signal binding */}
    <Control name="UI" anchorPreset="FULL_RECT">
      <VBoxContainer separation={8} position={{ x: 20, y: 20 }}>
        <Label text="ThreeDot Game HUD" />

        {/* 1) Local signal binding via onPressed property */}
        <Button
          text="Start Game"
          onPressed={() => {
            console.log('Game started via onPressed prop!');
          }}
        />

        {/* 2) Global SignalBus dispatch via threedotSignal property */}
        <Button
          text="Super Jump (Power: 15)"
          threedotSignal="player_jump"
          threedotParams={[15]}
        />
      </VBoxContainer>
    </Control>
  </Node3D>
);

// Mount the compiled scene tree into the Engine root
engine.sceneTree.root.addChild(scene);

// Connect to global SignalBus dispatched by threedotSignal
SignalBus.connect('player_jump', (power: number) => {
  player.jump(power);
});`,
    properties: [
      {
        name: 'on[SignalName]',
        type: '(...args: any[]) => void',
        description: 'Declarative property-based signal binding. Automatically connects callback to the node instance signal matching the event name (e.g. onPressed -> node.pressed, onReady -> node.ready, onTreeEntered -> node.treeEntered, onBodyEntered -> node.bodyEntered, onChildAdded -> node.childAdded).',
      },
      {
        name: 'threedotSignal / threedot-signal',
        type: 'string',
        description: 'Declarative property that configures an interactive node (such as Button) to automatically emit a global event via SignalBus when clicked or pressed.',
      },
      {
        name: 'threedotParams / threedot-params',
        type: 'any | any[]',
        description: 'Parameters passed to the SignalBus event when threedotSignal is emitted.',
      },
      {
        name: 'children',
        type: 'Node | Node[] | any',
        description: 'Child nodes nested inside this element. Automatically instantiated and appended via addChild().',
      },
    ],
    methods: [
      { name: 'instantiate', returns: 'Node', params: [{ name: 'jsxElement', type: 'JSX.Element' }], description: 'Compiles a declarative JSX tree element into an instantiated ThreeDot Node hierarchy.' },
      { name: 'createElement', returns: 'Node', params: [{ name: 'type', type: 'JSXElementType' }, { name: 'props', type: 'JSXProps | null' }, { name: '...children', type: 'any[]' }], description: 'Underlying JSX factory function that instantiates nodes, attaches children, and wires on[SignalName] and threedotSignal properties.' },
    ],
    signals: [],
  },
];
