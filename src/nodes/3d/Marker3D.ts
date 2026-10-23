/**
 * Marker3D — An invisible position marker in 3D space.
 * Useful as spawn points, targets, waypoints, etc.
 */

import { Node3D, Node3DOptions } from './Node3D';

export class Marker3D extends Node3D {
  constructor(options?: Node3DOptions) {
    super(options);
  }
}
