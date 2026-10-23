/**
 * NavigationServer3D & NavigationAgent3D — Navigation graph and agent tracking
 */

import * as THREE from 'three';
import { Node3D, Node3DOptions } from '../nodes/3d/Node3D';
import { Signal } from '../core/signals/Signal';
import { AStar3D } from './AStar3D';

export class NavigationServer3D {
  private static _defaultAStar = new AStar3D();

  static getDefaultMap(): AStar3D {
    return this._defaultAStar;
  }
}

export interface NavigationAgent3DOptions extends Node3DOptions {
  targetPosition?: THREE.Vector3 | { x: number; y: number; z: number };
  pathDesiredDistance?: number;
  targetDesiredDistance?: number;
  navigationMap?: AStar3D;
}

export class NavigationAgent3D extends Node3D {
  readonly pathChanged = new Signal<[]>('path_changed');
  readonly targetReached = new Signal<[]>('target_reached');
  readonly navigationFinished = new Signal<[]>('navigation_finished');

  private _targetPosition = new THREE.Vector3();
  private _currentPath: THREE.Vector3[] = [];
  private _pathIndex = 0;
  private _pathDesiredDistance: number;
  private _targetDesiredDistance: number;
  private _map: AStar3D;
  private _navigationFinished = true;

  constructor(options?: NavigationAgent3DOptions) {
    super(options);
    this._pathDesiredDistance = options?.pathDesiredDistance ?? 1.0;
    this._targetDesiredDistance = options?.targetDesiredDistance ?? 1.0;
    this._map = options?.navigationMap ?? NavigationServer3D.getDefaultMap();

    if (options?.targetPosition) {
      this.targetPosition = new THREE.Vector3(
        options.targetPosition.x,
        options.targetPosition.y,
        options.targetPosition.z
      );
    }
  }

  get targetPosition(): THREE.Vector3 {
    return this._targetPosition.clone();
  }

  set targetPosition(pos: THREE.Vector3) {
    this._targetPosition.copy(pos);
    this._recomputePath();
  }

  get navigationMap(): AStar3D {
    return this._map;
  }

  set navigationMap(map: AStar3D) {
    this._map = map;
    this._recomputePath();
  }

  isNavigationFinished(): boolean {
    return this._navigationFinished;
  }

  isTargetReached(): boolean {
    const parentPos = this.globalPosition;
    return parentPos.distanceTo(this._targetPosition) <= this._targetDesiredDistance;
  }

  distanceToTarget(): number {
    return this.globalPosition.distanceTo(this._targetPosition);
  }

  getNextPathPosition(): THREE.Vector3 {
    if (this._currentPath.length === 0 || this._pathIndex >= this._currentPath.length) {
      return this.globalPosition;
    }

    const currentTarget = this._currentPath[this._pathIndex];
    const currentPos = this.globalPosition;

    if (currentPos.distanceTo(currentTarget) <= this._pathDesiredDistance) {
      this._pathIndex++;
      if (this._pathIndex >= this._currentPath.length) {
        this._navigationFinished = true;
        this.navigationFinished.emit();
        if (this.isTargetReached()) {
          this.targetReached.emit();
        }
        return this.globalPosition;
      }
    }

    return this._currentPath[this._pathIndex].clone();
  }

  getCurrentPath(): ReadonlyArray<THREE.Vector3> {
    return this._currentPath;
  }

  private _recomputePath(): void {
    const fromId = this._map.getClosestPoint(this.globalPosition);
    const toId = this._map.getClosestPoint(this._targetPosition);

    if (fromId >= 0 && toId >= 0) {
      this._currentPath = this._map.findPath(fromId, toId);
      this._pathIndex = 0;
      this._navigationFinished = this._currentPath.length === 0;
      this.pathChanged.emit();
    } else {
      this._currentPath = [];
      this._navigationFinished = true;
    }
  }
}
