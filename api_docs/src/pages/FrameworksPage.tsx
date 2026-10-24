import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import FolderTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import { CodeBlock } from '../components/CodeBlock';

export const FrameworksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em' }}>
          UI FRAMEWORK INTEGRATION
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 1.5 }}>
          Step-by-Step Framework Guides
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 880 }}>
          ThreeDot is 100% framework-agnostic. Whether you choose React, Vue 3, or Svelte 5, your 3D
          gameplay logic (<code>Node3D</code> scripts) remains pure, identical TypeScript with zero
          vendor lock-in. Select your framework below for a complete step-by-step implementation guide:
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
          <Chip label="React 18 / 19" size="small" variant="outlined" />
          <Chip label="Vue 3 (Composition API)" size="small" variant="outlined" />
          <Chip label="Svelte 5 (Runes)" size="small" variant="outlined" />
          <Chip label="Zero Framework Lock-in" size="small" color="primary" variant="outlined" />
        </Box>
      </Box>

      {/* Framework Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
        >
          <Tab label="React 18 / 19" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '14px' }} />
          <Tab label="Vue 3" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '14px' }} />
          <Tab label="Svelte 5" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '14px' }} />
        </Tabs>
      </Box>

      {/* ─── TAB 0: REACT 18 / 19 ─── */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              React 18 / 19 Integration Guide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Follow this step-by-step walkthrough to build a complete interactive 3D game in React using Vite,
              ThreeDot, and clean lifecycle management.
            </Typography>
          </Box>

          {/* Step 1: Scaffolding */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <TerminalOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 1: Scaffold Your React Project
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Initialize a fresh React TypeScript project with Vite and install <code>threedot</code>. Only{' '}
              <code>threedot</code> is required—never install <code>three</code>:
            </Typography>
            <CodeBlock
              language="bash"
              title="Terminal (React Step 1)"
              code={`# 1. Create a fresh React TypeScript project
npm create vite@latest my-threedot-game -- --template react-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot (Only threedot is required!)
npm install threedot

# 4. Start development server
npm run dev`}
            />
          </Paper>

          {/* Step 2: Project File Structure */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <FolderTreeOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 2: Project File Structure
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              In React, the ThreeDot engine lifecycle is encapsulated in <code>src/App.tsx</code> using{' '}
              <code>useRef</code> and <code>useEffect</code>, with UI controls rendered in React JSX:
            </Typography>
            <CodeBlock
              language="text"
              title="React Project Layout"
              code={`my-threedot-game/
├── index.html            # Standard Vite React DOM mount point (<div id="root">)
├── package.json          # Dependencies ("react", "react-dom", "threedot")
├── tsconfig.json         # React TypeScript configuration ("jsx": "react-jsx")
├── vite.config.ts        # Vite configuration with @vitejs/plugin-react
└── src/
    ├── main.tsx          # React application root (ReactDOM.createRoot)
    ├── App.tsx           # React HUD overlay, useRef canvas mount & Engine lifecycle
    ├── Player.ts         # Custom Player Node3D (pure TypeScript, framework-agnostic!)
    └── App.css           # Fullscreen layout & HUD overlay styling`}
            />
          </Paper>

          {/* Step 3: Host HTML & CSS */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <WebOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 3: HTML Host & Fullscreen Styling
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Configure <code>src/App.css</code> to ensure the canvas container fills 100% of the viewport and
              style the floating HUD overlay:
            </Typography>
            <CodeBlock
              language="css"
              title="src/App.css"
              code={`* { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root, .game-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0a0a;
  font-family: sans-serif;
}
.viewport {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
#hud {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;
}
#hud button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  font-weight: 600;
  transition: background 0.15s ease;
}
#hud button:hover {
  background: rgba(255, 255, 255, 0.3);
}`}
            />
          </Paper>

          {/* Step 4: Player Node Logic */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <SportsEsportsOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 4: Writing Custom Game Logic (src/Player.ts)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Create <code>src/Player.ts</code> subclassing <code>Node3D</code>. Notice that this file is{' '}
              <strong>100% pure TypeScript OOP</strong> with zero React imports. Your game logic is completely
              portable:
            </Typography>
            <CodeBlock
              language="typescript"
              title="src/Player.ts"
              code={`import { Node3D, MeshInstance3D, Vector3, SignalBus } from 'threedot';

export class Player extends Node3D {
  private mesh!: MeshInstance3D;
  private velocity = new Vector3();
  private speed = 8.0;
  private gravity = -25.0;
  private isGrounded = true;
  private keys: Record<string, boolean> = {};

  protected override _enterTree(): void {
    super._enterTree();

    // 1. Attach Box Visual Mesh using primitive shape shortcut
    this.mesh = new MeshInstance3D({
      shape: 'box',
      shapeArgs: [1, 2, 1], // [width, height, depth]
      material: { color: 0xffffff, roughness: 0.3, metalness: 0.1 },
      castShadow: true,
    });
    this.mesh.position.y = 1;
    this.addChild(this.mesh);

    // 2. Connect to the HUD signal via SignalBus
    SignalBus.connect('player_jump', (power: number = 10) => {
      this.jump(power);
    });

    // 3. Bind Keyboard inputs
    window.addEventListener('keydown', (e) => (this.keys[e.key.toLowerCase()] = true));
    window.addEventListener('keyup', (e) => (this.keys[e.key.toLowerCase()] = false));
  }

  jump(power: number): void {
    if (this.isGrounded) {
      this.velocity.y = power;
      this.isGrounded = false;
    }
  }

  protected override _process(delta: number): void {
    const moveDir = new Vector3(0, 0, 0);

    if (this.keys['w'] || this.keys['arrowup']) moveDir.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveDir.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveDir.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDir.x += 1;
    if (this.keys[' '] && this.isGrounded) this.jump(10);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.position.x += moveDir.x * this.speed * delta;
      this.position.z += moveDir.z * this.speed * delta;
      this.lookAt(this.position.clone().add(moveDir));
    }

    this.velocity.y += this.gravity * delta;
    this.position.y += this.velocity.y * delta;

    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
  }
}`}
            />
          </Paper>

          {/* Step 5: Scene Assembly in React */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <CodeOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 5: Scene Assembly & Lifecycle (src/App.tsx)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Initialize the ThreeDot engine inside a <code>useEffect</code> hook bound to a container <code>useRef</code>.{' '}
              When React unmounts, <code>engine.dispose()</code> cleans up all WebGL context and event listeners automatically:
            </Typography>
            <CodeBlock
              language="tsx"
              title="src/App.tsx"
              code={`import { useEffect, useRef } from 'react';
import {
  Engine,
  Camera3D,
  DirectionalLight3D,
  AmbientLight3D,
  MeshInstance3D,
  Vector3,
  SignalBus,
} from 'threedot';
import { Player } from './Player';
import './App.css';

export function App() {
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewportRef.current) return;

    // 1. Initialize Engine on container element
    const engine = new Engine({
      container: viewportRef.current,
      antialias: true,
      shadows: true,
      backgroundColor: 0x0a0a0a,
      autoResize: true,
    });

    const scene = engine.sceneTree.root;

    // 2. Camera setup with auto-activation
    const camera = new Camera3D({ fov: 60, makeCurrent: true });
    camera.position.set(0, 8, 14);
    camera.lookAt(new Vector3(0, 1, 0));
    scene.addChild(camera);

    // 3. Lighting setup
    scene.addChild(new AmbientLight3D(0xffffff, 0.4));

    const sun = new DirectionalLight3D(0xffffff, 1.4);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.addChild(sun);

    // 4. Ground Plane
    const ground = new MeshInstance3D({
      shape: 'plane',
      shapeArgs: [60, 60],
      material: { color: 0x1a1a1a, roughness: 0.8 },
      receiveShadow: true,
    });
    ground.rotation.x = -Math.PI / 2;
    scene.addChild(ground);

    // 5. Spawn Player Node
    const player = new Player();
    player.name = 'Hero';
    scene.addChild(player);

    // 6. Connect signals dispatched by React JSX buttons
    const unsubSpawn = SignalBus.connect('spawn_cube', (colorName: string, scale: number = 1.0) => {
      const cube = new MeshInstance3D({
        shape: 'box',
        shapeArgs: [scale, scale, scale],
        material: {
          color: colorName === 'gold' ? 0xffd700 : 0x00ffff,
          roughness: 0.2,
          metalness: 0.8,
        },
        castShadow: true,
      });
      cube.position.set((Math.random() - 0.5) * 20, scale / 2, (Math.random() - 0.5) * 20);
      scene.addChild(cube);
      console.log('[ThreeDot] Spawned', colorName, 'cube at', cube.position);
    });

    const unsubReset = SignalBus.connect('reset_game', () => {
      player.position.set(0, 0, 0);
      console.log('[ThreeDot] Player reset to origin');
    });

    console.log('[ThreeDot] React Scene ready!');

    // Cleanup on React component unmount
    return () => {
      unsubSpawn();
      unsubReset();
      engine.dispose();
    };
  }, []);

  return (
    <div className="game-wrapper">
      {/* React UI HUD Overlay bound to ThreeDot Signals */}
      <div id="hud">
        <button threedot-signal="player_jump" threedot-params="[12]">
          Jump (Power: 12)
        </button>
        <button threedot-signal="spawn_cube" threedot-params='["gold", 2.0]'>
          Spawn Cube
        </button>
        <button threedot-signal="reset_game">
          Reset
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div ref={viewportRef} className="viewport" />
    </div>
  );
}`}
            />
          </Paper>

          {/* Step 6: Run */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <ElectricBoltOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 6: Run Your Game
              </Typography>
            </Box>
            <CodeBlock language="bash" title="Terminal (React Step 6)" code="npm run dev" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Open <code>http://localhost:5173/</code> in your browser. Move with WASD, jump with Space, and
              interact with the React HUD buttons!
            </Typography>
          </Paper>
        </Box>
      )}

      {/* ─── TAB 1: VUE 3 ─── */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Vue 3 Integration Guide (Composition API)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step-by-step guide to integrating ThreeDot into Vue 3 Single File Components (SFC) with{' '}
              <code>&lt;script setup lang=&quot;ts&quot;&gt;</code> and <code>onMounted</code> / <code>onUnmounted</code>.
            </Typography>
          </Box>

          {/* Step 1: Scaffold */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <TerminalOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 1: Scaffold Your Vue 3 Project
              </Typography>
            </Box>
            <CodeBlock
              language="bash"
              title="Terminal (Vue Step 1)"
              code={`# 1. Create a fresh Vue 3 TypeScript project with Vite
npm create vite@latest my-threedot-vue-game -- --template vue-ts

# 2. Enter project folder
cd my-threedot-vue-game

# 3. Install ThreeDot
npm install threedot

# 4. Start development server
npm run dev`}
            />
          </Paper>

          {/* Step 2: Project File Structure */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <FolderTreeOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 2: Project File Structure
              </Typography>
            </Box>
            <CodeBlock
              language="text"
              title="Vue 3 Project Layout"
              code={`my-threedot-vue-game/
├── index.html            # Standard Vite Vue DOM mount point (<div id="app">)
├── package.json          # Dependencies ("vue", "threedot", "vite")
├── tsconfig.json         # Standard Vue TypeScript configuration
├── vite.config.ts        # Vite configuration with @vitejs/plugin-vue
└── src/
    ├── main.ts           # Vue application entry point (createApp)
    ├── App.vue           # Main Vue component with HUD template & ThreeDot mount
    └── Player.ts         # Custom Player Node3D (pure TypeScript, framework-agnostic!)`}
            />
          </Paper>

          {/* Step 3: Vue SFC Component */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <CodeOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 3: Component Lifecycle (src/App.vue)
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Mount the ThreeDot engine inside <code>onMounted</code> and cleanly dispose it in <code>onUnmounted</code>:
            </Typography>
            <CodeBlock
              language="html"
              title="src/App.vue"
              code={`<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {
  Engine,
  Camera3D,
  DirectionalLight3D,
  AmbientLight3D,
  MeshInstance3D,
  Vector3,
  SignalBus,
} from 'threedot';
import { Player } from './Player';

const viewportRef = ref<HTMLDivElement | null>(null);
let engine: Engine | null = null;

onMounted(() => {
  if (!viewportRef.value) return;

  // 1. Initialize Engine
  engine = new Engine({
    container: viewportRef.value,
    antialias: true,
    shadows: true,
    backgroundColor: 0x0a0a0a,
    autoResize: true,
  });

  const scene = engine.sceneTree.root;

  // 2. Camera setup
  const camera = new Camera3D({ fov: 60, makeCurrent: true });
  camera.position.set(0, 8, 14);
  camera.lookAt(new Vector3(0, 1, 0));
  scene.addChild(camera);

  // 3. Lighting setup
  scene.addChild(new AmbientLight3D(0xffffff, 0.4));
  const sun = new DirectionalLight3D(0xffffff, 1.4);
  sun.position.set(10, 20, 10);
  sun.castShadow = true;
  scene.addChild(sun);

  // 4. Ground Plane
  const ground = new MeshInstance3D({
    shape: 'plane',
    shapeArgs: [60, 60],
    material: { color: 0x1a1a1a, roughness: 0.8 },
    receiveShadow: true,
  });
  ground.rotation.x = -Math.PI / 2;
  scene.addChild(ground);

  // 5. Spawn Player Node
  const player = new Player();
  player.name = 'Hero';
  scene.addChild(player);

  // 6. Connect HTML HUD signals
  SignalBus.connect('spawn_cube', (colorName: string, scale: number = 1.0) => {
    const cube = new MeshInstance3D({
      shape: 'box',
      shapeArgs: [scale, scale, scale],
      material: { color: 0xffd700, roughness: 0.2, metalness: 0.8 },
      castShadow: true,
    });
    cube.position.set((Math.random() - 0.5) * 20, scale / 2, (Math.random() - 0.5) * 20);
    scene.addChild(cube);
  });
});

onUnmounted(() => {
  engine?.dispose();
});
</script>

<template>
  <div class="game-container">
    <div id="hud">
      <button threedot-signal="player_jump" threedot-params="[12]">Jump (Power: 12)</button>
      <button threedot-signal="spawn_cube" threedot-params='["gold", 2.0]'>Spawn Cube</button>
    </div>
    <div ref="viewportRef" class="viewport" />
  </div>
</template>

<style scoped>
.game-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0a0a0a;
}
.viewport {
  width: 100%;
  height: 100%;
}
#hud {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  display: flex;
  gap: 10px;
}
button {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  backdrop-filter: blur(8px);
}
</style>`}
            />
          </Paper>

          {/* Step 4: Run */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <ElectricBoltOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 4: Run Your Vue 3 Game
              </Typography>
            </Box>
            <CodeBlock language="bash" title="Terminal (Vue Step 4)" code="npm run dev" />
          </Paper>
        </Box>
      )}

      {/* ─── TAB 2: SVELTE 5 ─── */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              Svelte 5 Integration Guide
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step-by-step guide to integrating ThreeDot into Svelte 5 / SvelteKit using runes and{' '}
              <code>onMount</code> lifecycle hooks.
            </Typography>
          </Box>

          {/* Step 1: Scaffold */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <TerminalOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 1: Scaffold Your Svelte 5 Project
              </Typography>
            </Box>
            <CodeBlock
              language="bash"
              title="Terminal (Svelte Step 1)"
              code={`# 1. Create a fresh Svelte TypeScript project with Vite
npm create vite@latest my-threedot-svelte-game -- --template svelte-ts

# 2. Enter project folder
cd my-threedot-svelte-game

# 3. Install ThreeDot
npm install threedot

# 4. Start development server
npm run dev`}
            />
          </Paper>

          {/* Step 2: Component Code */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <CodeOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 2: Component Integration (src/App.svelte)
              </Typography>
            </Box>
            <CodeBlock
              language="html"
              title="src/App.svelte"
              code={`<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Engine,
    Camera3D,
    DirectionalLight3D,
    AmbientLight3D,
    MeshInstance3D,
    Vector3,
    SignalBus,
  } from 'threedot';
  import { Player } from './Player';

  let container: HTMLDivElement;
  let engine: Engine;

  onMount(() => {
    engine = new Engine({
      container,
      antialias: true,
      shadows: true,
      backgroundColor: 0x0a0a0a,
      autoResize: true,
    });

    const scene = engine.sceneTree.root;

    const camera = new Camera3D({ fov: 60, makeCurrent: true });
    camera.position.set(0, 8, 14);
    camera.lookAt(new Vector3(0, 1, 0));
    scene.addChild(camera);

    scene.addChild(new AmbientLight3D(0xffffff, 0.4));
    const sun = new DirectionalLight3D(0xffffff, 1.4);
    sun.position.set(10, 20, 10);
    sun.castShadow = true;
    scene.addChild(sun);

    const ground = new MeshInstance3D({
      shape: 'plane',
      shapeArgs: [60, 60],
      material: { color: 0x1a1a1a, roughness: 0.8 },
      receiveShadow: true,
    });
    ground.rotation.x = -Math.PI / 2;
    scene.addChild(ground);

    const player = new Player();
    player.name = 'Hero';
    scene.addChild(player);

    SignalBus.connect('spawn_cube', (colorName: string, scale: number = 1.0) => {
      const cube = new MeshInstance3D({
        shape: 'box',
        shapeArgs: [scale, scale, scale],
        material: { color: 0xffd700, roughness: 0.2, metalness: 0.8 },
        castShadow: true,
      });
      cube.position.set((Math.random() - 0.5) * 20, scale / 2, (Math.random() - 0.5) * 20);
      scene.addChild(cube);
    });

    return () => {
      engine.dispose();
    };
  });
</script>

<div class="viewport-box">
  <div id="hud">
    <button threedot-signal="player_jump" threedot-params="[12]">Jump (Power: 12)</button>
    <button threedot-signal="spawn_cube" threedot-params='["gold", 2.0]'>Spawn Cube</button>
  </div>
  <div bind:this={container} class="canvas-host"></div>
</div>

<style>
  .viewport-box {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #0a0a0a;
  }
  .canvas-host {
    width: 100%;
    height: 100%;
  }
  #hud {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    gap: 10px;
  }
  button {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    backdrop-filter: blur(8px);
  }
</style>`}
            />
          </Paper>

          {/* Step 3: Run */}
          <Paper elevation={0} sx={{ p: 3.5, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <ElectricBoltOutlinedIcon fontSize="small" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Step 3: Run Your Svelte 5 Game
              </Typography>
            </Box>
            <CodeBlock language="bash" title="Terminal (Svelte Step 3)" code="npm run dev" />
          </Paper>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* SSR Notice */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: '8px',
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#111111' : '#f9f9f9'),
          borderColor: 'divider',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Server-Side Rendering (SSR) Notice (Next.js & Nuxt 3)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            WebGL and Web Audio APIs rely on browser globals (<code>window</code>, <code>document</code>,{' '}
            <code>HTMLCanvasElement</code>). When using Next.js (App Router), mark your canvas component with{' '}
            <code>&apos;use client&apos;;</code> or use dynamic imports with <code>{`{ ssr: false }`}</code>. In Nuxt 3, wrap
            the canvas element in <code>&lt;ClientOnly&gt;</code>.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
