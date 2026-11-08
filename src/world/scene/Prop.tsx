import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { KIT_SCALE, type InteractableId } from '../layout';

/** Kenney Furniture Kit models this room uses (CC0; see public/models/CREDITS.md). */
export type KitModel =
  | 'desk'
  | 'chairDesk'
  | 'computerScreen'
  | 'computerKeyboard'
  | 'computerMouse'
  | 'lampSquareTable'
  | 'lampSquareCeiling'
  | 'bookcaseClosedWide'
  | 'bookcaseOpen'
  | 'books'
  | 'cardboardBoxClosed'
  | 'cardboardBoxOpen'
  | 'trashcan'
  | 'coatRackStanding'
  | 'pottedPlant'
  | 'radio'
  | 'televisionVintage'
  | 'table';

const url = (model: KitModel) => `/models/${model}.glb`;

/**
 * The kit's bright toy colours, pulled towards the night palette: darker,
 * less saturated, slightly blue. Applied once per shared material.
 */
function nightGrade(material: THREE.Material): void {
  if (material.userData.nightGraded || !(material instanceof THREE.MeshStandardMaterial)) return;
  const hsl = { h: 0, s: 0, l: 0 };
  material.color.getHSL(hsl);
  material.color.setHSL(hsl.h, hsl.s * 0.32, Math.min(0.5, hsl.l * 0.6));
  material.roughness = 0.85;
  material.metalness = Math.min(material.metalness, 0.2);
  material.userData.nightGraded = true;
}

interface PropProps {
  readonly model: KitModel;
  readonly position: readonly [number, number, number];
  /** Rotation about the vertical axis, in radians. */
  readonly yaw?: number;
  /** Marks the prop as something the player can use. */
  readonly interactable?: InteractableId;
}

/**
 * A kit model placed by the centre of its footprint, standing on `position`,
 * at real-world scale.
 */
export function Prop({ model, position, yaw = 0, interactable }: PropProps) {
  const { scene } = useGLTF(url(model));
  const object = useMemo(() => {
    const copy = scene.clone(true);
    const box = new THREE.Box3().setFromObject(copy);
    const centre = box.getCenter(new THREE.Vector3());
    copy.position.set(-centre.x, -box.min.y, -centre.z);
    copy.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach(nightGrade);
        if (interactable) child.userData.interactable = interactable;
      }
    });
    const holder = new THREE.Group();
    holder.add(copy);
    return holder;
  }, [scene, interactable]);

  return (
    <primitive
      object={object}
      position={position as [number, number, number]}
      rotation={[0, yaw, 0]}
      scale={KIT_SCALE}
    />
  );
}

export const KIT_MODELS: readonly KitModel[] = [
  'desk',
  'chairDesk',
  'computerScreen',
  'computerKeyboard',
  'computerMouse',
  'lampSquareTable',
  'lampSquareCeiling',
  'bookcaseClosedWide',
  'bookcaseOpen',
  'books',
  'cardboardBoxClosed',
  'cardboardBoxOpen',
  'trashcan',
  'coatRackStanding',
  'pottedPlant',
  'radio',
  'televisionVintage',
  'table',
];

export function preloadKit(): void {
  for (const model of KIT_MODELS) useGLTF.preload(url(model));
}
