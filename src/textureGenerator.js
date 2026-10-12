import * as THREE from 'three';

// Procedural PBR Texture Generator with Module-Level Singleton Caching
// Lightweight canvas dimensions (128x128 to 256x256) to prevent GPU texture upload memory pressure

function createNoiseCanvas(width, height, drawFn) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawFn(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false; // Prevents extra GPU memory allocation
  return texture;
}

// Cached Singletons
let cachedGround = null;
let cachedPath = null;
let cachedBark = null;
let cachedStone = null;
let cachedBamboo = null;
let cachedWood = null;
let cachedTalisman = null;

// 1. Rich Forest Soil / Moss Loam & Leaf Litter Ground Texture
export function getForestGroundTextures() {
  if (cachedGround) return cachedGround;

  const map = createNoiseCanvas(256, 256, (ctx, w, h) => {
    // Rich dark damp earth
    ctx.fillStyle = '#1b2c1d';
    ctx.fillRect(0, 0, w, h);

    // Deep soil tone variations
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const r = Math.random() * 2.5 + 1;
      const shade = Math.floor(Math.random() * 25 + 20);
      ctx.fillStyle = `rgb(${shade + 4}, ${shade + 12}, ${shade})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lush organic moss carpets
    for (let i = 0; i < 35; i++) {
      const cx = Math.random() * w;
      const cy = Math.random() * h;
      const radius = Math.random() * 24 + 10;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
      grad.addColorStop(0, '#2e5d28');
      grad.addColorStop(0.5, '#20461e');
      grad.addColorStop(0.85, '#173215');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Realistic fallen forest leaves
    const leafColors = ['#6e3319', '#8a451e', '#a36224', '#78531e', '#452c16'];
    for (let i = 0; i < 250; i++) {
      const lx = Math.random() * w;
      const ly = Math.random() * h;
      const lw = Math.random() * 5 + 2.5;
      const lh = Math.random() * 2.5 + 1.5;
      const rot = Math.random() * Math.PI * 2;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.fillStyle = leafColors[Math.floor(Math.random() * leafColors.length)];
      ctx.beginPath();
      ctx.ellipse(0, 0, lw, lh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });

  const bumpMap = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const v = Math.floor(Math.random() * 90 + 80);
      ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  if (map) { map.repeat.set(24, 24); }
  if (bumpMap) { bumpMap.repeat.set(24, 24); }

  cachedGround = { map, bumpMap };
  return cachedGround;
}

// 2. Realistic Stone-and-Dirt Winding Pathway Texture
export function getDirtPathTextures() {
  if (cachedPath) return cachedPath;

  const map = createNoiseCanvas(256, 256, (ctx, w, h) => {
    // Warm compressed forest soil base
    ctx.fillStyle = '#3c2e22';
    ctx.fillRect(0, 0, w, h);

    // Weathered flagstone pavers embedded in pathway
    const stoneGrays = ['#54524c', '#615f57', '#484641', '#6e6a60'];
    const cols = 4;
    const rows = 8;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const sx = c * cellW + Math.random() * 6 + 3;
        const sy = r * cellH + Math.random() * 6 + 3;
        const sw = cellW - Math.random() * 8 - 6;
        const sh = cellH - Math.random() * 8 - 6;

        ctx.fillStyle = stoneGrays[Math.floor(Math.random() * stoneGrays.length)];
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(sx, sy, sw, sh, [4, 6, 5, 4]);
        } else {
          ctx.rect(sx, sy, sw, sh);
        }
        ctx.fill();
      }
    }

    // Dirt & gravel wash
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const tone = Math.floor(Math.random() * 30 + 60);
      ctx.fillStyle = `rgba(${tone + 12}, ${tone + 4}, ${tone - 10}, 0.5)`;
      ctx.fillRect(x, y, 4, 3);
    }
  });

  const bumpMap = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const light = Math.random() > 0.5 ? 190 : 65;
      ctx.fillStyle = `rgb(${light}, ${light}, ${light})`;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  if (map) { map.repeat.set(6, 18); }
  if (bumpMap) { bumpMap.repeat.set(6, 18); }

  cachedPath = { map, bumpMap };
  return cachedPath;
}

// 3. Ancient Weathered Bark Texture
export function getTreeBarkTextures() {
  if (cachedBark) return cachedBark;

  const map = createNoiseCanvas(128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#261910';
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 3) {
      const shade = Math.floor(Math.random() * 40 + 35);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 7})`;
      ctx.fillRect(x, 0, 2, h);
    }

    ctx.fillStyle = '#100804';
    for (let i = 0; i < 40; i++) {
      const fx = Math.random() * w;
      const fy = Math.random() * h;
      const fh = Math.random() * 60 + 30;
      ctx.fillRect(fx, fy, 2, fh);
    }
  });

  const bumpMap = createNoiseCanvas(64, 128, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 3) {
      const v = Math.floor(Math.random() * 90 + 45);
      ctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
      ctx.fillRect(x, 0, 2, h);
    }
  });

  if (map) { map.repeat.set(2, 6); }
  if (bumpMap) { bumpMap.repeat.set(2, 6); }

  cachedBark = { map, bumpMap };
  return cachedBark;
}

