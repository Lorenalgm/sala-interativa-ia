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
  Minimize2,
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

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<ArucoCardDetector | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
        if (onCameraStatusChange) onCameraStatusChange(true);
        startDetectionLoop();
      }
    } catch (err) {
      console.warn('Câmera não iniciada automaticamente ou permissão pendente:', err);
      setIsCameraActive(false);
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
        !isAnswerRevealed
      ) {
        const detected = detectorRef.current.detect(videoRef.current);

        if (detected.length > 0) {
          detected.forEach((marker) => {
            const student = students.find((s) => s.id === marker.id);
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

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isAnswerRevealed, students]);

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
      name: `Rodada de ${questions.length} ${questions.length === 1 ? 'questão' : 'questões'}`,
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
    if (isLastQuestion) {
      handleCompleteRound();
      return;
    }

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
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const optionsKeys: Alternative[] = ['A', 'B', 'C', 'D'];

  return (
    <div
      ref={containerRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 flex flex-col justify-between ${
        isFullscreen ? 'h-screen p-4 bg-stone-50 overflow-hidden' : 'min-h-[calc(100vh-120px)] pb-4'
      }`}
    >
      {/* Barra superior de controle completa (todos os botões no topo) */}
      <div className="no-print bg-white border border-zinc-200 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Navegação entre perguntas */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-zinc-700 transition-colors"
            title="Pergunta anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-bold text-zinc-950 px-2 whitespace-nowrap">
            Pergunta {currentIndex + 1} de {questions.length}
          </span>

          <button
            onClick={handleNext}
            disabled={isLastQuestion && !isAnswerRevealed}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-30 text-zinc-700 transition-colors"
            title="Próxima pergunta"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full bg-stone-100 border border-zinc-200 text-zinc-600 font-medium">
            {currentQuestion.category}
          </span>
        </div>

        {/* Botões centrais e de ação da pergunta */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão de revelação ou encerramento da pergunta */}
          {!isAnswerRevealed ? (
            <button
              onClick={handleRevealAnswer}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-xs transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Encerrar pergunta e ver gabarito</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-700 text-xs font-semibold hover:bg-stone-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Repetir</span>
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleCompleteRound}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-xs transition-all"
                >
                  <Award className="w-4 h-4" />
                  <span>Finalizar rodada e ver resumo</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-xs transition-all"
                >
                  <span>Próxima pergunta</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Botão da câmera */}
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desligar câmera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Conectar câmera</span>
            </button>
          )}

          {/* Simulação de respostas para testes rápidos */}
          <button
            onClick={handleSimulateQuickAnswers}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-zinc-200 text-zinc-800 text-xs font-semibold"
            title="Simula as respostas dos alunos"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Simular</span>
          </button>

          {/* Alternar tela cheia */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-zinc-200 text-zinc-700"
            title="Alternar tela cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Grid principal dividida: lado esquerdo para a pergunta (9 colunas) e lado direito para câmera e alunos (3 colunas) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        {/* Painel Esquerdo: Pergunta e Alternativas ou Gabarito (ocupa 9 colunas) */}
        <div className="lg:col-span-9 flex flex-col justify-between space-y-4 min-h-0">
          {!isAnswerRevealed ? (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between flex-1 min-h-0 space-y-6">
              {/* Enunciado amplo e de fácil leitura de longe */}
              <div className="my-auto">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-zinc-950 tracking-tight leading-tight">
                  {currentQuestion.prompt}
                </h1>
              </div>

              {/* Alternativas A, B, C, D */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {optionsKeys.map((opt) => (
                  <div
                    key={opt}
                    className="flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border border-zinc-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-lg flex-shrink-0 shadow-xs">
                      {opt}
                    </span>
                    <p className="text-lg sm:text-xl font-bold text-zinc-900 pt-1 leading-snug">
                      {currentQuestion.options[opt]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
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
          <div className="bg-white border border-zinc-200 rounded-2xl p-2.5 shadow-xs flex flex-col space-y-2 flex-shrink-0">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="font-bold text-zinc-950">
                Câmera da sala
              </span>
              <span className={`text-xs font-semibold ${isCameraActive ? 'text-emerald-700' : 'text-zinc-400'}`}>
                {isCameraActive ? 'Leitura de cartões ativa' : 'Desconectada'}
              </span>
            </div>

            <div className="w-full aspect-video bg-zinc-950 rounded-xl relative overflow-hidden flex items-center justify-center">
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
                  <Camera className="w-6 h-6 text-zinc-500" />
                  <p className="text-xs text-zinc-400">
                    A câmera detecta os cartões da turma.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-xs"
                  >
                    Ativar câmera
                  </button>
                </div>
              )}
            </div>

            {/* Indicação sutil de cartão reconhecido */}
            {lastDetectedStudent && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-900 text-xs font-medium truncate">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">{lastDetectedStudent}</span>
              </div>
            )}
          </div>

          {/* Quadrante de respostas dos alunos */}
          <ResponseRoster students={students} responses={responses} />
        </div>
      </div>
    </div>
  );
};
