import type { ClassDoc } from '../types';

export const uiClasses: ClassDoc[] = [
  {
    name: 'Control',
    category: 'User Interface',
    inherits: 'Node',
    inheritedBy: ['Container', 'Label', 'ColorRect', 'TextureRect', 'Button', 'CheckBox', 'RadioButton', 'LineEdit', 'ProgressBar', 'HSlider', 'VSlider', 'Separator'],
    brief: 'The foundational base class for all 2D graphical user interface components in ThreeDot, implementing Godot-style Anchors and Margins.',
    description: `Control introduces Godot's dual-anchor and margin layout model to Three.js applications. Instead of hardcoding absolute pixel offsets or relying entirely on external CSS stylesheets, Control elements position and size themselves dynamically relative to their parent container using fractional anchors (0.0 to 1.0) and offset margins in pixels.

Anchor and Margin Mathematics:
- Left Edge = ParentWidth * anchorLeft + marginLeft
- Top Edge = ParentHeight * anchorTop + marginTop
- Right Edge = ParentWidth * anchorRight + marginRight
- Bottom Edge = ParentHeight * anchorBottom + marginBottom
- Width = Right Edge - Left Edge
- Height = Bottom Edge - Top Edge

Preset Shortcuts:
The setAnchorsPreset() helper method allows configuring common anchor configurations in a single call, such as AnchorPreset.FULL_RECT, TOP_LEFT, CENTER, BOTTOM_WIDE, etc.

Sizing & Minimum Size:
Control elements calculate their minimum size (getMinimumSize()) based on content (e.g. text bounds or texture dimensions) and expand based on horizontal/vertical sizeFlags when nested within Containers.`,
    codeExample: `import { Control, AnchorPreset, Label, Button } from 'threedot';

// Create a full-screen HUD container
const hud = new Control({ name: 'HUD' });
hud.setAnchorsPreset(AnchorPreset.FULL_RECT);

// Create an anchored button at bottom-right
const actionBtn = new Button({
  name: 'ActionBtn',
  text: 'Launch Mission',
  size: { x: 180, y: 44 },
});
actionBtn.setAnchorsPreset(AnchorPreset.BOTTOM_RIGHT);
actionBtn.marginRight = -20;
actionBtn.marginBottom = -20;

actionBtn.pressed.connect(() => {
  console.log('Action button clicked!');
});

hud.addChild(actionBtn);`,
    properties: [
      {
        name: 'position',
        type: 'THREE.Vector2',
        description: 'Calculated 2D layout position (x, y) relative to the parent control.',
      },
      {
        name: 'size',
        type: 'THREE.Vector2',
        description: 'Calculated 2D layout size (width, height). Minimum size constraints are enforced.',
      },
      {
        name: 'customMinimumSize',
        type: 'THREE.Vector2',
        defaultValue: 'Vector2(0, 0)',
        description: 'User-specified minimum size constraint preventing the control from shrinking below these dimensions.',
      },
      {
        name: 'anchorLeft',
        type: 'number',
        defaultValue: '0.0',
        description: 'Fractional horizontal anchor for the left boundary (0.0 = parent left, 1.0 = parent right).',
      },
      {
        name: 'anchorTop',
        type: 'number',
        defaultValue: '0.0',
        description: 'Fractional vertical anchor for the top boundary (0.0 = parent top, 1.0 = parent bottom).',
      },
      {
        name: 'anchorRight',
        type: 'number',
        defaultValue: '0.0',
        description: 'Fractional horizontal anchor for the right boundary.',
      },
      {
        name: 'anchorBottom',
        type: 'number',
        defaultValue: '0.0',
        description: 'Fractional vertical anchor for the bottom boundary.',
      },
      {
        name: 'marginLeft',
        type: 'number',
        defaultValue: '0',
        description: 'Pixel offset applied to the anchorLeft boundary.',
      },
      {
        name: 'marginTop',
        type: 'number',
        defaultValue: '0',
        description: 'Pixel offset applied to the anchorTop boundary.',
      },
      {
        name: 'marginRight',
        type: 'number',
        defaultValue: '0',
        description: 'Pixel offset applied to the anchorRight boundary.',
      },
      {
        name: 'marginBottom',
        type: 'number',
        defaultValue: '0',
        description: 'Pixel offset applied to the anchorBottom boundary.',
      },
      {
        name: 'sizeFlagsHorizontal',
        type: 'SizeFlags',
        defaultValue: 'SizeFlags.Fill',
        description: 'Dictates how this control behaves when placed inside a horizontal Container (Fill, Expand, ShrinkCenter, etc.).',
      },
      {
        name: 'sizeFlagsVertical',
        type: 'SizeFlags',
        defaultValue: 'SizeFlags.Fill',
        description: 'Dictates how this control behaves when placed inside a vertical Container.',
      },
    ],
    methods: [
      {
        name: 'setAnchorsPreset',
        returns: 'void',
        params: [
          { name: 'preset', type: 'AnchorPreset', description: 'Preset enumeration value (e.g. FULL_RECT, CENTER, TOP_WIDE)' },
          { name: 'keepMargins?', type: 'boolean', defaultValue: 'false', description: 'Whether existing margins are preserved' },
        ],
        description: 'Convenience helper to set all four anchor values in a single call according to standard Godot layout presets.',
      },
      {
        name: 'getMinimumSize',
        returns: 'THREE.Vector2',
        params: [],
        description: 'Calculates the smallest size this control can occupy based on its contents and customMinimumSize.',
      },
    ],
    signals: [
      { name: 'resized', args: [], description: 'Emitted whenever this control calculated size changes.' },
      { name: 'mouseEntered', args: [], description: 'Emitted when pointer enters this control boundary.' },
      { name: 'mouseExited', args: [], description: 'Emitted when pointer leaves this control boundary.' },
    ],
    constants: [
      { name: 'AnchorPreset.TOP_LEFT', value: '0', description: 'Anchors to top-left corner.' },
      { name: 'AnchorPreset.TOP_RIGHT', value: '1', description: 'Anchors to top-right corner.' },
      { name: 'AnchorPreset.BOTTOM_LEFT', value: '2', description: 'Anchors to bottom-left corner.' },
      { name: 'AnchorPreset.BOTTOM_RIGHT', value: '3', description: 'Anchors to bottom-right corner.' },
      { name: 'AnchorPreset.CENTER', value: '8', description: 'Centers the control horizontally and vertically.' },
      { name: 'AnchorPreset.TOP_WIDE', value: '10', description: 'Stretches horizontally across the top edge.' },
      { name: 'AnchorPreset.BOTTOM_WIDE', value: '11', description: 'Stretches horizontally across the bottom edge.' },
      { name: 'AnchorPreset.FULL_RECT', value: '15', description: 'Expands across the entire area of the parent control.' },
    ],
  },
  {
    name: 'Container',
    category: 'User Interface',
    inherits: 'Control',
    inheritedBy: ['BoxContainer', 'HBoxContainer', 'VBoxContainer', 'GridContainer', 'CenterContainer', 'MarginContainer', 'PanelContainer', 'ScrollContainer', 'AspectRatioContainer'],
    brief: 'Base class for all layout containers that automatically compute positions and sizes for their child Control nodes.',
    description: `Container automatically arranges its direct child Control nodes according to specialized layout algorithms. Whenever child nodes are added, removed, or change their minimum size, the container queues a relayout pass via queueSort(). Direct manual manipulation of child position/size inside containers is overwritten by the container layout logic.`,
    codeExample: `import { VBoxContainer, Label, Button } from 'threedot';

const menu = new VBoxContainer({
  name: 'PauseMenu',
  separation: 10,
  position: { x: 50, y: 50 },
  size: { x: 200, y: 300 },
});

menu.addChild(new Label({ text: 'Paused' }));
menu.addChild(new Button({ text: 'Resume' }));
menu.addChild(new Button({ text: 'Settings' }));
menu.addChild(new Button({ text: 'Quit to Desktop' }));`,
    properties: [],
    methods: [
      {
        name: 'queueSort',
        returns: 'void',
        params: [],
        description: 'Marks the container dirty and schedules a child layout pass on the next frame update.',
      },
      {
        name: 'fitChildInRect',
        returns: 'void',
        params: [
          { name: 'child', type: 'Control', description: 'Target child node' },
          { name: 'rect', type: 'Rect2D', description: 'Bounding rectangle for child placement' },
        ],
        description: 'Internal utility that applies anchor bounds and size flags to place a child within an allocated sub-rectangle.',
      },
    ],
    signals: [],
  },
  {
    name: 'HBoxContainer',
    category: 'User Interface',
    inherits: 'Container',
    brief: 'Arranges child Control nodes horizontally from left to right with customizable spacing separation.',
    description: `HBoxContainer stacks its children horizontally along the X-axis. Children with SizeFlags.Expand share available excess width proportionately. Non-expanding children take their getMinimumSize().x width.`,
    codeExample: `import { HBoxContainer, Button } from 'threedot';

const bar = new HBoxContainer({ separation: 8 });
bar.addChild(new Button({ text: 'Inventory' }));
bar.addChild(new Button({ text: 'Skills' }));
bar.addChild(new Button({ text: 'Map' }));`,
    properties: [
      {
        name: 'separation',
        type: 'number',
        defaultValue: '4',
        description: 'Horizontal gap in pixels between consecutive child controls.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'VBoxContainer',
    category: 'User Interface',
    inherits: 'Container',
    brief: 'Arranges child Control nodes vertically from top to bottom with customizable spacing separation.',
    description: `VBoxContainer stacks its children vertically along the Y-axis. Ideal for vertical sidebars, dropdown lists, menus, and message logs.`,
    codeExample: `import { VBoxContainer, Label, Button } from 'threedot';

const list = new VBoxContainer({ separation: 6 });
list.addChild(new Label({ text: 'Player Status' }));
list.addChild(new Label({ text: 'HP: 100 / 100' }));
list.addChild(new Button({ text: 'Use Potion' }));`,
    properties: [
      {
        name: 'separation',
        type: 'number',
        defaultValue: '4',
        description: 'Vertical gap in pixels between consecutive child controls.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'GridContainer',
    category: 'User Interface',
    inherits: 'Container',
    brief: 'Arranges child Control nodes into a tabular grid with a specified number of columns.',
    description: `GridContainer aligns children in uniform rows and columns. Columns automatically expand to accommodate the widest element in that column, and rows expand to fit the tallest element.`,
    codeExample: `import { GridContainer, Button } from 'threedot';

const inventoryGrid = new GridContainer({ columns: 4 });
for (let i = 0; i < 16; i++) {
  inventoryGrid.addChild(new Button({ text: \`Slot \${i + 1}\` }));
}`,
    properties: [
      {
        name: 'columns',
        type: 'number',
        defaultValue: '1',
        description: 'The number of columns in the grid. Rows are automatically added as children are appended.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'MarginContainer',
    category: 'User Interface',
    inherits: 'Container',
    brief: 'Adds internal padding margins (left, top, right, bottom) around its child Control nodes.',
    description: `MarginContainer inserts an internal padding border around its children. It ensures that content does not touch the edges of panels or windows.`,
    codeExample: `import { MarginContainer, Label } from 'threedot';

const card = new MarginContainer({
  marginLeft: 16,
  marginTop: 16,
  marginRight: 16,
  marginBottom: 16,
});
card.addChild(new Label({ text: 'Padded card content' }));`,
    properties: [
      {
        name: 'marginLeft',
        type: 'number',
        defaultValue: '0',
        description: 'Padding margin in pixels along the left edge.',
      },
      {
        name: 'marginTop',
        type: 'number',
        defaultValue: '0',
        description: 'Padding margin in pixels along the top edge.',
      },
      {
        name: 'marginRight',
        type: 'number',
        defaultValue: '0',
        description: 'Padding margin in pixels along the right edge.',
      },
      {
        name: 'marginBottom',
        type: 'number',
        defaultValue: '0',
        description: 'Padding margin in pixels along the bottom edge.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'CenterContainer',
    category: 'User Interface',
    inherits: 'Container',
    brief: 'Positions all children centered horizontally and vertically within its bounding rectangle.',
    description: `CenterContainer calculates the minimum size of each child and offsets it to the center of the container. Commonly used for loading spinners, dialog boxes, and game over overlays.`,
    codeExample: `import { CenterContainer, Label, AnchorPreset } from 'threedot';

const center = new CenterContainer({ name: 'DialogCenter' });
center.setAnchorsPreset(AnchorPreset.FULL_RECT);
center.addChild(new Label({ text: 'Game Over' }));`,
    properties: [],
    methods: [],
    signals: [],
  },
  {
    name: 'Button',
    category: 'User Interface',
    inherits: 'Control',
    brief: 'Interactive push button control supporting normal, hovered, pressed, and disabled states with click signals.',
    description: `Button is an interactive UI control that listens to mouse and touch interactions. It provides built-in visual feedback (hover highlights, active depressions) and emits pressed signals when clicked.`,
    codeExample: `import { Button } from 'threedot';

const btn = new Button({
  name: 'PlayButton',
  text: 'Start Game',
  size: { x: 160, y: 40 },
});

btn.pressed.connect(() => {
  console.log('Button clicked!');
});`,
    properties: [
      {
        name: 'text',
        type: 'string',
        defaultValue: "''",
        description: 'The text label displayed on the button surface.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'When true, button ignores interactions and displays a dimmed disabled appearance.',
      },
    ],
    methods: [],
    signals: [
      { name: 'pressed', args: [], description: 'Emitted when the button is clicked or activated.' },
      { name: 'buttonDown', args: [], description: 'Emitted on mousedown.' },
      { name: 'buttonUp', args: [], description: 'Emitted on mouseup.' },
    ],
  },
  {
    name: 'Label',
    category: 'User Interface',
    inherits: 'Control',
    brief: 'Renders 2D textual typography with font styling, alignment, and auto-wrapping support.',
    description: `Label displays styled text on screen. It calculates text measurements and bounding boxes dynamically using canvas font metrics or 3D Troika text rendering.`,
    codeExample: `import { Label } from 'threedot';

const label = new Label({
  text: 'ThreeDot Engine v0.1.0',
  fontSize: 18,
  fontColor: 0x478cbf,
});`,
    properties: [
      {
        name: 'text',
        type: 'string',
        defaultValue: "''",
        description: 'The string content displayed by the label.',
      },
      {
        name: 'fontSize',
        type: 'number',
        defaultValue: '14',
        description: 'Font size in pixels.',
      },
      {
        name: 'horizontalAlignment',
        type: 'HorizontalAlignment',
        defaultValue: 'Left',
        description: 'Text alignment: Left, Center, Right, or Justify.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'TextureRect',
    category: 'User Interface',
    inherits: 'Control',
    brief: 'Draws a 2D texture or sprite image inside a rectangular GUI control boundary.',
    description: `TextureRect displays images, icons, and portraits inside UI layouts with support for texture stretch modes (Keep, Scale, Tile, KeepCentered).`,
    codeExample: `import { TextureRect } from 'threedot';

const icon = new TextureRect({
  textureUrl: '/assets/icons/sword.png',
  size: { x: 48, y: 48 },
});`,
    properties: [
      {
        name: 'texture',
        type: 'THREE.Texture | null',
        description: 'The Three.js Texture rendered inside the rectangle.',
      },
    ],
    methods: [],
    signals: [],
  },
  {
    name: 'ProgressBar',
    category: 'User Interface',
    inherits: 'Control',
    brief: 'A horizontal or vertical progress indicator showing current value relative to min/max range.',
    description: `ProgressBar visualizes loading indicators, health bars, experience gauges, and stamina meters.`,
    codeExample: `import { ProgressBar } from 'threedot';

const hpBar = new ProgressBar({
  minValue: 0,
  maxValue: 100,
  value: 75,
  size: { x: 200, y: 16 },
});`,
    properties: [
      {
        name: 'value',
        type: 'number',
        defaultValue: '0',
        description: 'Current progress value.',
      },
      {
        name: 'minValue',
        type: 'number',
        defaultValue: '0',
        description: 'Minimum value range bound.',
      },
      {
        name: 'maxValue',
        type: 'number',
        defaultValue: '100',
        description: 'Maximum value range bound.',
      },
    ],
    methods: [],
    signals: [
      { name: 'valueChanged', args: [{ name: 'newValue', type: 'number' }], description: 'Emitted whenever value changes.' },
    ],
  },
];
