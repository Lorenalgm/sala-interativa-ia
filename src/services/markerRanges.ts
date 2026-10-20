// Faixas de números do dicionário ARUCO_4X4_1000 (ids de 0 a 999)
export const STUDENT_MARKERS = { min: 1, max: 199 } as const;
export const BOARD_MARKERS = { min: 200, max: 899 } as const;
export const CALIBRATION_MARKERS = { min: 900, max: 903 } as const;

export const isStudentMarker = (id: number): boolean =>
  id >= STUDENT_MARKERS.min && id <= STUDENT_MARKERS.max;

// Paleta da lousa: uma por grupo, ids 200 a 209 (a paleta do grupo N é 199 + N)
export const PADDLE_MARKERS = { min: 200, max: 209 } as const;

export const isPaddleMarker = (id: number): boolean =>
  id >= PADDLE_MARKERS.min && id <= PADDLE_MARKERS.max;

export const isCalibrationMarker = (id: number): boolean =>
  id >= CALIBRATION_MARKERS.min && id <= CALIBRATION_MARKERS.max;
