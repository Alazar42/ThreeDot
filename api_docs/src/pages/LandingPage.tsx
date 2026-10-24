import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SpeedIcon from '@mui/icons-material/Speed';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LayersIcon from '@mui/icons-material/Layers';
import TuneIcon from '@mui/icons-material/Tune';
import CodeIcon from '@mui/icons-material/Code';
import { CodeBlock } from '../components/CodeBlock';
import { useDocTheme } from '../theme/ThemeContext';
import type { NavTab } from '../components/Navbar';

interface LandingPageProps {
  onNavigate: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { resolvedMode } = useDocTheme();
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [frameworkTab, setFrameworkTab] = useState(0);

  const installCommand = 'npm install threedot';

  const handleCopyInstall = () => {
    navigator.clipboard.writeText(installCommand);
    setCopiedInstall(true);
    setTimeout(() => setCopiedInstall(false), 2000);
  };

  const frameworkExamples = [
    {
      name: 'React',
      code: `import React, { useEffect, useRef } from 'react';
import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';

export const ThreeDotViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initialize Engine
    const engine = new Engine({
      container: containerRef.current,
      antialias: true,
      shadows: true,
      backgroundColor: 0x0a0a0a,
      autoResize: true,
    });

    // 2. Setup Camera and Lighting
    const camera = new Camera3D({ fov: 60, position: { x: 0, y: 4, z: 8 } });
    camera.lookAt({ x: 0, y: 0, z: 0 });
    engine.sceneTree.root.addChild(camera);
    camera.makeCurrent();

    const sun = new DirectionalLight3D({ intensity: 2.0, position: { x: 5, y: 10, z: 5 } });
    engine.sceneTree.root.addChild(sun);

    // 3. Create a rotating MeshInstance3D (No need to import THREE!)
    const cube = new MeshInstance3D({
      name: 'HeroCube',
      geometry: 'box',
      material: { color: 0xffffff, roughness: 0.2, metalness: 0.8 },
      position: { x: 0, y: 1, z: 0 },
    });
    engine.sceneTree.root.addChild(cube);

    return () => {
      engine.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />;
};`,
    },
    {
      name: 'Vue 3',
      code: `<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';

const containerRef = ref<HTMLDivElement | null>(null);
let engine: Engine | null = null;

onMounted(() => {
  if (!containerRef.value) return;

  engine = new Engine({
    container: containerRef.value,
    antialias: true,
    shadows: true,
    backgroundColor: 0x0a0a0a,
    autoResize: true,
  });

  const camera = new Camera3D({ fov: 60, position: { x: 0, y: 4, z: 8 } });
  camera.lookAt({ x: 0, y: 0, z: 0 });
  engine.sceneTree.root.addChild(camera);
  camera.makeCurrent();

  const light = new DirectionalLight3D({ intensity: 2.0, position: { x: 5, y: 10, z: 5 } });
  engine.sceneTree.root.addChild(light);

  const orb = new MeshInstance3D({
    name: 'Orb',
    geometry: 'sphere',
    material: { color: 0xffffff, roughness: 0.1, metalness: 0.9 },
  });
  engine.sceneTree.root.addChild(orb);
});

onUnmounted(() => {
  engine?.dispose();
});
</script>

<template>
  <div ref="containerRef" class="viewport-canvas" />
</template>

<style scoped>
.viewport-canvas {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>`,
    },
    {
      name: 'Svelte 5',
      code: `<script lang="ts">
  import { onMount } from 'svelte';
  import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D } from 'threedot';

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

    const camera = new Camera3D({ fov: 60, position: { x: 0, y: 4, z: 8 } });
    camera.lookAt({ x: 0, y: 0, z: 0 });
    engine.sceneTree.root.addChild(camera);
    camera.makeCurrent();

    const sun = new DirectionalLight3D({ intensity: 2.0, position: { x: 5, y: 10, z: 5 } });
    engine.sceneTree.root.addChild(sun);

    const torus = new MeshInstance3D({
      name: 'Torus',
      geometry: 'torus',
      material: { color: 0xffffff, roughness: 0.3, metalness: 0.7 },
    });
    engine.sceneTree.root.addChild(torus);

    return () => {
      engine.dispose();
    };
  });
</script>

<div bind:this={container} class="viewport-container"></div>

<style>
  .viewport-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }
</style>`,
    },
    {
      name: 'Vanilla TypeScript',
      code: `import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D, Vector3 } from 'threedot';

// 1. Initialize Engine directly on any DOM container
const container = document.getElementById('app')!;
const engine = new Engine({
  container,
  antialias: true,
  shadows: true,
  backgroundColor: 0x0a0a0a,
  autoResize: true,
});

// 2. Setup Camera
const camera = new Camera3D({
  name: 'MainCamera',
  fov: 60,
  position: { x: 0, y: 5, z: 10 },
});
camera.lookAt(new Vector3(0, 0, 0));
engine.sceneTree.root.addChild(camera);
camera.makeCurrent();

// 3. Add Lighting
const light = new DirectionalLight3D({
  intensity: 2.0,
  position: { x: 10, y: 15, z: 10 },
  castShadow: true,
});
engine.sceneTree.root.addChild(light);

// 4. Custom Node with process loop
class RotatingPlayer extends MeshInstance3D {
  speed = 1.5;

  constructor() {
    super({
      name: 'Player',
      geometry: 'box',
      material: { color: 0xffffff, roughness: 0.2, metalness: 0.8 },
      position: { x: 0, y: 1, z: 0 },
    });
  }

  override _process(delta: number): void {
    this.rotateY(this.speed * delta);
  }
}

engine.sceneTree.root.addChild(new RotatingPlayer());`,
    },
  ];

