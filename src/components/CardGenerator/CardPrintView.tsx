import React, { useMemo, useState } from 'react';
import { Student } from '../../types';
import { markerSvg } from '../../services/arucoDetector';
import { STUDENT_MARKERS, isStudentMarker } from '../../services/markerRanges';
import { AlertTriangle, Check, Printer, RotateCw, ScanLine } from 'lucide-react';
import { cropMarker } from './cropMarker';

interface CardPrintViewProps {
  students: Student[];
  initialPerPage?: 1 | 2;
  // Alunos já marcados ao abrir (ex.: reimprimir um cartão perdido). Sem isso, todos
  initialSelected?: number[] | null;
}

const tips = [
  { icon: Printer, text: 'Imprima em escala 100%, sem "ajustar à página", em papel fosco e sem plástico.' },
  { icon: RotateCw, text: 'O aluno gira o cartão até a letra escolhida ficar em cima e levanta acima da cabeça.' },
  { icon: ScanLine, text: 'As letras ficam pequenas na margem de propósito: o colega do lado não vê o voto.' },
];

export const CardPrintView: React.FC<CardPrintViewProps> = ({ students, initialPerPage = 1, initialSelected = null }) => {
  const [cardsPerPage, setCardsPerPage] = useState<1 | 2>(initialPerPage);

  const allPrintable = students.filter((s) => isStudentMarker(s.id));
  const skipped = students.filter((s) => !isStudentMarker(s.id));
  const [selected, setSelected] = useState<Set<number>>(
    () => new Set(initialSelected && initialSelected.length > 0 ? initialSelected : allPrintable.map((s) => s.id))
  );
  const printable = allPrintable.filter((s) => selected.has(s.id));
  const sheets = Math.ceil(printable.length / cardsPerPage);
  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      {/* Área útil da folha: 190 x 277 mm. O cartão cabe nela, senão cada cartão vira duas páginas */}
      <style>{`@page { size: A4 portrait; margin: 10mm; }`}</style>

      <div className="no-print space-y-8">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="space-y-2">
            <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">
              Cartões de resposta
            </h1>
            <p className="text-lg text-base-content/75">
              {printable.length} {printable.length === 1 ? 'cartão' : 'cartões'} em {sheets}{' '}
              {sheets === 1 ? 'folha' : 'folhas'} A4.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Controle segmentado: tamanho do cartão pela distância até a câmera */}
            <div role="radiogroup" aria-label="Cartões por folha" className="inline-flex rounded-[0.75rem] bg-[#e3e3e8] p-1 gap-1">
              {([
                [1, '1 por folha', 'até 8 m'],
                [2, '2 por folha', 'até 5,5 m'],
              ] as const).map(([n, label, reach]) => {
                const active = cardsPerPage === n;
                return (
                  <button
                    key={n}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setCardsPerPage(n)}
                    className={`min-h-[2.75rem] rounded-[0.5625rem] px-4 text-base font-semibold ${
                      active ? 'bg-primary text-primary-content shadow-[0_1px_3px_rgb(0_0_0/0.25)]' : 'hover:bg-black/5'
                    }`}
                  >
                    {label} <span className={active ? 'font-normal opacity-85' : 'font-normal text-base-content/70'}>· {reach}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => window.print()}
              disabled={printable.length === 0}
              className="inline-flex items-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd] disabled:bg-[#e3e3e8] disabled:text-base-content/45"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Imprimir
            </button>
          </div>
        </header>

        <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
          {tips.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-3 pl-4">
              <span className="shrink-0 w-8 h-8 rounded-[0.5rem] bg-[#636366] text-white flex items-center justify-center" aria-hidden="true">
                <Icon className="w-[1.125rem] h-[1.125rem]" />
              </span>
              <span className={`flex-1 min-h-[3.25rem] py-3 pr-4 flex items-center text-[1.0625rem] ${i > 0 ? 'border-t border-base-300' : ''}`}>
                {text}
              </span>
            </li>
          ))}
        </ul>

        {skipped.length > 0 && (
          <p role="alert" className="flex items-start gap-3 rounded-[0.875rem] bg-red-100 text-red-950 px-4 py-3 text-base">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
            Os cartões de aluno vão de {STUDENT_MARKERS.min} a {STUDENT_MARKERS.max}. Sem cartão:{' '}
            {skipped.map((s) => `${s.name} (#${s.id})`).join(', ')}.
          </p>
        )}

        {/* Quem imprimir: todos marcados; um toque tira da impressão */}
        <section aria-labelledby="quem-imprimir" className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4">
            <h2 id="quem-imprimir" className="text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">
              Quem imprimir · {printable.length} de {allPrintable.length}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setSelected(new Set(allPrintable.map((s) => s.id)))} className="min-h-[2.75rem] px-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
                Marcar todos
              </button>
              <button onClick={() => setSelected(new Set())} className="min-h-[2.75rem] px-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
                Desmarcar todos
              </button>
            </div>
          </div>
          <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 p-4 flex flex-wrap gap-2">
            {allPrintable.map((s) => {
              const on = selected.has(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => toggle(s.id)}
                    className={`inline-flex items-center gap-2 min-h-[2.75rem] pl-2 pr-4 rounded-full border text-base font-medium ${
                      on ? 'bg-base-100 border-base-300 hover:bg-black/[0.03]' : 'bg-base-200 border-base-300 text-base-content/55'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        on ? 'bg-primary text-primary-content' : 'border-2 border-[#aeaeb2]'
                      }`}
                      aria-hidden="true"
                    >
                      {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                    </span>
                    <span className="font-display font-bold">#{String(s.id).padStart(2, '0')}</span>
                    {s.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <h2 className="px-4 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">Prévia</h2>
      </div>

      <div
        className={`print:m-0 print:p-0 grid ${
          cardsPerPage === 1
            ? 'grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-6 print:grid-cols-1 print:gap-0'
            : 'grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-6 print:grid-cols-1 print:gap-0'
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
              className={`bg-white text-zinc-900 rounded-[0.25rem] shadow-[0_8px_18px_-10px_rgb(0_0_0/0.45)] ring-1 ring-black/10 select-none relative overflow-hidden print:rounded-none print:shadow-none print:ring-0 print:w-[190mm] ${
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
