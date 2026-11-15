import React, { useState } from 'react';
import { Alternative, Student } from '../../types';

interface ResponseRosterProps {
  students: Student[];
  responses: Record<number, Alternative>;
  // Cartão lido agora há pouco: ganha destaque por um instante
  recentId?: number | null;
  // Correção manual: o professor clica no aluno e escolhe a alternativa
  onCorrect?: (studentId: number, option: Alternative) => void;
}

export const ResponseRoster: React.FC<ResponseRosterProps> = ({
  students,
  responses,
  recentId,
  onCorrect,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  // Os nomes ficam escondidos por padrão: a turma vê só os números dos cartões
  const [showNames, setShowNames] = useState(false);

  const answeredCount = Object.keys(responses).length;
  const totalCount = students.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <section className="bg-base-100 border border-base-300 rounded-[0.875rem] p-4 flex flex-col flex-1 min-h-0 gap-3">
      <div>
        <h2 className="text-[1.0625rem] font-semibold text-base-content">Respostas da turma</h2>
        <p className="font-display text-5xl font-bold tracking-tight text-base-content leading-none mt-2 tabular-nums" aria-live="polite">
          {answeredCount}
          <span className="text-2xl font-semibold text-base-content/70"> de {totalCount}</span>
        </p>
        <p className="text-base text-base-content/70 mt-1">já responderam</p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Alunos que já responderam"
        className="w-full h-3 rounded-full bg-[#e3e3e8] overflow-hidden"
      >
        <div className="h-full rounded-full bg-success motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Número de cada cartão: quem ainda não foi lido sabe que precisa levantar de novo */}
      <ul
        className={`grid gap-1.5 overflow-y-auto flex-1 pr-1 max-h-[340px] content-start ${
          showNames ? 'grid-cols-1' : 'grid-cols-5'
        }`}
      >
        {students.map((student) => {
          const hasAnswered = !!responses[student.id];
          const number = String(student.id).padStart(2, '0');

          const isRecent = recentId === student.id;

          return (
            <li
              key={student.id}
              title={student.name}
              className={`flex items-center gap-2 rounded-[0.625rem] font-display font-bold text-lg tabular-nums transition-transform ${
                showNames ? 'px-2.5 py-1.5' : 'justify-center h-11'
              } ${
                hasAnswered
                  ? 'bg-success text-success-content'
                  : 'bg-[#e3e3e8] text-base-content/75'
              } ${isRecent ? 'scale-110 ring-[3px] ring-black' : ''}`}
            >
              {onCorrect ? (
                <button
                  type="button"
                  onClick={() => setEditingId(editingId === student.id ? null : student.id)}
                  className="flex items-center gap-2 w-full h-full justify-center"
                  aria-label={`Corrigir resposta de ${student.name}`}
                >
                  <span>{number}</span>
                  {showNames && <span className="truncate font-medium text-sm">{student.name}</span>}
                </button>
              ) : (
                <>
                  <span>{number}</span>
                  {showNames && <span className="truncate font-medium text-sm">{student.name}</span>}
                </>
              )}
              <span className="sr-only">{hasAnswered ? 'respondeu' : 'ainda não respondeu'}</span>
            </li>
          );
        })}
      </ul>

      {onCorrect && editingId !== null && (
        <div className="no-print flex items-center gap-1.5 flex-wrap" role="group" aria-label="Corrigir resposta">
          <span className="text-base text-base-content/75">
            {students.find((x) => x.id === editingId)?.name}:
          </span>
          {(['A', 'B', 'C', 'D'] as Alternative[]).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onCorrect(editingId, opt);
                setEditingId(null);
              }}
              className={`w-11 h-11 rounded-[0.625rem] font-display font-bold text-lg ${responses[editingId] === opt ? 'bg-primary text-primary-content' : 'bg-[#e3e3e8] hover:bg-[#d8d8de]'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <label className="label cursor-pointer justify-start gap-2 py-0 no-print">
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={showNames}
          onChange={(e) => setShowNames(e.target.checked)}
        />
        <span className="label-text text-base text-base-content/80">Mostrar nomes</span>
      </label>
    </section>
  );
};
