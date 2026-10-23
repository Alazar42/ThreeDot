/**
 * ScrollContainer, AspectRatioContainer, TabContainer, PopupPanel
 */

import * as THREE from 'three';
import { Container } from './Container';
import { Control, ControlOptions } from './Control';
import { Signal } from '../../core/signals/Signal';

// ── ScrollContainer ──

export interface ScrollContainerOptions extends ControlOptions {
  horizontalScroll?: boolean;
  verticalScroll?: boolean;
}

export class ScrollContainer extends Container {
  private _scrollContent: HTMLDivElement;

  constructor(options?: ScrollContainerOptions) {
    super(options);
    this.element.style.overflow = 'hidden';

    this._scrollContent = document.createElement('div');
    this._scrollContent.style.position = 'relative';
    this._scrollContent.style.width = '100%';
    this._scrollContent.style.height = '100%';
    this._scrollContent.style.overflowX = (options?.horizontalScroll ?? true) ? 'auto' : 'hidden';
    this._scrollContent.style.overflowY = (options?.verticalScroll ?? true) ? 'auto' : 'hidden';
    this.element.appendChild(this._scrollContent);
  }

  get scrollContent(): HTMLDivElement {
    return this._scrollContent;
  }
}

// ── AspectRatioContainer ──

export type StretchMode = 'fit' | 'cover' | 'widthControlsHeight' | 'heightControlsWidth';

export interface AspectRatioContainerOptions extends ControlOptions {
  ratio?: number;
  stretchMode?: StretchMode;
}

export class AspectRatioContainer extends Container {
  ratio: number;
  stretchMode: StretchMode;

  constructor(options?: AspectRatioContainerOptions) {
    super(options);
    this.ratio = options?.ratio ?? 1.0;
    this.stretchMode = options?.stretchMode ?? 'fit';
  }

  protected override _sortChildren(): void {
    let targetW = this.size.x;
    let targetH = this.size.y;

    if (this.stretchMode === 'fit') {
      if (this.size.x / this.size.y > this.ratio) {
        targetW = this.size.y * this.ratio;
      } else {
        targetH = this.size.x / this.ratio;
      }
    } else if (this.stretchMode === 'cover') {
      if (this.size.x / this.size.y > this.ratio) {
        targetH = this.size.x / this.ratio;
      } else {
        targetW = this.size.y * this.ratio;
      }
    } else if (this.stretchMode === 'widthControlsHeight') {
      targetH = this.size.x / this.ratio;
    } else if (this.stretchMode === 'heightControlsWidth') {
      targetW = this.size.y * this.ratio;
    }

    const x = Math.max(0, (this.size.x - targetW) / 2);
    const y = Math.max(0, (this.size.y - targetH) / 2);

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        this.fitChildInRect(child, {
          x,
          y,
          width: targetW,
          height: targetH,
        });
      }
    }
  }
}

// ── TabContainer ──

export interface TabContainerOptions extends ControlOptions {
  currentTab?: number;
}

export class TabContainer extends Container {
  readonly tabChanged = new Signal<[number]>('tab_changed');

  private _currentTab = 0;
  private _tabBarElement: HTMLDivElement;
  private _tabs: Array<{ title: string; control: Control; button: HTMLButtonElement }> = [];

  constructor(options?: TabContainerOptions) {
    super(options);

    this._tabBarElement = document.createElement('div');
    this._tabBarElement.style.display = 'flex';
    this._tabBarElement.style.gap = '2px';
    this._tabBarElement.style.borderBottom = `1px solid ${this.theme.colors.border}`;
    this._tabBarElement.style.marginBottom = '8px';
    this.element.appendChild(this._tabBarElement);

    this._currentTab = options?.currentTab ?? 0;
  }

  get currentTab(): number {
    return this._currentTab;
  }

  set currentTab(idx: number) {
    if (this._currentTab !== idx && idx >= 0 && idx < this._tabs.length) {
      this._currentTab = idx;
      this._updateTabVisibility();
      this.tabChanged.emit(idx);
    }
  }

  override addChild(child: import('../../core/node/Node').Node): void {
    super.addChild(child);
    if (child instanceof Control) {
      const btn = document.createElement('button');
      btn.textContent = child.name;
      btn.style.padding = '6px 14px';
      btn.style.border = 'none';
      btn.style.borderRadius = '4px 4px 0 0';
      btn.style.background = 'transparent';
      btn.style.color = this.theme.colors.textSecondary;
      btn.style.cursor = 'pointer';
      btn.style.fontSize = `${this.theme.fontSize}px`;

      const tabIndex = this._tabs.length;
      btn.addEventListener('click', () => {
        this.currentTab = tabIndex;
      });

      this._tabBarElement.appendChild(btn);
      this._tabs.push({ title: child.name, control: child, button: btn });

      this._updateTabVisibility();
    }
  }

  private _updateTabVisibility(): void {
    this._tabs.forEach((tab, idx) => {
      const active = idx === this._currentTab;
      tab.control.visible = active;
      tab.button.style.color = active ? this.theme.colors.text : this.theme.colors.textSecondary;
      tab.button.style.backgroundColor = active ? this.theme.colors.surfaceVariant : 'transparent';
      tab.button.style.fontWeight = active ? '600' : '400';
    });
  }

  protected override _sortChildren(): void {
    const tabBarHeight = this._tabBarElement.offsetHeight || 36;
    const contentH = Math.max(0, this.size.y - tabBarHeight);

    for (const child of this.getChildren()) {
      if (child instanceof Control && child.visible) {
        this.fitChildInRect(child, {
          x: 0,
          y: tabBarHeight,
          width: this.size.x,
          height: contentH,
        });
      }
    }
  }
}

// ── PopupPanel ──

export interface PopupPanelOptions extends ControlOptions {
  modal?: boolean;
}

export class PopupPanel extends Container {
  readonly aboutToPopup = new Signal<[]>('about_to_popup');
  readonly popupHide = new Signal<[]>('popup_hide');

  private _modal = false;

  constructor(options?: PopupPanelOptions) {
    super(options);
    this._modal = options?.modal ?? true;
    this.visible = false;
    this.theme.panelStyle.applyTo(this.element);
    this.element.style.zIndex = '9999';
  }

  get modal(): boolean {
    return this._modal;
  }

  set modal(val: boolean) {
    this._modal = val;
  }

  popup(): void {
    this.aboutToPopup.emit();
    this.visible = true;
  }

  popupCentered(size?: THREE.Vector2 | { x: number; y: number }): void {
    if (size) {
      this.size = new THREE.Vector2(size.x, size.y);
    }
    const engine = this.getRoot().getMeta<import('../../core/engine/Engine').Engine>('__engine');
    const viewportW = engine?.viewportSize.x ?? window.innerWidth;
    const viewportH = engine?.viewportSize.y ?? window.innerHeight;

    const x = Math.max(0, (viewportW - this.size.x) / 2);
    const y = Math.max(0, (viewportH - this.size.y) / 2);
    this.position = new THREE.Vector2(x, y);

    this.popup();
  }

  hide(): void {
    this.visible = false;
    this.popupHide.emit();
  }
}
