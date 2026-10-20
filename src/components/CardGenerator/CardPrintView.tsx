import React, { useMemo, useState } from 'react';
import { Student } from '../../types';
import { markerSvg } from '../../services/arucoDetector';
import { STUDENT_MARKERS, isStudentMarker } from '../../services/markerRanges';
import { Printer, Info, AlertTriangle } from 'lucide-react';

interface CardPrintViewProps {
  students: Student[];
}

// Só o quadrado preto do marcador: a folha branca já faz o papel da margem clara
const cropMarker = (svg: string) => svg.replace(/viewBox="[^"]*"/, 'viewBox="1 1 6 6"');

export const CardPrintView: React.FC<CardPrintViewProps> = ({ students }) => {
  const [cardsPerPage, setCardsPerPage] = useState<1 | 2>(1);

  const printable = students.filter((s) => isStudentMarker(s.id));
  const skipped = students.filter((s) => !isStudentMarker(s.id));

  // Marcador de ~18 cm (1 por folha, até ~8 m) ou ~12 cm (2 por folha, até ~5,5 m)
  const layout =
    cardsPerPage === 1
      ? { aspect: '210 / 297', markerW: 85.7, markerH: undefined as number | undefined, letter: 12, small: 3.4 }
      : { aspect: '210 / 148.5', markerW: 57.1, markerH: 80.8, letter: 5.5, small: 2.2 };

  const svgs = useMemo(
    () => Object.fromEntries(printable.map((s) => [s.id, cropMarker(markerSvg(s.id))])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [students]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Folha A4 sem margem de impressão: o cartão ocupa a página inteira */}
      <style>{`@media print { @page { margin: 0; size: A4 portrait; } }`}</style>

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
            Os cartões antigos não funcionam mais: reimprima todos.
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
          const pageBreak = cardsPerPage === 1 || (index + 1) % 2 === 0;
          const number = String(student.id).padStart(2, '0');
          const letterStyle = (extra: React.CSSProperties): React.CSSProperties => ({
            position: 'absolute',
            fontSize: `${layout.letter}cqw`,
            fontWeight: 800,
            lineHeight: 1,
            color: '#3f3f46',
            ...extra,
          });
          const gap = `${(layout.letter * 0.7).toFixed(2)}cqw`;

          return (
            <div
              key={student.id}
              className={`bg-white text-zinc-900 border border-dashed border-zinc-300 select-none relative overflow-hidden print:border-0 print:w-[210mm] ${
                cardsPerPage === 1 ? 'print:h-[297mm]' : 'print:h-[148.5mm]'
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
                  aspectRatio: '1',
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
