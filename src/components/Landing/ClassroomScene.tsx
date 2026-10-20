import React from 'react';
import { AnswerCardShape } from '../Library/AnswerCard';

type Letter = 'A' | 'B' | 'C' | 'D';

interface Student {
  x: number;
  skin: string;
  shirt: string;
  card?: { letter: Letter; tilt: number };
  tag?: string;
}

// Fileira de alunos vista pela câmera: quem levantou o cartão aparece lido
const students: Student[] = [
  { x: 150, skin: '#f0c19a', shirt: '#0a4d4a', card: { letter: 'B', tilt: -6 }, tag: '#01' },
  { x: 310, skin: '#9c6a46', shirt: '#d62839', card: { letter: 'B', tilt: 4 }, tag: '#02' },
  { x: 470, skin: '#e0a97c', shirt: '#f2a900' },
  { x: 630, skin: '#6f4630', shirt: '#0a4d4a', card: { letter: 'C', tilt: -3 }, tag: '#04' },
  { x: 790, skin: '#f0c19a', shirt: '#101820', card: { letter: 'B', tilt: 7 }, tag: '#05' },
  { x: 950, skin: '#b57a52', shirt: '#d62839', card: { letter: 'A', tilt: -5 }, tag: '#06' },
  { x: 1090, skin: '#e0a97c', shirt: '#0a4d4a' },
];

const Bracket: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <path
    d="M0 36V6a6 6 0 0 1 6-6h30"
    transform={`translate(${x} ${y}) rotate(${rot})`}
    fill="none"
    stroke="#f2a900"
    strokeWidth="6"
    strokeLinecap="round"
  />
);

export const ClassroomScene: React.FC = () => (
  <svg
    viewBox="0 0 1240 600"
    className="w-full h-auto"
    role="img"
    aria-label="Sala de aula: a pergunta é projetada, os alunos levantam cartões de papel e a câmera marca quem já respondeu."
  >
    {/* Projeção */}
    <rect x="320" y="20" width="600" height="270" rx="16" fill="#0a4d4a" />
    <text x="360" y="86" fontSize="30" fontWeight="800" fill="#ffffff" fontFamily="'Bricolage Grotesque Variable', sans-serif">
      Qual destes animais é um mamífero?
    </text>
    {(
      [
        ['A', 'Jacaré', 360, 114],
        ['B', 'Baleia', 650, 114],
        ['C', 'Sapo', 360, 200],
        ['D', 'Cobra', 650, 200],
      ] as const
    ).map(([letter, label, x, y]) => (
      <g key={letter} transform={`translate(${x} ${y})`}>
        <rect width="250" height="64" rx="12" fill={letter === 'B' ? '#f2a900' : 'rgba(255,255,255,0.12)'} />
        <text x="22" y="43" fontSize="30" fontWeight="800" fill={letter === 'B' ? '#101820' : '#ffffff'} fontFamily="'Bricolage Grotesque Variable', sans-serif">
          {letter}
        </text>
        <text x="64" y="42" fontSize="24" fontWeight="600" fill={letter === 'B' ? '#101820' : '#ffffff'} fontFamily="'Atkinson Hyperlegible Next Variable', sans-serif">
          {label}
        </text>
      </g>
    ))}

    {/* Câmera e feixe de leitura */}
    <g transform="translate(1040 40)">
      <rect width="120" height="74" rx="14" fill="#101820" />
      <circle cx="60" cy="37" r="22" fill="#e8f0ee" />
      <circle cx="60" cy="37" r="12" fill="#0a4d4a" />
      <rect x="40" y="74" width="40" height="14" fill="#101820" />
    </g>
    <text x="1100" y="150" textAnchor="middle" fontSize="20" fontWeight="700" fill="#101820" fontFamily="'Atkinson Hyperlegible Next Variable', sans-serif">
      câmera
    </text>

    {/* Enquadramento da câmera sobre a turma */}
    <Bracket x={40} y={300} rot={0} />
    <Bracket x={1200} y={300} rot={90} />
    <Bracket x={1200} y={590} rot={180} />
    <Bracket x={40} y={590} rot={270} />

    {/* Alunos */}
    {students.map((s) => (
      <g key={s.x}>
        {/* ombros e cabeça */}
        <path d={`M${s.x - 62} 600 v-60 a62 52 0 0 1 124 0 v60z`} fill={s.shirt} />
        <circle cx={s.x} cy="470" r="38" fill={s.skin} />
        {s.card ? (
          <>
            <rect x={s.x + 26} y="440" width="14" height="108" rx="7" fill={s.skin} transform={`rotate(8 ${s.x + 33} 548)`} />
            <g transform={`translate(${s.x - 22} 318) rotate(${s.card.tilt} 50 70) scale(0.9)`}>
              <AnswerCardShape letter={s.card.letter} />
            </g>
            <g transform={`translate(${s.x - 38} 296)`}>
              <rect width="76" height="26" rx="13" fill="#0a4d4a" />
              <text x="38" y="18" textAnchor="middle" fontSize="15" fontWeight="800" fill="#ffffff" fontFamily="'Atkinson Hyperlegible Next Variable', sans-serif">
                {s.tag} lido
              </text>
            </g>
          </>
        ) : (
          <g transform={`translate(${s.x - 44} 410)`} opacity="0.9">
            <rect width="88" height="26" rx="13" fill="none" stroke="#101820" strokeWidth="2" strokeDasharray="5 4" />
            <text x="44" y="18" textAnchor="middle" fontSize="14" fontWeight="700" fill="#101820" fontFamily="'Atkinson Hyperlegible Next Variable', sans-serif">
              ainda não
            </text>
          </g>
        )}
      </g>
    ))}
  </svg>
);
