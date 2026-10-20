import React, { useState } from 'react';
import { Alternative, Student } from '../../types';

interface ResponseRosterProps {
  students: Student[];
  responses: Record<number, Alternative>;
}

export const ResponseRoster: React.FC<ResponseRosterProps> = ({
  students,
  responses,
}) => {
  // Os nomes ficam escondidos por padrão: a turma vê só os números dos cartões
  const [showNames, setShowNames] = useState(false);

  const answeredCount = Object.keys(responses).length;
  const totalCount = students.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <section className="bg-base-100 border border-base-300 rounded-box p-4 flex flex-col flex-1 min-h-0 gap-3">
      <div>
        <h2 className="text-base font-bold text-base-content">Respostas da turma</h2>
        <p className="text-4xl font-extrabold text-base-content leading-none mt-2" aria-live="polite">
          {answeredCount}
          <span className="text-xl font-bold text-base-content/70"> de {totalCount}</span>
        </p>
        <p className="text-base text-base-content/70 mt-1">já responderam</p>
      </div>

      <progress
        className="progress progress-primary w-full h-3"
        value={progressPercent}
        max={100}
        aria-label="Alunos que já responderam"
      />

      {/* Número de cada cartão: quem ainda não foi lido sabe que precisa levantar de novo */}
      <ul
        className={`grid gap-1.5 overflow-y-auto flex-1 pr-1 max-h-[340px] content-start ${
          showNames ? 'grid-cols-1' : 'grid-cols-5'
        }`}
      >
        {students.map((student) => {
          const hasAnswered = !!responses[student.id];
          const number = String(student.id).padStart(2, '0');

          return (
            <li
              key={student.id}
              title={student.name}
              className={`flex items-center gap-2 rounded-btn font-bold text-base ${
                showNames ? 'px-2 py-1' : 'justify-center h-10'
              } ${
                hasAnswered
                  ? 'bg-success text-success-content'
                  : 'bg-base-200 text-base-content/70'
              }`}
            >
              <span>{number}</span>
              {showNames && (
                <span className="truncate font-medium text-sm">{student.name}</span>
              )}
              <span className="sr-only">{hasAnswered ? 'respondeu' : 'ainda não respondeu'}</span>
            </li>
          );
        })}
      </ul>

      <label className="label cursor-pointer justify-start gap-2 py-0 no-print">
        <input
          type="checkbox"
          className="toggle toggle-sm"
          checked={showNames}
          onChange={(e) => setShowNames(e.target.checked)}
        />
        <span className="label-text text-sm text-base-content/70">Mostrar nomes</span>
      </label>
    </section>
  );
};
