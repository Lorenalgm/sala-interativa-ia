import React, { useMemo, useState } from 'react';
import { Classroom, Student } from '../../types';
import { addStudent, removeStudent, updateStudents } from '../../services/storageService';
import { STUDENT_MARKERS } from '../../services/markerRanges';
import { Plus, Printer, Search, Trash2 } from 'lucide-react';

interface ClassroomManagerProps {
  classroom: Classroom;
  onRefresh: () => void;
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
export const ClassroomManager: React.FC<ClassroomManagerProps> = ({ classroom, onRefresh, onNavigateToCards }) => {
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

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return students.filter((s) => !term || s.name.toLowerCase().includes(term) || pad(s.id).includes(term));
  }, [students, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Turma</h1>
          <p className="text-lg text-base-content/75 max-w-2xl">
            Cada aluno tem um cartão com número próprio. É pelo desenho do cartão que a câmera sabe quem respondeu.
          </p>
        </div>
        <button onClick={() => onNavigateToCards()} className={pillSecondary}>
          <Printer className="w-4 h-4" aria-hidden="true" />
          Imprimir todos os cartões
        </button>
      </header>

      {/* Cadastro: um nome por vez ou uma lista colada */}
      <section aria-labelledby="novo-aluno" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4">
          <h2 id="novo-aluno" className="text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">
            {pasting ? 'Colar uma lista de nomes' : 'Novo aluno'}
          </h2>
          <button onClick={() => setPasting((p) => !p)} className={textButton}>
            {pasting ? 'Adicionar um por vez' : 'Colar uma lista de nomes'}
          </button>
        </div>
        <form
          onSubmit={handleAdd}
          className="bg-base-100 border border-base-300 rounded-[0.875rem] p-4 flex flex-wrap items-start gap-3"
        >
          {pasting ? (
            <label className="flex-1 min-w-[16rem] space-y-1.5">
              <span className="sr-only">Nomes, um por linha</span>
              <textarea
                value={pasted}
                onChange={(e) => setPasted(e.target.value)}
                rows={5}
                autoFocus
                placeholder={'Um nome por linha. Exemplo:\nLucas Silva\nMariana Costa'}
                className={`${field} py-2.5 leading-snug`}
              />
              <span className="block text-[0.9375rem] text-base-content/70">
                Cada nome recebe o próximo cartão livre.
              </span>
            </label>
          ) : (
            <label className="flex-1 min-w-[16rem]">
              <span className="sr-only">Nome do aluno</span>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do aluno"
                className={field}
              />
            </label>
          )}
          <div className="flex items-center gap-3">
            {!pasting && nextId !== null && (
              <span className="text-[0.9375rem] text-base-content/70 whitespace-nowrap">
                Recebe o cartão <strong className="font-semibold text-base-content">#{pad(nextId)}</strong>
              </span>
            )}
            <button
              type="submit"
              disabled={pasting ? pastedNames.length === 0 : !newName.trim()}
              className={pillPrimary}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              {pasting && pastedNames.length > 1 ? `Adicionar ${pastedNames.length} alunos` : 'Adicionar'}
            </button>
          </div>
          {error && (
            <p role="alert" className="w-full text-base font-semibold text-error">
              {error}
            </p>
          )}
        </form>
      </section>

      <section aria-labelledby="lista-alunos" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <h2 id="lista-alunos" className="text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">
            {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
          </h2>
          <label className="relative block w-full sm:w-72">
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
            {students.length === 0 ? 'Nenhum aluno ainda. Adicione o primeiro acima.' : 'Nenhum aluno encontrado para a busca.'}
          </p>
        ) : (
          <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
            {filtered.map((student, i) => {
              const editing = editingId === student.id;
              return (
                <li key={student.id} className="flex items-center gap-3 pl-4">
                  {/* O número no formato do cartão de papel */}
                  <span
                    className="shrink-0 w-11 h-11 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-base flex items-center justify-center"
                    aria-label={`Cartão ${pad(student.id)}`}
                  >
                    {pad(student.id)}
                  </span>
                  <div
                    className={`flex-1 min-w-0 min-h-[4rem] flex items-center gap-2 pr-2 ${i > 0 ? 'border-t border-base-300' : ''}`}
                  >
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
                        <button type="button" onClick={() => setEditingId(null)} className={textButton}>
                          Cancelar
                        </button>
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
        <p className="px-4 text-[0.9375rem] text-base-content/70">
          Remover um aluno não muda o cartão dos outros. Os cartões já impressos continuam valendo.
        </p>
      </section>
    </div>
  );
};
