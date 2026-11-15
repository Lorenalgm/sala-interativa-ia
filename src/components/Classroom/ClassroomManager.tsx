import React, { useMemo, useState } from 'react';
import { Classroom, Student } from '../../types';
import { addStudent, createClassroom, deleteClassroom, removeStudent, renameClassroom, updateStudents } from '../../services/storageService';
import { STUDENT_MARKERS } from '../../services/markerRanges';
import { Check, Plus, Printer, Search, Trash2 } from 'lucide-react';

interface ClassroomManagerProps {
  classroom: Classroom;
  onRefresh: () => void;
  classrooms: Classroom[];
  onSwitchClassroom: (id: string) => void;
  // Sem ids: todos os cartões. Com ids: só os desses alunos
  onNavigateToCards: (ids?: number[]) => void;
}

const pad = (id: number) => String(id).padStart(2, '0');

// Mesmo cálculo do cadastro: o menor número livre na faixa dos cartões de aluno
const nextFreeId = (students: Student[]): number | null => {
  const used = new Set(students.map((s) => s.id));
  for (let id = STUDENT_MARKERS.min; id <= STUDENT_MARKERS.max; id++) if (!used.has(id)) return id;
  return null;
};

const field =
  'w-full min-h-[2.75rem] rounded-[0.625rem] border border-base-300 bg-base-100 px-3.5 text-[1.0625rem] placeholder:text-base-content/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25';
const pillPrimary =
  'inline-flex items-center justify-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd] disabled:bg-[#e3e3e8] disabled:text-base-content/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const pillSecondary =
  'inline-flex items-center justify-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';
const textButton = 'min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5';

