import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Lock, RotateCcw, Unlock } from 'lucide-react';
import { Student } from '../../types';
import { ArucoCardDetector, DetectorStats } from '../../services/arucoDetector';
import { openClassroomCamera, setFocusLocked, stopStream } from '../../services/camera';
import { isCalibrationMarker, isStudentMarker } from '../../services/markerRanges';

interface CameraTestProps {
  students: Student[];
  onCameraStatusChange: (active: boolean) => void;
}

// Dicas separadas pelo uso: cartões na sala ou lousa no quadro
const TIPS: { title: string; items: string[] }[] = [
  {
    title: 'Cartões na sala',
    items: [
      'Câmera na frente da sala, a uns 2 m de altura e levemente inclinada para baixo.',
      'Alunos levantam o cartão acima da cabeça, com a letra escolhida em cima.',
      'Sem janela atrás dos alunos. Papel fosco, sem plástico.',
      'Cerca de 2,2 cm de marcador para cada metro até o aluno mais longe. Câmera de ângulo estreito: teste num canto da frente, apontada na diagonal.',
      'Câmera USB: use uma porta USB 3 ou USB-C. Em USB 2.0, muitas ficam limitadas a 720p.',
    ],
  },
  {
    title: 'Lousa no quadro',
    items: ['Câmera ao lado do datashow, virada para o quadro, a uns 2,5 m ou mais para um quadro de 3 m.'],
  },
];

const pad = (id: number) => String(id).padStart(2, '0');
const pill =
  'inline-flex items-center gap-2 min-h-[2.75rem] rounded-full text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