  const features = [
    {
      icon: <CodeIcon sx={{ fontSize: 28 }} />,
      title: 'Zero-THREE Dependency',
      desc: 'Only install threedot. Never import from three. All math, geometries, materials, shaders, textures, and loaders are bundled and directly exported.',
    },
    {
      icon: <AccountTreeIcon sx={{ fontSize: 28 }} />,
      title: 'Scene Tree Architecture',
      desc: 'Hierarchical node composition inspired by Godot Engine. Nodes feature automatic sibling name uniqueness, deep path resolution, and group queries.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 28 }} />,
      title: 'Deterministic Lifecycle',
      desc: 'Predictable execution stages: _enterTree, _ready, _process (frame ticks), _physicsProcess (fixed 60 Hz), _exitTree, and _destroy.',
    },
    {
      icon: <ElectricBoltIcon sx={{ fontSize: 28 }} />,
      title: 'Signals & threedot-signal',
      desc: 'Decoupled observer pattern bridging 3D nodes to HTML and JSX. Connect any standard HTML tag with threedot-signal="name" directly to gameplay logic.',
    },
    {
      icon: <TuneIcon sx={{ fontSize: 28 }} />,
      title: 'Declarative JSX & Imperative Code',
      desc: 'Write clean object-oriented TypeScript classes extending Node3D, or declare full scene graphs in JSX. Both paradigms interoperate seamlessly.',
    },
    {
      icon: <LayersIcon sx={{ fontSize: 28 }} />,
      title: 'Dual-Anchor GUI Engine',
      desc: 'Godot-style UI layout system using fractional anchors and pixel margins. Build responsive in-engine game HUDs and menus that adapt to any resolution.',
    },
  ];

