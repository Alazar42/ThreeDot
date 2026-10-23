import type { ClassDoc, CategoryGroup } from '../types';
import { coreClasses } from './coreClasses';
import { nodes3dClasses } from './nodes3dClasses';
import { uiClasses } from './uiClasses';
import { otherClasses } from './otherClasses';

export const allClasses: ClassDoc[] = [
  ...coreClasses,
  ...nodes3dClasses,
  ...otherClasses.filter((c) => c.category === '3D Physics'),
  ...otherClasses.filter((c) => c.category === '2D Nodes'),
  ...uiClasses,
  ...otherClasses.filter((c) => c.category === 'Animation & Audio'),
  ...otherClasses.filter((c) => c.category === 'Navigation'),
  ...otherClasses.filter((c) => c.category === 'JSX Layer'),
];

export const categoryGroups: CategoryGroup[] = [
  {
    id: 'core',
    title: 'Core Systems',
    classes: ['Engine', 'SceneTree', 'Node', 'Signal', 'InputManager', 'PackedScene', 'ResourceManager'],
  },
  {
    id: 'nodes3d',
    title: '3D Nodes & Graphics',
    classes: ['Node3D', 'MeshInstance3D', 'Camera3D', 'DirectionalLight3D', 'PointLight3D', 'SpotLight3D', 'AmbientLight3D', 'RayCast3D', 'Path3D', 'PathFollow3D'],
  },
  {
    id: 'physics3d',
    title: '3D Physics',
    classes: ['PhysicsServer3D', 'RigidBody3D', 'CharacterBody3D', 'Area3D', 'CollisionShape3D'],
  },
  {
    id: 'nodes2d',
    title: '2D Nodes & Graphics',
    classes: ['Node2D', 'Sprite2D', 'AnimatedSprite2D', 'Camera2D'],
  },
  {
    id: 'ui',
    title: 'User Interface',
    classes: ['Control', 'Container', 'HBoxContainer', 'VBoxContainer', 'GridContainer', 'MarginContainer', 'CenterContainer', 'Button', 'Label', 'TextureRect', 'ProgressBar'],
  },
  {
    id: 'animation',
    title: 'Animation & Audio',
    classes: ['AnimationPlayer'],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    classes: ['AStar3D'],
  },
  {
    id: 'jsx',
    title: 'JSX Declarative Layer',
    classes: ['JSX Declarative Syntax'],
  },
];

export function getClassDoc(name: string): ClassDoc | undefined {
  return allClasses.find((c) => c.name.toLowerCase() === name.toLowerCase());
}
