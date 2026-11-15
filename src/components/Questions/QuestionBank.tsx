import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, Plus, Search, Trash2 } from 'lucide-react';
import { Alternative, Question } from '../../types';
import { addQuestion, deleteQuestion, updateQuestion } from '../../services/storageService';
import { QuestionForm } from './QuestionForm';

interface QuestionBankProps {
  questions: Question[];
  onChange: () => void;
}

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];
const NO_SKILL = 'Sem habilidade';

// Banco de perguntas do professor: agrupadas por habilidade, com busca, criação, edição e exclusão
export const QuestionBank: React.FC<QuestionBankProps> = ({ questions, onChange }) => {
  const [query, setQuery] = useState('');
  // Formulário aberto: nova pergunta (com habilidade sugerida) ou edição de uma existente
  const [editing, setEditing] = useState<{ question?: Question; skill?: string } | null>(null);
  const [closed, setClosed] = useState<Set<string>>(new Set());

  const skills = useMemo(
    () => [...new Set(questions.map((q) => q.category.trim() || NO_SKILL))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [questions]
  );

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase();
    const match = (q: Question) =>
      !term ||
      q.prompt.toLowerCase().includes(term) ||
      q.category.toLowerCase().includes(term) ||
      Object.values(q.options).some((o) => o.toLowerCase().includes(term));
    return skills
      .map((skill) => ({
        skill,
        items: questions.filter((q) => (q.category.trim() || NO_SKILL) === skill && match(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [questions, skills, query]);

  const toggle = (skill: string) =>
    setClosed((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) next.delete(skill);
      else next.add(skill);
      return next;
    });

  const openForm = (value: { question?: Question; skill?: string }) => {
    setEditing(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = (question: Question) => {
    if (editing?.question) updateQuestion(question);
    else addQuestion(question);
    setEditing(null);
    onChange();
  };

  const remove = (q: Question) => {
    if (!confirm('Excluir esta pergunta?')) return;
    deleteQuestion(q.id);
    onChange();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Banco de perguntas</h1>
          <p className="text-lg text-base-content/75">
            {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'} em {skills.length}{' '}
            {skills.length === 1 ? 'habilidade' : 'habilidades'}. Na hora da aula, você marca quais usar.
          </p>
        </div>
        <button
          onClick={() => openForm({})}
          className="inline-flex items-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Nova pergunta
        </button>
      </header>

      {editing && (
        <QuestionForm
          key={editing.question?.id ?? `nova-${editing.skill ?? ''}`}
          question={editing.question}
          defaultSkill={editing.skill}
          skills={skills.filter((sk) => sk !== NO_SKILL)}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {/* Campo de busca como o do sistema: preenchido, sem borda */}
      <label className="relative block max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar pergunta, alternativa ou habilidade"
          aria-label="Buscar perguntas"
          className="w-full min-h-[2.75rem] rounded-[0.625rem] bg-[#e3e3e8] pl-10 pr-3 text-[1.0625rem] placeholder:text-base-content/55 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </label>

      {groups.length === 0 && (
        <p className="bg-base-100 border border-base-300 rounded-[0.875rem] p-6 text-lg text-base-content/75">
          {questions.length === 0
            ? 'Nenhuma pergunta ainda. Crie a primeira em "Nova pergunta".'
            : 'Nenhuma pergunta encontrada para essa busca.'}
        </p>
      )}

      <div className="space-y-8">
        {groups.map(({ skill, items }) => {
          const isClosed = closed.has(skill) && !query;
          return (
            <section key={skill} aria-label={skill} className="space-y-2">
              <div className="flex items-center justify-between gap-3 pl-2 pr-1">
                <button
                  onClick={() => toggle(skill)}
                  aria-expanded={!isClosed}
                  className="inline-flex items-center gap-2 min-h-[2.75rem] px-2 rounded-lg font-display text-2xl font-bold tracking-tight hover:bg-black/5"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-base-content/60 motion-safe:transition-transform ${isClosed ? '-rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                  {skill}
                  <span className="text-lg font-normal text-base-content/70">{items.length}</span>
                </button>
                <button
                  onClick={() => openForm({ skill: skill === NO_SKILL ? '' : skill })}
                  className="inline-flex items-center gap-1.5 min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Pergunta de {skill === NO_SKILL ? 'outra habilidade' : skill}
                </button>
              </div>
              {!isClosed && (
                <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
                  {items.map((q, i) => (
                    <li key={q.id} className={`px-5 py-4 space-y-3 ${i > 0 ? 'border-t border-base-300' : ''}`}>
                      <div className="flex items-start gap-3">
                        <p className="flex-1 text-lg font-semibold leading-snug pt-2">{q.prompt}</p>
                        <button
                          onClick={() => openForm({ question: q })}
                          className="shrink-0 min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
                          aria-label={`Editar: ${q.prompt}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => remove(q)}
                          className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-base-content/55 hover:text-error hover:bg-black/5"
                          aria-label={`Excluir: ${q.prompt}`}
                          title="Excluir pergunta"
                        >
                          <Trash2 className="w-5 h-5" aria-hidden="true" />
                        </button>
                      </div>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {LETTERS.map((l) => {
                          const isRight = l === q.correctOption;
                          return (
                            <li
                              key={l}
                              className={`flex items-center gap-2.5 rounded-[0.625rem] px-3 py-2 text-base ${
                                isRight ? 'bg-[#e8f5ec] text-[#14532d] font-semibold' : 'bg-base-200'
                              }`}
                            >
                              <span className="font-display font-bold">{l}</span>
                              <span className="flex-1 min-w-0">{q.options[l]}</span>
                              {isRight && (
                                <span className="inline-flex items-center gap-1 text-[0.9375rem]">
                                  <Check className="w-4 h-4" aria-hidden="true" />
                                  Certa
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
};
