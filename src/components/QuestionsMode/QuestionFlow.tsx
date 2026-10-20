import React, { useState } from 'react';
import { Alternative, Question, RoundSession, Student } from '../../types';
import { QuestionPresenter } from './QuestionPresenter';
import { RoundSummaryView } from './RoundSummaryView';
import { addQuestion, deleteQuestion } from '../../services/storageService';
import {
  Plus,
  Play,
  Trash2,
  CheckSquare,
  Square,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuestionFlowProps {
  questions: Question[];
  students: Student[];
  onRefreshQuestions: () => void;
  onSessionComplete: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onNavigateToReports?: () => void;
}

export const QuestionFlow: React.FC<QuestionFlowProps> = ({
  questions,
  students,
  onRefreshQuestions,
  onSessionComplete,
  onCameraStatusChange,
  onNavigateToReports,
}) => {
  // Estado do fluxo: 'setup' (seleção), 'presenting' (projeção), 'summary' (resumo da rodada)
  const [stage, setStage] = useState<'setup' | 'presenting' | 'summary'>('setup');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    questions.map((q) => q.id)
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [completedRound, setCompletedRound] = useState<RoundSession | null>(null);

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
    if (confirm('Deseja excluir esta pergunta?')) {
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

  // Visualização durante a apresentação no Datashow
  if (stage === 'presenting') {
    return (
      <div className="space-y-2">
        <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 pt-2 flex items-center justify-between">
          <button
            onClick={() => setStage('setup')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-semibold shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para seleção de perguntas</span>
          </button>

          <span className="text-xs text-zinc-500 font-medium">
            Sessão com {activeQuestions.length} {activeQuestions.length === 1 ? 'questão' : 'questões'}
          </span>
        </div>

        <QuestionPresenter
          questions={activeQuestions}
          students={students}
          onSessionComplete={onSessionComplete}
          onCameraStatusChange={onCameraStatusChange}
          onFinishRound={handleFinishRound}
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
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Fluxo da aula
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight">
            Preparação das perguntas
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Selecione as perguntas que farão parte desta rodada ou adicione novas questões.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 text-xs font-semibold shadow-xs transition-all"
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
              setStage('presenting');
            }}
            disabled={activeQuestions.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 text-xs font-bold shadow-xs transition-all"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>Iniciar no datashow ({activeQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Modal de criação de pergunta simples */}
      {isCreatingQuestion && (
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-950">
              Cadastrar pergunta para a turma
            </h2>
            <button
              onClick={() => setIsCreatingQuestion(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Enunciado da pergunta
              </label>
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                rows={2}
                placeholder="Exemplo: Qual é o papel da função de ativação?"
                className="w-full px-3.5 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="Exemplo: Visão computacional"
                  className="w-full px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 block mb-1">
                  Alternativa correta (gabarito)
                </label>
                <select
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value as Alternative)}
                  className="w-full px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                >
                  <option value="A">Alternativa A</option>
                  <option value="B">Alternativa B</option>
                  <option value="C">Alternativa C</option>
                  <option value="D">Alternativa D</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-700 block">
                Alternativas de resposta
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Alternativa A"
                  className="px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <input
                  type="text"
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Alternativa B"
                  className="px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Alternativa C"
                  className="px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Alternativa D"
                  className="px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-700 block mb-1">
                Explicação do gabarito (opcional)
              </label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explicação da resposta (opcional)"
                className="w-full px-3 py-2 bg-stone-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingQuestion(false)}
                className="px-4 py-2 rounded-xl text-xs text-zinc-600 hover:bg-zinc-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs"
              >
                Salvar pergunta
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controles de seleção rápida */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-zinc-200">
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span className="font-semibold text-zinc-900">
            {activeQuestions.length} de {questions.length} selecionadas
          </span>
          <span>•</span>
          <button
            onClick={selectAll}
            className="text-amber-700 font-semibold hover:underline"
          >
            Selecionar todas
          </button>
          <span>•</span>
          <button
            onClick={deselectAll}
            className="text-zinc-500 hover:underline"
          >
            Limpar seleção
          </button>
        </div>

        <span className="text-xs text-zinc-400">
          Por padrão a lista mostra só os enunciados
        </span>
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
                  ? 'bg-white border-amber-400 shadow-xs ring-1 ring-amber-400/30'
                  : 'bg-white/70 border-zinc-200 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="pt-0.5 flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-500">
                        Questão {idx + 1}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-zinc-600 border border-zinc-200">
                        {q.category}
                      </span>
                    </div>

                    <p className="text-base font-bold text-zinc-950 leading-snug">
                      {q.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => toggleExpand(q.id, e)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-zinc-700 text-xs font-semibold transition-colors"
                    title={isExpanded ? 'Ocultar alternativas' : 'Ver alternativas e gabarito'}
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
                    className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                    title="Excluir questão"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bloco expandido de alternativas e gabarito (somente exibido se a professora clicar para expandir) */}
              {isExpanded && (
                <div className="pt-3 mt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as Alternative[]).map((opt) => (
                    <div
                      key={opt}
                      className={`truncate px-3 py-1.5 rounded-xl border ${
                        opt === q.correctOption
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-stone-50 border-zinc-200/60 text-zinc-600'
                      }`}
                    >
                      <strong className="mr-1">{opt}:</strong>
                      <span>{q.options[opt]}</span>
                      {opt === q.correctOption && (
                        <span className="ml-1 text-xs text-emerald-700 font-bold uppercase">
                          (Gabarito)
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
