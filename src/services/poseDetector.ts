import { PoseFeedbackResult, PoseLandmark, PoseType } from '../types';

// Índices dos principais pontos anatômicos da biblioteca MediaPipe Pose
export const LANDMARK_INDEX = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
};

// Calcula o ângulo em graus formado por três pontos (A - B - C), sendo B o vértice
export function calculateAngle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
}

// Avalia a postura corporal atual contra os critérios do exercício alvo
export function evaluatePose(landmarks: PoseLandmark[], exerciseType: PoseType): PoseFeedbackResult {
  if (!landmarks || landmarks.length < 29) {
    return {
      isMatch: false,
      score: 0,
      feedback: 'Posicione-se diante da câmera para detecção do corpo inteiro.',
    };
  }

  const nose = landmarks[LANDMARK_INDEX.NOSE];
  const lShoulder = landmarks[LANDMARK_INDEX.LEFT_SHOULDER];
  const rShoulder = landmarks[LANDMARK_INDEX.RIGHT_SHOULDER];
  const lElbow = landmarks[LANDMARK_INDEX.LEFT_ELBOW];
  const rElbow = landmarks[LANDMARK_INDEX.RIGHT_ELBOW];
  const lWrist = landmarks[LANDMARK_INDEX.LEFT_WRIST];
  const rWrist = landmarks[LANDMARK_INDEX.RIGHT_WRIST];
  const lHip = landmarks[LANDMARK_INDEX.LEFT_HIP];
  const rHip = landmarks[LANDMARK_INDEX.RIGHT_HIP];
  const lKnee = landmarks[LANDMARK_INDEX.LEFT_KNEE];
  const rKnee = landmarks[LANDMARK_INDEX.RIGHT_KNEE];
  const lAnkle = landmarks[LANDMARK_INDEX.LEFT_ANKLE];
  const rAnkle = landmarks[LANDMARK_INDEX.RIGHT_ANKLE];

  switch (exerciseType) {
    case 'arms_raised': {
      // Ambos os pulsos devem estar acima da linha dos ombros e do nariz (coordenada Y menor no canvas)
      const leftUp = lWrist.y < lShoulder.y - 0.05;
      const rightUp = rWrist.y < rShoulder.y - 0.05;
      const leftOverNose = lWrist.y < nose.y;
      const rightOverNose = rWrist.y < nose.y;

      if (leftUp && rightUp && leftOverNose && rightOverNose) {
        return {
          isMatch: true,
          score: 100,
          feedback: 'Pose correta. Mantenha os braços firmes para o alto.',
        };
      } else if (!leftUp && !rightUp) {
        return {
          isMatch: false,
          score: 20,
          feedback: 'Erga ambos os braços acima da cabeça.',
        };
      } else if (!leftUp) {
        return {
          isMatch: false,
          score: 60,
          feedback: 'Erga também o braço esquerdo.',
        };
      } else {
        return {
          isMatch: false,
          score: 60,
          feedback: 'Erga também o braço direito.',
        };
      }
    }

    case 't_pose': {
      // Pulsos na altura aproximada dos ombros e afastados lateralmente
      const leftDiff = Math.abs(lWrist.y - lShoulder.y);
      const rightDiff = Math.abs(rWrist.y - rShoulder.y);
      const leftElbowDiff = Math.abs(lElbow.y - lShoulder.y);
      const rightElbowDiff = Math.abs(rElbow.y - rShoulder.y);

      const tolerance = 0.12;
      const leftLevel = leftDiff < tolerance && leftElbowDiff < tolerance;
      const rightLevel = rightDiff < tolerance && rightElbowDiff < tolerance;

      if (leftLevel && rightLevel) {
        return {
          isMatch: true,
          score: 100,
          feedback: 'Postura em T perfeita. Segure a posição.',
        };
      }

      let score = 30;
      if (leftLevel) score += 35;
      if (rightLevel) score += 35;

      return {
        isMatch: false,
        score,
        feedback: 'Alinhe ambos os braços na altura horizontal dos ombros.',
      };
    }

    case 'star_pose': {
      // Braços em diagonal alta e pernas afastadas
      const armsUp = lWrist.y < lShoulder.y && rWrist.y < rShoulder.y;
      const armsSpread = Math.abs(lWrist.x - rWrist.x) > Math.abs(lShoulder.x - rShoulder.x) * 1.5;
      const feetSpread = Math.abs(lAnkle.x - rAnkle.x) > Math.abs(lHip.x - rHip.x) * 1.6;

      if (armsUp && armsSpread && feetSpread) {
        return {
          isMatch: true,
          score: 100,
          feedback: 'Excelente estrela. Permaneça firme.',
        };
      }

      return {
        isMatch: false,
        score: (armsUp ? 40 : 0) + (armsSpread ? 30 : 0) + (feetSpread ? 30 : 0),
        feedback: 'Afaste as pernas e abra os braços em diagonal para o alto.',
      };
    }

    case 'right_hand_up': {
      // Apenas a mão direita erguida, braço esquerdo abaixo do ombro
      const rightUp = rWrist.y < nose.y;
      const leftDown = lWrist.y > lShoulder.y;

      if (rightUp && leftDown) {
        return {
          isMatch: true,
          score: 100,
          feedback: 'Braço direito erguido com sucesso.',
        };
      } else if (!rightUp) {
        return {
          isMatch: false,
          score: 30,
          feedback: 'Levante a mão direita acima da cabeça.',
        };
      } else {
        return {
          isMatch: false,
          score: 50,
          feedback: 'Abaixe o braço esquerdo.',
        };
      }
    }

    case 'squat': {
      // Ângulo dos joelhos flexionado abaixo de 135 graus
      const leftKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
      const rightKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

      if (avgKneeAngle < 135 && avgKneeAngle > 60) {
        return {
          isMatch: true,
          score: 100,
          feedback: 'Agachamento correto. Mantenha a posição.',
          activeAngles: { joelho: Math.round(avgKneeAngle) },
        };
      }

      return {
        isMatch: false,
        score: Math.max(20, Math.min(85, Math.round(180 - avgKneeAngle))),
        feedback: 'Dobre mais os joelhos mantendo a coluna ereta.',
        activeAngles: { joelho: Math.round(avgKneeAngle) },
      };
    }

    default:
      return {
        isMatch: false,
        score: 0,
        feedback: 'Aguardando início do exercício.',
      };
  }
}