// 4. Ancient Mythic Stone / Mossy Boulder Texture
export function getMossyStoneTextures() {
  if (cachedStone) return cachedStone;

  const map = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#3a403a';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 300; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const gray = Math.floor(Math.random() * 45 + 50);
      ctx.fillStyle = `rgb(${gray}, ${gray + 3}, ${gray - 2})`;
      ctx.fillRect(px, py, 3, 3);
    }

    for (let i = 0; i < 15; i++) {
      const mx = Math.random() * w;
      const my = Math.random() * h;
      const mr = Math.random() * 18 + 6;
      const grad = ctx.createRadialGradient(mx, my, 2, mx, my, mr);
      grad.addColorStop(0, '#2d5329');
      grad.addColorStop(0.7, '#1f3c1c');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const bumpMap = createNoiseCanvas(64, 64, (ctx, w, h) => {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      const b = Math.floor(Math.random() * 70 + 80);
      ctx.fillStyle = `rgb(${b}, ${b}, ${b})`;
      ctx.fillRect(x, y, 2, 2);
    }
  });

  if (map) { map.repeat.set(3, 3); }
  if (bumpMap) { bumpMap.repeat.set(3, 3); }

  cachedStone = { map, bumpMap };
  return cachedStone;
}

// 5. Haunted Bamboo Cane Texture
export function getHauntedBambooTextures() {
  if (cachedBamboo) return cachedBamboo;

  const map = createNoiseCanvas(128, 256, (ctx, w, h) => {
    ctx.fillStyle = '#2d4832';
    ctx.fillRect(0, 0, w, h);

    for (let x = 0; x < w; x += 2) {
      const shade = Math.floor(Math.random() * 25 + 40);
      ctx.fillStyle = `rgb(${shade - 10}, ${shade + 20}, ${shade})`;
      ctx.fillRect(x, 0, 1.5, h);
    }

    const nodeYPositions = [32, 90, 150, 210];
    nodeYPositions.forEach((ny) => {
      ctx.fillStyle = '#18291a';
      ctx.fillRect(0, ny - 3, w, 6);
      ctx.fillStyle = '#4f7553';
      ctx.fillRect(0, ny - 1, w, 2);
    });
  });

  if (map) { map.repeat.set(1, 4); }

  cachedBamboo = { map };
  return cachedBamboo;
}

// 6. Ancient Chinese Temple Weathered Vermilion Wood
export function getTempleWoodTextures() {
  if (cachedWood) return cachedWood;

  const map = createNoiseCanvas(128, 128, (ctx, w, h) => {
    ctx.fillStyle = '#6a1a1a';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 3) {
      const shade = Math.floor(Math.random() * 20 + 65);
      ctx.fillStyle = `rgb(${shade + 25}, ${Math.floor(shade * 0.25)}, ${Math.floor(shade * 0.2)})`;
      ctx.fillRect(0, y, w, 2);
    }
  });

  if (map) { map.repeat.set(2, 2); }

  cachedWood = { map };
  return cachedWood;
}

// 7. Taoist Yellow Talisman Paper Texture
export function getTalismanTextures() {
  if (cachedTalisman) return cachedTalisman;

  const map = createNoiseCanvas(64, 128, (ctx, w, h) => {
    ctx.fillStyle = '#dfb142';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 10);
    ctx.lineTo(w * 0.5, 35);
    ctx.moveTo(w * 0.25, 20);
    ctx.lineTo(w * 0.75, 20);
    ctx.stroke();
  });

  cachedTalisman = { map };
  return cachedTalisman;
}
