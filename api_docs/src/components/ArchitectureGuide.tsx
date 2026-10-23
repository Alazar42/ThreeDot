import React from 'react';
import { CodeBlock } from './CodeBlock';

interface ArchitectureGuideProps {
  onNavigateClass: (name: string) => void;
}

export const ArchitectureGuide: React.FC<ArchitectureGuideProps> = ({ onNavigateClass }) => {
  return (
    <article className="architecture-guide-article">
      <header className="guide-header">
        <h1 className="guide-title">The ThreeDot Architectural Philosophy</h1>
        <p className="guide-subtitle">
          Bringing Godot Engine's structured scene trees, deterministic lifecycles, and developer ergonomics to the Three.js ecosystem.
        </p>
      </header>

      {/* 1. Core Problem & Mission */}
      <section className="guide-section">
        <h2>1. Why Godot for Three.js?</h2>
        <p>
          Three.js is an exceptional 3D rendering library, but it is deliberately focused on the graphics pipeline: geometries, materials, shaders, lights, and WebGL rendering. It does not provide:
        </p>
        <ul className="guide-list">
          <li>A standardized game object lifecycle (like <code>_ready</code>, <code>_process</code>, <code>_physicsProcess</code>).</li>
          <li>Deterministic pause management (pausing gameplay while keeping UI and menus interactive).</li>
          <li>Decoupled event messaging (signals).</li>
          <li>A virtual input map system separating hardware keys from semantic gameplay actions.</li>
          <li>An integrated anchor-and-margin GUI system.</li>
        </ul>
        <p>
          <strong>ThreeDot</strong> bridges this gap by bringing Godot's proven architecture to TypeScript and Three.js.
        </p>
      </section>

      {/* 2. Scene Tree Hierarchy */}
      <section className="guide-section">
        <h2>2. Scene Trees vs. Three.js Flat Scenes</h2>
        <p>
          In vanilla Three.js, you attach meshes, groups, and lights directly to a <code>THREE.Scene</code>. Logic is usually scattered across ad-hoc <code>requestAnimationFrame</code> loops with manual iteration arrays.
        </p>
        <p>
          In ThreeDot, the fundamental abstraction is the <strong>Scene Tree</strong> composed of{' '}
          <button type="button" className="inline-link" onClick={() => onNavigateClass('Node')}>
            Node
          </button>{' '}
          instances:
        </p>
        <CodeBlock
          language="text"
          title="Scene Hierarchy"
          code={`SceneTree (Root)
 ├── Camera3D (Active Viewport Camera)
 ├── DirectionalLight3D (Sun)
 ├── Node3D (World)
 │    ├── MeshInstance3D (Ground Plane)
 │    └── CharacterBody3D (Player)
 │         ├── MeshInstance3D (Hero Mesh)
 │         ├── CollisionShape3D (Capsule)
 │         └── RayCast3D (Ground Check)
 └── Control (HUD Overlay)
      └── VBoxContainer (Score & Health)`}
        />
      </section>

      {/* 3. Deterministic Lifecycle */}
      <section className="guide-section">
        <h2>3. The Node Lifecycle Sequence</h2>
        <p>Every node undergoes a predictable, deterministic sequence of phases:</p>
        <div className="lifecycle-timeline">
          <div className="lifecycle-step">
            <span className="step-num">1</span>
            <div className="step-content">
              <strong>_enterTree()</strong>
              <p>Called when the node or its parent enters the active SceneTree. Subclasses attach their Three.js Object3D here.</p>
            </div>
          </div>
          <div className="lifecycle-step">
            <span className="step-num">2</span>
            <div className="step-content">
              <strong>_ready()</strong>
              <p>Called exactly once after the node AND all of its recursive children have entered the tree. Safe place to query child nodes via getNode().</p>
            </div>
          </div>
          <div className="lifecycle-step">
            <span className="step-num">3</span>
            <div className="step-content">
              <strong>_physicsProcess(delta)</strong>
              <p>Executed on a fixed timestep (default: 60 Hz). Used for physics movement, collision detection, and rigid body forces.</p>
            </div>
          </div>
          <div className="lifecycle-step">
            <span className="step-num">4</span>
            <div className="step-content">
              <strong>_process(delta)</strong>
              <p>Executed on every rendered visual frame with elapsed delta in seconds. Used for continuous animations, input queries, and visual updates.</p>
            </div>
          </div>
          <div className="lifecycle-step">
            <span className="step-num">5</span>
            <div className="step-content">
              <strong>_exitTree()</strong>
              <p>Called when the node is detached from the active SceneTree. Cleans up scene graph attachments.</p>
            </div>
          </div>
          <div className="lifecycle-step">
            <span className="step-num">6</span>
            <div className="step-content">
              <strong>_destroy()</strong>
              <p>Called when dispose() is invoked. Disconnects all signals and frees GPU geometries and textures.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Process Modes & Pausing */}
      <section className="guide-section">
        <h2>4. Process Modes & Pause Management</h2>
        <p>
          Pausing a game in ThreeDot is a single line: <code>engine.sceneTree.paused = true;</code>. How individual nodes respond to pause is governed by their{' '}
          <code>processMode</code>:
        </p>
        <ul className="guide-list">
          <li><strong>ProcessMode.Inherit (0):</strong> Inherits the behavior of its parent node.</li>
          <li><strong>ProcessMode.Pausable (1):</strong> Stops receiving process and physics updates when the scene tree is paused.</li>
          <li><strong>ProcessMode.WhenPaused (2):</strong> Processes ONLY when the scene tree is paused (used for pause menus and setting screens).</li>
          <li><strong>ProcessMode.Always (3):</strong> Continues processing regardless of whether the scene is running or paused.</li>
          <li><strong>ProcessMode.Disabled (4):</strong> Never processes.</li>
        </ul>
      </section>

      {/* 5. Decoupled Signals */}
      <section className="guide-section">
        <h2>5. Type-Safe Signals</h2>
        <p>
          Instead of storing direct references to other classes or passing callback functions through deep constructor chains, nodes declare typed{' '}
          <button type="button" className="inline-link" onClick={() => onNavigateClass('Signal')}>
            Signal
          </button>{' '}
          instances:
        </p>
        <CodeBlock
          language="typescript"
          title="Signals Example"
          code={`// Emitter Node
export class Coin extends Area3D {
  readonly collected = new Signal<[number]>('coin_collected');

  onPlayerTouch(player: Node): void {
    this.collected.emit(100); // Emits 100 points
    this.removeFromParent();
  }
}

// Receiver Node
coin.collected.connect((points) => {
  hud.addScore(points);
});`}
        />
      </section>

      {/* 6. UI Anchors & Margins */}
      <section className="guide-section">
        <h2>6. UI Dual-Anchor & Margin Model</h2>
        <p>
          ThreeDot's{' '}
          <button type="button" className="inline-link" onClick={() => onNavigateClass('Control')}>
            Control
          </button>{' '}
          nodes use fractional anchors (0.0 to 1.0) and pixel margins to adapt to any screen resolution or aspect ratio without hardcoded pixel coordinates:
        </p>
        <CodeBlock
          language="typescript"
          title="Control Anchoring"
          code={`// Pin a control to the top-right corner with 20px padding
control.anchorLeft = 1.0;
control.anchorRight = 1.0;
control.anchorTop = 0.0;
control.anchorBottom = 0.0;

control.marginLeft = -180;
control.marginRight = -20;
control.marginTop = 20;
control.marginBottom = 60;`}
        />
      </section>

      {/* 7. JSX vs Imperative Code Parity */}
      <section className="guide-section">
        <h2>7. Declarative JSX vs. Imperative Code Parity</h2>
        <p>
          A common question is: <em>"How does JSX work with the imperative code we write? Are they two different worlds?"</em>
        </p>
        <p>
          In ThreeDot, JSX and imperative classes are two ergonomic lenses on the exact same SceneTree.
          When you write JSX tags like <code>&lt;Node3D&gt;</code> or <code>&lt;MeshInstance3D shape="box" /&gt;</code>,
          the ThreeDot JSX runtime creates genuine ThreeDot <code>Node</code> instances.
        </p>
        <p>
          You can write complex game actors using clean object-oriented TypeScript classes (subclassing <code>Node3D</code> and overriding <code>_process(delta)</code>),
          and then embed those custom classes directly into JSX scene hierarchies:
        </p>
        <CodeBlock
          language="tsx"
          title="Seamless JSX & OOP Interoperability"
          code={`// 1. Write an imperative game actor
export class HeroPlayer extends Node3D {
  override _process(delta: number): void {
    // Game loop ticks...
  }
}

// 2. Embed into a declarative JSX scene hierarchy
const level = (
  <Node3D name="World">
    <Camera3D fov={60} position={[0, 5, 10]} makeCurrent />
    <DirectionalLight3D intensity={1.5} position={[10, 20, 10]} />
    <HeroPlayer name="Hero" position={[0, 1, 0]} />
  </Node3D>
);

// 3. Mount directly to the active SceneTree root
engine.sceneTree.root.addChild(level);

// 4. Query and manipulate the imperative instance at any time
const player = engine.sceneTree.root.getNode<HeroPlayer>('World/Hero');`}
        />
      </section>

      {/* 8. The threedot-signal HTML & JSX Bridge */}
      <section className="guide-section">
        <h2>8. The 'threedot-signal' HTML & JSX Bridge</h2>
        <p>
          In web games and 3D applications, the user interface is often composed of HTML DOM elements (or React/Vue/Svelte overlays).
          ThreeDot eliminates the boilerplate of attaching manual click listeners and passing callbacks through the <strong>threedot-signal</strong> attribute.
        </p>
        <p>
          Any standard HTML tag or JSX element can declare:
        </p>
        <ul className="guide-list">
          <li><code>threedot-signal="signal_name"</code>: The signal name to execute on the global <code>SignalBus</code>.</li>
          <li><code>threedot-params='["arg1", 42]'</code>: Optional arguments passed to the signal listener (JSON array or comma-separated).</li>
          <li><code>threedot-event="click"</code>: The DOM trigger event (defaults to <code>'click'</code>).</li>
        </ul>
        <CodeBlock
          language="html"
          title="HTML Overlay with threedot-signal"
          code={`<!-- In your HTML HUD or React/Vue overlay -->
<div id="hud">
  <button threedot-signal="player_jump" threedot-params="[15]">Jump</button>
  <button threedot-signal="change_weapon" threedot-params='["plasma_rifle", 100]'>Plasma Rifle</button>
</div>`}
        />
        <CodeBlock
          language="typescript"
          title="Listening in 3D Game Code"
          code={`import { SignalBus } from 'threedot';

// Automatically receives events when the user clicks the HTML button!
SignalBus.connect('player_jump', (jumpPower: number) => {
  player.jump(jumpPower);
});

SignalBus.connect('change_weapon', (weaponName: string, ammo: number) => {
  player.equipWeapon(weaponName, ammo);
});`}
        />
      </section>
    </article>
  );
};

