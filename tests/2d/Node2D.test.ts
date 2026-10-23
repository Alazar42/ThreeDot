import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { Node2D } from '../../src/nodes/2d/Node2D';
import { Sprite2D } from '../../src/nodes/2d/Sprite2D';
import { AnimatedSprite2D, SpriteFrames } from '../../src/nodes/2d/AnimatedSprite2D';

describe('2D Node System', () => {
  it('manages 2D local and global transforms', () => {
    const parent = new Node2D({
      name: 'Parent2D',
      position: { x: 100, y: 50 },
      rotation: 0,
      scale: { x: 2, y: 2 },
    });

    const child = new Node2D({
      name: 'Child2D',
      position: { x: 20, y: 10 },
    });

    parent.addChild(child);

    expect(parent.position.x).toBe(100);
    expect(parent.position.y).toBe(50);
    expect(child.position.x).toBe(20);

    // Global position includes parent scale and translation
    const globalPos = child.globalPosition;
    expect(globalPos.x).toBe(140); // 100 + 20 * 2
    expect(globalPos.y).toBe(70);  // 50 + 10 * 2
  });

  it('configures Sprite2D sizing, centered, and flip flags', () => {
    const sprite = new Sprite2D({
      name: 'PlayerSprite',
      size: { x: 64, y: 64 },
      centered: true,
      flipH: false,
      flipV: false,
    });

    expect(sprite.size.x).toBe(64);
    expect(sprite.size.y).toBe(64);
    expect(sprite.centered).toBe(true);
    expect(sprite.flipH).toBe(false);

    sprite.flipH = true;
    expect(sprite.flipH).toBe(true);

    sprite.flipV = true;
    expect(sprite.flipV).toBe(true);
  });

  it('manages AnimatedSprite2D playback and frame progression', () => {
    const dummyTexture1 = new THREE.Texture();
    const dummyTexture2 = new THREE.Texture();

    const frames: SpriteFrames = {
      animations: {
        walk: {
          fps: 10,
          loop: true,
          frames: [dummyTexture1, dummyTexture2],
        },
      },
    };

    const animSprite = new AnimatedSprite2D({
      name: 'PlayerAnim',
      spriteFrames: frames,
      animation: 'walk',
      autoplay: false,
    });

    const frameSpy = vi.fn();
    animSprite.frameChanged.connect(frameSpy);

    expect(animSprite.isPlaying).toBe(false);
    expect(animSprite.frame).toBe(0);

    animSprite.play('walk');
    expect(animSprite.isPlaying).toBe(true);

    // Advance by 0.15s (at 10fps, 1 frame takes 0.1s)
    animSprite._process(0.15);
    expect(animSprite.frame).toBe(1);
    expect(frameSpy).toHaveBeenCalledWith(1);

    animSprite.pause();
    expect(animSprite.isPlaying).toBe(false);

    animSprite.stop();
    expect(animSprite.frame).toBe(0);
  });
});
