import React, { useState } from 'react';
import { Student } from '../../types';
import { MasteryResult } from '../../services/mastery';
import { studentRecommendations } from '../../services/recommendations';
import { LevelBadge, RecommendationList, Sparkline } from './MasteryShared';

interface StudentMasteryProps {
  result: MasteryResult;
  students: Student[];
  label: (s: Student) => string;
}

export const StudentMastery: React.FC<StudentMasteryProps> = ({ result, students, label }) => {
  const [selectedId, setSelectedId] = useState<number>(students[0]?.id ?? 0);
  const student = students.find((s) => s.id === selectedId) ?? students[0];
  const row = result.students.find((r) => r.studentId === student?.id);
  const skills = row ? Object.values(row.skills).sort((a, b) => a.skill.localeCompare(b.skill, 'pt-BR')) : [];

  if (!student) return <p className="text-base-content/70">A turma não tem alunos.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      <nav aria-label="Alunos" className="bg-base-100 border border-base-300 rounded-box p-2 max-h-[32rem] overflow-y-auto">
        <ul className="space-y-1">
          {students.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedId(s.id)}
                aria-current={s.id === student.id ? 'true' : undefined}
                className={`btn btn-sm w-full justify-start ${s.id === student.id ? 'btn-neutral' : 'btn-ghost'}`}
              >
                {label(s)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="lg:col-span-3 space-y-4">
        <h2 className="text-2xl font-extrabold">{label(student)}</h2>

        {skills.length === 0 ? (
          <p className="bg-base-100 border border-base-300 rounded-box p-6 text-base-content/70">
            Este aluno ainda não tem respostas registradas.
          </p>
        ) : (
          <ul className="space-y-3">
            {skills.map((m) => (
              <li key={m.skill} className="bg-base-100 border border-base-300 rounded-box p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{m.skill}</h3>
                  <p className="text-sm text-base-content/70">
                    {m.correct} certas em {m.answers} respostas
                    {m.level === 'nodata' && ' (faltam respostas para estimar)'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Sparkline history={m.history} />
                  <LevelBadge level={m.level} mastery={m.mastery} />
                </div>
              </li>
            ))}
          </ul>
        )}

        <RecommendationList items={row ? studentRecommendations(row, result.skills) : []} nameOf={() => ''} />
      </div>
    </div>
  );
};