  return (
    <Box sx={{ pb: 10 }}>
      {/* Hero Section */}
      <Box
        sx={{
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 10 },
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, #1a1a1a 0%, #080808 70%)'
              : 'radial-gradient(ellipse at 50% 0%, #f0f0f0 0%, #ffffff 70%)',
        }}
      >
        <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, maxWidth: '1440px', mx: 'auto' }}>
          {/* Logo */}
          <Box
            component="img"
            src="/logo/whitelogo.png"
            alt="ThreeDot"
            sx={{
              height: { xs: 54, md: 72 },
              width: 'auto',
              mx: 'auto',
              mb: 3,
              filter: resolvedMode === 'light' ? 'invert(1)' : 'none',
              transition: 'filter 0.2s ease',
            }}
          />

          {/* Badges */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
            <Chip
              label="v0.1.0 Open Source"
              size="small"
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}
            />
            <Chip
              label="Godot Philosophy for Three.js"
              size="small"
              sx={{
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1f1f1f' : '#e5e5e5'),
              }}
            />
          </Box>

          {/* Main Headline */}
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '32px', md: '48px' },
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            A Godot-Inspired Framework for Three.js
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '15px', md: '18px' },
              color: 'text.secondary',
              maxWidth: '680px',
              mx: 'auto',
              lineHeight: 1.6,
              mb: 4,
            }}
          >
            Structured scene trees, deterministic lifecycle management, type-safe signals, responsive
            UI anchors, and physics simulation for modern web 3D applications.
          </Typography>

          {/* Install Command Bar */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#141414' : '#f0f0f0'),
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              px: 2,
              py: 1,
              mb: 4,
              fontFamily: 'monospace',
              fontSize: '13px',
              gap: 2,
            }}
          >
            <Box component="span" sx={{ opacity: 0.6 }}>$</Box>
            <Box component="span" sx={{ fontWeight: 600 }}>{installCommand}</Box>
            <Button
              size="small"
              variant="text"
              onClick={handleCopyInstall}
              startIcon={copiedInstall ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              sx={{ minWidth: 'auto', px: 1, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
            >
              {copiedInstall ? 'Copied' : 'Copy'}
            </Button>
          </Box>

          {/* CTA Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => onNavigate('quickstart')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: '8px',
                fontWeight: 700,
                backgroundColor: 'text.primary',
                color: 'background.default',
                '&:hover': {
                  backgroundColor: 'text.secondary',
                },
              }}
            >
              Get Started
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => onNavigate('api')}
              endIcon={<PlayArrowIcon />}
              sx={{
                px: 3,
                py: 1.2,
                borderRadius: '8px',
                fontWeight: 600,
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'text.primary',
                  backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#161616' : '#f5f5f5'),
                },
              }}
            >
              API Reference
            </Button>

            <Button
              variant="text"
              size="large"
              onClick={() => onNavigate('architecture')}
              sx={{
                px: 2,
                py: 1.2,
                color: 'text.secondary',
                fontWeight: 600,
                '&:hover': { color: 'text.primary' },
              }}
            >
              Architecture Guide
            </Button>
          </Box>
        </Box>
      </Box>


      {/* Framework Support Tabs Section */}
      <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, mt: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Works with Any UI Framework
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Mount ThreeDot into React, Vue 3, Svelte 5, or plain Vanilla TypeScript projects with 100% parity.
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Tabs
              value={frameworkTab}
              onChange={(_, val) => setFrameworkTab(val)}
              textColor="inherit"
              TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              {frameworkExamples.map((fw, idx) => (
                <Tab
                  key={fw.name}
                  label={fw.name}
                  sx={{
                    fontWeight: 600,
                    fontSize: '13px',
                    textTransform: 'none',
                    opacity: frameworkTab === idx ? 1 : 0.6,
                  }}
                />
              ))}
            </Tabs>
          </Box>
        </Box>

        <CodeBlock
          code={frameworkExamples[frameworkTab].code}
          language="typescript"
          title={`${frameworkExamples[frameworkTab].name} Integration Example`}
        />
      </Box>

      {/* Feature Highlights Grid */}
      <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, mt: 10, mb: 10 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Engine Features at a Glance
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
            Engineered from first principles to bring Godot Engine's proven abstractions to web 3D.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {features.map((feat) => (
            <Card
              key={feat.title}
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '10px',
                backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#111111' : '#fafafa'),
                borderColor: 'divider',
                transition: 'border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
                '&:hover': {
                  borderColor: 'text.primary',
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 8px 24px rgba(255,255,255,0.06)'
                      : '0 8px 24px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ color: 'text.primary', mb: 2 }}>{feat.icon}</Box>
                <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 700, mb: 1 }}>
                  {feat.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, flex: 1 }}>
                  {feat.desc}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
