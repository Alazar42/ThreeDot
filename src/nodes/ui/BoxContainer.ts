/**
 * BoxContainer, HBoxContainer, and VBoxContainer
 */

import * as THREE from 'three';
import { Container } from './Container';
import { Control, ControlOptions } from './Control';
import { SizeFlags } from './types';

export interface BoxContainerOptions extends ControlOptions {
  separation?: number;
}

export abstract class BoxContainer extends Container {
  separation: number = 4;

  constructor(options?: BoxContainerOptions) {
    super(options);
    this.separation = options?.separation ?? 4;
  }
}

export class HBoxContainer extends BoxContainer {
  constructor(options?: BoxContainerOptions) {
    super(options);
  }

  override getMinimumSize(): THREE.Vector2 {
    let minW = 0;
    let minH = 0;
    let visibleCount = 0;

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const childMin = child.getCombinedMinimumSize();
        minW += childMin.x;
        minH = Math.max(minH, childMin.y);
        visibleCount++;
      }
    }

    if (visibleCount > 1) {
      minW += (visibleCount - 1) * this.separation;
    }

    return new THREE.Vector2(minW, minH);
  }

  protected override _sortChildren(): void {
    const controls: Control[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        controls.push(child);
      }
    }

    if (controls.length === 0) return;

    let totalFixedW = 0;
    let expandCount = 0;

    for (const c of controls) {
      const min = c.getCombinedMinimumSize();
      if (c.sizeFlagsHorizontal & SizeFlags.EXPAND) {
        expandCount++;
      }
      totalFixedW += min.x;
    }

    const totalSep = (controls.length - 1) * this.separation;
    const availableW = Math.max(0, this.size.x - totalSep - totalFixedW);
    const expandExtraW = expandCount > 0 ? availableW / expandCount : 0;

    let currentX = 0;
    for (const c of controls) {
      const min = c.getCombinedMinimumSize();
      let slotW = min.x;
      if (c.sizeFlagsHorizontal & SizeFlags.EXPAND) {
        slotW += expandExtraW;
      }

      this.fitChildInRect(c, {
        x: currentX,
        y: 0,
        width: slotW,
        height: this.size.y,
      });

      currentX += slotW + this.separation;
    }
  }
}

export class VBoxContainer extends BoxContainer {
  constructor(options?: BoxContainerOptions) {
    super(options);
  }

  override getMinimumSize(): THREE.Vector2 {
    let minW = 0;
    let minH = 0;
    let visibleCount = 0;

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const childMin = child.getCombinedMinimumSize();
        minH += childMin.y;
        minW = Math.max(minW, childMin.x);
        visibleCount++;
      }
    }

    if (visibleCount > 1) {
      minH += (visibleCount - 1) * this.separation;
    }

    return new THREE.Vector2(minW, minH);
  }

  protected override _sortChildren(): void {
    const controls: Control[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        controls.push(child);
      }
    }

    if (controls.length === 0) return;

    let totalFixedH = 0;
    let expandCount = 0;

    for (const c of controls) {
      const min = c.getCombinedMinimumSize();
      if (c.sizeFlagsVertical & SizeFlags.EXPAND) {
        expandCount++;
      }
      totalFixedH += min.y;
    }

    const totalSep = (controls.length - 1) * this.separation;
    const availableH = Math.max(0, this.size.y - totalSep - totalFixedH);
    const expandExtraH = expandCount > 0 ? availableH / expandCount : 0;

    let currentY = 0;
    for (const c of controls) {
      const min = c.getCombinedMinimumSize();
      let slotH = min.y;
      if (c.sizeFlagsVertical & SizeFlags.EXPAND) {
        slotH += expandExtraH;
      }

      this.fitChildInRect(c, {
        x: 0,
        y: currentY,
        width: this.size.x,
        height: slotH,
      });

      currentY += slotH + this.separation;
    }
  }
}
