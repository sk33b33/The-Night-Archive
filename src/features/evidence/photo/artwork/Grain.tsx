/** Shared film-grain filter for drawn photographs. */
export function GrainFilter({ id, seed }: { readonly id: string; readonly seed: number }) {
  return (
    <filter id={id} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="noise" />
      <feColorMatrix type="saturate" values="0" in="noise" result="mono" />
      <feComponentTransfer in="mono" result="faint">
        <feFuncA type="linear" slope="0.2" />
      </feComponentTransfer>
      <feBlend in="SourceGraphic" in2="faint" mode="multiply" />
    </filter>
  );
}
