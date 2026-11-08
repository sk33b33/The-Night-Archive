import * as THREE from 'three';

/**
 * Text for the scene (drawer labels, desk tags, the clock face), drawn to a
 * canvas with system fonts. No font files are fetched, so it works offline.
 */
export function labelTexture(
  lines: readonly string[],
  options: { width?: number; height?: number; background?: string; color?: string; font?: string } = {},
): THREE.CanvasTexture {
  const width = options.width ?? 256;
  const height = options.height ?? 96;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = options.background ?? '#d8d1bd';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = options.color ?? '#1d1f24';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const size = Math.floor(height / (lines.length + 0.6));
    ctx.font = options.font ?? `700 ${size}px "Courier New", ui-monospace, monospace`;
    lines.forEach((line, i) => ctx.fillText(line, width / 2, (height / (lines.length + 1)) * (i + 1)));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** A clock face showing a fixed time. */
export function clockTexture(hours: number, minutes: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    ctx.fillStyle = '#e6e0cf';
    ctx.beginPath();
    ctx.arc(c, c, c - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#26282d';
    ctx.stroke();
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.lineWidth = i % 3 === 0 ? 7 : 3;
      ctx.beginPath();
      ctx.moveTo(c + Math.sin(a) * (c - 22), c - Math.cos(a) * (c - 22));
      ctx.lineTo(c + Math.sin(a) * (c - 40), c - Math.cos(a) * (c - 40));
      ctx.stroke();
    }
    const hand = (angle: number, length: number, width: number) => {
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.sin(angle) * length, c - Math.cos(angle) * length);
      ctx.stroke();
    };
    hand(((hours % 12) + minutes / 60) * (Math.PI / 6), c * 0.5, 10);
    hand(minutes * (Math.PI / 30), c * 0.75, 6);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
