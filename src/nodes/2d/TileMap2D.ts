/**
 * TileMap2D — Grid-based 2D tile placement and rendering
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface TileMap2DOptions extends Node2DOptions {
  cellSize?: THREE.Vector2 | { x: number; y: number };
  tileTexture?: THREE.Texture;
  tileSize?: THREE.Vector2 | { x: number; y: number };
}

export class TileMap2D extends Node2D {
  private _cellSize: THREE.Vector2 = new THREE.Vector2(1, 1);
  private _cells: Map<string, number> = new Map(); // "x,y" -> tileId
  private _texture: THREE.Texture | null = null;
  private _group: THREE.Group;
  private _material: THREE.MeshBasicMaterial;
  private _planeGeometry: THREE.PlaneGeometry;

  constructor(options?: TileMap2DOptions) {
    super(options);

    if (options?.cellSize) {
      this._cellSize.set(options.cellSize.x, options.cellSize.y);
    }

    this._texture = options?.tileTexture ?? null;
    this._group = new THREE.Group();
    this.object3D.add(this._group);

    this._planeGeometry = new THREE.PlaneGeometry(this._cellSize.x, this._cellSize.y);
    this._material = new THREE.MeshBasicMaterial({
      map: this._texture,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }

  get cellSize(): THREE.Vector2 {
    return this._cellSize.clone();
  }

  set cellSize(size: THREE.Vector2 | { x: number; y: number }) {
    this._cellSize.set(size.x, size.y);
    this._planeGeometry.dispose();
    this._planeGeometry = new THREE.PlaneGeometry(size.x, size.y);
    this._rebuildTiles();
  }

  get tileTexture(): THREE.Texture | null {
    return this._texture;
  }

  set tileTexture(tex: THREE.Texture | null) {
    this._texture = tex;
    this._material.map = tex;
    this._material.needsUpdate = true;
  }

  setCell(x: number, y: number, tileId: number): void {
    const key = `${x},${y}`;
    if (tileId < 0) {
      this._cells.delete(key);
    } else {
      this._cells.set(key, tileId);
    }
    this._rebuildTiles();
  }

  getCell(x: number, y: number): number {
    return this._cells.get(`${x},${y}`) ?? -1;
  }

  clear(): void {
    this._cells.clear();
    this._rebuildTiles();
  }

  getUsedCells(): Array<{ x: number; y: number; tileId: number }> {
    const result: Array<{ x: number; y: number; tileId: number }> = [];
    for (const [key, tileId] of this._cells.entries()) {
      const [x, y] = key.split(',').map(Number);
      result.push({ x, y, tileId });
    }
    return result;
  }

  private _rebuildTiles(): void {
    // Clear existing tile meshes
    while (this._group.children.length > 0) {
      const child = this._group.children[0];
      this._group.remove(child);
    }

    for (const [key, _tileId] of this._cells.entries()) {
      const [x, y] = key.split(',').map(Number);
      const mesh = new THREE.Mesh(this._planeGeometry, this._material);
      mesh.position.set(
        x * this._cellSize.x + this._cellSize.x / 2,
        y * this._cellSize.y + this._cellSize.y / 2,
        0
      );
      this._group.add(mesh);
    }
  }

  protected override _destroy(): void {
    this._planeGeometry.dispose();
    this._material.dispose();
    super._destroy();
  }
}
