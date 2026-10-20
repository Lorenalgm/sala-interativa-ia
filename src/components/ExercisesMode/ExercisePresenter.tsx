import React, { useState, useEffect, useRef } from 'react';
import { Exercise, PoseFeedbackResult, PoseLandmark } from '../../types';
import { PoseFeedback } from './PoseFeedback';
import {
  evaluatePose,
  POSE_CONNECTIONS,
  LANDMARK_INDEX,
} from '../../services/poseDetector';
import {
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExercisePresenterProps {
  exercises: Exercise[];
  onCameraStatusChange?: (active: boolean) => void;
}

export const ExercisePresenter: React.FC<ExercisePresenterProps> = ({
  exercises,
  onCameraStatusChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [completedReps, setCompletedReps] = useState(0);
  const [holdTime, setHoldTime] = useState(0);
  const [feedback, setFeedback] = useState<PoseFeedbackResult>({
    isMatch: false,
    score: 0,
    feedback: 'Conecte a câmera para iniciar a avaliação da pose.',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(Date.now());
  const poseInstanceRef = useRef<any>(null);
  const isSimulatingRef = useRef(false);

  const currentExercise = exercises[currentIndex] || exercises[0];

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    setHoldTime(0);
    setCompletedReps(0);
    setFeedback({
      isMatch: false,
      score: 0,
      feedback: 'Posicione-se diante da câmera para iniciar.',
    });
  }, [currentIndex]);

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

        initMediaPipe();
      }
    } catch (err) {
      console.error('Falha ao abrir câmera:', err);
      setCameraError(true);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    if (onCameraStatusChange) onCameraStatusChange(false);
  };

  const initMediaPipe = () => {
    const PoseConstructor = (window as any).Pose;

    if (PoseConstructor) {
      try {
        const pose = new PoseConstructor({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: any) => {
          handlePoseResults(results.poseLandmarks);
        });

        poseInstanceRef.current = pose;
      } catch (e) {
        console.warn('Erro ao configurar MediaPipe:', e);
      }
    }

    startRenderLoop();
  };

  const handlePoseResults = (landmarks?: PoseLandmark[]) => {
    if (!landmarks || landmarks.length === 0) {
      setFeedback({
        isMatch: false,
        score: 0,
        feedback: 'Nenhuma pessoa detectada no campo de visão.',
      });
      setHoldTime(0);
      return;
    }

    const result = evaluatePose(landmarks, currentExercise.type);
    setFeedback(result);

    const now = Date.now();
    const dt = (now - lastTimestampRef.current) / 1000;
    lastTimestampRef.current = now;

    if (result.isMatch) {
      setHoldTime((prev) => {
        const next = prev + dt;
        if (next >= currentExercise.targetDurationSeconds) {
          triggerSuccess();
          return 0;
        }
        return next;
      });
    } else {
      setHoldTime((prev) => Math.max(0, prev - dt * 1.5));
    }

    drawSkeleton(landmarks, result.isMatch);
  };

  const triggerSuccess = () => {
    setCompletedReps((prev) => prev + 1);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const startRenderLoop = () => {
    const loop = async () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === 4 &&
        !isSimulatingRef.current
      ) {
        if (poseInstanceRef.current) {
          try {
            await poseInstanceRef.current.send({ image: videoRef.current });
          } catch (err) {
            // Segue o loop
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const drawSkeleton = (landmarks: PoseLandmark[], isMatch: boolean) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 4;
    ctx.strokeStyle = isMatch ? '#10b981' : '#f59e0b';

    POSE_CONNECTIONS.forEach(([startIdx, endIdx]) => {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];

      if (p1 && p2 && (p1.visibility ?? 1) > 0.4 && (p2.visibility ?? 1) > 0.4) {
        ctx.beginPath();
        ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
        ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
        ctx.stroke();
      }
    });

    landmarks.forEach((p, idx) => {
      if (idx > 28 || (p.visibility ?? 1) < 0.4) return;
      ctx.fillStyle = isMatch ? '#34d399' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.restore();
  };

  const handleSimulatePose = () => {
    isSimulatingRef.current = true;
    setIsSimulating(true);
    let progress = 0;

    const dummyLandmarks: PoseLandmark[] = Array.from({ length: 33 }, () => ({
      x: 0.5,
      y: 0.5,
      visibility: 0.9,
    }));

    dummyLandmarks[LANDMARK_INDEX.NOSE] = { x: 0.5, y: 0.25, visibility: 0.9 };
    dummyLandmarks[LANDMARK_INDEX.LEFT_SHOULDER] = { x: 0.42, y: 0.35, visibility: 0.9 };
    dummyLandmarks[LANDMARK_INDEX.RIGHT_SHOULDER] = { x: 0.58, y: 0.35, visibility: 0.9 };
    dummyLandmarks[LANDMARK_INDEX.LEFT_HIP] = { x: 0.45, y: 0.6, visibility: 0.9 };
    dummyLandmarks[LANDMARK_INDEX.RIGHT_HIP] = { x: 0.55, y: 0.6, visibility: 0.9 };

    if (currentExercise.type === 'arms_raised') {
      dummyLandmarks[LANDMARK_INDEX.LEFT_WRIST] = { x: 0.4, y: 0.15, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_WRIST] = { x: 0.6, y: 0.15, visibility: 0.9 };
    } else if (currentExercise.type === 't_pose') {
      dummyLandmarks[LANDMARK_INDEX.LEFT_WRIST] = { x: 0.2, y: 0.35, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_WRIST] = { x: 0.8, y: 0.35, visibility: 0.9 };
    } else if (currentExercise.type === 'star_pose') {
      dummyLandmarks[LANDMARK_INDEX.LEFT_WRIST] = { x: 0.25, y: 0.2, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_WRIST] = { x: 0.75, y: 0.2, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.LEFT_ANKLE] = { x: 0.3, y: 0.9, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_ANKLE] = { x: 0.7, y: 0.9, visibility: 0.9 };
    } else if (currentExercise.type === 'right_hand_up') {
      dummyLandmarks[LANDMARK_INDEX.LEFT_WRIST] = { x: 0.42, y: 0.55, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_WRIST] = { x: 0.62, y: 0.15, visibility: 0.9 };
    } else if (currentExercise.type === 'squat') {
      dummyLandmarks[LANDMARK_INDEX.LEFT_KNEE] = { x: 0.44, y: 0.75, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_KNEE] = { x: 0.56, y: 0.75, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.LEFT_ANKLE] = { x: 0.44, y: 0.9, visibility: 0.9 };
      dummyLandmarks[LANDMARK_INDEX.RIGHT_ANKLE] = { x: 0.56, y: 0.9, visibility: 0.9 };
    }

    const interval = setInterval(() => {
      progress += 0.5;
      setHoldTime(progress);
      setFeedback({
        isMatch: true,
        score: 100,
        feedback: 'Pose correta! Segure a posição.',
      });

      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = 640;
          canvasRef.current.height = 480;
          ctx.fillStyle = '#18181b';
          ctx.fillRect(0, 0, 640, 480);
          drawSkeleton(dummyLandmarks, true);
        }
      }

      if (progress >= currentExercise.targetDurationSeconds) {
        clearInterval(interval);
        triggerSuccess();
        isSimulatingRef.current = false;
        setIsSimulating(false);
      }
    }, 500);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const goPrev = () => setCurrentIndex((p) => Math.max(0, p - 1));
  const goNext = () => setCurrentIndex((p) => Math.min(exercises.length - 1, p + 1));

  // Mantém o estado de tela cheia em sincronia quando o professor sai com Esc
  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Mesmos atalhos do modo perguntas: setas trocam de exercício, F projeta
  const shortcutsRef = useRef({ goPrev, goNext, toggleFullscreen });
  shortcutsRef.current = { goPrev, goNext, toggleFullscreen };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, button, [contenteditable="true"]')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const actions = shortcutsRef.current;
      if (e.key === 'ArrowRight') actions.goNext();
      else if (e.key === 'ArrowLeft') actions.goPrev();
      else if (e.key === 'f' || e.key === 'F') actions.toggleFullscreen();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-4 ${
        isFullscreen ? 'h-screen py-6 bg-base-200 overflow-hidden' : 'pb-6'
      }`}
    >
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Barra de controle do professor: some na tela cheia */}
      {!isFullscreen && (
        <div className="no-print bg-base-100 border border-base-300 rounded-box px-3 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="btn btn-sm btn-square"
              aria-label="Exercício anterior"
              title="Exercício anterior (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-base font-bold text-base-content px-1 whitespace-nowrap">
              Exercício {currentIndex + 1} de {exercises.length}
            </span>

            <button
              onClick={goNext}
              disabled={currentIndex === exercises.length - 1}
              className="btn btn-sm btn-square"
              aria-label="Próximo exercício"
              title="Próximo exercício (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="badge badge-secondary font-semibold">
              Nível {currentExercise.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulatePose}
              disabled={isSimulating}
              className="btn btn-sm btn-ghost"
              title="Simula uma pose correta sem ninguém se mexer"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Simular pose</span>
            </button>

            {isCameraActive && (
              <button onClick={stopCamera} className="btn btn-sm btn-ghost text-error">
                <CameraOff className="w-4 h-4" />
                <span className="hidden sm:inline">Desligar câmera</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="btn btn-sm"
              title="Tela cheia para projetar (F)"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden md:inline">Projetar</span>
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo projetado: instruções à esquerda, câmera e retorno à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start flex-1 min-h-0">
        <section className="lg:col-span-5 bg-base-100 border border-base-300 rounded-box p-6 lg:p-8 space-y-5">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-base-content tracking-tight leading-tight">
              {currentExercise.title}
            </h1>
            <p className="text-lg lg:text-xl text-base-content/80 leading-relaxed">
              {currentExercise.description}
            </p>
          </div>

          <div className="space-y-4 border-t border-base-300 pt-5">
            <h2 className="text-xl lg:text-2xl font-bold text-base-content">Como fazer</h2>
            <ol className="space-y-4 text-xl lg:text-2xl text-base-content leading-snug">
              {currentExercise.instructions.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="w-full aspect-video bg-neutral rounded-box overflow-hidden relative flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {!isCameraActive && !isSimulating && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral/80 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-btn bg-neutral-content/10 flex items-center justify-center text-neutral-content/70">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-content">
                    {cameraError ? 'Não foi possível abrir a câmera' : 'Câmera desligada'}
                  </h3>
                  <p role={cameraError ? 'alert' : undefined} className="text-sm text-neutral-content/80 max-w-sm mt-1">
                    {cameraError
                      ? 'Confira se o navegador tem permissão para usar a câmera e tente de novo.'
                      : 'Ligue a câmera ou use a simulação para ver como a pose é avaliada.'}
                  </p>
                </div>
                <button onClick={startCamera} className="btn btn-sm btn-primary">
                  {cameraError ? 'Tentar de novo' : 'Ligar câmera'}
                </button>
              </div>
            )}
          </div>

          <PoseFeedback
            feedback={feedback}
            holdTimeSeconds={holdTime}
            targetDurationSeconds={currentExercise.targetDurationSeconds}
            completedReps={completedReps}
          />

          {isFullscreen && (
            <p className="text-sm text-base-content/70 text-center">
              <kbd className="kbd kbd-sm">←</kbd> <kbd className="kbd kbd-sm">→</kbd> trocar exercício ·{' '}
              <kbd className="kbd kbd-sm">Esc</kbd> sair
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
