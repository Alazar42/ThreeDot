/**
 * Sprite2D — 2D texture rendering node
 */

import * as THREE from 'three';
import { Node2D, Node2DOptions } from './Node2D';

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Sprite2DOptions extends Node2DOptions {
  texture?: THREE.Texture;
  centered?: boolean;
  offset?: THREE.Vector2 | { x: number; y: number };
  flipH?: boolean;
  flipV?: boolean;
  regionEnabled?: boolean;
  regionRect?: Rect2D;
  modulate?: THREE.ColorRepresentation;
  opacity?: number;
  size?: THREE.Vector2 | { x: number; y: number };
}

export class Sprite2D extends Node2D {
  private _mesh: THREE.Mesh;
  private _material: THREE.MeshBasicMaterial;
  private _geometry: THREE.PlaneGeometry;
  private _texture: THREE.Texture | null = null;
  private _centered = true;
  private _offset = new THREE.Vector2(0, 0);
  private _flipH = false;
  private _flipV = false;
  private _regionEnabled = false;
  private _regionRect: Rect2D = { x: 0, y: 0, width: 1, height: 1 };
  private _size = new THREE.Vector2(1, 1);

  constructor(options?: Sprite2DOptions) {
    super(options);

    this._centered = options?.centered ?? true;
    if (options?.offset) {
      this._offset.set(options.offset.x, options.offset.y);
    }
    this._flipH = options?.flipH ?? false;
    this._flipV = options?.flipV ?? false;
    this._regionEnabled = options?.regionEnabled ?? false;
    if (options?.regionRect) {
      this._regionRect = { ...options.regionRect };
    }
    if (options?.size) {
      this._size.set(options.size.x, options.size.y);
    }

    this._geometry = new THREE.PlaneGeometry(this._size.x, this._size.y);
    this._material = new THREE.MeshBasicMaterial({
      transparent: true,
      side: THREE.DoubleSide,
      color: options?.modulate ?? 0xffffff,
      opacity: options?.opacity ?? 1.0,
      depthWrite: false,
    });

    if (options?.texture) {
      this.texture = options.texture;
    }

    this._mesh = new THREE.Mesh(this._geometry, this._material);
    this._updateMeshTransform();
    this.object3D.add(this._mesh);
  }

  get texture(): THREE.Texture | null {
    return this._texture;
  }

  set texture(tex: THREE.Texture | null) {
    this._texture = tex;
    this._material.map = tex;
    this._material.needsUpdate = true;
    const img = (tex?.image as { width?: number; height?: number } | undefined);
    if (tex && (!img || !img.width)) {
      // Texture might be loading
      (tex as any).addEventListener?.('update', () => {
        this._updateUVs();
      });
    } else {
      this._updateUVs();
    }
  }

  get size(): THREE.Vector2 {
    return this._size.clone();
  }

  set size(val: THREE.Vector2 | { x: number; y: number }) {
    this._size.set(val.x, val.y);
    this._geometry.dispose();
    this._geometry = new THREE.PlaneGeometry(this._size.x, this._size.y);
    this._mesh.geometry = this._geometry;
    this._updateMeshTransform();
    this._updateUVs();
  }

  get centered(): boolean {
    return this._centered;
  }

  set centered(val: boolean) {
    this._centered = val;
    this._updateMeshTransform();
  }

  get offset(): THREE.Vector2 {
    return this._offset.clone();
  }

  set offset(val: THREE.Vector2 | { x: number; y: number }) {
    this._offset.set(val.x, val.y);
    this._updateMeshTransform();
  }

  get flipH(): boolean {
    return this._flipH;
  }

  set flipH(val: boolean) {
    this._flipH = val;
    this._updateUVs();
  }

  get flipV(): boolean {
    return this._flipV;
  }

  set flipV(val: boolean) {
    this._flipV = val;
    this._updateUVs();
  }

  get regionEnabled(): boolean {
    return this._regionEnabled;
  }

  set regionEnabled(val: boolean) {
    this._regionEnabled = val;
    this._updateUVs();
  }

  get regionRect(): Rect2D {
    return { ...this._regionRect };
  }

  set regionRect(rect: Rect2D) {
    this._regionRect = { ...rect };
    this._updateUVs();
  }

  get modulate(): THREE.Color {
    return this._material.color;
  }

  set modulate(color: THREE.ColorRepresentation) {
    this._material.color.set(color);
  }

  get opacity(): number {
    return this._material.opacity;
  }

  set opacity(val: number) {
    this._material.opacity = val;
  }

  setSize(width: number, height: number): void {
    this._size.set(width, height);
    this._geometry.dispose();
    this._geometry = new THREE.PlaneGeometry(width, height);
    this._mesh.geometry = this._geometry;
    this._updateUVs();
    this._updateMeshTransform();
  }

  private _updateMeshTransform(): void {
    if (this._centered) {
      this._mesh.position.set(this._offset.x, this._offset.y, 0);
    } else {
      this._mesh.position.set(this._offset.x + this._size.x / 2, this._offset.y - this._size.y / 2, 0);
    }
  }

  private _updateUVs(): void {
    const uvAttr = this._geometry.attributes.uv;
    if (!uvAttr) return;

    let u0 = 0, v0 = 0, u1 = 1, v1 = 1;

    if (this._regionEnabled && this._texture && this._texture.image) {
      const img = this._texture.image as { width?: number; height?: number };
      const iw = img.width || 1;
      const ih = img.height || 1;
      u0 = this._regionRect.x / iw;
      v0 = 1 - (this._regionRect.y + this._regionRect.height) / ih;
      u1 = (this._regionRect.x + this._regionRect.width) / iw;
      v1 = 1 - this._regionRect.y / ih;
    }

    if (this._flipH) {
      const tmp = u0;
      u0 = u1;
      u1 = tmp;
    }
    if (this._flipV) {
      const tmp = v0;
      v0 = v1;
      v1 = tmp;
    }

    // PlaneGeometry vertices: top-left (0, 1), top-right (1, 1), bottom-left (0, 0), bottom-right (1, 0)
    uvAttr.setXY(0, u0, v1);
    uvAttr.setXY(1, u1, v1);
    uvAttr.setXY(2, u0, v0);
    uvAttr.setXY(3, u1, v0);
    uvAttr.needsUpdate = true;
  }

  protected override _destroy(): void {
    this._geometry.dispose();
    this._material.dispose();
    super._destroy();
  }
}
