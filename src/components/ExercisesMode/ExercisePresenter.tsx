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
  Minimize2,
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
        if (onCameraStatusChange) onCameraStatusChange(true);

        initMediaPipe();
      }
    } catch (err) {
      console.error('Falha ao abrir câmera:', err);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
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
        feedback: 'Pose correta detectada em modo simulado.',
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
      }
    }, 500);
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

  return (
    <div ref={containerRef} className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <video ref={videoRef} className="hidden" playsInline muted autoPlay />

      {/* Barra superior de controle clean */}
      <div className="no-print bg-white border border-zinc-200 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-zinc-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs sm:text-sm font-semibold text-zinc-900 px-2">
            Exercício {currentIndex + 1} de {exercises.length}
          </span>

          <button
            onClick={() =>
              setCurrentIndex((p) => Math.min(exercises.length - 1, p + 1))
            }
            disabled={currentIndex === exercises.length - 1}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-zinc-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            Nível {currentExercise.difficulty}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span>Desligar câmera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Conectar câmera</span>
            </button>
          )}

          <button
            onClick={handleSimulatePose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold transition-colors"
            title="Simula uma pose correta sem ninguém se mexer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Simular pose</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-zinc-200 text-zinc-700 shadow-xs"
            title="Alternar tela cheia"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Painel esquerdo */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <span className="text-xs uppercase tracking-wider text-amber-700 font-bold px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 inline-block">
              Desafio corporal ativo
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-950">
              {currentExercise.title}
            </h1>

            <p className="text-zinc-600 text-sm leading-relaxed">
              {currentExercise.description}
            </p>

            <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-zinc-200/80">
              <span className="text-xs font-bold text-zinc-800 block uppercase tracking-wide">
                Instruções para os alunos
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-600">
                {currentExercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-950 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <PoseFeedback
            feedback={feedback}
            holdTimeSeconds={holdTime}
            targetDurationSeconds={currentExercise.targetDurationSeconds}
            completedReps={completedReps}
          />
        </div>

        {/* Painel direito com visualização */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-zinc-100 text-xs">
            <span className="font-bold text-zinc-950">
              Câmera e pontos do corpo
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              Alvo: {currentExercise.targetDurationSeconds} segundos contínuos
            </span>
          </div>

          <div className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full object-contain" />

            {!isCameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Câmera desconectada
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-sm mt-1">
                    Conecte a câmera ou use a simulação para ver como a pose é avaliada.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold shadow-sm"
                >
                  Ativar câmera
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
