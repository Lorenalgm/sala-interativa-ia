import React from 'react';
import { HandScriptId } from '../../types';
import { MIX_PACKS, SCALE_PACKS, SORT_PACKS } from '../../data/handActivities';
import { HandActivityFlow, HowStep } from './HandActivityFlow';
import { WhereIsPlayer } from './WhereIsPlayer';
import { SortPlayer } from './SortPlayer';
import { ColorMixPlayer } from './ColorMixPlayer';

interface HandModelFlowProps {
  scriptId: HandScriptId;
  onBack: () => void;
  onCameraStatusChange: (active: boolean) => void;
  onRoundProgressChange: (inProgress: boolean) => void;
}

const HOW: Record<HandScriptId, { title: string; lead: string; how: HowStep[] }> = {
  'where-is': {
    title: 'Onde fica?',
    lead: 'Uma reta aparece no quadro. Um aluno leva a mão até onde acha que fica a resposta e a tela mostra o quão perto chegou.',
    how: [
      { title: 'A pergunta aparece', text: 'Ex.: "Onde fica 3/4?" A turma pode discutir antes.' },
      { title: 'A mão escolhe', text: 'O aluno põe a mão na faixa e para no ponto. O anel enche em 1,5 s.' },
      { title: 'A tela revela', text: 'Mostra a resposta, a distância e uma curiosidade.' },
    ],
  },
  'sort-groups': {
    title: 'Classificar em grupos',
    lead: 'Cartões ficam soltos no quadro. Os alunos pegam cada um com a pinça e soltam na caixa do grupo certo.',
    how: [
      { title: 'Pegue com a pinça', text: 'Junte polegar e indicador sobre o cartão.' },
      { title: 'Arraste até a caixa', text: 'Com os dedos juntos, leve o cartão até o grupo.' },
      { title: 'Abra a mão', text: 'Certo: o cartão entra na caixa. Errado: a caixa balança e ele volta.' },
    ],
  },
  'color-mix': {
    title: 'Misturar cores',
    lead: 'Um triângulo com as três cores primárias. A posição da mão decide quanto de cada cor entra na mistura.',
    how: [
      { title: 'Veja a cor pedida', text: 'Ex.: "Faça laranja".' },
      { title: 'Mova a mão no triângulo', text: 'Perto de um canto entra mais daquela cor.' },
      { title: 'Segure na cor certa', text: 'Parecida o bastante por 1 s: a cor é descoberta.' },
    ],
  },
};

// Os três modelos com a mão no quadro compartilham a preparação; muda só o conteúdo e o jogo
const HandModelFlow: React.FC<HandModelFlowProps> = ({ scriptId, ...rest }) => {
  const info = HOW[scriptId];
  const packs =
    scriptId === 'where-is'
      ? SCALE_PACKS.map((p) => ({ ...p, count: `${p.questions.length} perguntas` }))
      : scriptId === 'sort-groups'
        ? SORT_PACKS.map((p) => ({ ...p, count: `${p.items.length} cartões` }))
        : MIX_PACKS.map((p) => ({ ...p, count: `${p.challenges.length} cores` }));

  return (
    <HandActivityFlow
      key={scriptId}
      {...info}
      packs={packs}
      onBack={rest.onBack}
      onCameraStatusChange={rest.onCameraStatusChange}
      onRoundProgressChange={rest.onRoundProgressChange}
      renderPlayer={(packId, homography, onExit) => {
        const common = { homography, onExit, onCameraStatusChange: rest.onCameraStatusChange };
        if (scriptId === 'where-is') return <WhereIsPlayer pack={SCALE_PACKS.find((p) => p.id === packId)!} {...common} />;
        if (scriptId === 'sort-groups') return <SortPlayer pack={SORT_PACKS.find((p) => p.id === packId)!} {...common} />;
        return <ColorMixPlayer pack={MIX_PACKS.find((p) => p.id === packId)!} {...common} />;
      }}
    />
  );
};

export default HandModelFlow;
