import React, { useEffect, useState } from 'react';
import { Alternative, GroupFormation, Question, RoundSession, ScriptId, Student } from '../../types';
import { GroupSetup } from './GroupSetup';
import { getScript } from '../../data/scripts';
import { QuestionPresenter } from './QuestionPresenter';
import { RoundSummaryView } from './RoundSummaryView';
import { addQuestion, deleteQuestion } from '../../services/storageService';
import { ArrowLeft, Check, ChevronDown, Play, Plus, Trash2 } from 'lucide-react';

interface QuestionFlowProps {
  scriptId: ScriptId;
  questions: Question[];
  students: Student[];
  onRefreshQuestions: () => void;
  onSessionComplete: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onNavigateToReports?: () => void;
  onRoundProgressChange?: (inProgress: boolean) => void;
}

export const QuestionFlow: React.FC<QuestionFlowProps> = ({
  scriptId,
  questions,
  students,
  onRefreshQuestions,
  onSessionComplete,
  onCameraStatusChange,
  onNavigateToReports,
  onRoundProgressChange,
}) => {
  // Estado do fluxo: 'setup' (seleção), 'presenting' (projeção), 'summary' (resumo da rodada)
  const [stage, setStage] = useState<'setup' | 'groups' | 'presenting' | 'summary'>('setup');
  const [formation, setFormation] = useState<GroupFormation | null>(null);
  const isGroupScript = scriptId === 'group-draw';
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    questions.map((q) => q.id)
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [completedRound, setCompletedRound] = useState<RoundSession | null>(null);

  // Avisa o App quando há uma rodada sendo projetada
  useEffect(() => {
    onRoundProgressChange?.(stage === 'presenting');
  }, [stage, onRoundProgressChange]);

  // Campos do formulário de nova pergunta
  const [newPrompt, setNewPrompt] = useState('');
  const [newCat, setNewCat] = useState('Geral');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correct, setCorrect] = useState<Alternative>('A');
  const [explanation, setExplanation] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(questions.map((q) => q.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrompt.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Preencha a pergunta e todas as quatro opções.');
      return;
    }

    const newQuestion: Question = {
      id: `custom-${Date.now()}`,
      prompt: newPrompt.trim(),
      category: newCat.trim() || 'Geral',
      options: {
        A: optA.trim(),
        B: optB.trim(),
        C: optC.trim(),
        D: optD.trim(),
      },
      correctOption: correct,
      explanation: explanation.trim() || 'Resposta correta registrada pela professora.',
    };

    addQuestion(newQuestion);
    setSelectedIds((prev) => [newQuestion.id, ...prev]);
    setIsCreatingQuestion(false);

    setNewPrompt('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setExplanation('');
    onRefreshQuestions();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Excluir esta pergunta?')) {
      deleteQuestion(id);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      onRefreshQuestions();
    }
  };

  const activeQuestions = questions.filter((q) => selectedIds.includes(q.id));

  // Quando a rodada é finalizada
  const handleFinishRound = (round: RoundSession) => {
    setCompletedRound(round);
    setStage('summary');
    onSessionComplete();
  };

  // Se estiver na tela de resumo da rodada
  if (stage === 'summary' && completedRound) {
    return (
      <RoundSummaryView
        round={completedRound}
        students={students}
        onNewRound={() => {
          setStage('setup');
          setCompletedRound(null);
        }}
        onGoToReports={() => {
          if (onNavigateToReports) {
            onNavigateToReports();
          } else {
            setStage('setup');
          }
        }}
      />
    );
  }

  // Roteiro de grupo: monta os grupos antes de projetar
  if (stage === 'groups') {
    return (
      <GroupSetup
        students={students}
        onBack={() => setStage('setup')}
        onStart={(f) => {
          setFormation(f);
          setStage('presenting');
        }}
      />
    );
  }

  // Visualização durante a apresentação no Datashow
  if (stage === 'presenting') {
    return (
      <div className="space-y-2">
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-2 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('Voltar para a lista de perguntas? A rodada atual não será salva.')) {
                setStage('setup');
              }
            }}
            className="inline-flex items-center gap-1 min-h-[2.75rem] px-2 -ml-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Preparação</span>
          </button>

          <span className="text-base text-base-content/70 font-medium">
            Rodada com {activeQuestions.length} {activeQuestions.length === 1 ? 'pergunta' : 'perguntas'}
          </span>
        </div>

        <QuestionPresenter
          scriptId={scriptId}
          formation={formation}
          questions={activeQuestions}
          students={students}
          onSessionComplete={onSessionComplete}
          onCameraStatusChange={onCameraStatusChange}
          onFinishRound={handleFinishRound}
          autoFullscreen
        />
      </div>
    );
  }

  // Etapa 1: preparação. Lista agrupada como em Lembretes: marca à esquerda, pergunta, alternativas sob demanda
  const script = getScript(scriptId);
  const optionsKeys: Alternative[] = ['A', 'B', 'C', 'D'];
  const optionState: Record<Alternative, [string, (v: string) => void]> = {
    A: [optA, setOptA],
    B: [optB, setOptB],
    C: [optC, setOptC],
    D: [optD, setOptD],
  };
  const field =
    'w-full min-h-[2.75rem] rounded-[0.625rem] border border-base-300 bg-base-100 px-3.5 text-[1.0625rem] placeholder:text-base-content/45 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25';
  const startLabel = isGroupScript ? 'Montar grupos' : 'Iniciar no datashow';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">
            {script.name}
          </h1>
          <p className="text-lg text-base-content/75">
            Marque as perguntas desta rodada. Você pode criar uma nova aqui mesmo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-5 rounded-full bg-[#e3e3e8] hover:bg-[#d8d8de] text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            Nova pergunta
          </button>
          <button
            onClick={() => setStage(isGroupScript ? 'groups' : 'presenting')}
            disabled={activeQuestions.length === 0}
            className="inline-flex items-center gap-2 min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd] disabled:bg-[#e3e3e8] disabled:text-base-content/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            {startLabel}
            <span className="font-normal opacity-85">({activeQuestions.length})</span>
          </button>
        </div>
      </header>

      {/* Nova pergunta: formulário em grupo, alternativas com a marca de resposta certa ao lado */}
      {isCreatingQuestion && (
        <section aria-labelledby="nova-pergunta" className="bg-base-100 border border-base-300 rounded-[0.875rem] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h2 id="nova-pergunta" className="font-display text-2xl font-bold">
              Nova pergunta
            </h2>
            <button
              onClick={() => setIsCreatingQuestion(false)}
              className="min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-6">
            <label className="block space-y-1.5">
              <span className="text-base font-semibold">Enunciado</span>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={2}
                placeholder="Exemplo: Quantos lados tem um hexágono?"
                className={`${field} py-2.5 leading-snug`}
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-base font-semibold mb-1.5">Alternativas</legend>
              <p className="text-[0.9375rem] text-base-content/70 -mt-1 mb-2">Toque em "Certa" na alternativa correta.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {optionsKeys.map((opt) => {
                  const [value, setValue] = optionState[opt];
                  const isRight = correct === opt;
                  return (
                    <div key={opt} className="flex items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-11 h-11 rounded-[0.5rem] border-2 border-black bg-white font-display font-bold text-xl flex items-center justify-center"
                      >
                        {opt}
                      </span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={`Alternativa ${opt}`}
                        aria-label={`Alternativa ${opt}`}
                        className={field}
                      />
                      <button
                        type="button"
                        onClick={() => setCorrect(opt)}
                        aria-pressed={isRight}
                        aria-label={`Marcar ${opt} como resposta certa`}
                        className={`shrink-0 inline-flex items-center gap-1.5 min-h-[2.75rem] px-3 rounded-full text-[0.9375rem] font-semibold border ${
                          isRight
                            ? 'bg-success text-success-content border-success'
                            : 'border-base-300 text-base-content/75 hover:bg-black/5'
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
                <span className="text-base font-semibold">Habilidade</span>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="Exemplo: Frações"
                  className={field}
                />
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
                  className={field}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center min-h-[2.75rem] px-6 rounded-full bg-primary text-primary-content text-base font-semibold hover:bg-[#0036bd]"
              >
                Salvar pergunta
              </button>
            </div>
          </form>
        </section>
      )}

      <section aria-labelledby="lista-perguntas" className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4">
          <h2 id="lista-perguntas" className="text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">
            {activeQuestions.length} de {questions.length} marcadas
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={selectAll} className="min-h-[2.75rem] px-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
              Marcar todas
            </button>
            <button onClick={deselectAll} className="min-h-[2.75rem] px-2 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
              Desmarcar todas
            </button>
          </div>
        </div>

        <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
          {questions.map((q, idx) => {
            const isSelected = selectedIds.includes(q.id);
            const isExpanded = expandedIds.has(q.id);

            return (
              <li key={q.id} className="flex items-start gap-3 pl-3">
                {/* Marca circular, alvo de 44px */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`Marcar pergunta ${idx + 1}: ${q.prompt}`}
                  onClick={() => toggleSelect(q.id)}
                  className="shrink-0 w-11 h-11 mt-2.5 flex items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-primary text-primary-content' : 'border-2 border-[#aeaeb2]'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4" strokeWidth={3} aria-hidden="true" />}
                  </span>
                </button>

                <div className={`flex-1 min-w-0 py-3.5 pr-3 space-y-3 ${idx > 0 ? 'border-t border-base-300' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSelect(q.id)}
                      className="flex-1 min-w-0 text-left space-y-0.5"
                    >
                      <span className="block text-[0.9375rem] text-base-content/70">
                        Pergunta {idx + 1} · {q.category}
                      </span>
                      <span className={`block text-lg font-semibold leading-snug ${isSelected ? '' : 'text-base-content/60'}`}>
                        {q.prompt}
                      </span>
                    </button>

                    <button
                      onClick={(e) => toggleExpand(q.id, e)}
                      aria-expanded={isExpanded}
                      className="shrink-0 inline-flex items-center gap-1 min-h-[2.75rem] px-2.5 rounded-lg text-base font-semibold text-primary hover:bg-black/5"
                    >
                      Alternativas
                      <ChevronDown
                        className={`w-4 h-4 motion-safe:transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      onClick={(e) => handleDelete(q.id, e)}
                      className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg text-base-content/55 hover:text-error hover:bg-black/5"
                      aria-label={`Excluir pergunta ${idx + 1}`}
                      title="Excluir pergunta"
                    >
                      <Trash2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>

                  {isExpanded && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {optionsKeys.map((opt) => {
                        const isRight = opt === q.correctOption;
                        return (
                          <li
                            key={opt}
                            className={`flex items-center gap-2.5 rounded-[0.625rem] px-3 py-2 text-base ${
                              isRight ? 'bg-[#e8f5ec] text-[#14532d] font-semibold' : 'bg-base-200'
                            }`}
                          >
                            <span className="font-display font-bold">{opt}</span>
                            <span className="flex-1 min-w-0">{q.options[opt]}</span>
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
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};
