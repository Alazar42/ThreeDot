/**
 * ThreeDot — A Godot-Inspired Framework for Three.js
 *
 * Structured scene trees, lifecycle management, signals, input handling,
 * resources, 3D/2D nodes, physics, animation, and responsive UI.
 */

// ── Re-export Three.js Namespace and Direct Classes ──
export * as THREE from 'three';

export {
  // Math & Core
  Vector2,
  Vector3,
  Vector4,
  Matrix3,
  Matrix4,
  Euler,
  Quaternion,
  Color,
  Ray,
  Plane,
  Box2,
  Box3,
  Sphere,
  MathUtils,
  Object3D,

  // Geometries
  BufferGeometry,
  BoxGeometry,
  SphereGeometry,
  PlaneGeometry,
  CylinderGeometry,
  ConeGeometry,
  CapsuleGeometry,
  TorusGeometry,
  TorusKnotGeometry,
  RingGeometry,
  CircleGeometry,

  // Materials
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshToonMaterial,
  MeshNormalMaterial,
  MeshDepthMaterial,
  PointsMaterial,
  LineBasicMaterial,
  LineDashedMaterial,
  ShaderMaterial,
  RawShaderMaterial,
  ShadowMaterial,

  // Textures & Loaders
  Texture,
  CanvasTexture,
  DataTexture,
  CompressedTexture,
  CubeTexture,
  TextureLoader,

  // Lights & Shadows
  PCFSoftShadowMap,
  PCFShadowMap,
  BasicShadowMap,
  VSMShadowMap,
  ACESFilmicToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  SRGBColorSpace,
  LinearSRGBColorSpace,

  // Fog & Scenes
  Fog,
  FogExp2,
  Scene,
} from 'three';

export type {
  ColorRepresentation,
} from 'three';


// ── Core Engine & Systems ──
export * from './core/engine';
export * from './core/node';
export * from './core/scene';
export * from './core/signals';
export * from './core/input';
export * from './core/resources';
export * from './core/lifecycle';

// ── Nodes ──
export * from './nodes';

// ── Physics ──
export * from './physics';

// ── Navigation ──
export * from './navigation';

// ── JSX Declarative Layer ──
export * from './jsx';

// ── Auto-register Built-in Node Types for PackedScene Deserialization ──
import { registerNodeType } from './core/scene/PackedScene';
import { Node } from './core/node/Node';
import { Node3D } from './nodes/3d/Node3D';
import { MeshInstance3D } from './nodes/3d/MeshInstance3D';
import { Camera3D } from './nodes/3d/Camera3D';
import { DirectionalLight3D, PointLight3D, SpotLight3D, AmbientLight3D } from './nodes/3d/Light3D';
import { Marker3D } from './nodes/3d/Marker3D';
import { RayCast3D } from './nodes/3d/RayCast3D';
import { Path3D, PathFollow3D } from './nodes/3d/Path3D';
import { CollisionShape3D } from './nodes/3d/CollisionShape3D';
import { StaticBody3D } from './nodes/3d/StaticBody3D';
import { RigidBody3D } from './nodes/3d/RigidBody3D';
import { CharacterBody3D } from './nodes/3d/CharacterBody3D';
import { Area3D } from './nodes/3d/Area3D';

import { Node2D } from './nodes/2d/Node2D';
import { Sprite2D } from './nodes/2d/Sprite2D';
import { AnimatedSprite2D } from './nodes/2d/AnimatedSprite2D';
import { Camera2D } from './nodes/2d/Camera2D';
import { Line2D } from './nodes/2d/Line2D';
import { Polygon2D } from './nodes/2d/Polygon2D';
import { TileMap2D } from './nodes/2d/TileMap2D';
import { Parallax2D } from './nodes/2d/Parallax2D';
import { CollisionShape2D } from './nodes/2d/CollisionShape2D';
import { StaticBody2D } from './nodes/2d/StaticBody2D';
import { RigidBody2D } from './nodes/2d/RigidBody2D';
import { CharacterBody2D } from './nodes/2d/CharacterBody2D';
import { Area2D } from './nodes/2d/Area2D';
import { RayCast2D } from './nodes/2d/RayCast2D';

