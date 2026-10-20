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
    <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
        <div>
          <h3 className="text-xs font-bold text-zinc-950 uppercase tracking-wide">
            Respostas da turma
          </h3>
          <span className="text-[11px] text-zinc-400">
            Cartões captados pela câmera
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-zinc-800">
            {answeredCount}/{totalCount}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 font-bold">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="bg-amber-400 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 overflow-y-auto flex-1 pr-1 max-h-[340px]">
        {students.map((student) => {
          const hasAnswered = !!responses[student.id];

          return (
            <div
              key={student.id}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs transition-all ${
                hasAnswered
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                  : 'bg-stone-50/80 border-zinc-200/70 text-zinc-500'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-5 h-5 flex-shrink-0 flex items-center justify-center rounded text-[10px] font-bold font-mono ${
                    hasAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-200 text-zinc-600'
                  }`}
                >
                  {String(student.id).padStart(2, '0')}
                </span>
                <span className="truncate text-[11px]">
                  {student.name}
                </span>
              </div>

              {hasAnswered ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <User className="w-3 h-3 text-zinc-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
