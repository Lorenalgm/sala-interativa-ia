import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alternative, Question, QuestionSessionRecord, RoundSession, Student } from '../../types';
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
} from 'lucide-react';

interface QuestionPresenterProps {
  questions: Question[];
  students: Student[];
  onSessionComplete?: () => void;
  onCameraStatusChange?: (active: boolean) => void;
  onFinishRound?: (round: RoundSession) => void;
}

export const QuestionPresenter: React.FC<QuestionPresenterProps> = ({
  questions,
  students,
  onSessionComplete,
  onCameraStatusChange,
  onFinishRound,
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<ArucoCardDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // O loop da câmera roda fora do ciclo do React: lê sempre os valores atuais por ref
  const isAnswerRevealedRef = useRef(isAnswerRevealed);
  const studentsRef = useRef(students);
  isAnswerRevealedRef.current = isAnswerRevealed;
  studentsRef.current = students;

  const currentQuestion = questions[currentIndex] || questions[0];
  const isLastQuestion = currentIndex === questions.length - 1;

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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

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
        !isAnswerRevealedRef.current
      ) {
        const detected = detectorRef.current.detect(videoRef.current);

        if (detected.length > 0) {
          detected.forEach((marker) => {
            const student = studentsRef.current.find((s) => s.id === marker.id);
            if (student) {
              setResponses((prev) => {
                if (prev[marker.id] === marker.option) return prev;
                return { ...prev, [marker.id]: marker.option };
              });
              setLastDetectedStudent(`Cartão #${marker.id} (${student.name})`);
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

    saveQuestionSession({
      id: `sessao-${Date.now()}`,
      questionId: currentQuestion.id,
      questionPrompt: currentQuestion.prompt,
      correctOption: currentQuestion.correctOption,
      timestamp: Date.now(),
      responses,
      totalClassStudents: students.length,
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
      name: `Rodada de ${questions.length} ${questions.length === 1 ? 'pergunta' : 'perguntas'}`,
      timestamp: Date.now(),
      totalClassStudents: students.length,
      questions: sessionQuestions,
      overallAccuracy: totalVotos > 0 ? Math.round((totalAcertos / totalVotos) * 100) : 0,
      totalResponses: totalVotos,
    };

    saveRoundSession(roundRecord);

    if (onFinishRound) {
      onFinishRound(roundRecord);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) return;

    setIsAnswerRevealed(false);
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    const nextQ = questions[nextIdx];
    setResponses(roundResponses[nextQ.id] || {});
    setLastDetectedStudent(null);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
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
    setIsAnswerRevealed(false);
    setResponses({});
    setLastDetectedStudent(null);
  };

  const handleSimulateQuickAnswers = () => {
    const simulated: Record<number, Alternative> = {};
    const options: Alternative[] = ['A', 'B', 'C', 'D'];
    students.forEach((s) => {
      const pickCorrect = Math.random() < 0.75;
      simulated[s.id] = pickCorrect
        ? currentQuestion.correctOption
        : options[Math.floor(Math.random() * options.length)];
    });
    setResponses(simulated);
    setLastDetectedStudent('Respostas da turma simuladas');
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
    if (!isAnswerRevealed) {
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
      } else if (e.key === 'ArrowRight') {
        actions.handleNext();
      } else if (e.key === 'ArrowLeft') {
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
              {!isAnswerRevealed ? (
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
          <ResponseRoster students={students} responses={responses} />

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
