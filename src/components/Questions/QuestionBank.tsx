import React, { useMemo, useState } from 'react';
import { ChevronDown, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Alternative, Question } from '../../types';
import { addQuestion, deleteQuestion, updateQuestion } from '../../services/storageService';

interface QuestionBankProps {
  questions: Question[];
  onChange: () => void;
}

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];
const NO_SKILL = 'Sem habilidade';

interface Draft {
  id?: string;
  prompt: string;
  category: string;
  options: Record<Alternative, string>;
  correctOption: Alternative;
  explanation: string;
}

const emptyDraft = (category = ''): Draft => ({
  prompt: '',
  category,
  options: { A: '', B: '', C: '', D: '' },
  correctOption: 'A',
  explanation: '',
});

// Banco de perguntas do professor: agrupadas por habilidade, com busca, criação, edição e exclusão
export const QuestionBank: React.FC<QuestionBankProps> = ({ questions, onChange }) => {
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
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

  const startEdit = (q: Question) =>
    setDraft({
      id: q.id,
      prompt: q.prompt,
      category: q.category,
      options: { ...q.options },
      correctOption: q.correctOption,
      explanation: q.explanation,
    });

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.prompt.trim() || LETTERS.some((l) => !draft.options[l].trim())) {
      alert('Preencha a pergunta e as quatro alternativas.');
      return;
    }
    const question: Question = {
      id: draft.id ?? `custom-${Date.now()}`,
      prompt: draft.prompt.trim(),
      category: draft.category.trim() || 'Geral',
      options: {
        A: draft.options.A.trim(),
        B: draft.options.B.trim(),
        C: draft.options.C.trim(),
        D: draft.options.D.trim(),
      },
      correctOption: draft.correctOption,
      explanation: draft.explanation.trim() || 'Resposta correta registrada pelo professor.',
    };
    if (draft.id) updateQuestion(question);
    else addQuestion(question);
    setDraft(null);
    onChange();
  };

  const remove = (q: Question) => {
    if (!confirm('Excluir esta pergunta?')) return;
    deleteQuestion(q.id);
    onChange();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-extrabold tracking-[-0.025em]">Banco de perguntas</h1>
          <p className="text-lg text-base-content/80">
            {questions.length} {questions.length === 1 ? 'pergunta' : 'perguntas'} em {skills.length}{' '}
            {skills.length === 1 ? 'habilidade' : 'habilidades'}. Na rodada, você escolhe quais usar.
          </p>
        </div>
        <button onClick={() => setDraft(emptyDraft())} className="btn btn-primary">
          <Plus className="w-5 h-5" aria-hidden="true" />
          Nova pergunta
        </button>
      </div>

      {draft && (
        <form
          onSubmit={save}
          className="bg-base-100 border border-base-300 rounded-[1.25rem] p-6 sm:p-8 space-y-5"
          aria-label={draft.id ? 'Editar pergunta' : 'Nova pergunta'}
        >
          <h2 className="font-display text-2xl font-extrabold">
            {draft.id ? 'Editar pergunta' : 'Nova pergunta'}
          </h2>
          <label className="block space-y-1">
            <span className="text-sm font-bold">Enunciado</span>
            <textarea
              value={draft.prompt}
              onChange={(e) => setDraft({ ...draft, prompt: e.target.value })}
              rows={2}
              className="textarea textarea-bordered w-full text-base"
            />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-bold">Habilidade (agrupa as perguntas)</span>
              <input
                list="habilidades"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                placeholder="Exemplo: Frações"
                className="input input-bordered w-full"
              />
              <datalist id="habilidades">
                {skills.filter((s) => s !== NO_SKILL).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold">Resposta certa</span>
              <select
                value={draft.correctOption}
                onChange={(e) => setDraft({ ...draft, correctOption: e.target.value as Alternative })}
                className="select select-bordered w-full"
              >
                {LETTERS.map((l) => (
                  <option key={l} value={l}>
                    Alternativa {l}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LETTERS.map((l) => (
              <label key={l} className="flex items-center gap-2">
                <span className="w-8 h-8 shrink-0 rounded-lg bg-primary text-primary-content font-display font-extrabold flex items-center justify-center">
                  {l}
                </span>
                <input
                  value={draft.options[l]}
                  onChange={(e) => setDraft({ ...draft, options: { ...draft.options, [l]: e.target.value } })}
                  aria-label={`Alternativa ${l}`}
                  className="input input-bordered w-full"
                />
              </label>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="text-sm font-bold">Explicação da resposta (opcional)</span>
            <input
              value={draft.explanation}
              onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
              className="input input-bordered w-full"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Salvar pergunta
            </button>
          </div>
        </form>
      )}

      <label className="relative block max-w-md">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/60" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por enunciado ou habilidade"
          aria-label="Buscar perguntas"
          className="input input-bordered w-full pl-10"
        />
      </label>

      {groups.length === 0 && (
        <p className="text-lg text-base-content/80 border-2 border-dashed border-base-300 rounded-[1.25rem] p-8">
          {questions.length === 0
            ? 'Nenhuma pergunta ainda. Crie a primeira em "Nova pergunta".'
            : 'Nenhuma pergunta encontrada para essa busca.'}
        </p>
      )}

      <div className="space-y-6">
        {groups.map(({ skill, items }) => {
          const isClosed = closed.has(skill) && !query;
          return (
            <section key={skill} aria-label={skill} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => toggle(skill)}
                  aria-expanded={!isClosed}
                  className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-[-0.02em]"
                >
                  <ChevronDown
                    className={`w-5 h-5 motion-safe:transition-transform ${isClosed ? '-rotate-90' : ''}`}
                    aria-hidden="true"
                  />
                  {skill}
                  <span className="text-base font-bold text-base-content/70">{items.length}</span>
                </button>
                <button
                  onClick={() => setDraft(emptyDraft(skill === NO_SKILL ? '' : skill))}
                  className="btn btn-sm btn-ghost"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  Nesta habilidade
                </button>
              </div>
              {!isClosed && (
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {items.map((q) => (
                    <li key={q.id} className="bg-base-100 border border-base-300 rounded-2xl p-5 space-y-3">
                      <p className="text-lg font-bold leading-snug">{q.prompt}</p>
                      <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-base">
                        {LETTERS.map((l) => (
                          <li
                            key={l}
                            className={l === q.correctOption ? 'font-extrabold text-primary' : 'text-base-content/80'}
                          >
                            {l}. {q.options[l]}
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => startEdit(q)} className="btn btn-sm btn-ghost" aria-label={`Editar: ${q.prompt}`}>
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                          Editar
                        </button>
                        <button onClick={() => remove(q)} className="btn btn-sm btn-ghost" aria-label={`Excluir: ${q.prompt}`}>
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                          Excluir
                        </button>
                      </div>
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
