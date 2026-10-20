import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Alternative,
  GroupFormation,
  GroupResult,
  Question,
  QuestionSessionRecord,
  RoundSession,
  ScriptId,
  Student,
} from '../../types';
import { SuggestionsPanel } from './SuggestionsPanel';
import { suggestForQuestion } from '../../services/suggestions';
import { DiscussionTimer, DrawPanel, GroupResultsPanel } from './GroupPanels';
import { openClassroomCamera } from '../../services/camera';
import { StableReader } from '../../services/stableReader';
import { drawFromGroup, drawOnePerGroup } from '../../services/groupDraw';
import { ResponseRoster } from './ResponseRoster';
import { QuestionResults } from './QuestionResults';
import { ArucoCardDetector } from '../../services/arucoDetector';
import { saveQuestionSession, saveRoundSession } from '../../services/storageService';
import {
  Camera,
  CameraOff,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle,
  RotateCcw,
  Shuffle,
  MessageSquare,
} from 'lucide-react';

interface QuestionPresenterProps {
  scriptId?: ScriptId;
  formation?: GroupFormation | null;
  questions: Question[];
  students: Student[];
  onSessionComplete?: () => void;
  onCameraStatusChange?: (active: boolean) => void;
  onFinishRound?: (round: RoundSession) => void;
  autoFullscreen?: boolean;
}

