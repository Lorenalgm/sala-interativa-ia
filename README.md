# ClassPlay: sala interativa com IA

Acervo de roteiros de aprendizagem ativa para professores. Cada roteiro usa só cartões de papel, um datashow comum e uma webcam virada para a turma. A leitura dos cartões roda no navegador do professor, sem servidor.

## Funcionalidades

- Biblioteca: página inicial com os roteiros. Pergunta rápida e Grupo com sorteio estão prontos; Instrução por pares e Lousa interativa aparecem como "em breve".
- Pergunta rápida: o professor projeta uma pergunta de múltipla escolha e a câmera lê os cartões. O marcador identifica o aluno, e a rotação do cartão indica a alternativa (A, B, C ou D).
- Grupo com sorteio: os grupos discutem, o sistema sorteia um aluno de cada grupo e só os cartões dos sorteados são lidos.
- Cartões: gera os cartões de cada aluno para imprimir.
- Turma: cadastro e edição dos alunos.
- Relatórios: histórico das rodadas e acertos por aluno.

Os dados (turma, perguntas e histórico) ficam salvos no `localStorage` do navegador.

## Tecnologias

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/) e [daisyUI](https://daisyui.com/), com o tema `classplay` definido em `tailwind.config.js`
- Fonte [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible+Next)
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
