import React, { useMemo, useState } from 'react';
import { Download, EyeOff } from 'lucide-react';
import { Classroom, RoundSession } from '../../types';
import { LEVEL_LABEL, computeMastery } from '../../services/mastery';
import { ClassMastery } from './ClassMastery';
import { StudentMastery } from './StudentMastery';

interface MasteryPanelProps {
  classroom: Classroom;
  rounds: RoundSession[];
}

export const MasteryPanel: React.FC<MasteryPanelProps> = ({ classroom, rounds }) => {
  const [view, setView] = useState<'class' | 'student'>('class');
  // Nomes escondidos por padrão: a tela pode estar projetada
  const [showNames, setShowNames] = useState(false);

  const result = useMemo(() => computeMastery(rounds, classroom.students), [rounds, classroom.students]);
  const label = (s: { id: number; name: string }) =>
    showNames ? `#${String(s.id).padStart(2, '0')} ${s.name}` : `Cartão ${String(s.id).padStart(2, '0')}`;

  const exportCsv = () => {
    let csv = 'Aluno,Habilidade,Domínio (%),Nível,Respostas,Certas\n';
    classroom.students.forEach((st) => {
      const row = result.students.find((r) => r.studentId === st.id);
      Object.values(row?.skills ?? {}).forEach((m) => {
        csv += `"${st.name.replace(/"/g, '""')}","${m.skill.replace(/"/g, '""')}",${Math.round(m.mastery * 100)},"${LEVEL_LABEL[m.level]}",${m.answers},${m.correct}\n`;
      });
    });
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dominio_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (result.skills.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-box p-12 text-center space-y-2">
        <h3 className="text-base font-bold">O painel aparece depois de algumas rodadas</h3>
        <p className="text-sm text-base-content/70 max-w-md mx-auto">
          O domínio de cada aluno é estimado a cada resposta. Com 3 respostas numa habilidade já dá para ver um nível.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Visão do domínio" className="join">
          <button role="tab" aria-selected={view === 'class'} onClick={() => setView('class')} className={`btn btn-sm join-item ${view === 'class' ? 'btn-neutral' : ''}`}>
            Turma
          </button>
          <button role="tab" aria-selected={view === 'student'} onClick={() => setView('student')} className={`btn btn-sm join-item ${view === 'student' ? 'btn-neutral' : ''}`}>
            Por aluno
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="label cursor-pointer gap-2 py-0">
            <input type="checkbox" className="toggle toggle-sm" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} />
            <span className="label-text text-sm text-base-content/70">Mostrar nomes</span>
          </label>
          {!showNames && (
            <span className="hidden sm:flex items-center gap-1 text-sm text-base-content/70">
              <EyeOff className="w-4 h-4" aria-hidden="true" />
              Nomes escondidos
            </span>
          )}
          <button onClick={exportCsv} className="btn btn-sm">
            <Download className="w-4 h-4 text-amber-500" />
            Exportar domínio (CSV)
          </button>
        </div>
      </div>

      {view === 'class' ? (
        <ClassMastery result={result} students={classroom.students} label={label} />
      ) : (
        <StudentMastery result={result} students={classroom.students} label={label} />
      )}
    </div>
  );
};
