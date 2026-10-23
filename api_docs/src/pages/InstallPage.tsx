import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Divider,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { CodeBlock } from '../components/CodeBlock';

export const InstallPage: React.FC = () => {
  const [pmTab, setPmTab] = useState(0);

  const pmCommands = [
    { name: 'npm', cmd: 'npm install threedot' },
    { name: 'pnpm', cmd: 'pnpm add threedot' },
    { name: 'yarn', cmd: 'yarn add threedot' },
    { name: 'bun', cmd: 'bun add threedot' },
  ];

  const tsconfigExample = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  }
}`;

  const viteStarter = `# 1. Create a modern Vite TypeScript project
npm create vite@latest my-threedot-game -- --template vanilla-ts

# 2. Enter project folder
cd my-threedot-game

# 3. Install ThreeDot (Only threedot is required!)
npm install threedot

# 4. Start local development server
npm run dev`;

  const verificationCode = `import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';

// 1. Create engine and attach to DOM container
const engine = new Engine({
  container: document.getElementById('app')!,
  antialias: true,
  shadows: true,
  backgroundColor: 0x0a0a0a,
});

// 2. Setup 3D camera
const camera = new Camera3D({ fov: 60, makeCurrent: true });
camera.position.set(0, 3, 6);
camera.lookAt({ x: 0, y: 0, z: 0 });
engine.sceneTree.root.addChild(camera);

// 3. Add directional sunlight
const sun = new DirectionalLight3D(0xffffff, 1.5);
sun.position.set(5, 10, 5);
sun.castShadow = true;
engine.sceneTree.root.addChild(sun);

// 4. Add rotating mesh using primitive string shortcut
const cube = new MeshInstance3D({
  shape: 'box',
  shapeArgs: [1.5, 1.5, 1.5],
  material: { color: 0xffffff, roughness: 0.2, metalness: 0.8 },
  castShadow: true,
});
cube.position.set(0, 1, 0);
engine.sceneTree.root.addChild(cube);

console.log('[ThreeDot] Engine mounted and running');`;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Page Header */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <DownloadOutlinedIcon sx={{ fontSize: 32 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800 }}>
            Installation
          </Typography>
        </Box>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800, mb: 2 }}>
          Install ThreeDot into your project. ThreeDot bundles and re-exports all math, geometries,
          materials, and shaders, so you only ever install a single package.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="Single Package: threedot" size="small" variant="outlined" />
          <Chip label="Zero Peer Dependency Overhead" size="small" variant="outlined" />
          <Chip label="Bundled TypeScript Types" size="small" variant="outlined" />
        </Box>
      </Box>

      {/* Package Manager Tabs */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <TerminalOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            1. Install Package
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Choose your package manager of choice. No secondary packages or <code>@types/three</code> are needed:
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={pmTab}
            onChange={(_, val) => setPmTab(val)}
            textColor="inherit"
            TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
          >
            {pmCommands.map((pm, idx) => (
              <Tab
                key={pm.name}
                label={pm.name}
                sx={{
                  fontWeight: 600,
                  fontSize: '13px',
                  textTransform: 'none',
                  minWidth: 80,
                  opacity: pmTab === idx ? 1 : 0.6,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <CodeBlock
          code={pmCommands[pmTab].cmd}
          language="bash"
          title={`${pmCommands[pmTab].name} install`}
        />
      </Paper>

      {/* Recommended TSConfig */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <SettingsOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            2. TypeScript Configuration
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ThreeDot is built for modern ES2022+ module environments. Add the following to your{' '}
          <code>tsconfig.json</code>:
        </Typography>

        <CodeBlock
          code={tsconfigExample}
          language="json"
          title="tsconfig.json"
        />
      </Paper>

      {/* Vite Scaffolding */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <CheckCircleOutlineOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            3. Recommended Vite Scaffolding
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For the fastest development experience with Hot Module Replacement (HMR), scaffold a fresh
          Vite application:
        </Typography>

        <CodeBlock
          code={viteStarter}
          language="bash"
          title="Terminal (Vite Setup)"
        />
      </Paper>

      {/* Verification Script */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <VerifiedOutlinedIcon fontSize="small" />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            4. Verify Installation
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Paste this script into your entry file (e.g. <code>src/main.ts</code>) to verify that the
          canvas renders and the engine loop ticks:
        </Typography>

        <CodeBlock
          code={verificationCode}
          language="typescript"
          title="src/main.ts (Verification)"
        />
      </Paper>
    </Container>
  );
};
