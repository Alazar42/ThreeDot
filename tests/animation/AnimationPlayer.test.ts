import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { Node3D } from '../../src/nodes/3d/Node3D';
import { AnimationPlayer } from '../../src/nodes/animation/AnimationPlayer';

describe('AnimationPlayer System', () => {
  it('manages animation clips and playback', () => {
    const parent3D = new Node3D({ name: 'AnimatedMesh' });
    const animPlayer = new AnimationPlayer({ name: 'AnimPlayer' });

    parent3D.addChild(animPlayer);

    // Create a simple keyframe track
    const times = [0, 1];
    const values = [0, 0, 0, 0, 5, 0];
    const track = new THREE.VectorKeyframeTrack('.position', times, values);
    const clip = new THREE.AnimationClip('jump', 1, [track]);

    animPlayer.addAnimation('jump', clip);
    expect(animPlayer.hasAnimation('jump')).toBe(true);
    expect(animPlayer.animationNames).toContain('jump');

    // Trigger tree entry so mixer initializes on parent's object3D
    parent3D._propagateEnterTree(null as any);

    animPlayer.play('jump');
    expect(animPlayer.currentAnimation).toBe('jump');
    expect(animPlayer.isPlaying).toBe(true);

    animPlayer.pause();
    expect(animPlayer.isPaused).toBe(true);

    animPlayer.resume();
    expect(animPlayer.isPaused).toBe(false);

    animPlayer.stop();
    expect(animPlayer.isPlaying).toBe(false);
    expect(animPlayer.currentAnimation).toBe('');
  });
});
