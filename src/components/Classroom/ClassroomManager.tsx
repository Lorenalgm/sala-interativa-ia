import React, { useState } from 'react';
import { Classroom, Student } from '../../types';
import { addStudent, removeStudent, updateStudents } from '../../services/storageService';
import { Users, Plus, Trash2, Printer, Search, Check } from 'lucide-react';

interface ClassroomManagerProps {
  classroom: Classroom;
  onRefresh: () => void;
  onNavigateToCards: () => void;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  classroom,
  onRefresh,
  onNavigateToCards,
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    addStudent(newStudentName.trim());
    setNewStudentName('');
    onRefresh();
  };

  const handleRemove = (id: number) => {
    if (confirm(`Deseja remover o aluno do cartão #${id}?`)) {
      removeStudent(id);
      onRefresh();
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingId(student.id);
    setEditingName(student.name);
  };

  const handleSaveEdit = (id: number) => {
    if (!editingName.trim()) return;
    const updated = classroom.students.map((s) =>
      s.id === id ? { ...s, name: editingName.trim() } : s
    );
    updateStudents(updated);
    setEditingId(null);
    onRefresh();
  };

  const filteredStudents = classroom.students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.id).includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cabeçalho da página */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Gestão da turma
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Alunos e cartões cadastrados
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Cada aluno tem um número de cartão, ligado a um marcador ArUco só dele.
          </p>
        </div>

        <button
          onClick={onNavigateToCards}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimir cartões desta turma</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário para cadastrar novo aluno */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-950">
                Novo aluno
              </h2>
              <span className="text-xs text-zinc-500">
                Próximo cartão: #{String(classroom.students.length + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Exemplo: Lucas Silva"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={!newStudentName.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 text-xs font-bold shadow-sm transition-all"
            >
              Adicionar à lista
            </button>
          </form>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-zinc-200/80 text-xs text-zinc-600 leading-relaxed">
            Quem entra na turma recebe o próximo código livre, e os cartões já impressos continuam valendo.
          </div>
        </div>

        {/* Lista de alunos cadastrados */}
        <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-700" />
              <h2 className="text-base font-bold text-zinc-950">
                Lista de chamada ({classroom.students.length} estudantes)
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou número"
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950 focus:bg-white"
              />
            </div>
          </div>

          <div className="divide-y divide-zinc-100 max-h-[520px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-center py-8 text-xs text-zinc-400">
                Nenhum aluno encontrado para a busca.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      #{String(student.id).padStart(2, '0')}
                    </span>

                    {editingId === student.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="px-2.5 py-1 text-sm bg-white border border-zinc-300 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-950"
                        />
                        <button
                          onClick={() => handleSaveEdit(student.id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => handleStartEdit(student)}
                        className="text-sm font-medium text-zinc-900 cursor-pointer hover:underline truncate"
                        title="Clique para editar o nome"
                      >
                        {student.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(student.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remover aluno"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
