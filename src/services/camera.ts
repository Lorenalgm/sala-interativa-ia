// Abre a câmera na maior resolução disponível (1920x1080 com a StreamCam)
export async function openClassroomCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
    audio: false,
  });
}

// O foco automático pode ficar "caçando" com os alunos se mexendo: trava depois de ajustar
export async function setFocusLocked(stream: MediaStream, locked: boolean): Promise<boolean> {
  const track = stream.getVideoTracks()[0];
  if (!track) return false;
  try {
    await track.applyConstraints({
      advanced: [{ focusMode: locked ? 'manual' : 'continuous' } as MediaTrackConstraintSet],
    });
    return true;
  } catch {
    return false;
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((t) => t.stop());
}
