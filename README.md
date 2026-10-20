# ClassPlay — Sala interativa com IA

Aplicação web para sala de aula interativa que usa visão computacional no navegador do professor. Os alunos respondem perguntas levantando cartões com marcadores impressos e fazem exercícios físicos com feedback de postura em tempo real, tudo pela webcam e sem servidor.

## Funcionalidades

- **Modo Perguntas**: o professor apresenta uma pergunta de múltipla escolha e a câmera lê os cartões dos alunos. Cada marcador identifica o aluno, e a rotação do cartão indica a alternativa escolhida (A, B, C ou D).
- **Modo Exercícios**: detecção de pose corporal com MediaPipe Pose, com feedback sobre a execução dos movimentos.
- **Gerador de cartões**: gera os cartões com marcadores de cada aluno, prontos para impressão.
- **Gestão da turma**: cadastro e edição dos alunos.
- **Relatórios**: histórico das rodadas e desempenho por aluno.

Os dados (turma, perguntas e histórico) ficam salvos no `localStorage` do navegador.

## Tecnologias

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MediaPipe Pose](https://developers.google.com/mediapipe) (via CDN)
- [lucide-react](https://lucide.dev/) e [canvas-confetti](https://github.com/catdad/canvas-confetti)

## Como rodar

Pré-requisito: Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Acesse o endereço exibido no terminal (por padrão `http://localhost:5173`) e permita o acesso à câmera.

### Outros comandos

| Comando           | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `npm run build`   | Verifica os tipos e gera o build em `dist/` |
| `npm run preview` | Serve o build de produção localmente      |

## Estrutura

```
src/
├── components/
│   ├── CardGenerator/   # Impressão dos cartões com marcadores
│   ├── Classroom/       # Gestão da turma
│   ├── ExercisesMode/   # Exercícios com detecção de pose
│   ├── Home/            # Painel inicial
│   ├── QuestionsMode/   # Rodadas de perguntas
│   └── Reports/         # Relatórios de desempenho
├── data/                # Alunos, perguntas e exercícios padrão
├── services/            # Detecção de marcadores, pose e armazenamento
└── types/               # Tipos compartilhados
```

> A câmera só funciona em `localhost` ou em páginas servidas via HTTPS.
