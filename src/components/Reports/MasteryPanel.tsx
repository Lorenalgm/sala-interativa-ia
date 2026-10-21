import React from 'react';
import { Classroom, RoundSession } from '../../types';
import { LEVEL_LABEL, MasteryResult } from '../../services/mastery';
import { ClassMastery } from './ClassMastery';
import { StudentMastery } from './StudentMastery';

export const exportMasteryCsv = (result: MasteryResult, classroom: Classroom) => {
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

interface MasteryPanelProps {
  classroom: Classroom;
  result: MasteryResult;
  rounds: RoundSession[];
  view: 'class' | 'student';
  showNames: boolean;
}

export const MasteryPanel: React.FC<MasteryPanelProps> = ({ classroom, result, rounds, view, showNames }) => {
  const label = (s: { id: number; name: string }) =>
    showNames ? `#${String(s.id).padStart(2, '0')} ${s.name}` : `Cartão ${String(s.id).padStart(2, '0')}`;

  if (result.skills.length === 0) {
    return (
      <div className="bg-base-100 border border-base-300 rounded-[20px] p-12 text-center space-y-2">
        <h2 className="text-xl font-extrabold">Ainda não há dados suficientes</h2>
        <p className="text-base text-base-content/75 max-w-md mx-auto">
          Depois de 3 respostas de um aluno numa habilidade, o nível dele aparece aqui.
        </p>
      </div>
    );
  }

  return view === 'class' ? (
    <ClassMastery result={result} students={classroom.students} label={label} />
  ) : (
    <StudentMastery result={result} rounds={rounds} students={classroom.students} label={label} />
  );
};
