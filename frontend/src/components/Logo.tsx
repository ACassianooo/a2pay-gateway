import React from 'react';

interface LogoProps {
  height?: number;
  /** Se true, o texto fica branco (para fundos escuros) */
  light?: boolean;
}

export default function Logo({ height = 36, light = false }: LogoProps) {
  const textColor = light ? '#ffffff' : '#0A0A18';
  // Proporção original: ícone ~40px + gap 10px + texto ~110px = ~160px wide a 40px tall
  const scale = height / 40;
  const totalWidth = Math.round(160 * scale);

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox="0 0 160 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Ícone: rounded square roxo */}
      <rect x="0" y="0" width="40" height="40" rx="10" fill="#7C3AED" />

      {/* Dois traços diagonais formando A abstrato */}
      {/* Traço esquerdo (diagonal /) */}
      <path d="M10 30 L18 10 L22 10 L14 30 Z" fill="white" />
      {/* Traço direito (diagonal \) */}
      <path d="M20 30 L28 10 L32 10 L24 30 Z" fill="white" />
      {/* Pé da letra A (barra horizontal) */}
      <path d="M13 24 L29 24 L28 27 L14 27 Z" fill="white" />

      {/* Texto A2Pay */}
      <text
        x="50"
        y="29"
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill={textColor}
        letterSpacing="-0.8"
      >
        A2Pay
      </text>
    </svg>
  );
}
