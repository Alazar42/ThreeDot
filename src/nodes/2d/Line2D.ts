/**
 * Line2D — 2D polyline rendering node
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface Line2DOptions extends Node2DOptions {
  points?: (THREE.Vector2 | { x: number; y: number })[];
  width?: number;
  color?: THREE.ColorRepresentation;
  closed?: boolean;
}

export class Line2D extends Node2D {
  private _points: THREE.Vector2[] = [];
  private _width = 1.0;
  private _color: THREE.Color;
  private _closed = false;
  private _line: THREE.Line | THREE.LineLoop | null = null;
  private _geometry: THREE.BufferGeometry | null = null;
  private _material: THREE.LineBasicMaterial;

  constructor(options?: Line2DOptions) {
    super(options);
    this._color = new THREE.Color(options?.color ?? 0xffffff);
    this._width = options?.width ?? 1.0;
    this._closed = options?.closed ?? false;

    this._material = new THREE.LineBasicMaterial({
      color: this._color,
      linewidth: this._width,
      transparent: true,
    });

    if (options?.points) {
      this.setPoints(options.points);
    }
  }

  get points(): ReadonlyArray<THREE.Vector2> {
    return this._points;
  }

  setPoints(pts: (THREE.Vector2 | { x: number; y: number })[]): void {
    this._points = pts.map((p) => new THREE.Vector2(p.x, p.y));
    this._rebuildGeometry();
  }

  addPoint(point: THREE.Vector2 | { x: number; y: number }): void {
    this._points.push(new THREE.Vector2(point.x, point.y));
    this._rebuildGeometry();
  }

  clearPoints(): void {
    this._points = [];
    this._rebuildGeometry();
  }

  get color(): THREE.Color {
    return this._material.color;
  }

  set color(col: THREE.ColorRepresentation) {
    this._material.color.set(col);
  }

  get closed(): boolean {
    return this._closed;
  }

  set closed(val: boolean) {
    if (this._closed !== val) {
      this._closed = val;
      this._rebuildGeometry();
    }
  }

  private _rebuildGeometry(): void {
    if (this._line) {
      this.object3D.remove(this._line);
      this._geometry?.dispose();
      this._line = null;
    }

    if (this._points.length < 2) return;

    const vertices: number[] = [];
    for (const p of this._points) {
      vertices.push(p.x, p.y, 0);
    }

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    if (this._closed) {
      this._line = new THREE.LineLoop(this._geometry, this._material);
    } else {
      this._line = new THREE.Line(this._geometry, this._material);
    }

    this.object3D.add(this._line);
  }

  protected override _destroy(): void {
    this._geometry?.dispose();
    this._material.dispose();
    super._destroy();
  }
}
