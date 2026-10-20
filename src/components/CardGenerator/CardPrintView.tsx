import React, { useState } from 'react';
import { Student } from '../../types';
import { MARKER_PATTERNS_4X4 } from '../../services/arucoDetector';
import { Printer, Info } from 'lucide-react';

interface CardPrintViewProps {
  students: Student[];
}

export const CardPrintView: React.FC<CardPrintViewProps> = ({ students }) => {
  const [cardsPerPage, setCardsPerPage] = useState<2 | 4>(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Controles para o professor (ocultos na impressão) */}
      <div className="no-print bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Material para a turma
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
              Impressão dos cartões de resposta
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              As letras ficam pequenas nas bordas, assim quem está ao lado não vê o voto do colega.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-zinc-200 text-xs text-zinc-700">
              <button
                onClick={() => setCardsPerPage(2)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  cardsPerPage === 2
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                2 por folha
              </button>
              <button
                onClick={() => setCardsPerPage(4)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  cardsPerPage === 4
                    ? 'bg-white text-zinc-950 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                4 por folha
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-xs transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir cartões em PDF</span>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
          <Info className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <span className="leading-relaxed">
            Cada borda tem uma letra (A, B, C ou D). O aluno gira o cartão até a letra escolhida ficar em cima, já na posição de leitura.
          </span>
        </div>
      </div>

      {/* Grade de cartões de impressão */}
      <div
        className={`print:m-0 print:p-0 grid ${
          cardsPerPage === 2
            ? 'grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4'
        }`}
      >
        {students.map((student, index) => {
          const pattern =
            MARKER_PATTERNS_4X4[student.id] || MARKER_PATTERNS_4X4[1];
          const isPageBreak =
            cardsPerPage === 2
              ? (index + 1) % 2 === 0
              : (index + 1) % 4 === 0;

          return (
            <div
              key={student.id}
              className={`bg-white text-zinc-900 border border-dashed border-zinc-300 rounded-2xl p-5 flex flex-col items-center justify-between relative aspect-square select-none print:border-zinc-400 print:rounded-none print:shadow-none print:p-4 ${
                isPageBreak ? 'print-page-break' : ''
              }`}
              style={{ backgroundColor: '#ffffff' }}
            >
              {/* Borda superior: Letra A (leitura normal ao segurar com A para cima) */}
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-xs font-mono text-zinc-400">
                  #{String(student.id).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-400 hover:text-zinc-600 transition-colors">
                  A
                </span>
                <span className="text-xs text-zinc-400 truncate max-w-[110px]">
                  {student.name.split(' ')[0]}
                </span>
              </div>

              {/* Meio: Letra D na esquerda e Letra B na direita */}
              <div className="w-full flex items-center justify-between my-auto px-1 py-1">
                {/* Letra D: rotacionada -90 graus para ficar de pé quando o lado D for girado para cima */}
                <span className="text-xs sm:text-sm font-bold text-zinc-400 -rotate-90 origin-center">
                  D
                </span>

                {/* Marcador fiducial ArUco 4x4 */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 print:w-44 print:h-44 p-1 flex items-center justify-center bg-white">
                  <svg
                    viewBox="0 0 6 6"
                    className="w-full h-full"
                    shapeRendering="crispEdges"
                  >
                    <rect x="0" y="0" width="6" height="6" fill="#000000" />
                    {pattern.map((row, r) =>
                      row.map((bit, c) => (
                        <rect
                          key={`${r}-${c}`}
                          x={c + 1}
                          y={r + 1}
                          width="1"
                          height="1"
                          fill={bit === 1 ? '#ffffff' : '#000000'}
                        />
                      ))
                    )}
                  </svg>
                </div>

                {/* Letra B: rotacionada 90 graus para ficar de pé quando o lado B for girado para cima */}
                <span className="text-xs sm:text-sm font-bold text-zinc-400 rotate-90 origin-center">
                  B
                </span>
              </div>

              {/* Borda inferior: Letra C (rotacionada 180 graus para ficar de pé quando o lado C for girado para cima) */}
              <div className="w-full flex items-center justify-between px-2">
                <span className="text-xs text-zinc-300">
                  ClassPlay
                </span>
                {/* Letra C rotacionada 180 graus */}
                <span className="text-xs sm:text-sm font-bold text-zinc-400 rotate-180 origin-center">
                  C
                </span>
                <span className="text-xs text-zinc-300">
                  Cartão #{String(student.id).padStart(2, '0')}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
