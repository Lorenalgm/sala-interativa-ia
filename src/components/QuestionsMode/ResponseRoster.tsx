import React from 'react';
import { Alternative, Student } from '../../types';
import { CheckCircle2, User } from 'lucide-react';

interface ResponseRosterProps {
  students: Student[];
  responses: Record<number, Alternative>;
}

export const ResponseRoster: React.FC<ResponseRosterProps> = ({
  students,
  responses,
}) => {
  const answeredCount = Object.keys(responses).length;
  const totalCount = students.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-4 shadow-sm flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-base-300/60">
        <div>
          <h3 className="text-xs font-bold text-base-content uppercase tracking-wide">
            Respostas da turma
          </h3>
          <span className="text-xs text-base-content/60">
            Cartões captados pela câmera
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-base-content">
            {answeredCount}/{totalCount}
          </span>
          <span className="badge badge-primary badge-sm font-bold">
            {progressPercent}%
          </span>
        </div>
      </div>

      <progress
        className="progress progress-primary w-full h-1.5 mb-3"
        value={progressPercent}
        max={100}
        aria-label="Alunos que já responderam"
      />

      <div className="grid grid-cols-2 gap-1.5 overflow-y-auto flex-1 pr-1 max-h-[340px]">
        {students.map((student) => {
          const hasAnswered = !!responses[student.id];

          return (
            <div
              key={student.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs transition-all ${
                hasAnswered
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                  : 'bg-base-200/80 border-base-300 text-base-content/60'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-xs font-bold font-mono ${
                    hasAnswered
                      ? 'bg-success text-success-content'
                      : 'bg-base-300 text-base-content/70'
                  }`}
                >
                  {String(student.id).padStart(2, '0')}
                </span>
                <span className="truncate text-xs">
                  {student.name}
                </span>
              </div>

              {hasAnswered ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
              ) : (
                <User className="w-3 h-3 text-base-content/40 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
