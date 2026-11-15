import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { Alternative, Question } from '../../types';

const LETTERS: Alternative[] = ['A', 'B', 'C', 'D'];

interface QuestionFormProps {
  // Pergunta a editar; sem ela, o formulário cria uma nova
  question?: Question;
  defaultSkill?: string;
  skills: string[];
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export const fieldClass =
  'w-full min-h-[2.75rem] rounded-[0.625rem] border border-base-300 bg-base-100 px-3.5 text-[1.0625rem] placeholder:text-base-content/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25';

// Formulário único de pergunta, usado no banco de perguntas e na preparação da aula.
// A resposta certa é marcada ao lado da alternativa; os erros aparecem no próprio formulário.
export const QuestionForm: React.FC<QuestionFormProps> = ({ question, defaultSkill = '', skills, onSave, onCancel }) => {
  const [prompt, setPrompt] = useState(question?.prompt ?? '');
  const [skill, setSkill] = useState(question?.category ?? defaultSkill);
  const [options, setOptions] = useState<Record<Alternative, string>>(
    question ? { ...question.options } : { A: '', B: '', C: '', D: '' }
  );
  const [correct, setCorrect] = useState<Alternative>(question?.correctOption ?? 'A');
  const [explanation, setExplanation] = useState(question?.explanation ?? '');
  const [tried, setTried] = useState(false);

  const missingPrompt = !prompt.trim();
  const missingOptions = LETTERS.filter((l) => !options[l].trim());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (missingPrompt || missingOptions.length > 0) return;
    onSave({
      id: question?.id ?? `custom-${Date.now()}`,
      prompt: prompt.trim(),
      category: skill.trim() || 'Geral',
      options: {
        A: options.A.trim(),
        B: options.B.trim(),
        C: options.C.trim(),
        D: options.D.trim(),
      },
      correctOption: correct,
      explanation: explanation.trim() || 'Resposta correta registrada pelo professor.',
    });
  };

  const invalid = (bad: boolean) => (tried && bad ? ' border-error focus:border-error focus:ring-error/25' : '');
  const title = question ? 'Editar pergunta' : 'Nova pergunta';

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={title}
      className="bg-base-100 border border-base-300 rounded-[0.875rem] p-6 sm:p-8 space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
        >
          Cancelar
        </button>
      </div>

      <label className="block space-y-1.5">
        <span className="text-base font-semibold">Enunciado</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          autoFocus
          placeholder="Exemplo: Quantos lados tem um hexágono?"
          aria-invalid={tried && missingPrompt}
          className={`${fieldClass} py-2.5 leading-snug${invalid(missingPrompt)}`}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-base font-semibold">Alternativas</legend>
        <p className="text-[0.9375rem] text-base-content/70">Toque em "Certa" na alternativa correta.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {LETTERS.map((l) => {
            const isRight = correct === l;
            return (
              <div key={l} className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="shrink-0 w-11 h-11 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-xl flex items-center justify-center"
                >
                  {l}
                </span>
                <input
                  type="text"
                  value={options[l]}
                  onChange={(e) => setOptions({ ...options, [l]: e.target.value })}
                  placeholder={`Alternativa ${l}`}
                  aria-label={`Alternativa ${l}`}
                  aria-invalid={tried && missingOptions.includes(l)}
                  className={`${fieldClass}${invalid(missingOptions.includes(l))}`}
                />
                <button
                  type="button"
                  onClick={() => setCorrect(l)}
                  aria-pressed={isRight}
                  aria-label={`Marcar ${l} como resposta certa`}
                  className={`shrink-0 inline-flex items-center gap-1.5 min-h-[2.75rem] px-3 rounded-full text-[0.9375rem] font-semibold border ${
                    isRight ? 'bg-success text-success-content border-success' : 'border-base-300 text-base-content/75 hover:bg-black/5'
                  }`}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  Certa
                </button>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-base font-semibold">
            Habilidade <span className="font-normal text-base-content/70">(agrupa as perguntas)</span>
          </span>
          <input
            list="habilidades"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="Exemplo: Frações"
            className={fieldClass}
          />
          <datalist id="habilidades">
            {skills.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block space-y-1.5">
          <span className="text-base font-semibold">
            Explicação <span className="font-normal text-base-content/70">(opcional)</span>
          </span>
          <input
            type="text"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Aparece no datashow depois da resposta"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4">
        {tried && (missingPrompt || missingOptions.length > 0) && (
          <p role="alert" className="text-base font-semibold text-error">
            {missingPrompt ? 'Escreva o enunciado' : ''}
            {missingPrompt && missingOptions.length > 0 ? ' e preencha ' : missingOptions.length > 0 ? 'Preencha ' : ''}
            {missingOptions.length > 0 &&
              (missingOptions.length === 1 ? `a alternativa ${missingOptions[0]}` : `as alternativas ${missingOptions.join(', ')}`)}
            .
          </p>
        )}
        <button
          type="submit"
          className="inline-flex items-center min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd]"
        >
          Salvar pergunta
        </button>
      </div>
    </form>
  );
};
