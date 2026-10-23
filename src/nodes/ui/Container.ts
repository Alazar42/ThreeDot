/**
 * Container — Base container node for automatic child layout
 */

import * as THREE from 'three';
import { Control, ControlOptions } from './Control';
import { Rect2D, SizeFlags } from './types';
import { Signal } from '../../core/signals/Signal';

export class Container extends Control {
  readonly sortChildren = new Signal<[]>('sort_children');
  private _sortQueued = false;

  constructor(options?: ControlOptions) {
    super(options);
  }

  queueSort(): void {
    if (this._sortQueued) return;
    this._sortQueued = true;

    // Use microtask or requestAnimationFrame so multiple changes batch into a single layout pass
    queueMicrotask(() => {
      if (this._sortQueued) {
        this._sortQueued = false;
        this._performSort();
      }
    });
  }

  protected override _onSizeChanged(): void {
    super._onSizeChanged();
    this.queueSort();
  }

  override addChild(child: import('../../core/node/Node').Node): void {
    super.addChild(child);
    if (child instanceof Control) {
      child.minimumSizeChanged.connect(() => this.queueSort());
      this.queueSort();
    }
  }

  override removeChild(child: import('../../core/node/Node').Node): void {
    super.removeChild(child);
    if (child instanceof Control) {
      this.queueSort();
    }
  }

  fitChildInRect(child: Control, rect: Rect2D): void {
    const minSize = child.getCombinedMinimumSize();
    let newX = rect.x;
    let newY = rect.y;
    let newW = rect.width;
    let newH = rect.height;

    // Horizontal size flag handling
    const hFlags = child.sizeFlagsHorizontal;
    if (hFlags & SizeFlags.FILL) {
      newW = Math.max(minSize.x, rect.width);
    } else if (hFlags & SizeFlags.SHRINK_CENTER) {
      newW = minSize.x;
      newX = rect.x + Math.max(0, (rect.width - minSize.x) / 2);
    } else if (hFlags & SizeFlags.SHRINK_END) {
      newW = minSize.x;
      newX = rect.x + Math.max(0, rect.width - minSize.x);
    } else {
      // SHRINK_BEGIN
      newW = minSize.x;
    }

    // Vertical size flag handling
    const vFlags = child.sizeFlagsVertical;
    if (vFlags & SizeFlags.FILL) {
      newH = Math.max(minSize.y, rect.height);
    } else if (vFlags & SizeFlags.SHRINK_CENTER) {
      newH = minSize.y;
      newY = rect.y + Math.max(0, (rect.height - minSize.y) / 2);
    } else if (vFlags & SizeFlags.SHRINK_END) {
      newH = minSize.y;
      newY = rect.y + Math.max(0, rect.height - minSize.y);
    } else {
      // SHRINK_BEGIN
      newH = minSize.y;
    }

    child.position = new THREE.Vector2(newX, newY);
    child.size = new THREE.Vector2(newW, newH);
  }

  private _performSort(): void {
    if (!this.isInsideTree) return;
    this._sortChildren();
    this.sortChildren.emit();
  }

  protected _sortChildren(): void {
    // Override in layout containers (HBox, VBox, Grid, etc.)
  }
}
