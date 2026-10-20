import React, { useMemo, useState } from 'react';
import { ArrowLeft, Info, Printer } from 'lucide-react';
import { markerSvg } from '../../services/arucoDetector';
import { PADDLE_MARKERS } from '../../services/markerRanges';
import { cropMarker } from '../CardGenerator/cropMarker';

interface PaddlePrintViewProps {
  groupCount: number;
  onBack: () => void;
}

// Marcador de 10 cm com 1 cm de borda branca: 12 cm de lado, 2 paletas por folha A4
const SIDE_MM = 120;

export const PaddlePrintView: React.FC<PaddlePrintViewProps> = ({ groupCount, onBack }) => {
  const max = PADDLE_MARKERS.max - PADDLE_MARKERS.min + 1;
  const [count, setCount] = useState(Math.min(max, Math.max(2, groupCount)));
  const ids = Array.from({ length: count }, (_, i) => PADDLE_MARKERS.min + i);
  const svgs = useMemo(
    () => Object.fromEntries(ids.map((id) => [id, cropMarker(markerSvg(id))])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [count]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 print:max-w-none print:m-0 print:p-0 print:space-y-0">
      <style>{`@page { size: A4 portrait; margin: 10mm; }`}</style>

      <div className="no-print space-y-4">
        <button onClick={onBack} className="btn btn-sm rounded-full">
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Impressão das paletas</h1>
            <p className="text-sm text-base-content/70 mt-1">
              Uma paleta por grupo, duas por folha. Cada uma tem o número do grupo.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold">
              Paletas
              <input
                type="number"
                min={1}
                max={max}
                value={count}
                onChange={(e) => setCount(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
                className="input input-sm input-bordered w-20"
              />
            </label>
            <button onClick={() => window.print()} className="btn btn-sm btn-primary">
              <Printer className="w-4 h-4" />
              Imprimir em PDF
            </button>
          </div>
        </div>
        <div role="note" className="alert items-start bg-amber-50 border-amber-200 text-amber-950 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 text-amber-700" />
          <span className="leading-relaxed">
            Imprima em escala 100%, papel fosco, sem plástico (reflete a luz do datashow). Cole em papelão
            rígido com um cabo, como uma régua. O marcador mede 10 cm; a borda branca de 1 cm precisa
            ficar livre. O aluno segura a paleta com a face voltada para o quadro.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-1 print:gap-0">
        {ids.map((id, index) => {
          const pageBreak = index < ids.length - 1 && (index + 1) % 2 === 0;
          return (
            <div
              key={id}
              className={`bg-white text-zinc-900 border border-dashed border-zinc-300 flex flex-col items-center justify-center gap-[4mm] py-[6mm] print:border-0 print:w-[190mm] print:h-[138mm] ${
                pageBreak ? 'print-page-break' : ''
              }`}
            >
              <div
                aria-label={`Marcador da paleta ${index + 1}`}
                className="[&>svg]:w-full [&>svg]:h-full bg-white"
                style={{ width: `${SIDE_MM}mm`, height: `${SIDE_MM}mm`, maxWidth: '100%', padding: '10mm', boxSizing: 'border-box' }}
                dangerouslySetInnerHTML={{ __html: svgs[id] }}
              />
              <span className="text-lg font-bold text-zinc-600">
                Paleta {index + 1} · #{id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
