import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  Button,
  ButtonGroup,
} from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import FolderTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import SportsEsportsOutlinedIcon from '@mui/icons-material/SportsEsportsOutlined';
import ElectricBoltOutlinedIcon from '@mui/icons-material/ElectricBoltOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import WebOutlinedIcon from '@mui/icons-material/WebOutlined';
import { CodeBlock } from '../components/CodeBlock';

type Framework = 'vanilla' | 'react';

export const QuickstartPage: React.FC = () => {
  const [framework, setFramework] = useState<Framework>('vanilla');
  const [vanillaScaffoldTab, setVanillaScaffoldTab] = useState(0);
  const [reactScaffoldTab, setReactScaffoldTab] = useState(0);

  const vanillaScaffoldOptions = [
    {
      name: 'Instant (curl / wget)',
      cmd: `# 1. Scaffold a complete ready-to-run game project with one command:
curl -fsSL https://raw.githubusercontent.com/Alazar42/ThreeDot/master/install.sh | bash -s -- my-threedot-game

# 2. Enter project folder
cd my-threedot-game

# 3. Start development server
npm run dev`,
    },
    {
      name: 'Vite Vanilla TypeScript',
      cmd: `# 1. Create a fresh Vite TypeScript project
npm create vite@latest my-threedot-game -- --template vanilla-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot (Only threedot is required!)
npm install threedot

# 4. Start development server
npm run dev`,
    },
    {
      name: 'Manual npm init',
      cmd: `# 1. Create empty directory and initialize
mkdir my-threedot-game && cd my-threedot-game
npm init -y

# 2. Install ThreeDot and development tools
npm install threedot
npm install -D vite typescript

# 3. Start development server
npx vite`,
    },
  ];

  const reactScaffoldOptions = [
    {
      name: 'Vite React TypeScript',
      cmd: `# 1. Create a fresh React TypeScript project with Vite
npm create vite@latest my-threedot-game -- --template react-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot (Only threedot is required!)
npm install threedot

# 4. Start development server
npm run dev`,
    },
    {
      name: 'Manual React Setup',
      cmd: `# 1. Create empty directory and initialize
mkdir my-threedot-game && cd my-threedot-game
npm init -y

# 2. Install React and ThreeDot
npm install react react-dom threedot
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom

# 3. Start development server
npx vite`,
    },
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <PlayCircleOutlinedIcon sx={{ fontSize: 34 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
            Quickstart Guide
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 850, mb: 3, lineHeight: 1.7 }}>
          Learn how to start a web 3D project from terminal scaffolding to an interactive, signal-driven
          game with HTML HUD controls. No Three.js boilerplate, zero external math dependencies, and
          seamless integration between imperative TypeScript game logic, JSX, and HTML.
        </Typography>

        {/* Framework Switcher */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#141414' : '#f7f7f7'),
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
            SELECT FRAMEWORK ARCHITECTURE:
          </Typography>
          <ButtonGroup variant="outlined" size="small">
            <Button
              onClick={() => setFramework('vanilla')}
              variant={framework === 'vanilla' ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                px: 2.5,
              }}
            >
              Vanilla TypeScript
            </Button>
            <Button
              onClick={() => setFramework('react')}
              variant={framework === 'react' ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '13px',
                px: 2.5,
              }}
            >
              React + TypeScript
            </Button>
          </ButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Zero-THREE Imports" size="small" variant="outlined" />
          <Chip
            label={framework === 'vanilla' ? 'Mode: Vanilla TypeScript' : 'Mode: React + TypeScript'}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip label="threedot-signal DOM Binding" size="small" variant="outlined" />
          <Chip label="JSX & Imperative Parity" size="small" variant="outlined" />
        </Box>
      </Box>

      {/* Step 1: Terminal Scaffolding */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <TerminalOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 1: Scaffold Your Project ({framework === 'vanilla' ? 'Vanilla TypeScript' : 'React + TypeScript'})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {framework === 'vanilla'
            ? 'Scaffold a pure Vanilla TypeScript project using Vite or the one-line installer. Notice that only threedot is installed—never three or @types/three:'
            : 'Scaffold a modern React + TypeScript project with Vite. Notice that only threedot is installed alongside React—never three or @types/three:'}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={framework === 'vanilla' ? vanillaScaffoldTab : reactScaffoldTab}
            onChange={(_, val) => {
              if (framework === 'vanilla') {
                setVanillaScaffoldTab(val);
              } else {
                setReactScaffoldTab(val);
              }
            }}
            textColor="inherit"
            TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
          >
            {(framework === 'vanilla' ? vanillaScaffoldOptions : reactScaffoldOptions).map((opt, idx) => (
              <Tab
                key={opt.name}
                label={opt.name}
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  opacity: (framework === 'vanilla' ? vanillaScaffoldTab : reactScaffoldTab) === idx ? 1 : 0.6,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CodeBlock
          code={
            framework === 'vanilla'
              ? vanillaScaffoldOptions[vanillaScaffoldTab].cmd
              : reactScaffoldOptions[reactScaffoldTab].cmd
          }
          language="bash"
          title={`Terminal — ${framework === 'vanilla' ? 'Vanilla Scaffolding' : 'React Scaffolding'}`}
        />
      </Paper>

      {/* Step 2: Project File Structure */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <FolderTreeOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 2: Project File Structure ({framework === 'vanilla' ? 'Vanilla TypeScript' : 'React + TypeScript'})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {framework === 'vanilla' ? (
            <>
              A Vanilla TypeScript ThreeDot project uses a single entry point (<code>src/main.ts</code>) that
              directly mounts the engine into <code>#app</code> in <code>index.html</code>:
            </>
          ) : (
            <>
              A React TypeScript ThreeDot project delegates UI rendering and lifecycle management to React
              components, mounting the engine inside <code>src/App.tsx</code> via a <code>useRef</code> container:
            </>
          )}
        </Typography>

        {framework === 'vanilla' ? (
          <CodeBlock
            title="Vanilla TypeScript Directory Layout"
            language="text"
            code={`my-threedot-game/
├── index.html            # WebGL container (#app) & HTML HUD with threedot-signal
├── package.json          # Dependencies (only "threedot" required)
├── tsconfig.json         # Standard TypeScript configuration
└── src/
    ├── main.ts           # Engine setup, Camera, Lighting, Scene Assembly
    ├── Player.ts         # Custom Player Node3D with _process loop & jump
    └── style.css         # Fullscreen canvas & overlay HUD styling`}
          />
        ) : (
          <CodeBlock
            title="React TypeScript Directory Layout"
            language="text"
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
        )}

        <Box sx={{ mt: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Key Architectural Differences:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 0.75, fontSize: '13px', color: 'text.secondary' } }}>
            {framework === 'vanilla' ? (
              <>
                <li>
                  <strong>Direct DOM Mount:</strong> <code>src/main.ts</code> attaches <code>new Engine()</code> directly
                  to <code>document.getElementById('app')!</code>.
                </li>
                <li>
                  <strong>Static HTML HUD:</strong> Buttons in <code>index.html</code> carry <code>threedot-signal</code>{' '}
                  attributes that the engine's DOM bridge captures automatically.
                </li>
                <li>
                  <strong>Minimal Footprint:</strong> Zero UI framework dependencies; only <code>threedot</code> and Vite.
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Component Lifecycle:</strong> <code>src/App.tsx</code> instantiates <code>new Engine()</code> inside{' '}
                  <code>useEffect</code> with a <code>useRef&lt;HTMLDivElement&gt;</code> and calls <code>engine.dispose()</code> on unmount.
                </li>
                <li>
                  <strong>Declarative JSX HUD:</strong> HUD buttons are native React JSX elements with <code>threedot-signal</code>{' '}
                  attributes that route clicks directly to 3D node signals.
                </li>
                <li>
                  <strong>Framework-Agnostic Nodes:</strong> Notice that <code>src/Player.ts</code> is identical in both Vanilla and React.
                  Your 3D gameplay logic remains pure TypeScript OOP with zero framework lock-in.
                </li>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Step 3: Viewport & HUD Setup */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <WebOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 3: {framework === 'vanilla' ? 'HTML Viewport & Signal HUD (index.html)' : 'React Root & Fullscreen Styling'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {framework === 'vanilla' ? (
            <>
              In Vanilla TypeScript, configure <code>index.html</code> with an <code>#app</code> container and an overlay{' '}
              <code>#hud</code>. ThreeDot&apos;s DOM bridge automatically captures button clicks and dispatches signals
              without manual event listeners:
            </>
          ) : (
            <>
              In React TypeScript, <code>index.html</code> mounts the standard React root. The HUD buttons are rendered
              inside <code>src/App.tsx</code>, styled with <code>src/App.css</code>:
            </>
          )}
        </Typography>

        {framework === 'vanilla' ? (
          <CodeBlock
            title="index.html"
            language="html"
            code={`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ThreeDot Game</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body, html { width: 100%; height: 100%; overflow: hidden; background: #0a0a0a; font-family: sans-serif; }
      #app { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
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
        font-weight: 600;
        transition: background 0.15s ease;
      }
      button:hover { background: rgba(255, 255, 255, 0.3); }
    </style>
  </head>
  <body>
    <!-- 3D Canvas Mount Point -->
    <div id="app"></div>

    <!-- HTML HUD Overlay bound to ThreeDot Signals -->
    <div id="hud">
      <button threedot-signal="player_jump" threedot-params="[12]">Jump (Power: 12)</button>
      <button threedot-signal="spawn_cube" threedot-params='["gold", 2.0]'>Spawn Cube</button>
      <button threedot-signal="reset_game">Reset</button>
    </div>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <CodeBlock
              title="index.html (React Host)"
              language="html"
              code={`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ThreeDot React Game</title>
  </head>
  <body>
    <!-- React DOM Root -->
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`}
            />

            <CodeBlock
              title="src/App.css (Fullscreen Canvas & HUD Styling)"
              language="css"
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
          </Box>
        )}
      </Paper>

      {/* Step 4: Player Node Logic */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <SportsEsportsOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 4: Writing Custom Game Logic (src/Player.ts)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create <code>src/Player.ts</code> subclassing <code>Node3D</code>. It listens to the{' '}
          <code>player_jump</code> signal dispatched by the HUD button, accepts WASD keyboard input,
          and updates its position smoothly in the <code>_process(delta)</code> frame hook.
          <br />
          <strong>Crucial design note:</strong> This file is <strong>identical in both Vanilla and React</strong>.
          ThreeDot decouples your 3D gameplay logic completely from any UI library:
        </Typography>

        <CodeBlock
          title="src/Player.ts (Identical in Vanilla & React)"
          language="typescript"
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

  // Frame tick hook with delta in seconds
  protected override _process(delta: number): void {
    const moveDir = new Vector3(0, 0, 0);

    if (this.keys['w'] || this.keys['arrowup']) moveDir.z -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveDir.z += 1;
    if (this.keys['a'] || this.keys['arrowleft']) moveDir.x -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveDir.x += 1;
    if (this.keys[' '] && this.isGrounded) this.jump(10);

    // Apply horizontal translation
    if (moveDir.lengthSq() > 0) {
      moveDir.normalize();
      this.position.x += moveDir.x * this.speed * delta;
      this.position.z += moveDir.z * this.speed * delta;
      this.lookAt(this.position.clone().add(moveDir));
    }

    // Apply gravity
    this.velocity.y += this.gravity * delta;
    this.position.y += this.velocity.y * delta;

    // Ground collision plane
    if (this.position.y <= 0) {
      this.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
  }
}`}
        />
      </Paper>

      {/* Step 5: Scene Assembly */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <CodeOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 5: Scene Assembly ({framework === 'vanilla' ? 'src/main.ts' : 'src/App.tsx & src/main.tsx'})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {framework === 'vanilla' ? (
            <>
              Assemble the engine, camera, sunlight, ground plane, and player in <code>src/main.ts</code>.
              Notice how <code>SignalBus.connect(&apos;spawn_cube&apos;, ...)</code> receives parameters passed directly
              from the HTML HUD:
            </>
          ) : (
            <>
              In React, assemble the engine and scene inside a <code>useEffect</code> hook within{' '}
              <code>src/App.tsx</code>. When the component unmounts, <code>engine.dispose()</code> cleans up
              all WebGL buffers and animation loops automatically:
            </>
          )}
        </Typography>

        {framework === 'vanilla' ? (
          <CodeBlock
            title="src/main.ts"
            language="typescript"
            code={`import {
  Engine,
  Camera3D,
  DirectionalLight3D,
  AmbientLight3D,
  MeshInstance3D,
  Vector3,
  SignalBus,
} from 'threedot';
import { Player } from './Player';

// 1. Initialize Engine on DOM element
const engine = new Engine({
  container: document.getElementById('app')!,
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

// 4. Ground Plane (flat on XZ floor)
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

// 6. Handle signals from HTML HUD buttons: <button threedot-signal="spawn_cube" threedot-params='["gold", 2.0]'>
SignalBus.connect('spawn_cube', (colorName: string, scale: number = 1.0) => {
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
  cube.position.set(
    (Math.random() - 0.5) * 20,
    scale / 2,
    (Math.random() - 0.5) * 20
  );
  scene.addChild(cube);
  console.log('[ThreeDot] Spawned', colorName, 'cube at', cube.position);
});

// Handle reset signal
SignalBus.connect('reset_game', () => {
  player.position.set(0, 0, 0);
  console.log('[ThreeDot] Player reset to origin');
});

console.log('[ThreeDot] Scene ready. Press WASD to move or click the HUD buttons!');`}
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <CodeBlock
              title="src/App.tsx (React Component + ThreeDot Engine Lifecycle)"
              language="tsx"
              code={`import React, { useEffect, useRef } from 'react';
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

    // 1. Initialize Engine on React container ref
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
      cube.position.set(
        (Math.random() - 0.5) * 20,
        scale / 2,
        (Math.random() - 0.5) * 20
      );
      scene.addChild(cube);
      console.log('[ThreeDot] Spawned', colorName, 'cube at', cube.position);
    });

    const unsubReset = SignalBus.connect('reset_game', () => {
      player.position.set(0, 0, 0);
      console.log('[ThreeDot] Player reset to origin');
    });

    console.log('[ThreeDot] Scene ready. Press WASD to move or click the HUD buttons!');

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

            <CodeBlock
              title="src/main.tsx (React Application Entry Point)"
              language="tsx"
              code={`import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`}
            />
          </Box>
        )}
      </Paper>

      {/* Step 6: Imperative vs. Declarative JSX */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <LayersOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 6: Understanding JSX vs. Imperative Code
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          Developers often wonder: <em>&quot;How does JSX work with the code we wrote? Are they two different things?&quot;</em>{' '}
          In ThreeDot, JSX and imperative classes are <strong>two ergonomic lenses on the exact same SceneTree</strong>:
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
            mb: 3,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#111111' : '#fafafa'),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Paradigm A: Imperative OOP Code
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
                Subclass <code>Node3D</code>, implement <code>_process(delta)</code>, manage internal state,
                and call <code>this.addChild()</code>.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Best for: Player controllers, physics simulation, autonomous enemies, state machines.
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            sx={{
              height: '100%',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#111111' : '#fafafa'),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Paradigm B: Declarative JSX Code
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '13px' }}>
                Assemble scene hierarchies declaratively using JSX tags. The JSX runtime instantiates
                nodes and wires signal handlers automatically.
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Best for: Static level layouts, camera rigs, light configurations, UI HUD hierarchies.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Here is how your custom <code>Player</code> class and declarative JSX interoperate seamlessly:
        </Typography>

        <CodeBlock
          title="JSX + Imperative Integration"
          language="tsx"
          code={`import { Node3D, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';
import { Player } from './Player';

// Declare a full level layout in JSX, embedding your imperative Player class directly!
const levelScene = (
  <Node3D name="World">
    <Camera3D fov={60} position={[0, 8, 14]} makeCurrent />
    <DirectionalLight3D intensity={1.5} position={[10, 20, 10]} castShadow />
    
    {/* Ground Plane */}
    <MeshInstance3D
      name="Ground"
      shape="plane"
      shapeArgs={[50, 50]}
      material={{ color: 0x1a1a1a }}
      rotation={[-Math.PI / 2, 0, 0]}
    />

    {/* Your custom imperative Player class inside JSX! */}
    <Player name="Hero" position={[0, 0, 0]} />
  </Node3D>
);

// Mount the JSX tree directly into the engine's SceneTree root
engine.sceneTree.root.addChild(levelScene);

// You can query and control the imperative Player instance at any time:
const hero = engine.sceneTree.root.getNode<Player>('World/Hero');
hero.jump(15);`}
        />
      </Paper>

      {/* Step 7: Launch Development Server */}
      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <ElectricBoltOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Step 7: Run Your Game
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Launch the local development server from your terminal:
        </Typography>

        <CodeBlock
          code="npm run dev"
          language="bash"
          title="Terminal (Step 7)"
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Open <code>http://localhost:5173/</code> in your browser. Move your player with WASD, jump
          with the Space bar, and click the HUD buttons to watch the <code>threedot-signal</code>{' '}
          bridge trigger in real time!
        </Typography>
      </Paper>
    </Box>
  );
};
