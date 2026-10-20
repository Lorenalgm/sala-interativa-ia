import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, Users } from 'lucide-react';
import { GroupFormation, Question, Student } from '../../types';
import { Homography } from '../../services/homography';
import { PADDLE_MARKERS } from '../../services/markerRanges';
import { GroupSetup } from '../Conduct/GroupSetup';
import { HandCalibration } from './HandCalibration';
import { BoardCalibration } from './BoardCalibration';
import { BoardPlayer, BoardTurnResult } from './BoardPlayer';
import { PaddlePrintView } from './PaddlePrintView';
import { BoardInputSettings } from './boardInput';

interface BoardFlowProps {
  questions: Question[];
  students: Student[];
  onBack: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onRoundProgressChange: (inProgress: boolean) => void;
}

type Stage = 'setup' | 'print' | 'groups' | 'calibrate' | 'handcal' | 'play' | 'summary';

const MAX_GROUPS = PADDLE_MARKERS.max - PADDLE_MARKERS.min + 1;

// Etapas do roteiro da lousa: perguntas, grupos, calibração, rodada e resumo
export const BoardFlow: React.FC<BoardFlowProps> = ({
  questions,
  students,
  onBack,
  onCameraStatusChange,
  onRoundProgressChange,
}) => {
  const [stage, setStage] = useState<Stage>('setup');
  const [selected, setSelected] = useState<string[]>(() => questions.map((q) => q.id));
  const [formation, setFormation] = useState<GroupFormation | null>(null);
  const [homography, setHomography] = useState<Homography | null>(null);
  const [settings, setSettings] = useState<BoardInputSettings>({ input: 'paddle', click: 'pinch' });
  const [results, setResults] = useState<BoardTurnResult[]>([]);

  useEffect(() => {
    onRoundProgressChange(stage === 'play');
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  const chosen = questions.filter((q) => selected.includes(q.id));
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (stage === 'print') {
    return <PaddlePrintView groupCount={formation?.groups.length ?? 4} onBack={() => setStage('setup')} />;
  }

  if (stage === 'groups') {
    return (
      <GroupSetup
        students={students}
        onBack={() => setStage('setup')}
        onStart={(f) => {
          setFormation(f);
          setStage('calibrate');
        }}
      />
    );
  }

  if (stage === 'calibrate' && formation) {
    return (
      <BoardCalibration
        input={settings.input}
        onBack={() => setStage('groups')}
        onCameraStatusChange={onCameraStatusChange}
        onDone={(h) => {
          setHomography(h);
          setResults([]);
          setStage(settings.input === 'hand' ? 'handcal' : 'play');
        }}
      />
    );
  }

  if (stage === 'handcal' && homography) {
    return (
      <HandCalibration
        baseHomography={homography}
        onBack={() => setStage('calibrate')}
        onCameraStatusChange={onCameraStatusChange}
        onDone={(h) => {
          setHomography(h);
          setStage('play');
        }}
      />
    );
  }

  if (stage === 'play' && formation && homography) {
    return (
      <BoardPlayer
        settings={settings}
        questions={chosen}
        groups={formation.groups}
        homography={homography}
        onCameraStatusChange={onCameraStatusChange}
        onExit={() => setStage('setup')}
        onFinish={(r) => {
          setResults(r);
          setStage('summary');
        }}
      />
    );
  }

  if (stage === 'summary' && formation) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Resultado da lousa</h1>
          <p className="text-sm text-base-content/70 mt-1">Por grupo e por pergunta, sem ranking.</p>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formation.groups.map((g) => {
            const own = results.filter((r) => r.groupId === g.id);
            if (own.length === 0) return null;
            const first = own.filter((r) => r.firstTry).length;
            const second = own.filter((r) => r.correct && !r.firstTry).length;
            const wrong = own.filter((r) => !r.correct).length;
            return (
              <div key={g.id} className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
                <h2 className="font-bold text-lg">{g.name}</h2>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-green-100 text-green-900 py-2">
                    <p className="text-3xl font-extrabold leading-none">{first}</p>
                    <p className="text-sm font-semibold mt-1">de primeira</p>
                  </div>
                  <div className="rounded-lg bg-amber-100 text-amber-900 py-2">
                    <p className="text-3xl font-extrabold leading-none">{second}</p>
                    <p className="text-sm font-semibold mt-1">na 2ª tentativa</p>
                  </div>
                  <div className="rounded-lg bg-red-100 text-red-900 py-2">
                    <p className="text-3xl font-extrabold leading-none">{wrong}</p>
                    <p className="text-sm font-semibold mt-1">não acertou</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
          <h2 className="font-bold">Perguntas</h2>
          <ol className="space-y-2">
            {results.map((r, i) => (
              <li key={r.questionId + i} className="flex items-start gap-3">
                <span
                  className={`badge badge-lg font-semibold flex-shrink-0 whitespace-nowrap ${
                    r.firstTry ? 'badge-success' : r.correct ? 'badge-warning' : 'badge-error'
                  }`}
                >
                  {r.firstTry ? 'De primeira' : r.correct ? 'Na 2ª tentativa' : 'Não acertou'}
                </span>
                <span>
                  <span className="font-semibold">{r.groupName}:</span> {r.prompt}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex gap-2">
          <button onClick={() => setStage('setup')} className="btn btn-primary">
            Nova rodada
          </button>
          <button onClick={onBack} className="btn">
            Voltar ao roteiro
          </button>
        </div>
      </div>
    );
  }

  const groupsFull = formation && formation.groups.length > MAX_GROUPS;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <button onClick={onBack} className="btn btn-sm rounded-full mb-3">
          <ArrowLeft className="w-3.5 h-3.5" />
          Roteiro
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Quiz no quadro</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Escolha as perguntas. Depois você monta os grupos, calibra a câmera e começa no datashow.
        </p>
      </div>

      <section className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
        <h2 className="font-bold">
          Perguntas ({chosen.length} de {questions.length})
        </h2>
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm mt-1"
                  checked={selected.includes(q.id)}
                  onChange={() => toggle(q.id)}
                />
                <span>{q.prompt}</span>
              </label>
            </li>
          ))}
        </ul>
        {questions.length === 0 && (
          <p className="text-sm text-base-content/70">
            Cadastre perguntas em "Preparar aula" de outro roteiro antes de usar a lousa.
          </p>
        )}
      </section>

      {groupsFull && (
        <p role="alert" className="text-sm text-red-800">
          A lousa tem paletas para até {MAX_GROUPS} grupos. Monte os grupos de novo com menos grupos.
        </p>
      )}

      <section className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
        <h2 className="font-bold">Como o grupo aponta</h2>
        <div className="join" role="group" aria-label="Forma de apontar">
          {([['paddle', 'Paleta de papel'], ['hand', 'Mão']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setSettings((s) => ({ ...s, input: value }))}
              aria-pressed={settings.input === value}
              className={`btn btn-sm join-item ${settings.input === value ? 'btn-neutral' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
        {settings.input === 'hand' && (
          <div className="space-y-2">
            <p className="text-sm text-base-content/70">
              A mão inteira é o mouse: o centro da palma move o ponto. Sem nada para imprimir.
            </p>
            <div className="join" role="group" aria-label="Como clicar">
              {([['pinch', 'Clicar juntando polegar e indicador'], ['dwell', 'Clicar parando 1 s']] as const).map(
                ([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setSettings((s) => ({ ...s, click: value }))}
                    aria-pressed={settings.click === value}
                    className={`btn btn-sm join-item ${settings.click === value ? 'btn-neutral' : ''}`}
                  >
                    {label}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {settings.input === 'paddle' && (
          <button onClick={() => setStage('print')} className="btn">
            <Printer className="w-4 h-4" />
            Imprimir paletas
          </button>
        )}
        <button onClick={() => setStage('groups')} disabled={chosen.length === 0} className="btn btn-primary">
          <Users className="w-4 h-4" />
          Montar os grupos
        </button>
      </div>
    </div>
  );
};
