// Faixas de números do dicionário ARUCO_4X4_1000 (ids de 0 a 999)
export const STUDENT_MARKERS = { min: 1, max: 199 } as const;
export const BOARD_MARKERS = { min: 200, max: 899 } as const;
export const CALIBRATION_MARKERS = { min: 900, max: 903 } as const;

export const isStudentMarker = (id: number): boolean =>
  id >= STUDENT_MARKERS.min && id <= STUDENT_MARKERS.max;
