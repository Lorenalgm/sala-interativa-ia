import React, { useEffect, useState } from 'react';
import { Alternative, GroupFormation, Question, RoundSession, ScriptId, Student } from '../../types';
import { GroupSetup } from './GroupSetup';
import { getScript } from '../../data/scripts';
import { QuestionPresenter } from './QuestionPresenter';
import { RoundSummaryView } from './RoundSummaryView';
import { addQuestion, deleteQuestion } from '../../services/storageService';
import {
  Plus,
  Play,
  Trash2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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
            className="btn btn-sm rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a preparação</span>
          </button>

          <span className="text-sm text-base-content/70 font-medium">
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

  // Visualização da Etapa 1: Preparação e Seleção de Perguntas
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Topo informativo */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
            {getScript(scriptId).name}: escolha as perguntas
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Escolha as perguntas desta rodada ou crie novas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="btn btn-sm"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>Criar nova pergunta</span>
          </button>

          <button
            onClick={() => {
              if (activeQuestions.length === 0) {
                alert('Selecione pelo menos uma pergunta para iniciar.');
                return;
              }
              setStage(isGroupScript ? 'groups' : 'presenting');
            }}
            disabled={activeQuestions.length === 0}
            className="btn btn-sm btn-primary"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>{isGroupScript ? 'Montar grupos' : 'Iniciar no datashow'} ({activeQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Modal de criação de pergunta simples */}
      {isCreatingQuestion && (
        <div className="bg-base-100 border-2 border-amber-300 rounded-box p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-base-300/60">
            <h2 className="text-lg font-bold text-base-content">
              Cadastrar pergunta para a turma
            </h2>
            <button
              onClick={() => setIsCreatingQuestion(false)}
              className="btn btn-sm btn-ghost"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-base-content/80 block mb-1">
                Enunciado da pergunta
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={2}
                placeholder="Exemplo: Qual é o papel da função de ativação?"
                className="textarea textarea-bordered text-base w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-base-content/80 block mb-1">
                  Habilidade
                </label>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="Exemplo: Frações"
                  className="input input-bordered input-sm w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-base-content/80 block mb-1">
                  Resposta certa
                </label>
                <select
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value as Alternative)}
                  className="select select-bordered select-sm w-full"
                >
                  <option value="A">Alternativa A</option>
                  <option value="B">Alternativa B</option>
                  <option value="C">Alternativa C</option>
                  <option value="D">Alternativa D</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-semibold text-base-content/80 block">
                Alternativas de resposta
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Alternativa A"
                  className="input input-bordered input-sm"
                />
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Alternativa B"
                  className="input input-bordered input-sm"
                />
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Alternativa C"
                  className="input input-bordered input-sm"
                />
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Alternativa D"
                  className="input input-bordered input-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-base-content/80 block mb-1">
                Explicação da resposta (opcional)
              </label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explicação da resposta (opcional)"
                className="input input-bordered input-sm w-full"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingQuestion(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-neutral"
              >
                Salvar pergunta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controles de seleção rápida */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-base-300">
        <div className="flex items-center gap-3 text-sm text-base-content/70">
          <span className="font-semibold text-base-content">
            {activeQuestions.length} de {questions.length} selecionadas
          </span>
          <span>•</span>
          <button
            onClick={selectAll}
            className="btn btn-link btn-sm px-1 text-amber-800 font-semibold"
          >
            Selecionar todas
          </button>
          <span>•</span>
          <button
            onClick={deselectAll}
            className="btn btn-link btn-sm px-1 text-base-content/70 font-normal"
          >
            Limpar seleção
          </button>
        </div>
      </div>

      {/* Lista de perguntas (exibindo por padrão apenas o enunciado) */}
      <div className="grid grid-cols-1 gap-3.5">
        {questions.map((q, idx) => {
          const isSelected = selectedIds.includes(q.id);
          const isExpanded = expandedIds.has(q.id);

          return (
            <div
              key={q.id}
              onClick={() => toggleSelect(q.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-base-100 border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                  : 'bg-base-100/70 border-base-300 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary mt-0.5"
                    checked={isSelected}
                    onChange={() => toggleSelect(q.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Selecionar pergunta ${idx + 1}`}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-base-content/70">
                        Pergunta {idx + 1}
                      </span>
                      <span className="badge badge-ghost badge-sm">
                        {q.category}
                      </span>
                    </div>

                    <p className="text-base font-bold text-base-content leading-snug">
                      {q.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => toggleExpand(q.id, e)}
                    className="btn btn-sm"
                    title={isExpanded ? 'Ocultar alternativas' : 'Ver alternativas e resposta certa'}
                  >
                    <span>{isExpanded ? 'Ocultar' : 'Ver alternativas'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={(e) => handleDelete(q.id, e)}
                    className="btn btn-sm btn-ghost btn-square text-base-content/60 hover:text-error"
                    title="Excluir pergunta"
                    aria-label={`Excluir pergunta ${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bloco expandido de alternativas e gabarito (somente exibido se a professora clicar para expandir) */}
              {isExpanded && (
                <div className="pt-3 mt-2 border-t border-base-300/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as Alternative[]).map((opt) => (
                    <div
                      key={opt}
                      className={`truncate px-3 py-1.5 rounded-xl border ${
                        opt === q.correctOption
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-base-200 border-base-300 text-base-content/70'
                      }`}
                    >
                      <strong className="mr-1">{opt}:</strong>
                      <span>{q.options[opt]}</span>
                      {opt === q.correctOption && (
                        <span className="ml-1 text-xs text-emerald-800 font-bold">
                          (resposta certa)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
