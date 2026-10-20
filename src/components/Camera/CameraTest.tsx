import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Lock, Unlock } from 'lucide-react';
import { Student } from '../../types';
import { ArucoCardDetector, DetectorStats } from '../../services/arucoDetector';
import { openClassroomCamera, setFocusLocked, stopStream } from '../../services/camera';
import { isCalibrationMarker, isStudentMarker } from '../../services/markerRanges';

interface CameraTestProps {
  students: Student[];
  onCameraStatusChange: (active: boolean) => void;
}

const TIPS = [
  'Câmera na frente da sala, a uns 2 m de altura e levemente inclinada para baixo.',
  'Com a câmera de ângulo estreito, teste também num canto da frente, apontada na diagonal da sala.',
  'Alunos levantam o cartão acima da cabeça, com a letra escolhida em cima.',
  'Sem janela atrás dos alunos. Papel fosco, sem plástico.',
  'Ligue a StreamCam numa porta USB 3 ou USB-C: em USB 2.0 ela fica limitada a 720p.',
  'Regra prática: cerca de 2,2 cm de marcador para cada metro até o aluno mais longe.',
  'Lousa: câmera ao lado do datashow, virada para o quadro, a uns 2,5 m ou mais para um quadro de 3 m.',
];

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
            ctx.strokeStyle = ok ? '#16a34a' : '#dc2626';
            ctx.lineWidth = Math.max(4, canvas.width / 320);
            ctx.beginPath();
            m.corners.forEach((c, i) => (i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = ok ? '#16a34a' : '#dc2626';
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

  const seen = new Set(readIds);
  const notRead = students.filter((s) => !seen.has(s.id));
  const readStudents = students.filter((s) => seen.has(s.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Teste da câmera</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Peça para a turma levantar os cartões e veja quem a câmera lê, antes de começar a aula.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="w-full aspect-video bg-neutral rounded-box relative overflow-hidden flex items-center justify-center">
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
            {!active && (
              <div className="text-center p-6 space-y-3">
                <Camera className="w-10 h-10 mx-auto text-neutral-content/60" aria-hidden="true" />
                <p role={error ? 'alert' : undefined} className="text-neutral-content/80">
                  {error
                    ? 'Não foi possível abrir a câmera. Confira a permissão do navegador.'
                    : 'A câmera está desligada.'}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {active ? (
              <button onClick={stop} className="btn btn-sm">
                <CameraOff className="w-4 h-4" />
                Desligar câmera
              </button>
            ) : (
              <button onClick={start} className="btn btn-sm btn-primary">
                <Camera className="w-4 h-4" />
                {error ? 'Tentar de novo' : 'Ligar câmera'}
              </button>
            )}
            {active && (
              <button onClick={toggleFocus} className="btn btn-sm" aria-pressed={locked}>
                {locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {locked ? 'Soltar foco' : 'Travar foco'}
              </button>
            )}
            {lockFailed && (
              <span role="status" className="text-sm text-base-content/70">
                Esta câmera não permite travar o foco pelo navegador.
              </span>
            )}
            {stats && active && (
              <span className="ml-auto text-sm text-base-content/70 tabular-nums" aria-live="off">
                {stats.width}×{stats.height} · {stats.fps} quadros/s · {stats.detectMs} ms por leitura
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <section className="bg-base-100 border border-base-300 rounded-box p-4 space-y-3">
            <h2 className="font-bold">
              Lidos: {readStudents.length} de {students.length}
            </h2>
            <ul className="flex flex-wrap gap-1.5" aria-label="Cartões lidos">
              {readStudents.map((s) => (
                <li key={s.id} className="badge badge-success py-3 font-semibold" title={s.name}>
                  {String(s.id).padStart(2, '0')} {s.name.split(' ')[0]}
                </li>
              ))}
            </ul>
            <h2 className="font-bold pt-1">Ainda não lidos ({notRead.length})</h2>
            <ul className="flex flex-wrap gap-1.5" aria-label="Cartões não lidos">
              {notRead.map((s) => (
                <li key={s.id} className="badge badge-ghost py-3" title={s.name}>
                  {String(s.id).padStart(2, '0')} {s.name.split(' ')[0]}
                </li>
              ))}
            </ul>
            {calibrationSeen > 0 && (
              <p role="status" className="text-sm text-base-content/80">
                Marcadores de calibração da lousa vistos: {calibrationSeen} de 4.
              </p>
            )}
            {unknownIds.length > 0 && (
              <p role="status" className="text-sm text-red-800">
                Cartões sem aluno na turma: {unknownIds.map((id) => `#${id}`).join(', ')}.
              </p>
            )}
          </section>

          <section className="bg-base-100 border border-base-300 rounded-box p-4 space-y-2">
            <h2 className="font-bold">Dicas de posição</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-base-content/80">
              {TIPS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
