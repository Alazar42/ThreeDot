/**
 * UI System Types, Flags, and Presets inspired by Godot Engine
 */

export interface Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Margins {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export enum SizeFlags {
  SHRINK_BEGIN = 0,
  FILL = 1,
  EXPAND = 2,
  EXPAND_FILL = 3,
  SHRINK_CENTER = 4,
  SHRINK_END = 8,
}

export enum MouseFilter {
  STOP = 0,
  PASS = 1,
  IGNORE = 2,
}

export enum FocusMode {
  NONE = 0,
  CLICK = 1,
  ALL = 2,
}

export enum LayoutPreset {
  TOP_LEFT = 0,
  TOP_RIGHT = 1,
  BOTTOM_LEFT = 2,
  BOTTOM_RIGHT = 3,
  CENTER_LEFT = 4,
  CENTER_TOP = 5,
  CENTER_RIGHT = 6,
  CENTER_BOTTOM = 7,
  CENTER = 8,
  LEFT_WIDE = 9,
  TOP_WIDE = 10,
  RIGHT_WIDE = 11,
  BOTTOM_WIDE = 12,
  VCENTER_WIDE = 13,
  HCENTER_WIDE = 14,
  FULL_RECT = 15,
}

export { LayoutPreset as AnchorPreset };

export enum HorizontalAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum VerticalAlignment {
  TOP = 'top',
  CENTER = 'center',
  BOTTOM = 'bottom',
}
