import React, { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { RoundSession, Student } from '../../types';
import { MasteryResult } from '../../services/mastery';
import { studentRecommendations } from '../../services/recommendations';
import { LevelBadge, RecommendationList } from './MasteryShared';

interface StudentMasteryProps {
  result: MasteryResult;
  rounds: RoundSession[];
  students: Student[];
  label: (s: Student) => string;
}

interface Answer {
  key: string;
  prompt: string;
  roundName: string;
  selected: string;
  correct: string;
  ok: boolean;
}

export const StudentMastery: React.FC<StudentMasteryProps> = ({ result, rounds, students, label }) => {
  const [selectedId, setSelectedId] = useState<number>(students[0]?.id ?? 0);
  const student = students.find((s) => s.id === selectedId) ?? students[0];
  const row = result.students.find((r) => r.studentId === student?.id);
  // Quem precisa de reforço aparece primeiro
  const skills = row ? Object.values(row.skills).sort((a, b) => a.mastery - b.mastery) : [];

  // Cada resposta do aluno, da mais antiga para a mais nova, agrupada por habilidade
  const answersBySkill = useMemo(() => {
    const map = new Map<string, Answer[]>();
    if (!student) return map;
    [...rounds]
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((round, rIdx) => {
        round.questions.forEach((q, qIdx) => {
          const selected = q.responses[student.id];
          if (!selected) return;
          const list = map.get(q.skill) ?? [];
          list.push({
            key: `${round.id}-${q.id || qIdx}`,
            prompt: q.questionPrompt,
            roundName: round.name || `Rodada ${rIdx + 1}`,
            selected,
            correct: q.correctOption,
            ok: selected === q.correctOption,
          });
          map.set(q.skill, list);
        });
      });
    return map;
  }, [rounds, student]);

  if (!student) return <p className="text-base-content/70">A turma não tem alunos.</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6 items-start">
      <nav aria-label="Alunos" className="bg-base-100 border border-base-300 rounded-[20px] p-2 max-h-[34rem] overflow-y-auto">
        <ul className="space-y-1">
          {students.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedId(s.id)}
                aria-current={s.id === student.id ? 'true' : undefined}
                className={`btn w-full justify-start ${s.id === student.id ? 'btn-primary' : 'btn-ghost'}`}
              >
                {label(s)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6 min-w-0">
        <h2 className="text-3xl font-extrabold tracking-tight">{label(student)}</h2>

        <RecommendationList title="Para este aluno" items={row ? studentRecommendations(row, result.skills) : []} nameOf={() => ''} />

        {skills.length === 0 ? (
          <p className="bg-base-100 border border-base-300 rounded-[20px] p-6 text-base text-base-content/75">
            Este aluno ainda não respondeu nenhuma pergunta.
          </p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-2xl font-extrabold tracking-tight">Respostas por habilidade</h3>
            {skills.map((m) => (
              <section key={m.skill} className="bg-base-100 border border-base-300 rounded-[20px] overflow-hidden">
                <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-base-300">
                  <div>
                    <h4 className="font-extrabold text-xl leading-tight">{m.skill}</h4>
                    <p className="text-base text-base-content/75 tabular-nums">
                      Acertou {m.correct} de {m.answers} {m.answers === 1 ? 'pergunta' : 'perguntas'}
                      {m.level === 'nodata' && '. Ainda são poucas respostas para dizer o nível.'}
                    </p>
                  </div>
                  <LevelBadge level={m.level} />
                </header>
                <ol className="divide-y divide-base-300">
                  {(answersBySkill.get(m.skill) ?? []).map((a) => (
                    <li key={a.key} className="px-5 py-3 flex items-start gap-3">
                      <span
                        className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          a.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {a.ok ? <Check className="w-5 h-5" aria-hidden="true" /> : <X className="w-5 h-5" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-base-content">{a.prompt}</p>
                        <p className="text-base text-base-content/75">
                          <span className={`font-extrabold ${a.ok ? 'text-emerald-800' : 'text-red-800'}`}>
                            {a.ok ? 'Acertou' : 'Errou'}
                          </span>
                          {' · '}marcou {a.selected}
                          {!a.ok && `, a certa era ${a.correct}`}
                          {' · '}{a.roundName}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
