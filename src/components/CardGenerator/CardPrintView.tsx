import React, { useMemo, useState } from 'react';
import { Student } from '../../types';
import { markerSvg } from '../../services/arucoDetector';
import { STUDENT_MARKERS, isStudentMarker } from '../../services/markerRanges';
import { Printer, Info, AlertTriangle } from 'lucide-react';

interface CardPrintViewProps {
  students: Student[];
  initialPerPage?: 1 | 2;
}

// Só o quadrado preto do marcador: a folha branca já faz o papel da margem clara.
// As células brancas viram um único traçado, para a impressão não mostrar fios entre elas.
const cropMarker = (svg: string) => {
  const cells = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="1" height="1" fill="white"\/>/g)];
  const path = cells.map((m) => `M${m[1]} ${m[2]}h1v1h-1z`).join('');
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="1 1 6 6" shape-rendering="crispEdges">' +
    '<rect x="1" y="1" width="6" height="6" fill="black"/>' +
    `<path d="${path}" fill="white"/></svg>`
  );
};

export const CardPrintView: React.FC<CardPrintViewProps> = ({ students, initialPerPage = 1 }) => {
  const [cardsPerPage, setCardsPerPage] = useState<1 | 2>(initialPerPage);

  const printable = students.filter((s) => isStudentMarker(s.id));
  const skipped = students.filter((s) => !isStudentMarker(s.id));

  // Marcador de ~17 cm (1 por folha, até ~8 m) ou ~12 cm (2 por folha, até ~5,5 m).
  // As letras são pequenas de propósito: o colega do lado não deve conseguir ler o voto.
  const layout =
    cardsPerPage === 1
      ? { aspect: '190 / 276', markerW: 89.5, letter: 2.6, small: 2.2 }
      : { aspect: '190 / 138', markerW: 59, letter: 2.6, small: 2.2 };

  const svgs = useMemo(
    () => Object.fromEntries(printable.map((s) => [s.id, cropMarker(markerSvg(s.id))])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [students]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      {/* Área útil da folha: 190 x 277 mm. O cartão cabe nela, senão cada cartão vira duas páginas */}
      <style>{`@page { size: A4 portrait; margin: 10mm; }`}</style>

      <div className="no-print bg-base-100 border border-base-300 rounded-box p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
              Impressão dos cartões de resposta
            </h1>
            <p className="text-sm text-base-content/70 mt-1">
              As letras ficam nas margens, assim quem está ao lado não vê o voto do colega.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="join" role="group" aria-label="Cartões por folha">
              <button
                onClick={() => setCardsPerPage(1)}
                aria-pressed={cardsPerPage === 1}
                className={`btn btn-sm join-item ${cardsPerPage === 1 ? 'btn-neutral' : ''}`}
              >
                1 por folha (até 8 m)
              </button>
              <button
                onClick={() => setCardsPerPage(2)}
                aria-pressed={cardsPerPage === 2}
                className={`btn btn-sm join-item ${cardsPerPage === 2 ? 'btn-neutral' : ''}`}
              >
                2 por folha (até 5,5 m)
              </button>
            </div>

            <button onClick={() => window.print()} className="btn btn-sm btn-primary">
              <Printer className="w-4 h-4" />
              <span>Imprimir cartões em PDF</span>
            </button>
          </div>
        </div>

        <div role="note" className="alert items-start bg-amber-50 border-amber-200 text-amber-950 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 text-amber-700" />
          <span className="leading-relaxed">
            O aluno gira o cartão até a letra escolhida ficar em cima e levanta acima da cabeça.
            Use papel fosco, sem plástico, e imprima em escala 100% (sem "ajustar à página").
          </span>
        </div>

        {skipped.length > 0 && (
          <div role="alert" className="alert items-start bg-red-50 border-red-200 text-red-950 text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-700" />
            <span className="leading-relaxed">
              Os cartões de aluno vão de {STUDENT_MARKERS.min} a {STUDENT_MARKERS.max}. Sem cartão:{' '}
              {skipped.map((s) => `${s.name} (#${s.id})`).join(', ')}.
            </span>
          </div>
        )}
      </div>

      <div
        className={`print:m-0 print:p-0 grid ${
          cardsPerPage === 1
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:grid-cols-1 print:gap-0'
            : 'grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-1 print:gap-0'
        }`}
      >
        {printable.map((student, index) => {
          // Sem quebra depois do último cartão: evita uma página em branco no fim
          const pageBreak =
            index < printable.length - 1 && (cardsPerPage === 1 || (index + 1) % 2 === 0);
          const number = String(student.id).padStart(2, '0');
          const letterStyle = (extra: React.CSSProperties): React.CSSProperties => ({
            position: 'absolute',
            fontSize: `${layout.letter}cqw`,
            fontWeight: 600,
            lineHeight: 1,
            color: '#71717a',
            ...extra,
          });
          const gap = '3cqw';

          return (
            <div
              key={student.id}
              className={`bg-white text-zinc-900 border border-dashed border-zinc-300 select-none relative overflow-hidden print:border-0 print:w-[190mm] ${
                cardsPerPage === 1 ? 'print:h-[276mm]' : 'print:h-[138mm]'
              } ${pageBreak ? 'print-page-break' : ''}`}
              style={{ aspectRatio: layout.aspect, containerType: 'inline-size', backgroundColor: '#ffffff' }}
            >
              <div
                aria-label={`Marcador do cartão ${number}`}
                className="absolute [&>svg]:w-full [&>svg]:h-full"
                style={{
                  left: '50%',
                  top: '50%',
                  width: `${layout.markerW}cqw`,
                  height: `${layout.markerW}cqw`,
                  transform: 'translate(-50%, -50%)',
                }}
                dangerouslySetInnerHTML={{ __html: svgs[student.id] }}
              />

              <span style={letterStyle({ top: gap, left: '50%', transform: 'translateX(-50%)' })}>A</span>
              <span style={letterStyle({ bottom: gap, left: '50%', transform: 'translateX(-50%) rotate(180deg)' })}>C</span>
              <span style={letterStyle({ left: `${(100 - layout.markerW) / 4}cqw`, top: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' })}>D</span>
              <span style={letterStyle({ right: `${(100 - layout.markerW) / 4}cqw`, top: '50%', transform: 'translate(50%, -50%) rotate(90deg)' })}>B</span>

              <span
                style={{ position: 'absolute', top: '2cqw', left: '2.5cqw', fontSize: `${layout.small}cqw`, color: '#71717a' }}
              >
                #{number} · {student.name.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
