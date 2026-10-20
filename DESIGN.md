---
name: ClassPlay
description: Um catálogo de livros de roteiro em pé sobre o fundo verde claro do app, que viram na lombada e se abrem em página dupla, para o professor escolher e preparar a aula.
colors:
  teal: "#0a4d4a"
  cover-mustard: "#f2a900"
  cover-red: "#d62839"
  back-mustard: "#8a6200"
  back-red: "#8f1a28"
  ink: "#101820"
  page-white: "#ffffff"
  mist: "#e8f0ee"
  mist-edge: "#c9d8d4"
  page-edge-line: "#e4e4e0"
  info-blue: "#0369a1"
  success-green: "#047857"
  error-crimson: "#be123c"
  warning-ink: "#451a03"
typography:
  display:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 3.5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  editorial-headline:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.015em"
  editorial-section:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "clamp(1.875rem, 3vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  editorial-title:
    fontFamily: "Literata Variable, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.25
rounded:
  spine-side: "2px"
  btn: "12px"
  book-edge: "12px"
  panel: "20px"
  band: "28px"
  spread: "16px"
  tile: "8px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "56px"
components:
  book-cover-mustard:
    backgroundColor: "{colors.cover-mustard}"
    textColor: "{colors.ink}"
    rounded: "{rounded.book-edge}"
    padding: "32px 32px 32px 44px"
  book-cover-red:
    backgroundColor: "{colors.cover-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.book-edge}"
    padding: "32px 32px 32px 44px"
  book-back-mustard:
    backgroundColor: "{colors.back-mustard}"
    rounded: "{rounded.book-edge}"
  book-back-red:
    backgroundColor: "{colors.back-red}"
    rounded: "{rounded.book-edge}"
  book-page-block:
    backgroundColor: "{colors.page-white}"
    rounded: "{rounded.book-edge}"
  filter-pill:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  filter-pill-active:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    padding: "6px 16px"
  prep-panel:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  soon-item:
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "8px 12px"
  answer-card:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    size: "80px"
  step-number:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    size: "32px"
  prep-tile:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.tile}"
    size: "36px"
  navbar:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
  nav-pill-active:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.teal}"
    rounded: "{rounded.pill}"
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.btn}"
  script-cover:
    backgroundColor: "{colors.cover-mustard}"
    textColor: "{colors.ink}"
    rounded: "{rounded.spread}"
    padding: "40px 40px 40px 56px"
  script-page:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.spread}"
    padding: "36px 40px"
  scene-panel:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    padding: "0"
  closing-band:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.band}"
    padding: "56px 56px"
  button-closing:
    backgroundColor: "{colors.cover-mustard}"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
  need-tile:
    backgroundColor: "rgb(255 255 255 / 0.10)"
    textColor: "{colors.page-white}"
    rounded: "12px"
    size: "56px"
  demo-projection:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.band}"
    padding: "36px"
  demo-option-letter-correct:
    backgroundColor: "{colors.cover-mustard}"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    size: "44px"
  demo-card-pick:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    width: "64px"
    height: "80px"
  demo-card-picked:
    backgroundColor: "{colors.cover-mustard}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    width: "64px"
    height: "80px"
  demo-panel:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.band}"
    padding: "36px"
  camera-status:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
---

# Design System: ClassPlay

## Overview

**Creative North Star: "O Catálogo do Professor"**

