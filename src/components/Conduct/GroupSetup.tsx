import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Check, History, Play, Shuffle } from 'lucide-react';
import { Group, GroupFormation, Student } from '../../types';
import { formGroups, moveStudent } from '../../services/groupDraw';
import { loadClassroom, loadFormation, saveFormation } from '../../services/storageService';

interface GroupSetupProps {
  students: Student[];
  onBack: () => void;
  onStart: (formation: GroupFormation) => void;
}

export const GroupSetup: React.FC<GroupSetupProps> = ({ students, onBack, onStart }) => {
  const classroomId = useMemo(() => loadClassroom().id, []);
  const saved = useMemo(() => {
    const f = loadFormation();
    return f && f.classroomId === classroomId ? f : null;
  }, [classroomId]);

  const [absentIds, setAbsentIds] = useState<number[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [rotation, setRotation] = useState<Record<string, number[]>>({});
  const [dragId, setDragId] = useState<number | null>(null);

  const nameOf = (id: number) => students.find((s) => s.id === id)?.name ?? `Aluno ${id}`;
  const presentCount = students.length - absentIds.length;
  const assigned = new Set(groups.flatMap((g) => g.studentIds));
  const unassigned = students.filter((s) => !absentIds.includes(s.id) && !assigned.has(s.id));

  const toggleAbsent = (id: number) => {
    setAbsentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    // Ausente sai do grupo; quem volta fica na lista "sem grupo"
    setGroups((prev) => prev.map((g) => ({ ...g, studentIds: g.studentIds.filter((x) => x !== id) })));
  };

  const draw = (size: 3 | 4) => {
    setGroups(formGroups(students, absentIds, size));
    setRotation({});
  };

  const reuse = () => {
    if (!saved) return;
    const valid = new Set(students.map((s) => s.id));
    setAbsentIds(saved.absentIds.filter((id) => valid.has(id)));
    setGroups(
      saved.groups.map((g) => ({ ...g, studentIds: g.studentIds.filter((id) => valid.has(id)) }))
    );
    setRotation(saved.rotation);
  };

  const move = (studentId: number, groupId: string) =>
    setGroups((prev) => moveStudent(prev, studentId, groupId));

  const canStart = groups.length > 0 && groups.every((g) => g.studentIds.length > 0);

  const start = () => {
    const formation: GroupFormation = { classroomId, absentIds, groups, rotation };
    saveFormation(formation);
    onStart(formation);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 min-h-[2.75rem] px-2 -ml-2 mb-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Perguntas
          </button>
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Montar os grupos</h1>
          <p className="text-lg text-base-content/75 mt-2">
            Desmarque quem faltou e sorteie grupos de 3 ou 4. Arraste um aluno para trocar de grupo.
          </p>
        </div>
        <button
          onClick={start}
          disabled={!canStart}
          className="inline-flex items-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd] disabled:bg-[#e3e3e8] disabled:text-base-content/45"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          Iniciar no datashow
        </button>
      </div>

      <section className="bg-base-100 border border-base-300 rounded-[0.875rem] p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Quem veio hoje? <span className="text-base-content/70 font-normal text-xl">{presentCount} presentes</span>
        </h2>
        <ul className="flex flex-wrap gap-2">
          {students.map((s) => {
            const absent = absentIds.includes(s.id);
            return (
              <li key={s.id}>
                {/* Marcado = presente. Um toque marca a falta */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={!absent}
                  onClick={() => toggleAbsent(s.id)}
                  className={`inline-flex items-center gap-2 min-h-[2.75rem] pl-2 pr-4 rounded-full border text-base font-medium ${
                    absent
                      ? 'bg-base-200 border-base-300 text-base-content/55 line-through'
                      : 'bg-base-100 border-base-300 hover:bg-black/[0.03]'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      absent ? 'border-2 border-[#aeaeb2]' : 'bg-primary text-primary-content'
                    }`}
                    aria-hidden="true"
                  >
                    {!absent && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  </span>
                  {s.name}
                  <span className="sr-only">{absent ? '(faltou)' : '(presente)'}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={() => draw(3)} disabled={presentCount < 3} className="inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold disabled:opacity-40">
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            Sortear grupos de 3
          </button>
          <button onClick={() => draw(4)} disabled={presentCount < 3} className="inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold disabled:opacity-40">
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            Sortear grupos de 4
          </button>
          {saved && (
            <button onClick={reuse} className="inline-flex items-center gap-2 min-h-[2.75rem] px-4 rounded-full text-base font-semibold text-primary hover:bg-black/5">
              <History className="w-4 h-4" aria-hidden="true" />
              Reaproveitar última formação
            </button>
          )}
        </div>
      </section>

      {groups.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <section
              key={g.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId !== null) move(dragId, g.id);
                setDragId(null);
              }}
              className="bg-base-100 border border-base-300 rounded-[0.875rem] p-4 space-y-2.5 min-h-[8rem]"
            >
              <h3 className="font-display text-xl font-bold">
                {g.name} <span className="text-base-content/70 font-normal">{g.studentIds.length} alunos</span>
              </h3>
              <ul className="space-y-1.5">
                {g.studentIds.map((id) => (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDragId(id)}
                    className="flex items-center justify-between gap-2 bg-base-200 rounded-[0.625rem] pl-3 pr-1 min-h-[2.75rem] cursor-grab"
                  >
                    <span className="truncate text-base font-medium">{nameOf(id)}</span>
                    <select
                      aria-label={`Mover ${nameOf(id)} para outro grupo`}
                      value={g.id}
                      onChange={(e) => move(id, e.target.value)}
                      className="select select-ghost select-sm w-28 text-base"
                    >
                      {groups.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {unassigned.length > 0 && groups.length > 0 && (
        <section
          onDragOver={(e) => e.preventDefault()}
          className="bg-amber-50 border border-amber-300 rounded-[0.875rem] p-4 space-y-2"
        >
          <h3 className="font-bold text-amber-950">Sem grupo</h3>
          <ul className="flex flex-wrap gap-2">
            {unassigned.map((s) => (
              <li key={s.id} className="flex items-center gap-2 bg-base-100 rounded-[0.625rem] pl-3 pr-1 min-h-[2.75rem] text-base">
                {s.name}
                <select
                  aria-label={`Colocar ${s.name} em um grupo`}
                  defaultValue=""
                  onChange={(e) => e.target.value && move(s.id, e.target.value)}
                  className="select select-ghost select-xs w-24"
                >
                  <option value="" disabled>
                    Grupo…
                  </option>
                  {groups.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};