export const CameraTest: React.FC<CameraTestProps> = ({ students, onCameraStatusChange }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<ArucoCardDetector | null>(null);
  const frameRef = useRef<number | null>(null);
  const studentsRef = useRef(students);
  studentsRef.current = students;

  const [active, setActive] = useState(false);
  const [error, setError] = useState(false);
  const [locked, setLocked] = useState(false);
  const [lockFailed, setLockFailed] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);
  const [unknownIds, setUnknownIds] = useState<number[]>([]);
  const [calibrationSeen, setCalibrationSeen] = useState(0);
  const [stats, setStats] = useState<DetectorStats | null>(null);
  // Quem já foi visto desde que a câmera ligou (o professor passeia pela sala)
  const seenRef = useRef<Set<number>>(new Set());

  const stop = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    onCameraStatusChange(false);
  };

  const start = async () => {
    try {
      const stream = await openClassroomCamera();
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play();
      detectorRef.current = detectorRef.current ?? new ArucoCardDetector();
      seenRef.current = new Set();
      setReadIds([]);
      setError(false);
      setActive(true);
      onCameraStatusChange(true);
      loop();
    } catch (err) {
      console.warn('Câmera não iniciada:', err);
      setError(true);
      setActive(false);
    }
  };

  const loop = () => {
    let lastStatsAt = 0;
    const step = () => {
      const video = videoRef.current;
      const detector = detectorRef.current;
      if (video && detector && video.readyState === 4) {
        const markers = detector.detect(video);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const known = new Set(studentsRef.current.map((s) => s.id));
          markers.forEach((m) => {
            const ok = known.has(m.id);
            ctx.strokeStyle = ok ? '#248a3d' : '#d70015';
            ctx.lineWidth = Math.max(4, canvas.width / 320);
            ctx.beginPath();
            m.corners.forEach((c, i) => (i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = ok ? '#248a3d' : '#d70015';
            ctx.font = `bold ${Math.max(18, canvas.width / 50)}px sans-serif`;
            ctx.fillText(`#${m.id} ${m.option}`, m.corners[0].x, m.corners[0].y - 8);
          });
        }

        const calibration = markers.filter((m) => isCalibrationMarker(m.id)).length;
        setCalibrationSeen((prev) => (prev === calibration ? prev : calibration));

        const before = seenRef.current.size;
        const unknown: number[] = [];
        markers.forEach((m) => {
          if (studentsRef.current.some((s) => s.id === m.id)) seenRef.current.add(m.id);
          else if (!isStudentMarker(m.id)) return;
          else unknown.push(m.id);
        });
        if (seenRef.current.size !== before) setReadIds([...seenRef.current]);
        setUnknownIds((prev) => (prev.join() === unknown.join() ? prev : unknown));

        const now = performance.now();
        if (now - lastStatsAt > 500) {
          lastStatsAt = now;
          setStats({ ...detector.stats });
        }
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFocus = async () => {
    if (!streamRef.current) return;
    const ok = await setFocusLocked(streamRef.current, !locked);
    setLockFailed(!ok);
    if (ok) setLocked(!locked);
  };

  // Zera a lista de lidos sem desligar a câmera, para testar de novo
  const resetRead = () => {
    seenRef.current = new Set();
    setReadIds([]);
  };

  const seen = new Set(readIds);
  const notRead = students.filter((s) => !seen.has(s.id));
  const readStudents = students.filter((s) => seen.has(s.id));

  const pct = students.length > 0 ? Math.round((readStudents.length / students.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.05]">Teste da câmera</h1>
        <p className="text-lg text-base-content/75">
          Antes da aula, peça para a turma levantar os cartões e veja quem a câmera consegue ler.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-3">
          <div className="w-full aspect-video bg-[#1c1c1e] rounded-[1.25rem] relative overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-contain ${active ? 'block' : 'hidden'}`}
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${active ? '' : 'hidden'}`}
            />
            {/* Desligada: a ação principal fica no centro, onde o olhar já está */}
            {!active && (
              <div className="text-center p-6 space-y-4">
                <Camera className="w-12 h-12 mx-auto text-white/60" aria-hidden="true" />
                <p role={error ? 'alert' : undefined} className="text-lg text-white/85 max-w-sm">
                  {error
                    ? 'Não foi possível abrir a câmera. Confira se o navegador tem permissão para usá-la.'
                    : 'A câmera está desligada.'}
                </p>
                <button onClick={start} className={`${pill} px-6 bg-primary text-primary-content hover:bg-[#0036bd]`}>
                  <Camera className="w-5 h-5" aria-hidden="true" />
                  {error ? 'Tentar de novo' : 'Ligar câmera'}
                </button>
              </div>
            )}
          </div>

          {active && (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={stop} className={`${pill} px-5 bg-[#e3e3e8] hover:bg-[#d8d8de]`}>
                <CameraOff className="w-4 h-4" aria-hidden="true" />
                Desligar
              </button>
              <button onClick={toggleFocus} className={`${pill} px-5 bg-[#e3e3e8] hover:bg-[#d8d8de]`} aria-pressed={locked}>
                {locked ? <Unlock className="w-4 h-4" aria-hidden="true" /> : <Lock className="w-4 h-4" aria-hidden="true" />}
                {locked ? 'Soltar foco' : 'Travar foco'}
              </button>
              {stats && (
                <span className="ml-auto text-[0.9375rem] text-base-content/70 tabular-nums" aria-live="off">
                  {stats.width}×{stats.height} · {stats.fps} quadros/s · {stats.detectMs} ms por leitura
                </span>
              )}
            </div>
          )}
          {lockFailed && (
            <p role="status" className="text-base text-base-content/75">
              Esta câmera não deixa o navegador travar o foco. Tudo bem: a leitura funciona assim mesmo.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {TIPS.map((group) => (
              <section key={group.title} aria-label={group.title} className="space-y-2">
                <h2 className="px-4 text-[0.8125rem] font-semibold uppercase tracking-wide text-base-content/70">{group.title}</h2>
                <ul className="bg-base-100 rounded-[0.875rem] border border-base-300 overflow-hidden">
                  {group.items.map((t, i) => (
                    <li key={t} className={`px-4 py-3 text-base leading-snug ${i > 0 ? 'border-t border-base-300' : ''}`}>
                      {t}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          {/* Quem a câmera já leu, no formato dos cartões */}
          <section aria-labelledby="lidos" className="bg-base-100 border border-base-300 rounded-[0.875rem] p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="lidos" className="text-[1.0625rem] font-semibold">Cartões lidos</h2>
                <p className="font-display text-5xl font-bold tracking-tight leading-none mt-2 tabular-nums" aria-live="polite">
                  {readStudents.length}
                  <span className="text-2xl font-semibold text-base-content/70"> de {students.length}</span>
                </p>
              </div>
              {readStudents.length > 0 && (
                <button onClick={resetRead} className="inline-flex items-center gap-1.5 min-h-[2.75rem] px-3 rounded-lg text-base font-semibold text-primary hover:bg-black/5">
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  Ler de novo
                </button>
              )}
            </div>
            <div className="h-3 rounded-full bg-[#e3e3e8] overflow-hidden" aria-hidden="true">
              <div className="h-full rounded-full bg-success motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${pct}%` }} />
            </div>
            <ul className="grid grid-cols-2 gap-1.5" aria-label="Alunos da turma">
              {students.map((s) => {
                const ok = seen.has(s.id);
                return (
                  <li
                    key={s.id}
                    title={s.name}
                    className={`flex items-center gap-2 min-h-[2.75rem] px-2.5 rounded-[0.625rem] text-base ${
                      ok ? 'bg-success text-success-content font-semibold' : 'bg-[#e3e3e8] text-base-content/80'
                    }`}
                  >
                    <span className="font-display font-bold tabular-nums">{pad(s.id)}</span>
                    <span className="truncate">{s.name.split(' ')[0]}</span>
                    <span className="sr-only">{ok ? '(lido)' : '(ainda não lido)'}</span>
                  </li>
                );
              })}
            </ul>
            {notRead.length > 0 && readStudents.length > 0 && (
              <p className="text-base text-base-content/75">
                Quem ainda não foi lido: peça para virar o cartão de frente para a câmera e levantar mais alto.
              </p>
            )}
            {calibrationSeen > 0 && (
              <p role="status" className="text-base text-base-content/80">
                Marcadores de calibração da lousa vistos: {calibrationSeen} de 4.
              </p>
            )}
            {unknownIds.length > 0 && (
              <p role="status" className="text-base font-semibold text-error">
                Cartões sem aluno na turma: {unknownIds.map((id) => `#${pad(id)}`).join(', ')}. Cadastre o aluno na Turma.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
