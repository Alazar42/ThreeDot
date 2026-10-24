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

export const QuickstartPage: React.FC = () => {
  const [scaffoldTab, setScaffoldTab] = useState(0);

  const scaffoldOptions = [
    {
      name: 'Vite Vanilla TypeScript',
      cmd: `# 1. Create a fresh Vite TypeScript project
npm create vite@latest my-threedot-game -- --template vanilla-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot (Only threedot is required!)
npm install threedot`,
    },
    {
      name: 'Vite React TypeScript',
      cmd: `# 1. Create a fresh React TypeScript project
npm create vite@latest my-threedot-game -- --template react-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot
npm install threedot`,
    },
    {
      name: 'Manual npm init',
      cmd: `# 1. Create empty directory and initialize
mkdir my-threedot-game && cd my-threedot-game
npm init -y

# 2. Install ThreeDot and development tools
npm install threedot
npm install -D vite typescript`,
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
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 850, mb: 2.5, lineHeight: 1.7 }}>
          Learn how to start a web 3D project from terminal scaffolding to an interactive, signal-driven
          game with HTML HUD controls. No Three.js boilerplate, zero external math dependencies, and
          seamless integration between imperative TypeScript game logic, JSX, and HTML.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Zero-THREE Imports" size="small" variant="outlined" />
          <Chip label="Terminal Scaffolding" size="small" variant="outlined" />
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
            Step 1: Scaffold Your Project from the Terminal
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Starting a Node/Vite project can feel daunting. Choose your preferred scaffolding template below.
          Notice that you only install <code>threedot</code>—never <code>three</code> or <code>@types/three</code>:
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={scaffoldTab}
            onChange={(_, val) => setScaffoldTab(val)}
            textColor="inherit"
            TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
          >
            {scaffoldOptions.map((opt, idx) => (
              <Tab
                key={opt.name}
                label={opt.name}
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  opacity: scaffoldTab === idx ? 1 : 0.6,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CodeBlock
          code={scaffoldOptions[scaffoldTab].cmd}
          language="bash"
          title="Terminal (Step 1)"
        />
      </Paper>

      {/* Step 2: Project File Tree */}
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
            Step 2: Project File Structure
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          A clean ThreeDot project organizes HTML overlay elements, engine initialization, and node
          scripts into distinct files:
        </Typography>

        <CodeBlock
          title="Directory Layout"
          language="text"
          code={`my-threedot-game/
├── index.html            # WebGL container + HTML HUD with threedot-signal
├── package.json          # Dependencies (only "threedot" required)
├── tsconfig.json         # Standard TypeScript configuration
└── src/
    ├── main.ts           # Engine setup, Camera, Lighting, Scene Assembly
    ├── Player.ts         # Custom Player Node3D with _process loop & jump
    └── style.css         # Fullscreen canvas & overlay HUD styling`}
        />
      </Paper>

      {/* Step 3: Setting Up HTML & HUD */}
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
            Step 3: HTML Viewport & Declarative Signal HUD
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Configure <code>index.html</code>. Notice the <code>threedot-signal</code> and <code>threedot-params</code> attributes
          on the HTML buttons. ThreeDot's DOM bridge automatically captures clicks and triggers the
          corresponding signals in your 3D game logic without manual event listeners:
        </Typography>

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
          <code>player_jump</code> signal dispatched by the HTML HUD button, accepts WASD keyboard
          input, and updates its position smoothly in the <code>_process(delta)</code> frame hook:
        </Typography>

        <CodeBlock
          title="src/Player.ts"
          language="typescript"
          code={`import { Node3D, MeshInstance3D, Vector3, SignalBus } from 'threedot';

export class Player extends Node3D {
  private mesh!: MeshInstance3D;
  private velocity = new Vector3();
  private speed = 8.0;
  private gravity = -25.0;
  private isGrounded = true;
  private keys: Record<string, boolean> = {};

  protected _enterTree(): void {
    // 1. Attach Box Visual Mesh using primitive string shortcut
    this.mesh = new MeshInstance3D({
      shape: 'box',
      shapeArgs: [1, 2, 1], // [width, height, depth]
      material: { color: 0xffffff, roughness: 0.3, metalness: 0.1 },
      castShadow: true,
    });
    this.mesh.position.y = 1;
    this.addChild(this.mesh);

    // 2. Connect to the HTML HUD signal via SignalBus
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
  protected _process(delta: number): void {
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
            Step 5: Assemble the Scene (src/main.ts)
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Assemble the engine, camera, sunlight, ground plane, and player in <code>src/main.ts</code>.
          Notice how <code>SignalBus.connect('spawn_cube', ...)</code> receives parameters passed directly
          from the HTML HUD:
        </Typography>

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

// 1. Initialize Engine
const engine = new Engine({
  container: document.getElementById('app')!,
  antialias: true,
  shadows: true,
  backgroundColor: 0x0a0a0a,
  autoResize: true,
});

const scene = engine.sceneTree.root;

// 2. Camera
const camera = new Camera3D({ fov: 60, makeCurrent: true });
camera.position.set(0, 8, 14);
camera.lookAt(new Vector3(0, 1, 0));
scene.addChild(camera);

// 3. Lighting
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
          Developers often wonder: <em>"How does JSX work with the code we wrote? Are they two different things?"</em>{' '}
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
          with the Space bar, and click the HTML HUD buttons to watch the <code>threedot-signal</code>{' '}
          bridge trigger in real time!
        </Typography>
      </Paper>
    </Box>
  );
};
