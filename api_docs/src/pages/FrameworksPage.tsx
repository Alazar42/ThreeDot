import React, { useState } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { CodeBlock } from '../components/CodeBlock';

export const FrameworksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const frameworks = [
    {
      name: 'React',
      title: 'React 18 / 19 Integration',
      desc: 'Use ThreeDot inside React with standard hooks (useRef, useEffect) or declaratively using ThreeDot JSX.',
      imperativeCode: `import React, { useEffect, useRef, useState } from 'react';
import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D, Vector3 } from 'threedot';

export const ThreeDotCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fps, setFps] = useState(60);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Create Engine instance
    const engine = new Engine({
      container: containerRef.current,
      antialias: true,
      shadows: true,
      backgroundColor: 0x0a0a0a,
      autoResize: true,
    });

    // 2. Add Camera
    const camera = new Camera3D({ fov: 60, position: { x: 0, y: 5, z: 10 } });
    camera.lookAt(new Vector3(0, 0, 0));
    engine.sceneTree.root.addChild(camera);
    camera.makeCurrent();

    // 3. Add Sunlight
    const sun = new DirectionalLight3D({ intensity: 2.0, position: { x: 5, y: 12, z: 5 } });
    engine.sceneTree.root.addChild(sun);

    // 4. Custom Node with process loop
    class RotatingCube extends MeshInstance3D {
      override _process(delta: number): void {
        this.rotateY(1.5 * delta);
      }
    }

    const cube = new RotatingCube({
      name: 'Player',
      geometry: 'box',
      material: { color: 0xffffff, roughness: 0.3, metalness: 0.8 },
      position: { x: 0, y: 1, z: 0 },
    });
    engine.sceneTree.root.addChild(cube);

    // 5. Connect signals to React state
    const disconnectFrame = engine.frameProcessed.connect(() => {
      setFps(Math.round(engine.fps));
    });

    // 6. Clean up on unmount
    return () => {
      disconnectFrame();
      engine.dispose();
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '500px' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', top: 12, left: 12, color: '#fff', fontFamily: 'monospace' }}>
        FPS: {fps}
      </div>
    </div>
  );
};`,
      jsxCode: `/** @jsxImportSource threedot/jsx */
import { instantiate, Vector3 } from 'threedot';
import React, { useEffect, useRef } from 'react';
import { Engine } from 'threedot';

export const DeclarativeThreeDot: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Engine({ container: containerRef.current });

    // Build complete scene tree declaratively
    const scene = instantiate(
      <Node3D name="World">
        <Camera3D name="MainCamera" fov={60} position={{ x: 0, y: 4, z: 8 }} />
        <DirectionalLight3D name="Sun" intensity={2.0} position={{ x: 5, y: 10, z: 5 }} />
        <MeshInstance3D
          name="Floor"
          geometry="plane"
          material={{ color: 0x1a1a1a }}
          rotation={{ x: -Math.PI / 2, y: 0, z: 0 }}
        />
        <MeshInstance3D
          name="Hero"
          geometry="box"
          material={{ color: 0xffffff }}
          position={{ x: 0, y: 1, z: 0 }}
        />
      </Node3D>
    );

    engine.sceneTree.root.addChild(scene);

    return () => engine.dispose();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '500px' }} />;
};`,
    },
    {
      name: 'Vue 3',
      title: 'Vue 3 (Composition API / Nuxt 3)',
      desc: 'Seamless integration with Vue 3 SFCs using <script setup lang="ts"> and onMounted.',
      code: `<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D, Vector3 } from 'threedot';

const viewportRef = ref<HTMLDivElement | null>(null);
const currentFps = ref(60);
let engine: Engine | null = null;

onMounted(() => {
  if (!viewportRef.value) return;

  // Initialize Engine
  engine = new Engine({
    container: viewportRef.value,
    antialias: true,
    shadows: true,
    backgroundColor: 0x0a0a0a,
    autoResize: true,
  });

  // Setup Camera and Lighting
  const camera = new Camera3D({ fov: 60, position: { x: 0, y: 4, z: 8 } });
  camera.lookAt(new Vector3(0, 0, 0));
  engine.sceneTree.root.addChild(camera);
  camera.makeCurrent();

  const sun = new DirectionalLight3D({ intensity: 2.0, position: { x: 6, y: 10, z: 4 } });
  engine.sceneTree.root.addChild(sun);

  // Rotating Mesh
  class Orb extends MeshInstance3D {
    override _process(delta: number): void {
      this.rotateY(2.0 * delta);
    }
  }

  const orb = new Orb({
    name: 'VueOrb',
    geometry: 'sphere',
    material: { color: 0xffffff, roughness: 0.15, metalness: 0.85 },
    position: { x: 0, y: 1, z: 0 },
  });
  engine.sceneTree.root.addChild(orb);

  // Connect engine frame signal to Vue reactivity
  engine.frameProcessed.connect(() => {
    if (engine) currentFps.value = Math.round(engine.fps);
  });
});

onUnmounted(() => {
  engine?.dispose();
});
</script>

<template>
  <div class="canvas-wrapper">
    <div ref="viewportRef" class="viewport-element" />
    <div class="hud-fps">FPS: {{ currentFps }}</div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
}
.viewport-element {
  width: 100%;
  height: 100%;
}
.hud-fps {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: monospace;
  color: #fff;
}
</style>`,
    },
    {
      name: 'Svelte 5',
      title: 'Svelte 5 / SvelteKit Integration',
      desc: 'Clean integration using Svelte 5 runes ($state) and onMount lifecycle hooks.',
      code: `<script lang="ts">
  import { onMount } from 'svelte';
  import { Engine, Camera3D, DirectionalLight3D, MeshInstance3D, Vector3 } from 'threedot';

  let container: HTMLDivElement;
  let engine: Engine;
  let fps = $state(60);

  onMount(() => {
    engine = new Engine({
      container,
      antialias: true,
      shadows: true,
      backgroundColor: 0x0a0a0a,
      autoResize: true,
    });

    const camera = new Camera3D({ fov: 60, position: { x: 0, y: 4, z: 8 } });
    camera.lookAt(new Vector3(0, 0, 0));
    engine.sceneTree.root.addChild(camera);
    camera.makeCurrent();

    const sun = new DirectionalLight3D({ intensity: 2.0, position: { x: 5, y: 12, z: 5 } });
    engine.sceneTree.root.addChild(sun);

    class TorusNode extends MeshInstance3D {
      override _process(delta: number): void {
        this.rotateY(1.2 * delta);
        this.rotateX(0.8 * delta);
      }
    }

    const torus = new TorusNode({
      name: 'Torus',
      geometry: 'torus',
      material: { color: 0xffffff, roughness: 0.2, metalness: 0.8 },
      position: { x: 0, y: 1.5, z: 0 },
    });
    engine.sceneTree.root.addChild(torus);

    const disconnect = engine.frameProcessed.connect(() => {
      fps = Math.round(engine.fps);
    });

    return () => {
      disconnect();
      engine.dispose();
    };
  });
</script>

<div class="viewport-box">
  <div bind:this={container} class="canvas-host"></div>
  <div class="hud">FPS: {fps}</div>
</div>

<style>
  .viewport-box {
    position: relative;
    width: 100%;
    height: 500px;
  }
  .canvas-host {
    width: 100%;
    height: 100%;
  }
  .hud {
    position: absolute;
    top: 12px;
    left: 12px;
    color: #fff;
    font-family: monospace;
  }
</style>`,
    },
  ];

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 4, md: 6 }, py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          UI INTEGRATION
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
          Framework Integration Guides
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          ThreeDot is completely framework-agnostic. Learn how to embed the ThreeDot engine into
          React, Vue 3, Svelte 5, or Next.js applications.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="inherit"
          TabIndicatorProps={{ sx: { backgroundColor: 'text.primary', height: 2 } }}
        >
          {frameworks.map((fw) => (
            <Tab
              key={fw.name}
              label={fw.name}
              sx={{ textTransform: 'none', fontWeight: 600, fontSize: '13px' }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Active Framework Content */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {frameworks[activeTab].title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          {frameworks[activeTab].desc}
        </Typography>

        {activeTab === 0 ? (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 1 }}>
              Standard Hook-Based Integration:
            </Typography>
            <CodeBlock
              code={frameworks[0].imperativeCode!}
              language="tsx"
              title="ThreeDotCanvas.tsx"
            />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 4, mb: 1 }}>
              Declarative JSX / TSX Integration:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              You can construct your entire scene tree using JSX tags without manual <code>addChild</code> chains:
            </Typography>
            <CodeBlock
              code={frameworks[0].jsxCode!}
              language="tsx"
              title="DeclarativeThreeDot.tsx"
            />
          </>
        ) : (
          <CodeBlock
            code={frameworks[activeTab].code!}
            language={activeTab === 1 ? 'html' : 'html'}
            title={`${frameworks[activeTab].name} Component`}
          />
        )}
      </Box>

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
            Server-Side Rendering (SSR) Notice
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            WebGL and Web Audio APIs rely on browser objects (<code>window</code>, <code>document</code>,{' '}
            <code>HTMLCanvasElement</code>). When using Next.js (App Router), mark your canvas component with{' '}
            <code>'use client';</code> or use dynamic imports with <code>{`{ ssr: false }`}</code>. In Nuxt 3, wrap
            the canvas in <code>&lt;ClientOnly&gt;</code>.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
