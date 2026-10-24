#!/usr/bin/env bash
# ==============================================================================
# ThreeDot Official Installer Script
# A Godot-inspired framework for Three.js
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/Alazar42/ThreeDot/master/install.sh | bash
#   wget -qO- https://raw.githubusercontent.com/Alazar42/ThreeDot/master/install.sh | bash
#   bash install.sh [project-name]
# ==============================================================================

set -e

PACKAGE_URL="https://github.com/Alazar42/ThreeDot/raw/master/packages/threedot-0.1.0.tgz"
DEFAULT_PROJECT_NAME="my-threedot-game"

# Detect package manager (prefer npm for maximum compatibility)
detect_pm() {
  if command -v npm >/dev/null 2>&1; then
    echo "npm"
  elif command -v pnpm >/dev/null 2>&1; then
    echo "pnpm"
  elif command -v bun >/dev/null 2>&1; then
    echo "bun"
  elif command -v yarn >/dev/null 2>&1; then
    echo "yarn"
  else
    echo "none"
  fi
}

PM=$(detect_pm)
if [ "$PM" = "none" ]; then
  echo "[ThreeDot] Error: No Node.js package manager (npm, pnpm, yarn, bun) found."
  echo "[ThreeDot] Please install Node.js from https://nodejs.org/ first."
  exit 1
fi

echo "========================================================"
echo "  ThreeDot Installer"
echo "  Godot-Inspired Web 3D Framework"
echo "========================================================"

# Mode A: Existing Node.js Project (package.json present in current dir)
if [ -f "package.json" ]; then
  echo "-> Detected existing Node.js project in current directory."
  echo "-> Installing threedot using $PM..."

  case "$PM" in
    npm)
      npm install "$PACKAGE_URL"
      ;;
    pnpm)
      pnpm add "$PACKAGE_URL" || npm install "$PACKAGE_URL"
      ;;
    yarn)
      yarn add "$PACKAGE_URL"
      ;;
    bun)
      bun add "$PACKAGE_URL"
      ;;
  esac

  echo ""
  echo "========================================================"
  echo "  ThreeDot installed successfully in current project!"
  echo "========================================================"
  echo "Import in your code:"
  echo "  import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';"
  echo ""
  exit 0
fi

# Mode B: Scaffold New ThreeDot Project
PROJECT_NAME="${1:-$DEFAULT_PROJECT_NAME}"

if [ -d "$PROJECT_NAME" ]; then
  echo "[ThreeDot] Directory '$PROJECT_NAME' already exists. Please choose another name or run inside an existing project."
  exit 1
fi

echo "-> Scaffolding new ThreeDot project: $PROJECT_NAME"
mkdir -p "$PROJECT_NAME/src"
cd "$PROJECT_NAME"

# Create package.json
cat << 'EOF' > package.json
{
  "name": "my-threedot-game",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "threedot": "https://github.com/Alazar42/ThreeDot/raw/master/packages/threedot-0.1.0.tgz"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
EOF

# Update package name in package.json
sed -i "s/my-threedot-game/$PROJECT_NAME/g" package.json 2>/dev/null || true

# Create tsconfig.json
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["src"]
}
EOF

# Create index.html
cat << 'EOF' > index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ThreeDot Game</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { overflow: hidden; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      #viewport { width: 100vw; height: 100vh; display: block; }
      #hud {
        position: absolute;
        top: 24px;
        left: 24px;
        color: #ffffff;
        z-index: 10;
        background: rgba(14, 14, 14, 0.85);
        backdrop-filter: blur(12px);
        padding: 16px 20px;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }
      #hud h2 { font-size: 16px; margin-bottom: 4px; font-weight: 700; }
      #hud p { font-size: 13px; color: #aaaaaa; margin-bottom: 12px; }
      button {
        padding: 8px 14px;
        background: #ffffff;
        color: #000000;
        border: none;
        border-radius: 4px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s ease;
      }
      button:hover { background: #e0e0e0; }
    </style>
  </head>
  <body>
    <div id="hud">
      <h2>ThreeDot Starter</h2>
      <p>Deterministic 60 FPS Engine Loop</p>
      <button threedot-signal="change_color">Randomize Color</button>
    </div>
    <div id="viewport"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
EOF

# Create src/main.ts
cat << 'EOF' > src/main.ts
import {
  Engine,
  Camera3D,
  DirectionalLight3D,
  AmbientLight3D,
  MeshInstance3D,
  SignalBus,
} from 'threedot';

const container = document.getElementById('viewport') as HTMLDivElement;

// 1. Initialize Engine
const engine = new Engine({
  container,
  antialias: true,
  shadows: true,
});

// 2. Setup Camera
const camera = new Camera3D({ name: 'MainCamera', fov: 75 });
camera.position.set(0, 3, 5);
camera.lookAt({ x: 0, y: 0, z: 0 });
engine.sceneTree.root.addChild(camera);

// 3. Setup Lighting
const sun = new DirectionalLight3D({ name: 'Sun', intensity: 2.0 });
sun.position.set(5, 10, 5);
engine.sceneTree.root.addChild(sun);

const ambient = new AmbientLight3D({ name: 'Ambient', intensity: 0.4 });
engine.sceneTree.root.addChild(ambient);

// 4. Create Player Cube with deterministic _process frame tick
class RotatingCube extends MeshInstance3D {
  _process(delta: number) {
    this.rotateY(delta * 1.5);
    this.rotateX(delta * 0.75);
  }
}

const cube = new RotatingCube({
  name: 'PlayerCube',
  geometry: 'box',
  material: { color: 0x4a9eff, roughness: 0.3, metalness: 0.2 },
});
cube.position.set(0, 0, 0);
engine.sceneTree.root.addChild(cube);

// 5. Connect HTML button signal directly to game logic
SignalBus.connect('change_color', () => {
  const palette = [0x4a9eff, 0xff4a80, 0x4aff80, 0xffbb4a, 0xbb4aff, 0xffffff];
  const nextColor = palette[Math.floor(Math.random() * palette.length)];
  (cube.mesh.material as any).color.setHex(nextColor);
});

console.log('[ThreeDot] Starter project running successfully.');
EOF

# Install dependencies
echo "-> Installing dependencies with $PM..."
case "$PM" in
  npm)
    npm install
    ;;
  pnpm)
    pnpm install || npm install
    ;;
  yarn)
    yarn install
    ;;
  bun)
    bun install
    ;;
esac

echo ""
echo "========================================================"
echo "  ThreeDot project created successfully!"
echo "========================================================"
echo ""
echo "To start development:"
echo "  cd $PROJECT_NAME"
echo "  $PM run dev"
echo ""
