import type { ClassDoc } from '../types';

export const nodes3dClasses: ClassDoc[] = [
  {
    name: 'Node3D',
    category: '3D Nodes',
    inherits: 'Node',
    inheritedBy: ['MeshInstance3D', 'Camera3D', 'DirectionalLight3D', 'PointLight3D', 'SpotLight3D', 'AmbientLight3D', 'Marker3D', 'RayCast3D', 'Path3D', 'PathFollow3D', 'RigidBody3D', 'StaticBody3D', 'CharacterBody3D', 'Area3D'],
    brief: 'Base class for all 3D nodes in the scene tree. Wraps a native Three.js Object3D and provides spatial transformation, hierarchy synchronization, and spatial queries.',
    description: `Node3D brings Godot's spatial node architecture to Three.js. Every Node3D encapsulates a Three.js Object3D instance and ensures that parent-child relationships in the ThreeDot scene tree are automatically mirrored in the underlying Three.js scene graph.

Transformations:
- Local Transforms: position, rotation (Euler), quaternion, scale.
- World Transforms: globalPosition, globalRotation, globalScale automatically trigger matrixWorld updates for immediate accuracy.
- Direction Vectors: forward (negative Z), right (positive X), up (positive Y) reflect the current world orientation.
- Relative helper methods: translate(x, y, z), translateLocal(offset), rotateX(angle), rotateY(angle), rotateZ(angle), rotateOnAxis(axis, angle), lookAt(target).

Parenting Behavior:
When a Node3D is added as a child of another Node3D, its object3D is appended to the parent's object3D. If parented to a non-spatial Node, it automatically attaches to the root engine.threeScene. Removing the node automatically detaches its object3D.`,
    codeExample: `import { Node3D, THREE } from 'threedot';

export class Turret extends Node3D {
  speed = 2.0;

  constructor() {
    super({
      name: 'Turret',
      position: { x: 0, y: 1, z: 0 },
    });
  }

  override _process(delta: number): void {
    // Rotate 2 radians per second around local Y axis
    this.rotateY(this.speed * delta);

    // Query global position and forward direction
    const worldPos = this.globalPosition;
    const forwardDir = this.forward;
  }
}`,
    properties: [
      {
        name: 'object3D',
        type: 'THREE.Object3D',
        description: 'Direct reference to the underlying Three.js Object3D managed by this node.',
      },
      {
        name: 'position',
        type: 'THREE.Vector3',
        description: 'Local position relative to the parent Node3D.',
      },
      {
        name: 'rotation',
        type: 'THREE.Euler',
        description: 'Local Euler rotation angles in radians.',
      },
      {
        name: 'quaternion',
        type: 'THREE.Quaternion',
        description: 'Local rotation representation as a unit Quaternion.',
      },
      {
        name: 'scale',
        type: 'THREE.Vector3',
        description: 'Local 3D scaling factor along X, Y, and Z axes.',
      },
      {
        name: 'globalPosition',
        type: 'THREE.Vector3',
        description: 'Global world space position. Reading forces updateWorldMatrix(true, false). Writing recalculates local coordinates based on parent transform.',
      },
      {
        name: 'globalRotation',
        type: 'THREE.Quaternion',
        description: 'Global world space rotation quaternion.',
      },
      {
        name: 'globalScale',
        type: 'THREE.Vector3',
        description: 'Global world space scale vector.',
      },
      {
        name: 'forward',
        type: 'THREE.Vector3',
        description: 'Normalized forward direction vector (0, 0, -1 in local space) rotated into world coordinates.',
      },
      {
        name: 'right',
        type: 'THREE.Vector3',
        description: 'Normalized right direction vector (1, 0, 0 in local space) rotated into world coordinates.',
      },
      {
        name: 'up',
        type: 'THREE.Vector3',
        description: 'Normalized up direction vector (0, 1, 0 in local space) rotated into world coordinates.',
      },
      {
        name: 'visible',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Toggles rendering visibility of this node and all underlying Object3D children.',
      },
    ],
    methods: [
      {
        name: 'lookAt',
        returns: 'void',
        params: [{ name: 'target', type: 'THREE.Vector3', description: 'Target position in world space' }],
        description: 'Rotates this node to orient its negative Z axis towards target.',
      },
      {
        name: 'translate',
        returns: 'void',
        params: [
          { name: 'x', type: 'number', description: 'Offset on X' },
          { name: 'y?', type: 'number', defaultValue: '0', description: 'Offset on Y' },
          { name: 'z?', type: 'number', defaultValue: '0', description: 'Offset on Z' },
        ],
        description: 'Translates this node along its local axes.',
      },
      {
        name: 'translateLocal',
        returns: 'void',
        params: [{ name: 'offset', type: 'THREE.Vector3', description: 'Local direction offset vector' }],
        description: 'Translates this node using translateX, translateY, and translateZ.',
      },
      {
        name: 'rotateX',
        returns: 'void',
        params: [{ name: 'angle', type: 'number', description: 'Angle in radians' }],
        description: 'Rotates this node around its local X axis.',
      },
      {
        name: 'rotateY',
        returns: 'void',
        params: [{ name: 'angle', type: 'number', description: 'Angle in radians' }],
        description: 'Rotates this node around its local Y axis.',
      },
      {
        name: 'rotateZ',
        returns: 'void',
        params: [{ name: 'angle', type: 'number', description: 'Angle in radians' }],
        description: 'Rotates this node around its local Z axis.',
      },
      {
        name: 'rotateOnAxis',
        returns: 'void',
        params: [
          { name: 'axis', type: 'THREE.Vector3', description: 'Normalized axis vector' },
          { name: 'angle', type: 'number', description: 'Angle in radians' },
        ],
        description: 'Rotates this node around an arbitrary normalized axis in local space.',
      },
    ],
    signals: [],
  },
  {
    name: 'MeshInstance3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Node that displays a 3D polygonal geometry mesh and standard material in the scene.',
    description: `MeshInstance3D wraps a THREE.Mesh object. It binds a THREE.BufferGeometry and THREE.Material to the scene tree with full lifecycle support, shadow casting/receiving flags, and material overrides.`,
    codeExample: `import { MeshInstance3D, THREE } from 'threedot';

const cube = new MeshInstance3D({
  name: 'HeroCube',
  geometry: new THREE.BoxGeometry(2, 2, 2),
  material: new THREE.MeshStandardMaterial({
    color: 0x478cbf,
    roughness: 0.3,
    metalness: 0.8,
  }),
  castShadow: true,
  receiveShadow: true,
  position: { x: 0, y: 1, z: 0 },
});

engine.sceneTree.root.addChild(cube);`,
    properties: [
      {
        name: 'mesh',
        type: 'THREE.Mesh',
        description: 'Direct reference to the underlying Three.js Mesh instance.',
      },
      {
        name: 'geometry',
        type: 'THREE.BufferGeometry',
        description: 'The polygonal geometry rendered by this mesh.',
      },
      {
        name: 'material',
        type: 'THREE.Material | THREE.Material[]',
        description: 'The active Three.js material applied to this mesh instance.',
      },
      {
        name: 'castShadow',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether this mesh casts real-time shadows onto other objects.',
      },
      {
        name: 'receiveShadow',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether this mesh receives shadows cast by other lights and objects.',
      },
    ],
    methods: [
      {
        name: 'setMaterialOverride',
        returns: 'void',
        params: [{ name: 'material', type: 'THREE.Material', description: 'Override material' }],
        description: 'Replaces the current active material on the mesh.',
      },
    ],
    signals: [],
  },
  {
    name: 'Camera3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'A 3D perspective or orthographic camera node that can be designated as the active viewport camera.',
    description: `Camera3D controls the projection and viewing frustum for the ThreeDot Engine. Unlike raw Three.js where cameras are detached objects, Camera3D is a full Node3D. It can be attached to moving player nodes, animated along paths, or manipulated using standard Node3D transforms.

Calling makeCurrent() designates this camera as the active rendering camera on the Engine. Its aspect ratio and projection matrices are automatically updated during viewport resize events.`,
    codeExample: `import { Camera3D, THREE } from 'threedot';

// Create third-person follow camera
const camera = new Camera3D({
  name: 'FollowCam',
  fov: 60,
  near: 0.1,
  far: 500,
  position: { x: 0, y: 4, z: 8 },
});

camera.lookAt(new THREE.Vector3(0, 1, 0));
player.addChild(camera);
camera.makeCurrent();`,
    properties: [
      {
        name: 'fov',
        type: 'number',
        defaultValue: '75',
        description: 'Vertical field of view in degrees (Perspective mode). Updates projection matrix on change.',
      },
      {
        name: 'near',
        type: 'number',
        defaultValue: '0.1',
        description: 'Distance to the near clipping plane.',
      },
      {
        name: 'far',
        type: 'number',
        defaultValue: '1000',
        description: 'Distance to the far clipping plane.',
      },
      {
        name: 'isOrthographic',
        type: 'boolean',
        defaultValue: 'false',
        description: 'True if configured as an OrthographicCamera.',
      },
      {
        name: 'threeCamera',
        type: 'THREE.PerspectiveCamera | THREE.OrthographicCamera',
        description: 'Direct reference to the underlying Three.js Camera instance.',
      },
    ],
    methods: [
      {
        name: 'makeCurrent',
        returns: 'void',
        params: [],
        description: 'Assigns this camera as the engine active camera for rendering.',
      },
    ],
    signals: [],
  },
  {
    name: 'DirectionalLight3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Directional light source that illuminates the scene from an infinite distance with parallel rays (e.g. sun or moon).',
    description: `DirectionalLight3D wraps THREE.DirectionalLight. It supports real-time shadow mapping, color filtering, and intensity scaling. The light shines from its position towards its target.`,
    codeExample: `import { DirectionalLight3D } from 'threedot';

const sun = new DirectionalLight3D({
  name: 'SunLight',
  color: 0xffffff,
  intensity: 2.0,
  position: { x: 10, y: 20, z: 10 },
  castShadow: true,
  shadowMapSize: 2048,
});

engine.sceneTree.root.addChild(sun);`,
    properties: [
      {
        name: 'color',
        type: 'THREE.Color',
        description: 'Light color emitted.',
      },
      {
        name: 'intensity',
        type: 'number',
        defaultValue: '1.0',
        description: 'Brightness intensity multiplier.',
      },
      {
        name: 'castShadow',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Enables shadow map generation for this light.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'PointLight3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Omnidirectional point light source that emits light uniformly in all directions from a single position with attenuation.',
    description: `PointLight3D wraps THREE.PointLight. It represents localized light sources such as torches, lamps, explosions, and glowing projectiles. Light intensity diminishes over distance according to physical inverse-square or linear falloff.`,
    codeExample: `import { PointLight3D } from 'threedot';

const lantern = new PointLight3D({
  name: 'Lantern',
  color: 0xffa502,
  intensity: 3.0,
  distance: 12,
  decay: 2,
  position: { x: 0, y: 2, z: 0 },
});

engine.sceneTree.root.addChild(lantern);`,
    properties: [
      {
        name: 'distance',
        type: 'number',
        defaultValue: '0',
        description: 'Maximum range of the light. When set to 0, light reaches infinity.',
      },
      {
        name: 'decay',
        type: 'number',
        defaultValue: '2',
        description: 'Rate at which light dims over distance.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'SpotLight3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Conical light source that emits light from a point in a specific direction within a specified cone angle.',
    description: `SpotLight3D wraps THREE.SpotLight. Ideal for flashlights, vehicle headlights, and theatrical stage spotlights.`,
    codeExample: `import { SpotLight3D } from 'threedot';

const flashlight = new SpotLight3D({
  name: 'Flashlight',
  color: 0xffffff,
  intensity: 4.0,
  angle: Math.PI / 6,
  penumbra: 0.3,
  castShadow: true,
});

camera.addChild(flashlight);`,
    properties: [
      {
        name: 'angle',
        type: 'number',
        defaultValue: 'Math.PI / 3',
        description: 'Maximum extent of the spotlight cone in radians.',
      },
      {
        name: 'penumbra',
        type: 'number',
        defaultValue: '0',
        description: 'Softness percentage of the spotlight cone edges (0.0 to 1.0).',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'AmbientLight3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Uniform non-directional environmental light that illuminates all scene objects equally without casting shadows.',
    description: `AmbientLight3D wraps THREE.AmbientLight. It prevents completely black shadows by providing baseline indirect ambient bounce light across the entire scene.`,
    codeExample: `import { AmbientLight3D } from 'threedot';

const ambient = new AmbientLight3D({
  name: 'SkyAmbient',
  color: 0x3d4b66,
  intensity: 0.7,
});

engine.sceneTree.root.addChild(ambient);`,
    properties: [],
    methods: [],
    signals: [],
  },
  {
    name: 'RayCast3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'A query node that casts a 3D ray along its forward axis to detect intersections with colliders and meshes.',
    description: `RayCast3D projects a mathematical ray from its global position along its targetVector. It can query physics bodies via the PhysicsServer3D or Three.js visual meshes via Three.js Raycaster.

Features:
- isColliding(): Returns true if the ray intersects an obstacle.
- getCollider(): Returns the collided Node3D.
- getCollisionPoint(): Returns the world coordinates of the intersection.
- getCollisionNormal(): Returns the surface normal vector at the hit point.`,
    codeExample: `import { RayCast3D, THREE } from 'threedot';

const ray = new RayCast3D({
  name: 'GroundCheck',
  targetVector: new THREE.Vector3(0, -1.5, 0),
  collisionMask: 1,
});

player.addChild(ray);

// In player _physicsProcess:
if (ray.isColliding()) {
  const floorPoint = ray.getCollisionPoint();
  const surfaceNormal = ray.getCollisionNormal();
}`,
    properties: [
      {
        name: 'targetVector',
        type: 'THREE.Vector3',
        defaultValue: 'Vector3(0, 0, -1)',
        description: 'The ray endpoint offset relative to the node local position.',
      },
      {
        name: 'collisionMask',
        type: 'number',
        defaultValue: '1',
        description: 'Physics collision bitmask determining which layers are tested.',
      },
    ],
    methods: [
      {
        name: 'forceRaycastUpdate',
        returns: 'void',
        params: [],
        description: 'Immediately casts the ray and updates collision states without waiting for next physics tick.',
      },
      {
        name: 'isColliding',
        returns: 'boolean',
        params: [],
        description: 'Returns true if the ray is currently intersecting a valid collision surface.',
      },
      {
        name: 'getCollider',
        returns: 'Node3D | null',
        params: [],
        description: 'Returns the colliding Node3D instance, or null if no hit occurred.',
      },
      {
        name: 'getCollisionPoint',
        returns: 'THREE.Vector3 | null',
        params: [],
        description: 'Returns the global world coordinates of the raycast hit point.',
      },
      {
        name: 'getCollisionNormal',
        returns: 'THREE.Vector3 | null',
        params: [],
        description: 'Returns the surface normal vector at the collision point.',
      },
    ],
    signals: [],
  },
  {
    name: 'Path3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Defines a 3D spline curve in 3D space using THREE.CatmullRomCurve3 or Bezier curves.',
    description: `Path3D defines a mathematical path in 3D space. Combined with PathFollow3D, it enables smooth camera rails, moving platforms, patrol routes, and cinematic flythroughs.`,
    codeExample: `import { Path3D, PathFollow3D, THREE } from 'threedot';

// Create a curved route
const path = new Path3D({
  name: 'PatrolPath',
  points: [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 2, 5),
    new THREE.Vector3(20, 0, 0),
    new THREE.Vector3(10, -2, -5),
  ],
  closed: true,
});

const follower = new PathFollow3D({ name: 'Follower' });
path.addChild(follower);`,
    properties: [
      {
        name: 'curve',
        type: 'THREE.Curve<THREE.Vector3>',
        description: 'The underlying Three.js 3D curve.',
      },
    ],
    methods: [
      {
        name: 'getLength',
        returns: 'number',
        params: [],
        description: 'Returns the total length of the 3D curve in world units.',
      },
    ],
    signals: [],
  },
  {
    name: 'PathFollow3D',
    category: '3D Nodes',
    inherits: 'Node3D',
    brief: 'Samples a parent Path3D curve and positions itself along the path using progress ratio (0.0 to 1.0) or unit distance.',
    description: `PathFollow3D must be added as a direct child of a Path3D node. Updating its progressRatio automatically repositions the node and rotates it to align with the curve tangent.`,
    codeExample: `import { PathFollow3D } from 'threedot';

class MovingPlatform extends PathFollow3D {
  speed = 0.2;

  override _process(delta: number): void {
    // Increment ratio from 0.0 to 1.0
    this.progressRatio = (this.progressRatio + this.speed * delta) % 1.0;
  }
}`,
    properties: [
      {
        name: 'progressRatio',
        type: 'number',
        defaultValue: '0.0',
        description: 'Normalized position along the parent curve from 0.0 (start) to 1.0 (end).',
      },
      {
        name: 'loop',
        type: 'boolean',
        defaultValue: 'true',
        description: 'Whether progressRatio wraps around to 0.0 when exceeding 1.0.',
      },
    ],
    methods: [],
    signals: [],
  },
];
