import React, { useMemo, useState } from 'react';
import { ArrowLeft, History, Play, Shuffle } from 'lucide-react';
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
          <button onClick={onBack} className="btn btn-sm rounded-full mb-3">
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para as perguntas
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Montar os grupos</h1>
          <p className="text-sm text-base-content/70 mt-1">
            Marque quem faltou e sorteie grupos de 3 ou 4. Arraste os alunos para trocar de grupo.
          </p>
        </div>
        <button onClick={start} disabled={!canStart} className="btn btn-primary">
          <Play className="w-4 h-4" />
          Iniciar no datashow
        </button>
      </div>

      <section className="bg-base-100 border border-base-300 rounded-box p-5 space-y-3">
        <h2 className="text-lg font-bold">
          Quem veio hoje? <span className="text-base-content/70 font-medium">({presentCount} presentes)</span>
        </h2>
        <ul className="flex flex-wrap gap-2">
          {students.map((s) => {
            const absent = absentIds.includes(s.id);
            return (
              <li key={s.id}>
                <label
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-btn border cursor-pointer text-sm ${
                    absent ? 'bg-base-200 border-base-300 text-base-content/60 line-through' : 'bg-base-100 border-base-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={absent}
                    onChange={() => toggleAbsent(s.id)}
                  />
                  {s.name}
                  <span className="sr-only">{absent ? '(ausente)' : '(presente)'}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-wrap gap-2 pt-2">
          <button onClick={() => draw(3)} disabled={presentCount < 3} className="btn btn-sm btn-neutral">
            <Shuffle className="w-4 h-4" />
            Sortear grupos de 3
          </button>
          <button onClick={() => draw(4)} disabled={presentCount < 3} className="btn btn-sm btn-neutral">
            <Shuffle className="w-4 h-4" />
            Sortear grupos de 4
          </button>
          {saved && (
            <button onClick={reuse} className="btn btn-sm">
              <History className="w-4 h-4" />
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
              className="bg-base-100 border border-base-300 rounded-box p-4 space-y-2 min-h-[8rem]"
            >
              <h3 className="font-bold">
                {g.name} <span className="text-base-content/60 font-medium">({g.studentIds.length})</span>
              </h3>
              <ul className="space-y-1.5">
                {g.studentIds.map((id) => (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDragId(id)}
                    className="flex items-center justify-between gap-2 bg-base-200 rounded-btn px-3 py-1.5 cursor-grab"
                  >
                    <span className="truncate text-sm font-medium">{nameOf(id)}</span>
                    <select
                      aria-label={`Mover ${nameOf(id)} para outro grupo`}
                      value={g.id}
                      onChange={(e) => move(id, e.target.value)}
                      className="select select-ghost select-xs w-24"
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
          className="bg-amber-50 border border-amber-200 rounded-box p-4 space-y-2"
        >
          <h3 className="font-bold text-amber-950">Sem grupo</h3>
          <ul className="flex flex-wrap gap-2">
            {unassigned.map((s) => (
              <li key={s.id} className="flex items-center gap-2 bg-base-100 rounded-btn px-3 py-1.5 text-sm">
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
