/**
 * AStar3D — 3D A* graph search algorithm for pathfinding
 */

import * as THREE from 'three';

export interface AStarPoint3D {
  id: number;
  position: THREE.Vector3;
  weightScale: number;
  connections: Set<number>;
  disabled: boolean;
}

export class AStar3D {
  private _points = new Map<number, AStarPoint3D>();

  addPoint(id: number, position: THREE.Vector3 | { x: number; y: number; z: number }, weightScale = 1.0): void {
    const pos = new THREE.Vector3(position.x, position.y, position.z);
    this._points.set(id, {
      id,
      position: pos,
      weightScale: Math.max(0.001, weightScale),
      connections: new Set<number>(),
      disabled: false,
    });
  }

  removePoint(id: number): void {
    const pt = this._points.get(id);
    if (!pt) return;

    for (const neighborId of pt.connections) {
      const neighbor = this._points.get(neighborId);
      neighbor?.connections.delete(id);
    }
    this._points.delete(id);
  }

  hasPoint(id: number): boolean {
    return this._points.has(id);
  }

  getPointPosition(id: number): THREE.Vector3 | null {
    return this._points.get(id)?.position.clone() ?? null;
  }

  setPointDisabled(id: number, disabled: boolean): void {
    const pt = this._points.get(id);
    if (pt) pt.disabled = disabled;
  }

  isPointDisabled(id: number): boolean {
    return this._points.get(id)?.disabled ?? true;
  }

  connectPoints(id1: number, id2: number, bidirectional = true): void {
    const p1 = this._points.get(id1);
    const p2 = this._points.get(id2);
    if (!p1 || !p2) return;

    p1.connections.add(id2);
    if (bidirectional) {
      p2.connections.add(id1);
    }
  }

  disconnectPoints(id1: number, id2: number, bidirectional = true): void {
    this._points.get(id1)?.connections.delete(id2);
    if (bidirectional) {
      this._points.get(id2)?.connections.delete(id1);
    }
  }

  arePointsConnected(id1: number, id2: number): boolean {
    return this._points.get(id1)?.connections.has(id2) ?? false;
  }

  getClosestPoint(position: THREE.Vector3 | { x: number; y: number; z: number }): number {
    const pos = new THREE.Vector3(position.x, position.y, position.z);
    let closestId = -1;
    let minDistanceSq = Infinity;

    for (const pt of this._points.values()) {
      if (pt.disabled) continue;
      const dSq = pt.position.distanceToSquared(pos);
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        closestId = pt.id;
      }
    }

    return closestId;
  }

  /**
   * Find path from fromId to toId using A* algorithm.
   */
  findPath(fromId: number, toId: number): THREE.Vector3[] {
    const start = this._points.get(fromId);
    const goal = this._points.get(toId);
    if (!start || !goal || start.disabled || goal.disabled) return [];

    const openSet = new Set<number>([fromId]);
    const cameFrom = new Map<number, number>();

    const gScore = new Map<number, number>();
    gScore.set(fromId, 0);

    const fScore = new Map<number, number>();
    fScore.set(fromId, start.position.distanceTo(goal.position));

    while (openSet.size > 0) {
      // Find node in openSet with lowest fScore
      let current = -1;
      let lowestF = Infinity;
      for (const id of openSet) {
        const score = fScore.get(id) ?? Infinity;
        if (score < lowestF) {
          lowestF = score;
          current = id;
        }
      }

      if (current === toId) {
        // Reconstruct path
        const path: THREE.Vector3[] = [];
        let curr: number | undefined = current;
        while (curr !== undefined) {
          path.unshift(this._points.get(curr)!.position.clone());
          curr = cameFrom.get(curr);
        }
        return path;
      }

      openSet.delete(current);
      const currPt = this._points.get(current)!;

      for (const neighborId of currPt.connections) {
        const neighbor = this._points.get(neighborId);
        if (!neighbor || neighbor.disabled) continue;

        const tentG = (gScore.get(current) ?? Infinity) +
          currPt.position.distanceTo(neighbor.position) * neighbor.weightScale;

        if (tentG < (gScore.get(neighborId) ?? Infinity)) {
          cameFrom.set(neighborId, current);
          gScore.set(neighborId, tentG);
          fScore.set(neighborId, tentG + neighbor.position.distanceTo(goal.position));
          openSet.add(neighborId);
        }
      }
    }

    return [];
  }
}
