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

const LEGEND = [
  { key: 'reinforce', text: 'em reforço', dot: 'bg-red-500' },
  { key: 'progress', text: 'em progresso', dot: 'bg-amber-400' },
  { key: 'mastered', text: 'dominando', dot: 'bg-emerald-500' },
] as const;

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

  // Onde a turma mais errou vem primeiro
  const skills = [...result.skills].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-8">
      <RecommendationList title="Para a próxima aula" items={classRecommendations(result)} nameOf={nameOf} />

      <section aria-labelledby="skills-title" className="space-y-3">
        <div>
          <h2 id="skills-title" className="text-2xl font-extrabold tracking-tight">Habilidades da turma</h2>
          <p className="text-base text-base-content/75">Começa pelas que a turma mais errou.</p>
        </div>

        <ul className="bg-base-100 border border-base-300 rounded-[20px] divide-y divide-base-300">
          {skills.map((s) => {
            const total = s.studentsWithData || 1;
            const seg = (n: number) => `${(n / total) * 100}%`;
            return (
              <li key={s.skill} className="p-5 grid gap-x-8 gap-y-3 md:grid-cols-[minmax(0,16rem)_1fr] items-center">
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold leading-tight">{s.skill}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <DifficultyBadge difficulty={s.difficulty} />
                    <span className="text-base text-base-content/75 tabular-nums">
                      <strong className="text-base-content font-extrabold">{s.accuracy}%</strong> de acerto
                    </span>
                  </div>
                </div>

                {s.studentsWithData > 0 ? (
                  <div className="space-y-2">
                    <div
                      className="flex h-4 rounded-full overflow-hidden bg-base-200"
                      role="img"
                      aria-label={`${s.counts.reinforce} em reforço, ${s.counts.progress} em progresso, ${s.counts.mastered} dominando`}
                    >
                      <span style={{ width: seg(s.counts.reinforce) }} className="bg-red-500" />
                      <span style={{ width: seg(s.counts.progress) }} className="bg-amber-400" />
                      <span style={{ width: seg(s.counts.mastered) }} className="bg-emerald-500" />
                    </div>
                    <p className="flex flex-wrap gap-x-5 gap-y-1 text-base text-base-content/85 tabular-nums">
                      {LEGEND.map((l) => (
                        <span key={l.key} className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true" className={`w-3 h-3 rounded-full ${l.dot}`} />
                          <strong className="font-extrabold">{s.counts[l.key]}</strong> {l.text}
                        </span>
                      ))}
                      {s.counts.nodata > 0 && (
                        <span className="text-base-content/65">{s.counts.nodata} sem dados</span>
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-base text-base-content/70">
                    Ainda são poucas respostas. O nível aparece quando cada aluno tem 3.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-base-100 border border-base-300 rounded-[20px] p-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="max-w-xl space-y-1">
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" aria-hidden="true" />
            Grupos que misturam níveis
          </h2>
          <p className="text-base text-base-content/75">
            Monta grupos com alunos de níveis diferentes e salva a formação para o roteiro Grupo com sorteio.
          </p>
          {saved && (
            <p role="status" className="text-base text-success font-semibold">
              Formação com grupos de {saved} salva. No roteiro Grupo com sorteio, use "Reaproveitar última formação".
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => useMixedGroups(3)} className="btn btn-primary">Grupos de 3</button>
          <button onClick={() => useMixedGroups(4)} className="btn btn-primary btn-outline">Grupos de 4</button>
        </div>
      </section>

      <details className="group bg-base-100 border border-base-300 rounded-[20px]">
        <summary className="cursor-pointer select-none px-6 py-4 text-xl font-extrabold flex items-center justify-between focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary rounded-[20px]">
          Nível de cada aluno em cada habilidade
          <span className="text-base font-semibold text-base-content/70 group-open:hidden">Abrir</span>
          <span className="text-base font-semibold text-base-content/70 hidden group-open:inline">Fechar</span>
        </summary>
        <div className="overflow-x-auto px-6 pb-6">
          <table className="table">
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
      </details>
    </div>
  );
};