A biblioteca é um catálogo sobre o mesmo fundo verde claro (#e8f0ee) das demais telas: um cabeçalho enxuto e uma grade de livros de roteiro em pé, como livros de retrato, que cresce com o acervo. Cada livro é montado em camadas de profundidade (contracapa, bloco de páginas brancas e capa) com lombada escura de dois frisos à esquerda. Em repouso o livro já está virado na lombada; ao receber mouse ou foco, vira um pouco mais. Na biblioteca ele nunca abre: etapas e material vivem na página do roteiro, depois do clique, onde o livro se abre em página dupla: capa de tecido à esquerda, folha branca à direita.

O tom é de ferramenta séria e legível de longe. Superfícies são chapadas, sem degradê nem vidro (a única textura é a trama fina de tecido da capa e as linhas das folhas, feitas de filetes de 1px); a profundidade vem do objeto físico (sombra de apoio sob cada camada, rotação em perspectiva). Cor é material: mostarda e vermelho vivem nas capas, o petróleo é a barra de navegação, a ação e o foco, o branco é o papel. A biblioteca e as telas internas compartilham fundo, paleta e fontes; o que distingue a biblioteca são os livros.

**Key Characteristics:**
- Fundo verde claro como o resto do app; livros de retrato (17rem x 25rem) em grade que cresce, lombada à esquerda, sem prateleira.
- Um único gesto de movimento: o livro que vira na lombada (0.7s) e a subida escalonada dos livros na entrada.
- Títulos do app em Bricolage Grotesque 800, apertados; títulos da landing em Literata 700; texto corrido em Atkinson Hyperlegible Next.
- Capa em coluna: título, emblema do cartão de resposta no meio (mostra a atividade), objetivo e metadados embaixo. Na página do roteiro, a mesma capa vira o lado esquerdo de um livro aberto.
- Coluna lateral discreta: painel branco "Antes da aula" e lista quieta "Em breve".
- Contraste alto e alvos grandes, pensados para projeção e para crianças.
- Landing enxuta em quatro seções sem mensagens repetidas: abertura com a cena, simulação ("Levante um cartão"), base pedagógica com referências e uma única faixa petróleo com o que a primeira aula exige. As seções sobem e aparecem uma vez ao entrar na tela.

## Colors

Paleta de papelaria sobre névoa verde: um teal profundo para estrutura e ação, duas tintas de capa, papel branco e uma tinta quase preta azulada.

### Primary
- **Azul-Petróleo** (#0a4d4a): barra de navegação, botões primários, filtro ativo, blocos de ícone do "Antes da aula", numeração das etapas, contorno de foco dos livros, seleção e foco de campos. É o `primary` do tema daisyUI `classplay`.

### Secondary
- **Mostarda de Capa** (#f2a900): capa de livro, enquadramento e alternativa destacada na cena da landing, ponto de câmera desligada na barra e o botão da faixa de fechamento da landing.
- **Vermelho de Capa** (#d62839): segunda capa de livro e destaque `accent`; usado em capa e no friso da marca.

### Tertiary
- **Contracapa Mostarda** (#8a6200) e **Contracapa Vermelha** (#8f1a28): a camada escura de trás do livro, vista como borda de profundidade quando o livro vira.

### Neutral
- **Tinta Azulada** (#101820): texto sobre papel e sobre mostarda, `neutral`.
- **Papel Branco** (#ffffff): bloco de páginas do livro, painel "Antes da aula", pílulas de filtro, painéis da página do roteiro (`base-100`).
- **Névoa Verde** (#e8f0ee): fundo de todas as telas, inclusive a biblioteca (`base-200`), e trilho da barra de rolagem.
- **Borda de Névoa** (#c9d8d4): bordas dos painéis, pílulas e itens tracejados (`base-300`).
- **Fio de Folha** (#e4e4e0): linhas finas da borda das folhas.
- Estados: informação #0369a1, sucesso #047857, erro #be123c, aviso #f2a900 com texto #451a03.

### Named Rules
**A Regra da Cor de Material.** Mostarda e vermelho aparecem como objetos (capas de livro, enquadramento da câmera, cartões), nunca como fundo de seção inteira. A única ação mostarda é o botão sobre a faixa petróleo de fechamento da landing; em qualquer outro lugar a ação é petróleo. O fundo é sempre a névoa verde, o papel sempre branco.

**A Regra do Texto Legível.** Texto sobre a névoa e o papel é tinta (#101820) ou a 65-75% dela; sobre mostarda é tinta, nunca branco; sobre vermelho e petróleo é branco.

## Typography

**Display Font:** Bricolage Grotesque Variable (com sans-serif do sistema)
**Editorial Font:** Literata Variable (com Georgia e serifa do sistema), só nos títulos da landing
**Body Font:** Atkinson Hyperlegible Next Variable (com sans-serif do sistema)

**Character:** Bricolage dá peso e calor de lombada de livro aos títulos do app; Literata dá à landing a voz de texto de leitura, de quem explica ao professor; Atkinson, desenhada para leitura difícil, sustenta o texto para quem lê do fundo da sala. Numerais tabulares no corpo.

### Hierarchy
- **Display** (800, 1.875rem, 2.25rem em `lg`, 1.02): "Biblioteca de roteiros" e nome do roteiro na página do roteiro (capa à esquerda).
- **Headline** (800, 2.25rem a 3rem, 1.02): nome do roteiro encabeçando a página do roteiro.
- **Title** (800, 1.5rem, 1.1): "Etapas" na folha do roteiro; nome do livro na biblioteca em 1.8rem; "Antes da aula" em 1.125rem.
- **Editorial Headline** (Literata 700, 2.25rem a 3rem, 1.08, -0.015em): só o h1 da landing.
- **Editorial Section** (Literata 700, 1.875rem a 2.25rem, -0.015em): h2 da landing ("Levante um cartão...", "Em que o ClassPlay se apoia", "Para a primeira aula...").
- **Editorial Title** (Literata 700, 1.5rem, -0.01em): título de cada uma das cinco ideias da base pedagógica.
- **Body** (400, 1rem a 1.25rem): linha de apoio do cabeçalho (1rem, a 75%), objetivo na capa da página do roteiro (1.25rem), etapas (1.125rem), itens do painel (1rem, 600). Objetivo do livro na biblioteca em 0.875rem. Parágrafos com `text-wrap: pretty`, títulos com `balance`.
- **Label** (600-800, 0.875rem a 1rem): minutos, formato, pílulas de filtro e suas contagens, "Em breve" (0.875rem), nomes dos itens futuros (0.875rem, 600).

### Named Rules
**A Regra dos Três Papéis.** Literata (`font-editorial`) só para os títulos h1, h2 e h3 da landing; Bricolage para a interface do app, nomes de livros e os títulos da simulação e das necessidades; Atkinson para todo o resto. Nenhuma quarta família, e Literata não sai da landing.

## Layout

Contêiner centrado de até 80rem (`max-w-7xl`) com respiro lateral de 1rem, 1.5rem e 2rem por faixa de largura, topo de 2rem. A biblioteca é uma coluna com lacuna de 1.5rem: cabeçalho compacto e, abaixo, estante e lateral. O cabeçalho é uma linha que quebra: à esquerda "Biblioteca de roteiros" e uma linha de apoio; à direita as pílulas de filtro por formato, alinhadas pela base, cada uma com a contagem de roteiros ("Todos 4"). Só aparecem formatos que já têm roteiro disponível.

Abaixo, uma grade de duas partes (lacuna 2rem, alinhada ao topo): a estante e uma coluna lateral fixa de 18rem a partir de `lg` (empilha abaixo disso). A estante é uma grade `auto-fill` de colunas de 17rem, lacuna de 2rem na horizontal e 2.5rem na vertical, centrada no celular e alinhada à esquerda a partir de `sm`; cresce com o acervo, sem teto de linhas nem prateleira. Cada livro tem 17rem x 25rem. A lateral é `sticky` (a 5rem do topo, sob a barra) e empilha o painel "Antes da aula" e a lista "Em breve" com lacuna de 1rem.

A página do roteiro é um livro aberto de até 72rem (`max-w-6xl`): duas colunas iguais a partir de `lg`, altura mínima `min(34rem, 100dvh - 11rem)` para caber numa viewport de desktop; empilhada abaixo de `lg`, capa em cima. À esquerda a capa de tecido (nome, objetivo, minutos, formato, etapas e emblema grande centralizado); à direita a folha branca com Etapas, Material e a ação "Preparar aula" alinhada à direita no pé. A barra de navegação é fixa no topo (4rem), com rótulos ocultos abaixo de `sm`.

Regra de conteúdo da landing: citar o que a pesquisa mostra e o que o ClassPlay faz, sem afirmar resultados do próprio ClassPlay.

A landing (exibida só na primeira visita; a marca na barra volta a ela) usa o mesmo contêiner de 80rem, com 6rem entre seções (`space-y-24`) e quatro seções. Abertura em 12 colunas a partir de `lg`: título, um parágrafo, botão e o link "Experimente agora" em 5 colunas à esquerda, cena em 7 à direita, alinhadas ao centro. Depois, "Levante um cartão e veja a turma responder" (simulação em 12 colunas a partir de `lg`: projeção em 7, painel branco do visitante em 5, lacuna de 1.5rem a 2rem). Depois, "Em que o ClassPlay se apoia" em 12 colunas (lacuna 2.5rem a 4rem): à esquerda, em 4, título, parágrafo sobre orquestração da sala e `<details>` "Ver as referências"; à direita, em 8, lista numerada de cinco ideias separadas por filetes de névoa (padding vertical 2rem). Por fim, a única faixa petróleo, "Para a primeira aula, você precisa de", com três necessidades em três colunas.

Na condução, a lista de perguntas (QuestionFlow) é uma grade de 1 coluna que passa a 2 a partir de `lg`, lacuna de 0.75rem, cartões de padding 1rem, alinhados ao topo.

## Elevation & Depth

Híbrido: superfícies chapadas, sem gradiente, e sombra só como apoio de objeto. Profundidade vem de camadas reais no espaço: cada livro é um conjunto 3D com perspectiva de 1600px no palco, origem de rotação na lombada (esquerda), e três camadas empilhadas em Z (contracapa a -16px, bloco de páginas a -8px, capa a 0). Cada camada projeta sua própria sombra de apoio, em tinta azulada, que lê bem sobre o fundo claro.

### Shadow Vocabulary
- **Apoio da Camada** (`box-shadow: 0 20px 26px -16px rgb(16 24 32 / 0.5)`): cada camada do livro (contracapa, páginas, capa).
- **Apoio do Livro Aberto** (`box-shadow: 0 24px 34px -18px rgb(16 24 32 / 0.45)`): o conjunto capa e folha da página do roteiro.
- **Apoio do Cartão** (`drop-shadow(0 12px 8px rgb(0 0 0 / 0.35))` no cartão único; `0 8px 6px` em cada cartão da grade de quatro): cartões de resposta nos emblemas, que também são papel pousado.

### Named Rules
**A Regra do Objeto Pousado.** Só objetos físicos (livros, o livro aberto da página do roteiro e cartões de resposta, inclusive o cartão levantado na simulação) têm sombra. O painel "Antes da aula", os itens "Em breve", as pílulas, os blocos de ícone, os selos e a barra de navegação ficam chapados, separados por borda de 1px.

**A Regra da Profundidade Real.** A espessura do livro vem de camadas em `translateZ` com `transform-style: preserve-3d`, nunca de sombras duras deslocadas nem de bordas grossas.

## Shapes

Forma de livro: o lado da lombada quase reto (2px), o lado externo arredondado (12px), nas três camadas. O livro aberto da página do roteiro tem 16px nos cantos externos e é reto na costura central. Botões em 12px, a faixa de fechamento e o painel da cena da landing em 28px, o painel lateral em 20px (`rounded-box`), blocos de ícone e itens da lista em 8px, pílulas de filtro, selos e números em pílula/círculo. Lombada: faixa de 1.25rem de preto a 20% com dois frisos brancos a 40%, de 2px, nas pontas. A capa leva uma moldura estampada de 2px, raio 6px, recuada da borda (tinta a 25% na mostarda, branco a 35% na vermelha). A capa leva uma trama de tecido (`.cloth`): filetes de 1px a cada 3px, pretos a 5% na horizontal e brancos a 6% na vertical, sobre a cor da capa. A borda das folhas é um padrão de linhas de 1px a cada 3px no bloco de páginas. O vazio é marcado por borda tracejada (itens "Em breve" e seu marcador de livro).

## Components

### Livro de Roteiro (componente assinatura)
- **Estrutura:** botão de 17rem x 25rem com três camadas empilhadas em profundidade: contracapa escura (mostarda #8a6200 ou vermelha #8f1a28), bloco de páginas brancas com borda de folhas (recuado da borda, inset vertical de 4px e 12px à esquerda) e capa. A capa traz lombada, moldura estampada e, em coluna (padding 2rem, 2.75rem à esquerda): nome em Display (1.8rem), emblema centralizado ocupando o espaço livre, objetivo em 0.875rem, e linha de minutos (com relógio) e formato. A capa tem trama de tecido (`.cloth`). Capa e camadas vêm de `bindingFor` e `Spine`, compartilhados em `BookParts.tsx`. O clique abre o roteiro; não há chamada "Ver roteiro" na capa.
- **Emblema:** mostra a atividade. Tamanho `sm` na biblioteca, `lg` na página do roteiro. "Pergunta rápida" traz um cartão único, letra C, inclinado 6 graus (5rem em `sm`, 10rem em `lg`); "Grupo com sorteio" traz os quatro cartões A-D numa grade 2x2 (6rem em `sm`, 13rem em `lg`), onde só o B sobe (-0.5rem) e inclina 3 graus, e os outros ficam a 60% de opacidade e dessaturados, porque a câmera os ignora.
- **Cores:** capa mostarda (texto tinta) ou vermelha (texto branco), alternando por tipo de roteiro.
- **Repouso:** o conjunto está virado `rotateY(-9deg)`, origem à esquerda.
- **Hover / foco-visível:** `rotateY(-15deg)` e sobe 4px. O livro não abre; etapas e material ficam na página do roteiro.
- **Foco:** contorno petróleo (#0a4d4a) de 4px, deslocado 6px, com raio de 12px.
- **Movimento:** 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, só com `prefers-reduced-motion: no-preference`; sem isso o livro troca de estado sem transição.
- **Entrada:** `shelve`, subida de 28px com fade, 0.7s, atraso de 120ms por livro.

### Cartão de Resposta (emblema)
SVG autoral do cartão impresso (proporção 100x140, raio 7): papel branco, marcador 4x4 desenhado à mão em tinta com células brancas (ilustra o cartão, não é o marcador lido pela câmera) e letra grande em Bricolage 800 (tinta) embaixo. Decorativo (`aria-hidden`). Só aparece como emblema de capa; sombra de apoio própria.

### Pílulas de Filtro
Grupo `aria-pressed` no canto direito do cabeçalho. Pílula (px 1rem, py 0.375rem, 0.875rem bold) com contagem em peso médio a 75%. Inativa: papel branco, borda névoa, texto tinta, borda petróleo no hover. Ativa: fundo petróleo, texto branco.

### Antes da Aula (painel lateral)
Painel branco (`base-100`), borda de névoa de 1px, raio 20px, padding 1.25rem, chapado. Título "Antes da aula" em Bricolage 800 (1.125rem) e três linhas-botão de largura inteira: bloco de ícone de 2.25rem (raio 8px) petróleo com ícone branco de 1.125rem, seguido do título em 1rem 600 ("Confira a turma · N", "Imprima os cartões", "Posicione a câmera"). Hover: fundo névoa. Foco: contorno petróleo de 2px.

### Em Breve (lista quieta)
Sob o painel, sem cartão: título "Em breve" (0.875rem bold, a 70%) e itens pequenos com borda tracejada de 1px na cor névoa, raio 8px, padding 0.5rem 0.75rem. Cada item leva um marcador de livro tracejado (1.5rem x 2rem, borda de 2px a 35%), o nome (0.875rem 600) e os minutos a 65%. Sem interação; o objetivo aparece como `title`.

### Navegação
Barra petróleo fixa, borda inferior branca a 15%. Marca ClassPlay em Bricolage 800 com três barras (mostarda, vermelha, branca) que sobem 2px no hover; a marca também leva à landing. Quatro itens em pílula, com ícone: Início (ícone Home, abre a landing), Biblioteca, Turma e Desempenho; ativo em branco com texto petróleo e `aria-current="page"`; inativos fantasmas a 85% de branco com hover a 10%. À direita, o estado da câmera é um botão em pílula ("Testar câmera" / "Câmera ligada", rótulo oculto abaixo de `sm`) que abre o teste da câmera: fundo branco a 10% com borda branca a 25% (branco com texto petróleo quando a tela do teste está ativa) e um ponto de 8px, mostarda com a câmera desligada e verde (`success`) com ela ligada. Cartões e teste da câmera também se alcançam pela lateral da biblioteca e pela Turma.

### Landing: cena da sala (componente assinatura)
Ilustração SVG fornecida pela equipe (`src/assets/sala-classplay.svg`, viewBox 1200x664), com as cores do sistema aplicadas e inserida inline por `ClassroomScene.tsx` para usar as fontes da página. Fica à direita do título, num painel de 28px de raio com filete de 1px na borda da névoa. Mostra a professora ao lado do quadro com a pergunta (barras no lugar do texto), o datashow no teto com o feixe em mostarda, a câmera com o cone de leitura tracejado, e alunos sentados levantando cartões com marcador e etiquetas "#NN ✓"; o cartão ainda não lido tem contorno tracejado. Piso e paredes em tons da névoa, camisas em petróleo, vermelho, tinta e mostarda. O feixe e o cone usam degradê só como luz, nunca como preenchimento de interface. `role="img"` e `aria-label` vêm do próprio SVG. Sem sombras.

### Landing: seções de apoio
- **Base pedagógica ("Em que o ClassPlay se apoia"):** coluna esquerda com título Literata, parágrafo em 1.125rem a 85% e `<details>` nativo "Ver as referências" (sumário em negrito sublinhado, lista a 80%). Coluna direita: lista numerada entre filetes de 1px na névoa (`divide-y` e filetes no topo e na base), cada ideia com título Literata 700 (1.5rem), parágrafo em 1.125rem a 85% (máx. 42rem), linha de citação (0.875rem 600, a 65%) e, em duas delas, uma ação em texto petróleo em negrito com seta ("Abrir Pergunta rápida", "Abrir Grupo com sorteio") que abre o roteiro; a seta desliza 0.25rem no hover, só com movimento permitido. Sem cartões, sem fundos.
- **Entrada das seções (`Reveal`):** cada seção abaixo da abertura sobe 28px e aparece (opacidade) uma única vez ao entrar na tela (limiar 15%), 0.8s `cubic-bezier(0.16, 1, 0.3, 1)`. Sem efeito sob `prefers-reduced-motion: reduce`, e sem `IntersectionObserver` aparece direto.
- **Faixa "Para a primeira aula, você precisa de":** única faixa petróleo da página, raio 28px, padding 3.5rem a 3.5rem lateral, título Literata. Três necessidades em linha: bloco de ícone de 3.5rem (raio 12px) translúcido, preenchimento branco a 10% com anel de 1px branco a 35%, ícone branco de 1.75rem; título em Bricolage 800 (1.25rem) e apoio em 1.125rem a 85%. Embaixo, a linha de privacidade dos dados (1rem, a 80%) e o botão mostarda "Abrir a biblioteca" com seta. O botão do topo é petróleo.

### Landing: simulação "Experimente" (componente assinatura)
Duas metades, rotuladas como simulação com turma de exemplo ("Na aula, a câmera lê os cartões de papel de verdade").
- **Projeção (esquerda):** a tela do datashow como objeto: painel petróleo, raio 28px, padding 1.75rem a 2.25rem, chapado. Pergunta em Bricolage 800 (1.5rem a 1.875rem), quatro linhas de alternativa (`aria-live="polite"`): pílula de letra de 2.75rem (raio 12px, branco a 15%, letra branca em Bricolage 800), rótulo em 1.125rem 600, trilho de barra de 1rem (branco a 15%) com preenchimento branco a 70% que cresce em largura (0.5s, só com movimento permitido) e contagem tabular. Quando todos foram lidos, a alternativa certa vira mostarda: letra em mostarda com texto tinta e barra mostarda. Linha de estado embaixo em 1.125rem 600 ("Esperando os cartões da turma." / "A câmera leu N de 8 cartões…" / "Resposta certa: B. N de 8 acertaram.").
- **Visitante (direita):** painel branco com borda de névoa, raio 28px, padding 1.75rem a 2.25rem. "Levante o seu cartão": quatro cartões A-D (4rem x 5rem, raio 8px, borda de 2px tinta, letra em Bricolage 800 de 1.875rem); no hover sobem 0.375rem e a borda vira petróleo. O escolhido sobe 0.5rem, vira mostarda (texto tinta) e leva apoio de objeto (`0 12px 14px -8px rgb(16 24 32 / 0.5)`); os outros esmaecem para névoa com texto a 40% e ficam desabilitados.
- **A turma:** grade de 4 colunas, oito alunos (Você, #02 a #08); cada um é um quadro de proporção 5:4 que vira petróleo ao ser lido, com busto de cor de pele e o cartão branco lido (letra em tinta, 0.75rem 800) no canto; ainda não lido é névoa com borda tracejada. Os sete alunos de exemplo são lidos um a um a cada ~420ms (o primeiro após 500ms).
- **Reiniciar:** depois da escolha aparece o botão ghost pequeno "Jogar de novo" com ícone de seta circular.

### Livro Aberto (página do roteiro)
Duas metades sob uma única sombra de apoio. Esquerda: capa de tecido (cor e moldura do `bindingFor`, lombada, padding 2.5rem com 3.5rem à esquerda) com nome em Display, objetivo em 1.25rem, minutos, formato e número de etapas, e o emblema `lg` centralizado no espaço restante. Direita: folha branca de padding 2.25rem a 2.5rem com "Etapas" (círculos petróleo de 2rem numerando cada passo, texto 1.125rem), "Material" (selos de fundo névoa com borda de névoa) e o botão petróleo grande "Preparar aula" no pé. Botão "Biblioteca" de volta acima, em pílula pequena.

### Lista de Perguntas (condução)
Cartões de padding 1rem, raio 16px, borda de névoa; selecionado fica opaco com realce, não selecionado a 70% de opacidade. Duas colunas a partir de `lg`.

## Do's and Don'ts

### Do:
- **Do** mostrar a aula antes de explicá-la na landing: ilustração da sala num painel com filete, com cartões levantados e etiquetas de leitura.
- **Do** reutilizar `AnswerCardShape` para qualquer cartão desenhado dentro de outro SVG do app, para que o cartão seja o mesmo em todo o app.
- **Do** manter a navegação com quatro destinos (Início, Biblioteca, Turma, Desempenho) e o estado da câmera como botão que leva ao teste.
- **Do** manter a biblioteca sobre a névoa verde (#e8f0ee), como as demais telas, e pousar objetos coloridos (livros) sobre ela.
- **Do** dar a todo livro lombada à esquerda com dois frisos, cantos 2px/12px e camadas de profundidade em `translateZ`.
- **Do** usar texto tinta (#101820) sobre mostarda e branco sobre vermelho e petróleo.
- **Do** virar o livro tanto em hover quanto em foco-visível, e condicionar o movimento a `prefers-reduced-motion: no-preference`.
- **Do** manter o texto corrido dos livros em 0.875rem ou mais, com títulos em Bricolage 800.
- **Do** usar contorno de foco petróleo (#0a4d4a) de 4px nos livros.
- **Do** usar como emblema de capa o cartão de resposta que a atividade realmente usa; destacar só o cartão em jogo e esmaecer os ignorados.
- **Do** deixar etapas e material para a página do roteiro; a biblioteca só mostra título, objetivo, minutos, formato e abertura por clique.
- **Do** deixar a grade crescer com o acervo (colunas `auto-fill` de 17rem) e manter o cabeçalho compacto.
- **Do** deixar a landing mostrar o fluxo funcionando (levantar o cartão, a câmera ler, a projeção contar) em simulação rotulada como exemplo.
- **Do** fazer cada seção da landing subir uma única vez ao entrar na tela, e desligar o movimento sob `prefers-reduced-motion`.
- **Do** dizer cada mensagem uma só vez na landing, citando o que a pesquisa mostra e o que o ClassPlay faz.
- **Do** abrir roteiros a partir das ideias da base pedagógica por ação em texto, não por cartão.
- **Do** manter itens futuros pequenos, tracejados e na lateral, abaixo do painel de preparo.

### Don't:
- **Don't** repetir a faixa petróleo ou o botão mostarda fora do fechamento da landing (a única exceção é a projeção da simulação, que é a tela do datashow e não uma faixa de seção), nem usar grade de cartões para benefícios: a base pedagógica usa lista numerada entre filetes.
- **Don't** pôr sombra na cena da landing; só os cartões pousados têm apoio.
- **Don't** usar Literata fora dos títulos da landing, nem afirmar na landing resultados que o próprio ClassPlay produziria.
- **Don't** usar simbologia de jogo de azar (ficha, feltro, bingo, dado, baralho); o tom é de ferramenta séria. O cartão de resposta de papel é o próprio instrumento da aula e pode aparecer, sempre como cartão branco com marcador e letra.
- **Don't** voltar ao campo petróleo escuro, à classe `.desk`, ao cabeçalho com parágrafo de apresentação nem à tábua da estante.
- **Don't** voltar a livros "em breve" como livros de contorno na grade; eles são itens pequenos na lateral.
- **Don't** abrir o livro na biblioteca nem reintroduzir a guarda "Material" ou a capa que gira 180°; a página dupla pertence só à página do roteiro.
- **Don't** colorir seções inteiras de mostarda ou vermelho nem pôr texto branco sobre mostarda.
- **Don't** pôr sombra em botões, pílulas, selos, blocos de ícone, painéis ou na barra de navegação.
- **Don't** introduzir um segundo movimento de destaque além do livro que vira e da subida (livros na biblioteca, seções na landing); a resposta da simulação (cartão que sobe, barra que enche) é reação a um clique, não decoração.
- **Don't** reintroduzir o mundo anterior de blocos de brinquedo (amarelo vivo, azul de bloco, bordas grossas).
