import { RefObject, useEffect, useRef, useState } from 'react';
import { DetectedMarker } from '../../types';
import { ArucoCardDetector, DetectorStats } from '../../services/arucoDetector';
import { openClassroomCamera, setFocusLocked, stopStream } from '../../services/camera';
import { HandReading, HandTracker } from '../../services/handTracker';

export interface BoardFrame {
  markers: DetectedMarker[]; // vazio quando a leitura de marcadores está desligada
  hand: HandReading | null; // sempre nulo quando a leitura da mão está desligada
}

interface Sources {
  markers: boolean;
  hands: boolean;
}

// Abre a câmera da lousa e lê, a cada quadro, os marcadores e/ou a mão. Quem usa só recebe o quadro.
export function useBoardCamera(
  videoRef: RefObject<HTMLVideoElement>,
  onFrame: (frame: BoardFrame, now: number) => void,
  sources: Sources,
  onCameraStatusChange?: (active: boolean) => void
) {
  const [error, setError] = useState(false);
  const [handError, setHandError] = useState(false);
  const [handsReady, setHandsReady] = useState(!sources.hands);
  const [stats, setStats] = useState<DetectorStats | null>(null);
  const sourcesRef = useRef(sources);
  sourcesRef.current = sources;
  const handler = useRef(onFrame);
  handler.current = onFrame;
  const status = useRef(onCameraStatusChange);
  status.current = onCameraStatusChange;

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frame = 0;
    let cancelled = false;
    let tracker: HandTracker | null = null;
    const detector = new ArucoCardDetector();

    if (sources.hands) {
      HandTracker.create()
        .then((t) => {
          if (cancelled) return t.close();
          tracker = t;
          setHandsReady(true);
        })
        .catch((err) => {
          console.warn('Leitura da mão não iniciada:', err);
          setHandError(true);
        });
    }

    (async () => {
      try {
        stream = await openClassroomCamera();
        if (cancelled) return stopStream(stream);
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        await setFocusLocked(stream, true);
        status.current?.(true);
        let lastStats = 0;
        const step = () => {
          if (cancelled) return;
          if (video.readyState === 4) {
            const now = performance.now();
            const markers = sourcesRef.current.markers ? detector.detect(video) : [];
            const hand = tracker ? tracker.detect(video, now) : null;
            handler.current({ markers, hand }, now);
            if (sourcesRef.current.markers && now - lastStats > 500) {
              lastStats = now;
              setStats({ ...detector.stats });
            }
          }
          frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      } catch (err) {
        console.warn('Câmera não iniciada:', err);
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stopStream(stream);
      tracker?.close();
      status.current?.(false);
    };
  }, [videoRef]); // eslint-disable-line react-hooks/exhaustive-deps

  return { error, handError, handsReady, stats };
}