import { Control } from './nodes/ui/Control';
import { Container } from './nodes/ui/Container';
import { HBoxContainer, VBoxContainer } from './nodes/ui/BoxContainer';
import { GridContainer, CenterContainer, MarginContainer, PanelContainer } from './nodes/ui/CommonContainers';
import { ScrollContainer, AspectRatioContainer, TabContainer, PopupPanel } from './nodes/ui/SpecializedContainers';
import { Label, ColorRect, TextureRect, Separator, HSeparator, VSeparator } from './nodes/ui/BasicControls';
import { Button, CheckBox, RadioButton, LineEdit, TextEdit, ProgressBar, HSlider, VSlider, OptionButton, MenuButton } from './nodes/ui/InteractiveControls';

import { AnimationPlayer } from './nodes/animation/AnimationPlayer';
import { AudioPlayer, AudioPlayer3D } from './nodes/audio/AudioPlayer';

registerNodeType('Node', Node);
registerNodeType('Node3D', Node3D);
registerNodeType('MeshInstance3D', MeshInstance3D);
registerNodeType('Camera3D', Camera3D);
registerNodeType('DirectionalLight3D', DirectionalLight3D);
registerNodeType('PointLight3D', PointLight3D);
registerNodeType('SpotLight3D', SpotLight3D);
registerNodeType('AmbientLight3D', AmbientLight3D);
registerNodeType('Marker3D', Marker3D);
registerNodeType('RayCast3D', RayCast3D);
registerNodeType('Path3D', Path3D);
registerNodeType('PathFollow3D', PathFollow3D);
registerNodeType('CollisionShape3D', CollisionShape3D);
registerNodeType('StaticBody3D', StaticBody3D);
registerNodeType('RigidBody3D', RigidBody3D);
registerNodeType('CharacterBody3D', CharacterBody3D);
registerNodeType('Area3D', Area3D);

registerNodeType('Node2D', Node2D);
registerNodeType('Sprite2D', Sprite2D);
registerNodeType('AnimatedSprite2D', AnimatedSprite2D);
registerNodeType('Camera2D', Camera2D);
registerNodeType('Line2D', Line2D);
registerNodeType('Polygon2D', Polygon2D);
registerNodeType('TileMap2D', TileMap2D);
registerNodeType('Parallax2D', Parallax2D);
registerNodeType('CollisionShape2D', CollisionShape2D);
registerNodeType('StaticBody2D', StaticBody2D);
registerNodeType('RigidBody2D', RigidBody2D);
registerNodeType('CharacterBody2D', CharacterBody2D);
registerNodeType('Area2D', Area2D);
registerNodeType('RayCast2D', RayCast2D);

registerNodeType('Control', Control);
registerNodeType('Container', Container);
registerNodeType('HBoxContainer', HBoxContainer);
registerNodeType('VBoxContainer', VBoxContainer);
registerNodeType('GridContainer', GridContainer);
registerNodeType('CenterContainer', CenterContainer);
registerNodeType('MarginContainer', MarginContainer);
registerNodeType('PanelContainer', PanelContainer);
registerNodeType('ScrollContainer', ScrollContainer);
registerNodeType('AspectRatioContainer', AspectRatioContainer);
registerNodeType('TabContainer', TabContainer);
registerNodeType('PopupPanel', PopupPanel);
registerNodeType('Label', Label);
registerNodeType('ColorRect', ColorRect);
registerNodeType('TextureRect', TextureRect);
registerNodeType('Separator', Separator);
registerNodeType('HSeparator', HSeparator);
registerNodeType('VSeparator', VSeparator);
registerNodeType('Button', Button);
registerNodeType('CheckBox', CheckBox);
registerNodeType('RadioButton', RadioButton);
registerNodeType('LineEdit', LineEdit);
registerNodeType('TextEdit', TextEdit);
registerNodeType('ProgressBar', ProgressBar);
registerNodeType('HSlider', HSlider);
registerNodeType('VSlider', VSlider);
registerNodeType('OptionButton', OptionButton);
registerNodeType('MenuButton', MenuButton);

registerNodeType('AnimationPlayer', AnimationPlayer);
registerNodeType('AudioPlayer', AudioPlayer);
registerNodeType('AudioPlayer3D', AudioPlayer3D);
