import React from 'react';
import scene from '../../assets/sala-classplay.svg?raw';

// Ilustração da sala (fornecida pela equipe, com as cores do app). Inline para usar as fontes da página
export const ClassroomScene: React.FC = () => (
  <div
    className="[&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
    dangerouslySetInnerHTML={{ __html: scene }}
  />
);
