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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            Alunos e cartões cadastrados
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Cada aluno tem um número de cartão. O desenho no meio do cartão é só dele, e é por ele que a câmera reconhece quem respondeu.
          </p>
        </div>

        <button
          onClick={onNavigateToCards}
          className="btn btn-sm btn-neutral"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Imprimir cartões desta turma</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Formulário para cadastrar novo aluno */}
        <div className="lg:col-span-4 bg-base-100 border border-base-300 rounded-box p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-base-content">
                Novo aluno
              </h2>
              <span className="text-sm text-base-content/70">
                Próximo cartão: #{String(classroom.students.length + 1).padStart(2, '0')}
              </span>
            </div>
          </div>

          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-base-content/80 block mb-1.5">
                Nome completo
              </label>
              <input
                type="text"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                placeholder="Exemplo: Lucas Silva"
                className="input input-bordered w-full"
              />
            </div>

            <button
              type="submit"
              disabled={!newStudentName.trim()}
              className="btn btn-sm btn-primary w-full"
            >
              Adicionar à lista
            </button>
          </form>

          <div className="text-sm text-base-content/70 leading-relaxed border-t border-base-300 pt-4">
            Quem entra na turma recebe o próximo código livre, e os cartões já impressos continuam valendo.
          </div>
        </div>

        {/* Lista de alunos cadastrados */}
        <div className="lg:col-span-8 bg-base-100 border border-base-300 rounded-box p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-base-content/80" />
              <h2 className="text-base font-bold text-base-content">
                Lista de chamada ({classroom.students.length} estudantes)
              </h2>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-base-content/60 absolute left-3 top-2 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome ou número"
                className="input input-bordered input-sm w-full pl-9"
              />
            </div>
          </div>

          <div className="divide-y divide-base-300/60 max-h-[520px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <p className="text-center py-8 text-sm text-base-content/70">
                Nenhum aluno encontrado para a busca.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-base-200 px-2 rounded-xl transition-colors"
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
                          className="input input-bordered input-sm"
                        />
                        <button
                          onClick={() => handleSaveEdit(student.id)}
                          aria-label="Salvar nome"
                          className="btn btn-sm btn-success btn-square"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => handleStartEdit(student)}
                        className="text-sm font-medium text-base-content cursor-pointer hover:underline truncate"
                        title="Clique para editar o nome"
                      >
                        {student.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemove(student.id)}
                      className="btn btn-sm btn-ghost btn-square text-base-content/60 hover:text-error"
                      title="Remover aluno"
                      aria-label={`Remover ${student.name}`}
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
