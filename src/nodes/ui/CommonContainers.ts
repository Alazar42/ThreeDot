/**
 * GridContainer, CenterContainer, MarginContainer, PanelContainer
 */

import * as THREE from 'three';
import { Container } from './Container';
import { Control, ControlOptions } from './Control';
import { StyleBoxFlat } from './Theme';

// ── GridContainer ──

export interface GridContainerOptions extends ControlOptions {
  columns?: number;
  hSeparation?: number;
  vSeparation?: number;
}

export class GridContainer extends Container {
  columns: number;
  hSeparation: number;
  vSeparation: number;

  constructor(options?: GridContainerOptions) {
    super(options);
    this.columns = Math.max(1, options?.columns ?? 1);
    this.hSeparation = options?.hSeparation ?? 4;
    this.vSeparation = options?.vSeparation ?? 4;
  }

  override getMinimumSize(): THREE.Vector2 {
    const controls = this._getVisibleChildren();
    if (controls.length === 0) return new THREE.Vector2(0, 0);

    const cols = this.columns;
    const rows = Math.ceil(controls.length / cols);

    const colWidths = new Array<number>(cols).fill(0);
    const rowHeights = new Array<number>(rows).fill(0);

    controls.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const min = c.getCombinedMinimumSize();
      colWidths[col] = Math.max(colWidths[col], min.x);
      rowHeights[row] = Math.max(rowHeights[row], min.y);
    });

    const totalW = colWidths.reduce((a, b) => a + b, 0) + (cols - 1) * this.hSeparation;
    const totalH = rowHeights.reduce((a, b) => a + b, 0) + (rows - 1) * this.vSeparation;

    return new THREE.Vector2(totalW, totalH);
  }

  protected override _sortChildren(): void {
    const controls = this._getVisibleChildren();
    if (controls.length === 0) return;

    const cols = this.columns;
    const rows = Math.ceil(controls.length / cols);

    const colWidths = new Array<number>(cols).fill(0);
    const rowHeights = new Array<number>(rows).fill(0);

    controls.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const min = c.getCombinedMinimumSize();
      colWidths[col] = Math.max(colWidths[col], min.x);
      rowHeights[row] = Math.max(rowHeights[row], min.y);
    });

    const colX: number[] = [0];
    for (let i = 1; i < cols; i++) {
      colX[i] = colX[i - 1] + colWidths[i - 1] + this.hSeparation;
    }

    const rowY: number[] = [0];
    for (let i = 1; i < rows; i++) {
      rowY[i] = rowY[i - 1] + rowHeights[i - 1] + this.vSeparation;
    }

    controls.forEach((c, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      this.fitChildInRect(c, {
        x: colX[col],
        y: rowY[row],
        width: colWidths[col],
        height: rowHeights[row],
      });
    });
  }

  private _getVisibleChildren(): Control[] {
    const res: Control[] = [];
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) res.push(child);
    }
    return res;
  }
}

// ── CenterContainer ──

export class CenterContainer extends Container {
  constructor(options?: ControlOptions) {
    super(options);
  }

  override getMinimumSize(): THREE.Vector2 {
    let minW = 0;
    let minH = 0;
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const min = child.getCombinedMinimumSize();
        minW = Math.max(minW, min.x);
        minH = Math.max(minH, min.y);
      }
    }
    return new THREE.Vector2(minW, minH);
  }

  protected override _sortChildren(): void {
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const min = child.getCombinedMinimumSize();
        const x = Math.max(0, (this.size.x - min.x) / 2);
        const y = Math.max(0, (this.size.y - min.y) / 2);
        this.fitChildInRect(child, {
          x,
          y,
          width: min.x,
          height: min.y,
        });
      }
    }
  }
}

// ── MarginContainer ──

export interface MarginContainerOptions extends ControlOptions {
  marginLeft?: number;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
}

export class MarginContainer extends Container {
  marginLeft = 0;
  marginTop = 0;
  marginRight = 0;
  marginBottom = 0;

  constructor(options?: MarginContainerOptions) {
    super(options);
    this.marginLeft = options?.marginLeft ?? 0;
    this.marginTop = options?.marginTop ?? 0;
    this.marginRight = options?.marginRight ?? 0;
    this.marginBottom = options?.marginBottom ?? 0;
    // Enforce size bounds now that margins are loaded
    if (options?.size) {
      this.size = options.size;
    }
  }

  override getMinimumSize(): THREE.Vector2 {
    let minW = 0;
    let minH = 0;
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const min = child.getCombinedMinimumSize();
        minW = Math.max(minW, min.x);
        minH = Math.max(minH, min.y);
      }
    }
    return new THREE.Vector2(
      minW + (this.marginLeft || 0) + (this.marginRight || 0),
      minH + (this.marginTop || 0) + (this.marginBottom || 0)
    );
  }

  protected override _sortChildren(): void {
    const innerW = Math.max(0, this.size.x - this.marginLeft - this.marginRight);
    const innerH = Math.max(0, this.size.y - this.marginTop - this.marginBottom);

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        this.fitChildInRect(child, {
          x: this.marginLeft,
          y: this.marginTop,
          width: innerW,
          height: innerH,
        });
      }
    }
  }
}

// ── PanelContainer ──

export interface PanelContainerOptions extends ControlOptions {
  style?: StyleBoxFlat;
}

export class PanelContainer extends Container {
  private _style: StyleBoxFlat;

  constructor(options?: PanelContainerOptions) {
    super(options);
    this._style = options?.style ?? this.theme.panelStyle;
    this._style.applyTo(this.element);
  }

  get style(): StyleBoxFlat {
    return this._style;
  }

  set style(s: StyleBoxFlat) {
    this._style = s;
    s.applyTo(this.element);
    this.queueSort();
  }

  override getMinimumSize(): THREE.Vector2 {
    let minW = 0;
    let minH = 0;
    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        const min = child.getCombinedMinimumSize();
        minW = Math.max(minW, min.x);
        minH = Math.max(minH, min.y);
      }
    }
    const m = this._style.contentMargins;
    return new THREE.Vector2(minW + m.left + m.right, minH + m.top + m.bottom);
  }

  protected override _sortChildren(): void {
    const m = this._style.contentMargins;
    const innerW = Math.max(0, this.size.x - m.left - m.right);
    const innerH = Math.max(0, this.size.y - m.top - m.bottom);

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        this.fitChildInRect(child, {
          x: m.left,
          y: m.top,
          width: innerW,
          height: innerH,
        });
      }
    }
  }
}
