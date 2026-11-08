/** A sealed internal-mail envelope, lying where the papers sit at position 7. */
export function Envelope({ ink = '#5a4630' }: { readonly ink?: string }) {
  return (
    <g>
      <path d="M40 202 L106 196 L110 234 L44 240 Z" fill="#c8a978" />
      <path d="M40 202 L76 220 L106 196" stroke={ink} strokeWidth="1.2" fill="none" />
      <circle cx="76" cy="221" r="3" fill="#7a2f22" />
      <path d="M50 230 L86 227" stroke={ink} strokeWidth="1" />
    </g>
  );
}
