/**
 * Polygon2D — 2D filled polygon rendering node
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface Polygon2DOptions extends Node2DOptions {
  polygon?: (THREE.Vector2 | { x: number; y: number })[];
  color?: THREE.ColorRepresentation;
  texture?: THREE.Texture;
}

export class Polygon2D extends Node2D {
  private _polygon: THREE.Vector2[] = [];
  private _mesh: THREE.Mesh | null = null;
  private _geometry: THREE.ShapeGeometry | null = null;
  private _material: THREE.MeshBasicMaterial;

  constructor(options?: Polygon2DOptions) {
    super(options);
    this._material = new THREE.MeshBasicMaterial({
      color: options?.color ?? 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      map: options?.texture ?? null,
    });

    if (options?.polygon) {
      this.setPolygon(options.polygon);
    }
  }

  get polygon(): ReadonlyArray<THREE.Vector2> {
    return this._polygon;
  }

  setPolygon(pts: (THREE.Vector2 | { x: number; y: number })[]): void {
    this._polygon = pts.map((p) => new THREE.Vector2(p.x, p.y));
    this._rebuildMesh();
  }

  get color(): THREE.Color {
    return this._material.color;
  }

  set color(col: THREE.ColorRepresentation) {
    this._material.color.set(col);
  }

  get texture(): THREE.Texture | null {
    return this._material.map;
  }

  set texture(tex: THREE.Texture | null) {
    this._material.map = tex;
    this._material.needsUpdate = true;
  }

  private _rebuildMesh(): void {
    if (this._mesh) {
      this.object3D.remove(this._mesh);
      this._geometry?.dispose();
      this._mesh = null;
    }

    if (this._polygon.length < 3) return;

    const shape = new THREE.Shape();
    shape.moveTo(this._polygon[0].x, this._polygon[0].y);
    for (let i = 1; i < this._polygon.length; i++) {
      shape.lineTo(this._polygon[i].x, this._polygon[i].y);
    }
    shape.closePath();

    this._geometry = new THREE.ShapeGeometry(shape);
    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this.object3D.add(this._mesh);
  }

  protected override _destroy(): void {
    this._geometry?.dispose();
    this._material.dispose();
    super._destroy();
  }
}
