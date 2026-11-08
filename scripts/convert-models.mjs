// Converts the Kenney Furniture Kit (CC0) OBJ models this game uses into
// binary glTF (GLB) under public/models. Run once after downloading the kit:
//   node scripts/convert-models.mjs "<path to kit>/Models/OBJ format"
// The kit itself is not committed; the converted GLBs are (CC0, see
// public/models/CREDITS.md).
import obj2gltf from 'obj2gltf';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const MODELS = [
  'desk', 'chairDesk', 'computerScreen', 'computerKeyboard', 'computerMouse',
  'lampSquareTable', 'lampSquareCeiling', 'bookcaseClosedWide', 'bookcaseOpen', 'books',
  'cardboardBoxClosed', 'cardboardBoxOpen', 'trashcan', 'coatRackStanding', 'pottedPlant',
  'radio', 'televisionVintage', 'table',
];

const source = process.argv[2];
if (!source) {
  console.error('Usage: node scripts/convert-models.mjs "<kit>/Models/OBJ format"');
  process.exit(1);
}
const out = new URL('../public/models/', import.meta.url);
await mkdir(out, { recursive: true });
for (const name of MODELS) {
  const glb = await obj2gltf(join(source, `${name}.obj`), { binary: true });
  await writeFile(new URL(`${name}.glb`, out), glb);
  console.log(`${name}.glb ${glb.length} bytes`);
}