export const QuestionPresenter: React.FC<QuestionPresenterProps> = ({
  scriptId = 'quick-question',
  formation = null,
  questions,
  students,
  onSessionComplete,
  onCameraStatusChange,
  onFinishRound,
  autoFullscreen = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [responses, setResponses] = useState<Record<number, Alternative>>({});
  // Armazena as respostas gravadas de cada pergunta da rodada
  const [roundResponses, setRoundResponses] = useState<Record<string, Record<number, Alternative>>>({});
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastDetectedStudent, setLastDetectedStudent] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  // Sugestões ficam escondidas por padrão: a turma vê o datashow e a regra revela a resposta
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentId, setRecentId] = useState<number | null>(null);

  // Roteiro de grupo: discussão → sorteio → resposta dos sorteados → resultado
  const isGroup = scriptId === 'group-draw' && !!formation;
  const DISCUSSION_SECONDS = 120;
  const [phase, setPhase] = useState<'discussion' | 'draw' | 'answer'>(
    isGroup ? 'discussion' : 'answer'
  );
  const [formationState, setFormationState] = useState<GroupFormation | null>(formation);
  const [drawn, setDrawn] = useState<Record<string, number>>({});
  const [drawKey, setDrawKey] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(DISCUSSION_SECONDS);
  const [timerRunning, setTimerRunning] = useState(true);
  const [groupResults, setGroupResults] = useState<GroupResult[]>([]);
  const [roundGroupResults, setRoundGroupResults] = useState<Record<string, GroupResult[]>>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<ArucoCardDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // O loop da câmera roda fora do ciclo do React: lê sempre os valores atuais por ref
  const isAnswerRevealedRef = useRef(isAnswerRevealed);
  const studentsRef = useRef(students);
  const readerRef = useRef(new StableReader());
  // Só os sorteados são lidos no roteiro de grupo; null = a turma toda
  const allowedIdsRef = useRef<number[] | null>(null);
  const phaseRef = useRef(phase);
  isAnswerRevealedRef.current = isAnswerRevealed;
  studentsRef.current = students;
  phaseRef.current = phase;
  allowedIdsRef.current = isGroup ? Object.values(drawn) : null;

  // Alunos que aparecem na lista de respostas
  const rosterStudents = isGroup
    ? students.filter((s) => Object.values(drawn).includes(s.id))
    : students;

  // Cronômetro da discussão
  useEffect(() => {
    if (!isGroup || phase !== 'discussion' || !timerRunning) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [isGroup, phase, timerRunning]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;

  // Abre direto em tela cheia: a turma vê só o conteúdo, sem os controles do professor
  useEffect(() => {
    if (autoFullscreen && containerRef.current && !document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  }, []);

  // Inicia detector e câmera automaticamente ao abrir
  useEffect(() => {
    detectorRef.current = new ArucoCardDetector();
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await openClassroomCamera();

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setCameraError(false);
        if (onCameraStatusChange) onCameraStatusChange(true);
        startDetectionLoop();
      }
    } catch (err) {
      console.warn('Câmera não iniciada automaticamente ou permissão pendente:', err);
      setIsCameraActive(false);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (onCameraStatusChange) onCameraStatusChange(false);
  };

  const startDetectionLoop = useCallback(() => {
    const processFrame = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        detectorRef.current &&
        !isAnswerRevealedRef.current &&
        phaseRef.current === 'answer'
      ) {
        const detected = detectorRef.current.detect(videoRef.current);

        if (detected.length > 0) {
          detected.forEach((marker) => {
            const student = studentsRef.current.find((s) => s.id === marker.id);
            const allowed = allowedIdsRef.current;
            if (student && (!allowed || allowed.includes(marker.id))) {
              // Só conta depois de ~0,5 s com o cartão parado na mesma letra
              const confirmed = readerRef.current.feed(marker.id, marker.option, performance.now());
              if (confirmed) {
                setResponses((prev) => {
                  if (prev[marker.id] === confirmed) return prev;
                  return { ...prev, [marker.id]: confirmed };
                });
                setLastDetectedStudent(`Cartão #${marker.id} (${student.name})`);
                setRecentId(marker.id);
                setTimeout(() => setRecentId((cur) => (cur === marker.id ? null : cur)), 1200);
              }
            }
          });
        }

        // Desenha caixas de detecção no canvas sobreposto
        if (canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            detected.forEach((m) => {
              ctx.strokeStyle = '#f59e0b';
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.moveTo(m.corners[0].x, m.corners[0].y);
              for (let i = 1; i < m.corners.length; i++) {
                ctx.lineTo(m.corners[i].x, m.corners[i].y);
              }
              ctx.closePath();
              ctx.stroke();

              ctx.fillStyle = '#f59e0b';
              ctx.font = 'bold 18px sans-serif';
              ctx.fillText(`ID #${m.id}`, m.corners[0].x, m.corners[0].y - 8);
            });
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, []);

  // Revela o gabarito e armazena a resposta
  const handleRevealAnswer = () => {
    setIsAnswerRevealed(true);
    const updatedRound = {
      ...roundResponses,
      [currentQuestion.id]: responses,
    };
    setRoundResponses(updatedRound);

    let results: GroupResult[] | undefined;
    if (isGroup && formationState) {
      results = formationState.groups
        .filter((g) => drawn[g.id] !== undefined)
        .map((g) => {
          const answer = responses[drawn[g.id]];
          return {
            groupId: g.id,
            groupName: g.name,
            studentId: drawn[g.id],
            answer,
            correct: answer === currentQuestion.correctOption,
          };
        });
      setGroupResults(results);
      setRoundGroupResults((prev) => ({ ...prev, [currentQuestion.id]: results! }));
    }

    saveQuestionSession({
      id: `sessao-${Date.now()}`,
      questionId: currentQuestion.id,
      questionPrompt: currentQuestion.prompt,
      correctOption: currentQuestion.correctOption,
      timestamp: Date.now(),
      responses,
      totalClassStudents: students.length,
      groupResults: results,
    });

    if (onSessionComplete) onSessionComplete();
  };

  // Conclui a rodada inteira e constrói o registro consolidado
  const handleCompleteRound = () => {
    const finalRoundResponses = {
      ...roundResponses,
      [currentQuestion.id]: responses,
    };

    const sessionQuestions: QuestionSessionRecord[] = questions.map((q) => {
      const resp = finalRoundResponses[q.id] || {};
      return {
        id: `q-${q.id}-${Date.now()}`,
        questionId: q.id,
        questionPrompt: q.prompt,
        correctOption: q.correctOption,
        timestamp: Date.now(),
        responses: resp,
        totalClassStudents: students.length,
        groupResults:
          q.id === currentQuestion.id && groupResults.length > 0
            ? groupResults
            : roundGroupResults[q.id],
      };
    });

    let totalVotos = 0;
    let totalAcertos = 0;

    sessionQuestions.forEach((sq) => {
      Object.values(sq.responses).forEach((ans) => {
        totalVotos++;
        if (ans === sq.correctOption) {
          totalAcertos++;
        }
      });
    });

    const roundRecord: RoundSession = {
      id: `rodada-${Date.now()}`,
      name: `${isGroup ? 'Grupos: ' : ''}Rodada de ${questions.length} ${questions.length === 1 ? 'pergunta' : 'perguntas'}`,
      timestamp: Date.now(),
      totalClassStudents: students.length,
      questions: sessionQuestions,
      overallAccuracy: totalVotos > 0 ? Math.round((totalAcertos / totalVotos) * 100) : 0,
      totalResponses: totalVotos,
      scriptId,
    };

    saveRoundSession(roundRecord);

    if (onFinishRound) {
      onFinishRound(roundRecord);
    }
  };

  // Cada pergunta recomeça na primeira fase do roteiro
  const resetPhase = () => {
    readerRef.current.reset();
    setDrawn({});
    setGroupResults([]);
    setSecondsLeft(DISCUSSION_SECONDS);
    setTimerRunning(true);
    setPhase(isGroup ? 'discussion' : 'answer');
  };

  const handleNext = () => {
    if (isLastQuestion) return;
    resetPhase();

    setIsAnswerRevealed(false);
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    const nextQ = questions[nextIdx];
    setResponses(roundResponses[nextQ.id] || {});
    setLastDetectedStudent(null);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      resetPhase();
      setIsAnswerRevealed(false);
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = questions[prevIdx];
      setResponses(roundResponses[prevQ.id] || {});
      setLastDetectedStudent(null);
    }
  };

  const handleReset = () => {
    const hasAnswers = Object.keys(responses).length > 0;
    if (hasAnswers && !confirm('Repetir a pergunta? As respostas da turma serão apagadas.')) return;
    resetPhase();
    setIsAnswerRevealed(false);
    setResponses({});
    setLastDetectedStudent(null);
  };

  const handleSimulateQuickAnswers = () => {
    const simulated: Record<number, Alternative> = {};
    const options: Alternative[] = ['A', 'B', 'C', 'D'];
    rosterStudents.forEach((s) => {
      const pickCorrect = Math.random() < 0.75;
      simulated[s.id] = pickCorrect
        ? currentQuestion.correctOption
        : options[Math.floor(Math.random() * options.length)];
    });
    setResponses(simulated);
    setLastDetectedStudent('Respostas da turma simuladas');
  };

  // Sorteia um aluno por grupo e projeta os nomes
  const handleDraw = () => {
    if (!formationState) return;
    const result = drawOnePerGroup(formationState);
    setFormationState(result.formation);
    setDrawn(result.drawn);
    setDrawKey((k) => k + 1);
    setPhase('draw');
  };

  // Sorteia outro aluno de um grupo (por exemplo, se o sorteado saiu da sala)
  const handleRedraw = (groupId: string) => {
    if (!formationState) return;
    const result = drawFromGroup(formationState, groupId, drawn[groupId] !== undefined ? [drawn[groupId]] : []);
    if (result.studentId === null) return;
    setFormationState(result.formation);
    setDrawn((prev) => ({ ...prev, [groupId]: result.studentId as number }));
    setDrawKey((k) => k + 1);
  };

  // Correção manual feita pelo professor
  const handleCorrect = (studentId: number, option: Alternative) => {
    setResponses((prev) => ({ ...prev, [studentId]: option }));
    setLastDetectedStudent('Resposta corrigida pelo professor');
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Espaço: mostra a resposta certa; depois avança ou finaliza a rodada
  const handlePrimaryAction = () => {
    if (isGroup && !isAnswerRevealed && phase === 'discussion') {
      handleDraw();
    } else if (isGroup && !isAnswerRevealed && phase === 'draw') {
      setPhase('answer');
    } else if (!isAnswerRevealed) {
      handleRevealAnswer();
    } else if (isLastQuestion) {
      handleCompleteRound();
    } else {
      handleNext();
    }
  };

  // Mantém o estado de tela cheia em sincronia quando o professor sai com Esc
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Atalhos para conduzir a aula sem procurar botões
  const shortcutsRef = useRef({ handlePrimaryAction, handleNext, handlePrev, toggleFullscreen });
  shortcutsRef.current = { handlePrimaryAction, handleNext, handlePrev, toggleFullscreen };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, button, [contenteditable="true"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const actions = shortcutsRef.current;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        actions.handlePrimaryAction();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        actions.handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        actions.handlePrev();
      } else if (e.key === 'f' || e.key === 'F') {
        actions.toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const optionsKeys: Alternative[] = ['A', 'B', 'C', 'D'];

  return (
    <div
      ref={containerRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-between ${
        isFullscreen ? 'h-screen p-4 bg-base-200 overflow-hidden' : 'min-h-[calc(100vh-120px)] pb-4'
      }`}
    >
      {/* Barra de controle do professor: some na tela cheia, onde vale o teclado */}
      {!isFullscreen && (
        <div className="no-print bg-base-100 border border-base-300 rounded-box px-3 py-2.5 flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Navegação entre perguntas */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-sm btn-square"
              aria-label="Pergunta anterior"
              title="Pergunta anterior (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-base font-bold text-base-content px-1 whitespace-nowrap">
              Pergunta {currentIndex + 1} de {questions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={isLastQuestion}
              className="btn btn-sm btn-square"
              aria-label="Próxima pergunta"
              title="Próxima pergunta (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="hidden sm:inline-flex badge badge-ghost">
              {currentQuestion.category}
            </span>
          </div>

          {/* Ações: a principal fica sempre por último, no mesmo lugar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateQuickAnswers}
              disabled={isGroup && phase !== 'answer'}
              className="btn btn-sm btn-ghost"
              title="Preenche respostas falsas para testar sem câmera"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Simular respostas</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="btn btn-sm"
              title="Tela cheia para projetar (F)"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden md:inline">Projetar</span>
            </button>

            {isAnswerRevealed && (
              <button
                onClick={handleReset}
                className="btn btn-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir</span>
              </button>
            )}

            <button
              onClick={handlePrimaryAction}
              className="btn btn-sm btn-primary min-w-[12rem]"
              title="Espaço"
            >
              {isGroup && !isAnswerRevealed && phase === 'discussion' ? (
                <>
                  <Shuffle className="w-4 h-4" />
                  <span>Sortear alunos</span>
                </>
              ) : isGroup && !isAnswerRevealed && phase === 'draw' ? (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Ler cartões</span>
                </>
              ) : !isAnswerRevealed ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Mostrar resposta certa</span>
                </>
              ) : isLastQuestion ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Finalizar rodada</span>
                </>
              ) : (
                <>
                  <span>Próxima pergunta</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Grid principal dividida: lado esquerdo para a pergunta (9 colunas) e lado direito para câmera e alunos (3 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Painel Esquerdo: Pergunta e Alternativas ou Gabarito (ocupa 9 colunas) */}
        <div className="lg:col-span-9 flex flex-col min-h-0">
          {!isAnswerRevealed ? (
            <div className="bg-base-100 border border-base-300 rounded-box p-6 sm:p-10 flex flex-col gap-8 lg:gap-10 flex-1 min-h-0">
              {/* Enunciado amplo e de fácil leitura de longe */}
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-base-content tracking-tight leading-tight max-w-[32ch]">
                {currentQuestion.prompt}
              </h1>

              {/* Etapa do grupo: cronômetro da discussão ou nomes sorteados */}
              {isGroup && phase === 'discussion' && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold flex items-center gap-2 text-base-content/80">
                    <MessageSquare className="w-6 h-6" aria-hidden="true" />
                    Conversem no grupo. Todos precisam entender a resposta.
                  </p>
                  <DiscussionTimer
                    seconds={secondsLeft}
                    running={timerRunning}
                    onToggle={() => setTimerRunning((r) => !r)}
                    onAdd={() => setSecondsLeft((s) => s + 30)}
                  />
                </div>
              )}
              {isGroup && formationState && phase !== 'discussion' && (
                <div className="space-y-3">
                  <p className="text-2xl font-bold">
                    {phase === 'draw' ? 'Sorteados:' : 'Só os sorteados levantam o cartão:'}
                  </p>
                  <DrawPanel
                    groups={formationState.groups}
                    drawn={drawn}
                    students={students}
                    drawKey={drawKey}
                    onRedraw={handleRedraw}
                  />
                </div>
              )}

              {/* Alternativas A, B, C, D: sempre as quatro visíveis, em tamanho de sala */}
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                {optionsKeys.map((opt) => (
                  <li key={opt} className="flex items-center gap-4">
                    <span
                      aria-hidden="true"
                      className="w-14 h-14 lg:w-16 lg:h-16 rounded-btn bg-primary text-primary-content flex items-center justify-center font-extrabold text-2xl lg:text-3xl flex-shrink-0"
                    >
                      {opt}
                    </span>
                    <p className="text-2xl lg:text-3xl font-bold text-base-content leading-snug">
                      <span className="sr-only">{opt}: </span>
                      {currentQuestion.options[opt]}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              {/* A pergunta continua visível para a turma conferir a resposta */}
              <p className="text-2xl lg:text-3xl font-bold text-base-content leading-snug px-1">
                {currentQuestion.prompt}
              </p>
              <QuestionResults
                question={currentQuestion}
                responses={responses}
              />
              {isGroup && <GroupResultsPanel results={groupResults} students={students} />}
            </div>
          )}
        </div>

        {/* Painel Direito: Câmera no topo e Quadrante de Alunos embaixo (ocupa 3 colunas) */}
        <div className="lg:col-span-3 flex flex-col gap-3 min-h-0">
          {/* Câmera visível por padrão na lateral */}
          <div className="bg-base-100 border border-base-300 rounded-2xl p-2.5 shadow-sm flex flex-col space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-base-content">
                Câmera da sala
              </span>
              {isCameraActive ? (
                <button onClick={stopCamera} className="btn btn-xs btn-ghost text-error no-print">
                  <CameraOff className="w-3.5 h-3.5" />
                  Desligar
                </button>
              ) : (
                <span className="text-xs font-semibold text-base-content/70">Desligada</span>
              )}
            </div>

            <div className="w-full aspect-video bg-neutral rounded-xl relative overflow-hidden flex items-center justify-center">
              {/* O elemento de vídeo está visível na página para decodificação imediata pelo navegador */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center text-center p-3 space-y-2">
                  <Camera className="w-6 h-6 text-neutral-content/60" />
                  <p role={cameraError ? 'alert' : undefined} className="text-sm text-neutral-content/80">
                    {cameraError
                      ? 'Não foi possível abrir a câmera. Confira a permissão do navegador.'
                      : 'A câmera lê os cartões da turma.'}
                  </p>
                  <button
                    onClick={startCamera}
                    className="btn btn-sm btn-primary"
                  >
                    {cameraError ? 'Tentar de novo' : 'Ligar câmera'}
                  </button>
                </div>
              )}
            </div>

            {/* Indicação sutil de cartão reconhecido */}
            {lastDetectedStudent && (
              <div role="status" className="alert alert-success py-1.5 px-2 gap-1.5 rounded-btn text-xs font-medium bg-emerald-50 border-emerald-200 text-emerald-900">
                <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                <span className="truncate">{lastDetectedStudent}</span>
              </div>
            )}
          </div>

          {/* Quadrante de respostas dos alunos */}
          <ResponseRoster
            students={rosterStudents}
            responses={responses}
            recentId={recentId}
            onCorrect={handleCorrect}
          />

          {isAnswerRevealed && (
            <div className="no-print space-y-2">
              <label className="label cursor-pointer justify-start gap-2 py-0">
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={showSuggestions}
                  onChange={(e) => setShowSuggestions(e.target.checked)}
                />
                <span className="label-text text-sm text-base-content/70">Sugestões para o professor</span>
              </label>
              {showSuggestions && (
                <SuggestionsPanel
                  suggestions={suggestForQuestion(currentQuestion.correctOption, responses)}
                />
              )}
            </div>
          )}

          {isFullscreen && (
            <p className="text-sm text-base-content/70 text-center">
              <kbd className="kbd kbd-sm">Espaço</kbd> resposta / próxima ·{' '}
              <kbd className="kbd kbd-sm">←</kbd> <kbd className="kbd kbd-sm">→</kbd> navegar ·{' '}
              <kbd className="kbd kbd-sm">Esc</kbd> sair
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