// Conexões anatômicas padrão para desenhar o esqueleto no canvas
export const POSE_CONNECTIONS: [number, number][] = [
  // Cabeça
  [LANDMARK_INDEX.NOSE, LANDMARK_INDEX.LEFT_SHOULDER],
  [LANDMARK_INDEX.NOSE, LANDMARK_INDEX.RIGHT_SHOULDER],
  // Ombros e tronco
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.RIGHT_SHOULDER],
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.LEFT_HIP],
  [LANDMARK_INDEX.RIGHT_SHOULDER, LANDMARK_INDEX.RIGHT_HIP],
  [LANDMARK_INDEX.LEFT_HIP, LANDMARK_INDEX.RIGHT_HIP],
  // Braço esquerdo
  [LANDMARK_INDEX.LEFT_SHOULDER, LANDMARK_INDEX.LEFT_ELBOW],
  [LANDMARK_INDEX.LEFT_ELBOW, LANDMARK_INDEX.LEFT_WRIST],
  // Braço direito
  [LANDMARK_INDEX.RIGHT_SHOULDER, LANDMARK_INDEX.RIGHT_ELBOW],
  [LANDMARK_INDEX.RIGHT_ELBOW, LANDMARK_INDEX.RIGHT_WRIST],
  // Perna esquerda
  [LANDMARK_INDEX.LEFT_HIP, LANDMARK_INDEX.LEFT_KNEE],
  [LANDMARK_INDEX.LEFT_KNEE, LANDMARK_INDEX.LEFT_ANKLE],
  // Perna direita
  [LANDMARK_INDEX.RIGHT_HIP, LANDMARK_INDEX.RIGHT_KNEE],
  [LANDMARK_INDEX.RIGHT_KNEE, LANDMARK_INDEX.RIGHT_ANKLE],
];
