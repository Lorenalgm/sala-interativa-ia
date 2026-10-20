import React from 'react';

// Padrões 4x4 de marcador desenhados à mão; ilustram o cartão, não são os marcadores lidos pela câmera
const patterns: Record<string, string> = {
  a: '1011010011100010',
  b: '0110110100111001',
  c: '1100001110100101',
  d: '0101101011010011',
};

interface AnswerCardProps {
  letter: 'A' | 'B' | 'C' | 'D';
  className?: string;
}

// Cartão de resposta impresso: marcador em cima, letra grande embaixo
export const AnswerCard: React.FC<AnswerCardProps> = ({ letter, className = '' }) => {
  const bits = patterns[letter.toLowerCase()];

  return (
    <svg viewBox="0 0 100 140" className={className} aria-hidden="true">
      <rect width="100" height="140" rx="7" fill="#ffffff" />
      <g transform="translate(20 13)">
        <rect width="60" height="60" fill="#101820" />
        {bits.split('').map((bit, i) =>
          bit === '1' ? (
            <rect
              key={i}
              x={10 + (i % 4) * 10}
              y={10 + Math.floor(i / 4) * 10}
              width="10"
              height="10"
              fill="#ffffff"
            />
          ) : null
        )}
      </g>
      <text
        x="50"
        y="121"
        textAnchor="middle"
        fontSize="46"
        fontWeight="800"
        fontFamily="'Bricolage Grotesque Variable', sans-serif"
        fill="#101820"
      >
        {letter}
      </text>
    </svg>
  );
};