// Turma: lista agrupada com o número de cada cartão, cadastro no topo e impressão por aluno
export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  classroom,
  onRefresh,
  classrooms,
  onSwitchClassroom,
  onNavigateToCards,
}) => {
  const [newClass, setNewClass] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [pasting, setPasting] = useState(false);
  const [pasted, setPasted] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const students = classroom.students;
  const nextId = nextFreeId(students);
  const pastedNames = pasted
    .split(/\r?\n/)
    .map((n) => n.trim())
    .filter(Boolean);

  const addNames = (names: string[]) => {
    setError('');
    try {
      names.forEach((n) => addStudent(n));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível adicionar o aluno.');
    }
    onRefresh();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (pasting) {
      if (pastedNames.length === 0) return;
      addNames(pastedNames);
      setPasted('');
      setPasting(false);
    } else {
      if (!newName.trim()) return;
      addNames([newName.trim()]);
      setNewName('');
    }
  };

  const handleRemove = (s: Student) => {
    if (confirm(`Remover ${s.name}? O cartão #${pad(s.id)} fica livre para outro aluno.`)) {
      removeStudent(s.id);
      onRefresh();
    }
  };

  const saveEdit = (id: number) => {
    if (!editingName.trim()) return;
    updateStudents(students.map((s) => (s.id === id ? { ...s, name: editingName.trim() } : s)));
    setEditingId(null);
    onRefresh();
  };

  const addClassroom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass?.trim()) return;
    createClassroom(newClass);
    setNewClass(null);
    onRefresh();
  };

  const saveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming?.trim()) return;
    renameClassroom(classroom.id, renaming);
    setRenaming(null);
    onRefresh();
  };

  const removeClassroom = () => {
    if (
      !confirm(
        `Apagar a turma ${classroom.name}? Os ${students.length} alunos e todas as rodadas dela saem deste computador. Não dá para desfazer.`
      )
    )
      return;
    deleteClassroom(classroom.id);
    onRefresh();
  };

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return students.filter((s) => !term || s.name.toLowerCase().includes(term) || pad(s.id).includes(term));
  }, [students, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="space-y-2">
        <p className="text-base font-semibold text-base-content/70">Turma</p>
        {renaming !== null ? (
          <form onSubmit={saveRename} className="flex flex-wrap items-center gap-2 max-w-xl">
            <input
              value={renaming}
              onChange={(e) => setRenaming(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setRenaming(null)}
              autoFocus
              aria-label="Nome da turma"
              className={`${field} flex-1 text-2xl font-display font-bold`}
            />
            <button type="button" onClick={() => setRenaming(null)} className={textButton}>
              Cancelar
            </button>
            <button type="submit" className={pillPrimary}>
              Salvar
            </button>
          </form>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">{classroom.name}</h1>
            <button onClick={() => setRenaming(classroom.name)} className={textButton}>
              Renomear
            </button>
          </div>
        )}
        <p className="text-lg text-base-content/75 max-w-3xl">
          Cada aluno tem um cartão com número próprio. É pelo desenho do cartão que a câmera sabe quem respondeu.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] gap-8 items-start">
        {/* Lateral: cadastro e cartões */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          {/* Turmas do professor: cada uma com seus alunos, cartões e rodadas */}
          <section aria-labelledby="turmas" className="bg-base-100 border border-base-300 rounded-[0.875rem] overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-2">
              <h2 id="turmas" className="font-display text-xl font-bold tracking-tight">
                Suas turmas
              </h2>
              {newClass === null && (
                <button onClick={() => setNewClass('')} className={`${textButton} -mr-2`}>
                  Nova turma
                </button>
              )}
            </div>
            <ul role="radiogroup" aria-label="Turma ativa">
              {classrooms.map((c) => {
                const on = c.id === classroom.id;
                return (
                  <li key={c.id} className="border-t border-base-300 first:border-t-0">
                    <button
                      role="radio"
                      aria-checked={on}
                      onClick={() => !on && onSwitchClassroom(c.id)}
                      className={`w-full flex items-center gap-3 min-h-[3rem] px-5 text-left text-base hover:bg-black/[0.03] ${on ? 'font-semibold' : ''}`}
                    >
                      <Check className={`w-4 h-4 shrink-0 text-primary ${on ? '' : 'invisible'}`} aria-hidden="true" />
                      <span className="flex-1 truncate">{c.name}</span>
                      <span className="text-[0.9375rem] font-normal text-base-content/60">
                        {c.students.length} {c.students.length === 1 ? 'aluno' : 'alunos'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {newClass !== null && (
              <form onSubmit={addClassroom} className="border-t border-base-300 p-4 space-y-2">
                <input
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setNewClass(null)}
                  autoFocus
                  placeholder="Nome da turma, ex.: 6º A"
                  aria-label="Nome da nova turma"
                  className={field}
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setNewClass(null)} className={textButton}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={!newClass.trim()} className={pillPrimary}>
                    Criar
                  </button>
                </div>
              </form>
            )}
            {classrooms.length > 1 && newClass === null && (
              <div className="border-t border-base-300 px-5 py-2">
                <button onClick={removeClassroom} className="min-h-[2.75rem] -ml-3 px-3 rounded-lg text-base font-semibold text-error hover:bg-black/5">
                  Apagar esta turma
                </button>
              </div>
            )}
          </section>

          <section aria-labelledby="novo-aluno" className="bg-base-100 border border-base-300 rounded-[0.875rem] p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 id="novo-aluno" className="font-display text-xl font-bold tracking-tight">
                {pasting ? 'Colar uma lista' : 'Novo aluno'}
              </h2>
              <button onClick={() => setPasting((p) => !p)} className={`${textButton} -mr-2`}>
                {pasting ? 'Um por vez' : 'Colar lista'}
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              {pasting ? (
                <label className="block space-y-1.5">
                  <span className="sr-only">Nomes, um por linha</span>
                  <textarea
                    value={pasted}
                    onChange={(e) => setPasted(e.target.value)}
                    rows={6}
                    autoFocus
                    placeholder={'Um nome por linha. Exemplo:\nLucas Silva\nMariana Costa'}
                    className={`${field} py-2.5 leading-snug`}
                  />
                  <span className="block text-[0.9375rem] text-base-content/70">Cada nome recebe o próximo cartão livre.</span>
                </label>
              ) : (
                <label className="block space-y-1.5">
                  <span className="sr-only">Nome do aluno</span>
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nome do aluno" className={field} />
                  {nextId !== null && (
                    <span className="block text-[0.9375rem] text-base-content/70">
                      Recebe o cartão <strong className="font-semibold text-base-content">#{pad(nextId)}</strong>
                    </span>
                  )}
                </label>
              )}
              <button type="submit" disabled={pasting ? pastedNames.length === 0 : !newName.trim()} className={`${pillPrimary} w-full`}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                {pasting && pastedNames.length > 1 ? `Adicionar ${pastedNames.length} alunos` : 'Adicionar'}
              </button>
              {error && (
                <p role="alert" className="text-base font-semibold text-error">
                  {error}
                </p>
              )}
            </form>
          </section>

          <section aria-labelledby="cartoes" className="bg-base-100 border border-base-300 rounded-[0.875rem] p-5 space-y-3">
            <h2 id="cartoes" className="font-display text-xl font-bold tracking-tight">Cartões</h2>
            <p className="text-base text-base-content/75">
              Remover um aluno não muda o cartão dos outros. Os cartões já impressos continuam valendo.
            </p>
            <button onClick={() => onNavigateToCards()} className={`${pillSecondary} w-full`}>
              <Printer className="w-4 h-4" aria-hidden="true" />
              Imprimir todos os cartões
            </button>
          </section>
        </aside>

        {/* Lista em duas colunas, aproveitando a largura do notebook */}
        <section aria-labelledby="lista-alunos" className="space-y-3 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="lista-alunos" className="font-display text-2xl font-bold tracking-tight">
              {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
            </h2>
            <label className="relative block w-full sm:w-80">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou número"
                aria-label="Buscar alunos"
                className="w-full min-h-[2.75rem] rounded-[0.625rem] bg-[#e3e3e8] pl-10 pr-3 text-[1.0625rem] placeholder:text-base-content/55 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="bg-base-100 border border-base-300 rounded-[0.875rem] p-6 text-lg text-base-content/75">
              {students.length === 0 ? 'Nenhum aluno ainda. Adicione o primeiro ao lado.' : 'Nenhum aluno encontrado para a busca.'}
            </p>
          ) : (
            <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden grid grid-cols-1 xl:grid-cols-2">
              {filtered.map((student, i) => {
                const editing = editingId === student.id;
                return (
                  <li
                    key={student.id}
                    className={`flex items-center gap-3 pl-4 border-base-300 ${i > 0 ? 'border-t' : ''} ${i === 1 ? 'xl:border-t-0' : ''} ${
                      i % 2 === 0 ? 'xl:border-r' : ''
                    }`}
                  >
                    <span
                      className="shrink-0 w-11 h-11 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-base flex items-center justify-center"
                      aria-label={`Cartão ${pad(student.id)}`}
                    >
                      {pad(student.id)}
                    </span>
                    <div className="flex-1 min-w-0 min-h-[4rem] flex items-center gap-1 pr-2">
                      {editing ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            saveEdit(student.id);
                          }}
                          className="flex-1 flex items-center gap-2 py-2"
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setEditingId(null)}
                            autoFocus
                            aria-label={`Nome do cartão ${pad(student.id)}`}
                            className={field}
                          />
                          <button type="submit" className={pillPrimary}>
                            Salvar
                          </button>
                        </form>
                      ) : (
                        <>
                          <span className="flex-1 min-w-0 truncate text-lg font-medium">{student.name}</span>
                          <button
                            onClick={() => {
                              setEditingId(student.id);
                              setEditingName(student.name);
                            }}
                            className={textButton}
                            aria-label={`Editar o nome de ${student.name}`}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onNavigateToCards([student.id])}
                            className="w-11 h-11 flex items-center justify-center rounded-lg text-base-content/70 hover:bg-black/5"
                            aria-label={`Imprimir o cartão de ${student.name}`}
                            title="Imprimir só este cartão"
                          >
                            <Printer className="w-5 h-5" aria-hidden="true" />
                          </button>
                          <button
                            onClick={() => handleRemove(student)}
                            className="w-11 h-11 flex items-center justify-center rounded-lg text-base-content/55 hover:text-error hover:bg-black/5"
                            aria-label={`Remover ${student.name}`}
                            title="Remover aluno"
                          >
                            <Trash2 className="w-5 h-5" aria-hidden="true" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
