# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Professores do ensino fundamental e médio, de qualquer disciplina. Eles usam o ClassPlay durante a aula, com o notebook ligado a um datashow e a uma webcam virada para a turma. O professor opera o app; os alunos (incluindo crianças) só olham a projeção e participam com cartões de papel.

## Product Purpose

Acervo de roteiros de aprendizagem ativa que não exige nenhum aparelho dos alunos. Cada roteiro é uma sequência de etapas conduzida pelo professor: projeta a pergunta, a câmera lê os cartões levantados pela turma e a tela mostra o resultado. Hoje: Pergunta rápida e Grupo com sorteio; Instrução por pares e Lousa interativa aparecem como "em breve". Sucesso é a turma inteira participar e o professor ver na hora quem respondeu e quanto acertou.

## Positioning

Só datashow e uma câmera: os alunos não precisam de celular, tablet ou conta. Esse é o diferencial que o produto precisa manter.

## Operating Context

- Sala de aula com datashow; a tela projetada é lida de longe, do fundo da sala.
- O professor imprime os cartões (A4, 2 ou 4 por folha) antes da aula; cada aluno tem um cartão com marcador ArUco próprio, e a letra virada para cima indica a resposta.
- Fluxo de perguntas: preparar a rodada, projetar, ler os cartões, revelar o gabarito, ver o resumo e o histórico.
- Fluxo de grupo com sorteio: montar os grupos, projetar, discutir com cronômetro, sortear um aluno por grupo, ler só os cartões dos sorteados e mostrar o resultado por grupo.

## Capabilities and Constraints

- Aplicação web em React, TypeScript, Vite, Tailwind e daisyUI; roda inteiramente no navegador do professor, sem servidor.
- Leitura dos marcadores ArUco 4x4 feita no próprio app.
- Turma, perguntas e histórico ficam no `localStorage`; exportação do histórico em CSV.
- A câmera só funciona em `localhost` ou HTTPS.
- Modos de simulação permitem demonstrar respostas sem câmera.
- Terminologia: turma, aluno, cartão, rodada, pergunta, gabarito, roteiro, grupo, sorteio.

## Brand Commitments

Nome: ClassPlay. Interface em português do Brasil.

## Evidence on Hand

- 20 alunos de exemplo e perguntas padrão (`src/data/`).
- Não há depoimentos, escolas parceiras, métricas de uso ou estudos de eficácia. Não inventar.

## Product Principles

1. Nenhum aparelho do aluno: toda participação acontece com papel e a câmera do professor.
2. Legível do fundo da sala: o que é projetado precisa ser lido à distância por crianças.
3. Linguagem simples: textos que uma criança entende e que o professor lê em voz alta sem traduzir.
4. O professor conduz: controles claros e rápidos, sem atrapalhar o ritmo da aula.

## Accessibility & Inclusion

- Conteúdo projetado precisa ser legível à distância (tamanhos grandes, alto contraste).
- Público inclui crianças: linguagem simples e direta nas telas projetadas.
