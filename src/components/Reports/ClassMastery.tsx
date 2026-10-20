import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Student } from '../../types';
import { MasteryResult } from '../../services/mastery';
import { classRecommendations, mixedFormation } from '../../services/recommendations';
import { loadClassroom, saveFormation } from '../../services/storageService';
import { DifficultyBadge, LevelBadge, RecommendationList } from './MasteryShared';

interface ClassMasteryProps {
  result: MasteryResult;
  students: Student[];
  label: (s: Student) => string;
}

export const ClassMastery: React.FC<ClassMasteryProps> = ({ result, students, label }) => {
  const [saved, setSaved] = useState<3 | 4 | null>(null);
  const nameOf = (id: number) => {
    const s = students.find((x) => x.id === id);
    return s ? label(s) : `#${id}`;
  };

  const useMixedGroups = (size: 3 | 4) => {
    saveFormation(mixedFormation(result, students, size, loadClassroom().id));
    setSaved(size);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {result.skills.map((s) => {
          const total = s.studentsWithData || 1;
          const seg = (n: number) => `${(n / total) * 100}%`;
          return (
            <section key={s.skill} className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-extrabold">{s.skill}</h3>
                <DifficultyBadge difficulty={s.difficulty} />
              </div>
              <p className="text-base text-base-content/80">
                <strong className="text-2xl font-extrabold text-base-content">{s.accuracy}%</strong> de acerto em {s.totalAnswers} respostas
              </p>
              {s.studentsWithData > 0 ? (
                <>
                  <div className="flex h-3 rounded-full overflow-hidden bg-base-200" role="img" aria-label={`${s.counts.reinforce} em reforço, ${s.counts.progress} em progresso, ${s.counts.mastered} dominando`}>
                    <span style={{ width: seg(s.counts.reinforce) }} className="bg-red-500" />
                    <span style={{ width: seg(s.counts.progress) }} className="bg-amber-400" />
                    <span style={{ width: seg(s.counts.mastered) }} className="bg-emerald-500" />
                  </div>
                  <p className="text-sm text-base-content/80">
                    {s.counts.reinforce} em reforço · {s.counts.progress} em progresso · {s.counts.mastered} dominando
                    {s.counts.nodata > 0 && ` · ${s.counts.nodata} sem dados`}
                  </p>
                </>
              ) : (
                <p className="text-sm text-base-content/70">Ainda faltam respostas para estimar (mínimo de 3 por aluno).</p>
              )}
            </section>
          );
        })}
      </div>

      <RecommendationList items={classRecommendations(result)} nameOf={nameOf} />

      <section className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3">
        <h2 className="font-bold flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-700" aria-hidden="true" />
          Grupos que misturam níveis
        </h2>
        <p className="text-sm text-base-content/70">
          Cada grupo recebe alunos de todas as faixas de domínio. A formação fica salva para o roteiro Grupo com sorteio.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => useMixedGroups(3)} className="btn btn-sm">Grupos de 3</button>
          <button onClick={() => useMixedGroups(4)} className="btn btn-sm">Grupos de 4</button>
          {saved && (
            <span role="status" className="text-sm text-success font-semibold">
              Formação de {saved} salva. No roteiro de grupo, use "Reaproveitar última formação".
            </span>
          )}
        </div>
      </section>

      <section className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3">
        <h2 className="font-bold">Aluno × habilidade</h2>
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Aluno</th>
                {result.skills.map((s) => (
                  <th key={s.skill}>{s.skill}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((st) => {
                const row = result.students.find((r) => r.studentId === st.id);
                return (
                  <tr key={st.id}>
                    <th className="font-semibold whitespace-nowrap">{label(st)}</th>
                    {result.skills.map((s) => {
                      const m = row?.skills[s.skill];
                      return (
                        <td key={s.skill}>
                          <LevelBadge level={m?.level ?? 'nodata'} mastery={m?.mastery} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
