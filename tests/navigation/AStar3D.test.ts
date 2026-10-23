import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { AStar3D } from '../../src/navigation/AStar3D';

describe('AStar3D Navigation System', () => {
  it('manages graph points and connections', () => {
    const astar = new AStar3D();

    astar.addPoint(1, { x: 0, y: 0, z: 0 });
    astar.addPoint(2, { x: 10, y: 0, z: 0 });
    astar.addPoint(3, { x: 20, y: 0, z: 0 });

    expect(astar.hasPoint(1)).toBe(true);
    expect(astar.hasPoint(4)).toBe(false);

    astar.connectPoints(1, 2);
    astar.connectPoints(2, 3);

    expect(astar.arePointsConnected(1, 2)).toBe(true);
    expect(astar.arePointsConnected(2, 1)).toBe(true);
    expect(astar.arePointsConnected(1, 3)).toBe(false);

    const closest = astar.getClosestPoint({ x: 1, y: 0, z: 0 });
    expect(closest).toBe(1);
  });

  it('calculates optimal path using A* search', () => {
    const astar = new AStar3D();

    // Create a 2x2 grid in 3D:
    // (0,0) [1] ---- (10,0) [2]
    //   |                 |
    // (0,10) [3] --- (10,10) [4]
    astar.addPoint(1, { x: 0, y: 0, z: 0 });
    astar.addPoint(2, { x: 10, y: 0, z: 0 });
    astar.addPoint(3, { x: 0, y: 0, z: 10 });
    astar.addPoint(4, { x: 10, y: 0, z: 10 });

    astar.connectPoints(1, 2);
    astar.connectPoints(2, 4);
    astar.connectPoints(1, 3);
    astar.connectPoints(3, 4);

    const path = astar.findPath(1, 4);
    expect(path.length).toBe(3); // Start, intermediate, Goal
    expect(path[0]).toEqual(new THREE.Vector3(0, 0, 0));
    expect(path[path.length - 1]).toEqual(new THREE.Vector3(10, 0, 10));
  });

  it('honors disabled points when pathfinding', () => {
    const astar = new AStar3D();

    astar.addPoint(1, { x: 0, y: 0, z: 0 });
    astar.addPoint(2, { x: 5, y: 0, z: 0 });
    astar.addPoint(3, { x: 10, y: 0, z: 0 });

    astar.connectPoints(1, 2);
    astar.connectPoints(2, 3);

    // Disable middle point
    astar.setPointDisabled(2, true);
    expect(astar.isPointDisabled(2)).toBe(true);

    const path = astar.findPath(1, 3);
    expect(path).toHaveLength(0); // No valid path through disabled point
  });
});
