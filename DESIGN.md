---
name: ClassPlay
description: Um catálogo de livros de modelo em pé sobre o papel pautado do app, que viram na lombada e se abrem em página dupla, para o professor escolher e preparar a aula.
colors:
  action-blue: "#0040dd"
  cover-indigo: "#3634a3"
  cover-orange: "#c93400"
  cover-teal: "#006e7f"
  cover-purple: "#8944ab"
  highlight-yellow: "#ffcc00"
  label: "#000000"
  page-white: "#ffffff"
  grouped-background: "#f2f2f7"
  separator: "#c6c6c8"
  segmented-track: "#e3e3e8"
  page-edge-line: "#e4e4e0"
  success-green: "#248a3d"
  warning-orange: "#b25000"
  error-red: "#d70015"
typography:
  display:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 3.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Atkinson Hyperlegible Next Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
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

A biblioteca é um catálogo sobre o mesmo papel pautado (#f3f5fa) das demais telas: um cabeçalho enxuto e uma grade de livros de modelo em pé, como livros de retrato, que cresce com o acervo. Cada livro é montado em camadas de profundidade (contracapa, bloco de páginas brancas e capa) com lombada escura de dois frisos à esquerda. Em repouso o livro já está virado na lombada; ao receber mouse ou foco, vira um pouco mais. Na biblioteca ele nunca abre: etapas e material vivem na página do modelo, depois do clique, onde o livro se abre em página dupla: capa de tecido à esquerda, folha branca à direita.

O tom é de ferramenta séria e legível de longe. Superfícies são chapadas, sem degradê nem vidro (a única textura é a trama fina de tecido da capa e as linhas das folhas, feitas de filetes de 1px); a profundidade vem do objeto físico (sombra de apoio sob cada camada, rotação em perspectiva). Cor é material: amarela e vermelho vivem nas capas, o azul é a barra de navegação, a ação e o foco, o branco é o papel. A biblioteca e as telas internas compartilham fundo, paleta e fontes; o que distingue a biblioteca são os livros.

**Key Characteristics:**
- Fundo de papel pautado como o resto do app; livros de retrato (17rem x 25rem) em grade que cresce, lombada à esquerda, sem prateleira.
- Um único gesto de movimento: o livro que vira na lombada (0.7s) e a subida escalonada dos livros na entrada.
- Títulos do app em Inter 800, apertados; títulos da landing também em Inter 700; texto corrido em Atkinson Hyperlegible Next.
- Capa em coluna: título, emblema do cartão de resposta no meio (mostra a interação do modelo), objetivo e metadados embaixo. Na página do modelo, a mesma capa vira o lado esquerdo de um livro aberto.
- Coluna lateral discreta: painel branco "Antes da aula" e lista quieta "Em breve".
- Contraste alto e alvos grandes, pensados para projeção e para crianças.
- Landing enxuta em quatro seções sem mensagens repetidas: abertura com a cena, simulação ("Levante um cartão"), metodologias ativas pelo nome e uma única faixa azul com o que a primeira aula exige. As seções sobem e aparecem uma vez ao entrar na tela.

## Colors

Paleta "sala clara": as cores de alto contraste do sistema da Apple (as variantes de Increase Contrast do modo claro), escolhidas porque o datashow costuma rodar com a luz da sala acesa, o que apaga tons claros, pastéis e diferenças sutis de cinza. Fundo quase branco, texto preto, cor saturada e escura o bastante para segurar texto branco acima de 4.5:1. Sem modo escuro: no datashow o preto vira o cinza da luz ambiente.

- **Azul de Ação** (#0040dd): só o que se clica ou o que está selecionado: botões primários, item ativo da barra, segmento escolhido do filtro, foco, cursor e links (`primary`). Branco sobre ele: 7.6:1.
- **Capas dos modelos**, uma cor por modelo, todas com texto branco: Pergunta rápida em índigo #3634a3 (9.7:1), Grupo com sorteio em laranja #c93400 (5.3:1), Lousa interativa em verde-azulado #006e7f (5.9:1), Instrução por pares em roxo #8944ab (6.0:1). Contracapas na mesma cor, mais escura. As cores vêm de `bindingFor` em `BookParts.tsx` e também marcam a lombada do item "Em breve" e as três barras da marca.
- **Amarelo de Destaque** (#ffcc00): alternativa certa na simulação da landing e o botão da faixa de fechamento, sempre com texto preto (13.9:1) (`secondary`).
- **Preto** (#000000): texto (`base-content`). Texto secundário é preto a 70-75%, nunca abaixo disso: cinza claro some na projeção.
- **Branco** (#ffffff): grupos, painéis e barra de navegação (`base-100`).
- **Fundo Agrupado** (#f2f2f7): fundo de todas as telas (`base-200`).
- **Separador** (#c6c6c8): bordas dos grupos e separadores recuados das listas (`base-300`).
- **Trilho do Segmentado** (#e3e3e8): fundo do controle segmentado.
- Estados: sucesso #248a3d, aviso #b25000 (também o ponto de câmera desligada), erro #d70015.

**A Regra do Azul Só para Ação.** Azul nunca é capa, enfeite ou texto parado. As cores das capas identificam modelos; o azul diz "clique aqui" ou "você está aqui".

**A Regra do Texto Legível.** Texto sobre o fundo e o branco é preto ou a 70-75% dele; sobre amarelo é preto; sobre azul e sobre as capas é branco.

## Typography

**Display Font:** Inter Variable (com sans-serif do sistema)
**Body Font:** Atkinson Hyperlegible Next Variable (com sans-serif do sistema)

**Character:** Inter em 700 nos títulos, com letras abertas e próxima da San Francisco da Apple, fácil de ler projetada; Atkinson, desenhada para leitura difícil, sustenta o texto para quem lê do fundo da sala. Numerais tabulares no corpo.

### Hierarchy
- **Display** (800, 1.875rem, 2.25rem em `lg`, 1.02): "Modelos de atividade" e nome do modelo na página do modelo (capa à esquerda).
- **Headline** (800, 2.25rem a 3rem, 1.02): nome do modelo encabeçando a página do modelo.
- **Title** (800, 1.5rem, 1.1): "Etapas" na folha do modelo; nome do livro na biblioteca em 1.8rem; "Antes da aula" em 1.125rem.
- **Body** (400, 1rem a 1.25rem): linha de apoio do cabeçalho (1rem, a 75%), objetivo na capa da página do modelo (1.25rem), etapas (1.125rem), itens do painel (1rem, 600). Objetivo do livro na biblioteca em 0.875rem. Parágrafos com `text-wrap: pretty`, títulos com `balance`.
- **Label** (600-800, 0.875rem a 1rem): minutos, formato, pílulas de filtro e suas contagens, "Em breve" (0.875rem), nomes dos itens futuros (0.875rem, 600).

### Named Rules
**A Regra das Duas Fontes.** Inter (`font-display`) em todos os títulos, do app e da landing; Atkinson em todo o resto. Não reintroduzir uma terceira fonte.

## Layout

Contêiner centrado de até 80rem (`max-w-7xl`) com respiro lateral de 1rem, 1.5rem e 2rem por faixa de largura, topo de 2rem. A biblioteca é uma coluna com lacuna de 1.5rem: cabeçalho compacto e, abaixo, estante e lateral. O cabeçalho é uma linha que quebra: à esquerda "Modelos de atividade" e uma linha de apoio; à direita as pílulas de filtro por formato, alinhadas pela base, cada uma com a contagem de modelos ("Todos 4"). Só aparecem formatos que já têm modelo disponível.

Abaixo, uma grade de duas partes (lacuna 2rem, alinhada ao topo): a estante e uma coluna lateral fixa de 18rem a partir de `lg` (empilha abaixo disso). A estante é uma grade `auto-fill` de colunas de 17rem, lacuna de 2rem na horizontal e 2.5rem na vertical, centrada no celular e alinhada à esquerda a partir de `sm`; cresce com o acervo, sem teto de linhas nem prateleira. Cada livro tem 17rem x 25rem. A lateral é `sticky` (a 5rem do topo, sob a barra) e empilha o painel "Antes da aula" e a lista "Em breve" com lacuna de 1rem.

A página do modelo é um livro aberto de até 72rem (`max-w-6xl`): duas colunas iguais a partir de `lg`, altura mínima `min(34rem, 100dvh - 11rem)` para caber numa viewport de desktop; empilhada abaixo de `lg`, capa em cima. À esquerda a capa de tecido (nome, objetivo, minutos, formato, etapas e emblema grande centralizado); à direita a folha branca com Etapas, Material e a ação "Preparar aula" alinhada à direita no pé. A barra de navegação é fixa no topo (4rem), com rótulos ocultos abaixo de `sm`.

Regra de conteúdo da landing: nomear metodologias e benefícios em linguagem simples de professor; nunca citar autores, estudos ou números de pesquisa, nunca escrever como artigo, nunca afirmar resultados do próprio ClassPlay.

A landing (exibida só na primeira visita; a marca na barra volta a ela) usa o mesmo contêiner de 80rem, com 6rem entre seções (`space-y-24`) e quatro seções. Abertura em 12 colunas a partir de `lg`: título, um parágrafo, botão e o link "Experimente agora" em 5 colunas à esquerda, cena em 7 à direita, alinhadas ao centro. Depois, "Levante um cartão e veja a turma responder" (simulação em 12 colunas a partir de `lg`: projeção em 7, painel branco do visitante em 5, lacuna de 1.5rem a 2rem). Depois, "Metodologias ativas, prontas para a aula" em 12 colunas (lacuna 2.5rem a 4rem): à esquerda, em 4, título e um parágrafo curto que define aprendizagem ativa; à direita, em 8, lista de quatro ideias (Avaliação formativa, Aprendizagem em grupo, Instrução por pares, Informação na hora) separadas por filetes de pauta (padding vertical 2rem). Por fim, a única faixa azul, "O que você precisa para começar", com três necessidades em três colunas.

Na condução, a lista de perguntas (QuestionFlow) é uma grade de 1 coluna que passa a 2 a partir de `lg`, lacuna de 0.75rem, cartões de padding 1rem, alinhados ao topo.

## Elevation & Depth

Híbrido: superfícies chapadas, sem gradiente, e sombra só como apoio de objeto. Profundidade vem de camadas reais no espaço: cada livro é um conjunto 3D com perspectiva de 1600px no palco, origem de rotação na lombada (esquerda), e três camadas empilhadas em Z (contracapa a -16px, bloco de páginas a -8px, capa a 0). Cada camada projeta sua própria sombra de apoio, em tinta azulada, que lê bem sobre o fundo claro.

### Shadow Vocabulary
- **Apoio da Camada** (`box-shadow: 0 20px 26px -16px rgb(16 24 32 / 0.5)`): cada camada do livro (contracapa, páginas, capa).
- **Apoio do Livro Aberto** (`box-shadow: 0 24px 34px -18px rgb(16 24 32 / 0.45)`): o conjunto capa e folha da página do modelo.
- **Apoio do Cartão** (`drop-shadow(0 12px 8px rgb(0 0 0 / 0.35))` no cartão único; `0 8px 6px` em cada cartão da grade de quatro): cartões de resposta nos emblemas, que também são papel pousado.

### Named Rules
**A Regra do Objeto Pousado.** Só objetos físicos (livros, o livro aberto da página do modelo e cartões de resposta, inclusive o cartão levantado na simulação) têm sombra. O painel "Antes da aula", os itens "Em breve", as pílulas, os blocos de ícone, os selos e a barra de navegação ficam chapados, separados por borda de 1px.

**A Regra da Profundidade Real.** A espessura do livro vem de camadas em `translateZ` com `transform-style: preserve-3d`, nunca de sombras duras deslocadas nem de bordas grossas.

## Shapes

Forma de livro: o lado da lombada quase reto (2px), o lado externo arredondado (12px), nas três camadas. O livro aberto da página do modelo tem 16px nos cantos externos e é reto na costura central. Botões em 12px, a faixa de fechamento e o painel da cena da landing em 28px, o painel lateral em 20px (`rounded-box`), blocos de ícone e itens da lista em 8px, pílulas de filtro, selos e números em pílula/círculo. Lombada: faixa de 1.25rem de preto a 20% com dois frisos brancos a 40%, de 2px, nas pontas. A capa leva uma moldura estampada de 2px, raio 6px, recuada da borda (tinta a 25% na amarela, branco a 35% na vermelha). A capa leva uma trama de tecido (`.cloth`): filetes de 1px a cada 3px, pretos a 5% na horizontal e brancos a 6% na vertical, sobre a cor da capa. A borda das folhas é um padrão de linhas de 1px a cada 3px no bloco de páginas. O vazio é marcado por borda tracejada (itens "Em breve" e seu marcador de livro).

## Components

### Livro de Modelo (componente assinatura)
- **Estrutura:** botão de 17rem x 25rem com três camadas empilhadas em profundidade: contracapa escura (amarela #ca8a04 ou vermelha #9f1239), bloco de páginas brancas com borda de folhas (recuado da borda, inset vertical de 4px e 12px à esquerda) e capa. A capa traz lombada, moldura estampada e, em coluna (padding 2rem, 2.75rem à esquerda): nome em Display (1.8rem), emblema centralizado ocupando o espaço livre, objetivo em 0.875rem, e linha de minutos (com relógio) e formato. A capa tem trama de tecido (`.cloth`). Capa e camadas vêm de `bindingFor` e `Spine`, compartilhados em `BookParts.tsx`. O clique abre o modelo; não há chamada "Ver modelo" na capa.
- **Emblema:** mostra a interação do modelo. Tamanho `sm` na biblioteca, `lg` na página do modelo. "Pergunta rápida" traz um cartão único, letra C, inclinado 6 graus (5rem em `sm`, 10rem em `lg`); "Grupo com sorteio" traz os quatro cartões A-D numa grade 2x2 (6rem em `sm`, 13rem em `lg`), onde só o B sobe (-0.5rem) e inclina 3 graus, e os outros ficam a 60% de opacidade e dessaturados, porque a câmera os ignora.
- **Cores:** capa amarela (texto tinta) ou vermelha (texto branco), alternando por tipo de modelo.
- **Repouso:** o conjunto está virado `rotateY(-9deg)`, origem à esquerda.
- **Hover / foco-visível:** `rotateY(-15deg)` e sobe 4px. O livro não abre; etapas e material ficam na página do modelo.
- **Foco:** contorno azul (#0040dd) de 4px, deslocado 6px, com raio de 12px.
- **Movimento:** 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`, só com `prefers-reduced-motion: no-preference`; sem isso o livro troca de estado sem transição.
- **Entrada:** `shelve`, subida de 28px com fade, 0.7s, atraso de 120ms por livro.

### Cartão de Resposta (emblema)
SVG autoral do cartão impresso (proporção 100x140, raio 7): papel branco, marcador 4x4 desenhado à mão em tinta com células brancas (ilustra o cartão, não é o marcador lido pela câmera) e letra grande em Inter 700 (tinta) embaixo. Decorativo (`aria-hidden`). Só aparece como emblema de capa; sombra de apoio própria.

### Controle Segmentado (filtro por formato)
No canto direito do cabeçalho, `role="radiogroup"`. Trilho #e3e3e8, raio 12px, padding 4px; segmentos de 44px de altura (alvo mínimo de toque), raio 9px, 1rem 600, com a contagem em peso normal a 70%. Segmento escolhido em azul de ação com texto branco e sombra curta; os outros transparentes com hover a 5% de preto. O segmento escolhido é azul cheio, e não branco como no sistema, porque o branco sobre o trilho claro some no datashow.

### Antes da Aula (lista agrupada)
Como em Ajustes: cabeçalho de seção fora do grupo (0.8125rem 600, caixa alta, a 70%), grupo branco com borda separadora de 1px e raio 14px. Linhas de 52px: bloco de ícone de 32px (raio 8px) colorido com ícone branco (turma em verde #248a3d, cartões em cinza #636366, câmera em azul), título em 1.0625rem 500, valor à direita a 70% ("20 alunos") e chevron a 45%. Separador recuado: começa no texto, não no ícone. Hover a 4% de preto, pressionado a 8%; foco com contorno azul de 2px por dentro.

### Em Breve (lista agrupada, sem ação)
Mesmo grupo, sem chevron e sem hover. Cada linha leva uma lombada pequena (24x32px) na cor do modelo a 45%, o nome em 1.0625rem 500 e o objetivo em 0.9375rem a 70%.

### Navegação
Barra branca a 90% com desfoque (a única superfície translúcida do app, porque flutua sobre o conteúdo), 64px, separador inferior de 1px. Marca ClassPlay em Inter 700 com três lombadas nas cores das capas (índigo, laranja, verde-azulado); o nome some abaixo de `md`. Itens em pílula de 44px com ícone: ativo em azul de ação com texto branco e `aria-current="page"`; inativos em preto com hover a 5%. A barra rola na horizontal em telas estreitas em vez de empurrar a página. À direita, o botão da câmera ("Testar câmera" / "Câmera ligada") em pílula branca com borda, ponto de 10px laranja (desligada) ou verde (ligada).

### Preparação da aula (lista agrupada)
As três preparações (Pergunta rápida, Grupo com sorteio e Lousa interativa) usam o mesmo desenho: título grande com o nome do modelo, ações em cápsula de 44px à direita (secundária em cinza #e3e3e8, principal em azul com a contagem de perguntas) e as perguntas numa lista agrupada como em Lembretes. Cada linha tem um círculo de marcar de 28px dentro de um alvo de 44px (azul cheio com check branco quando marcado, contorno #aeaeb2 quando não), a pergunta em 1.125rem 600 (a 60% quando desmarcada) e, na Pergunta rápida, "Alternativas" com chevron e a lixeira em cinza. Alternativas abertas mostram a certa em verde claro com check e a palavra "Certa", nunca só a cor. No formulário de nova pergunta, cada alternativa tem o cartão com a letra, o campo e um botão "Certa"; não há menu para escolher a resposta. Presença na montagem de grupos: pílulas marcadas por padrão, um toque marca a falta (riscado e cinza).

### Datashow (condução)
- **Alternativas como cartão:** cada letra aparece como o cartão de papel, branco com borda preta de 3px e letra preta, proporção 4:5. Nada de azul, porque não é botão.
- **Escala com a tela:** enunciado em Inter 700 com `clamp(2rem, 3.6vw, 4.25rem)`, alternativas em `clamp(1.5rem, 2.3vw, 2.75rem)`.
- **Barra do professor:** cápsulas de 44px; navegação com setas em botões redondos cinza, "Simular" discreto sem fundo, "Projetar" e "Repetir" em cinza, ação principal em azul sempre por último.
- **Respostas da turma:** contagem em Inter 700 (3rem), barra de progresso verde sobre trilho #e3e3e8, números dos cartões em Inter, verdes quando lidos; o último lido ganha anel preto.
- **Resultado:** caixa da resposta certa com borda verde de 3px; barras das outras letras em #636366 sobre #e3e3e8 (o cinza claro sumia na projeção).
- **Sorteio do grupo:** nome do grupo pequeno em cima e aluno sorteado grande embaixo, com filete preto de 4px à esquerda.

**A Regra dos Algarismos.** Todos os números usam os algarismos da Inter (`@font-face` "ClassPlay Digits" com `unicode-range` 0-9 à frente da Atkinson). O zero cortado da Atkinson parece Ø de longe.

### Landing: cena da sala (componente assinatura)
Ilustração SVG fornecida pela equipe (`src/assets/sala-classplay.svg`, viewBox 1200x664), com as cores do sistema aplicadas e inserida inline por `ClassroomScene.tsx` para usar as fontes da página. Fica à direita do título, num painel de 28px de raio com filete de 1px na borda da pauta. Mostra a professora ao lado do quadro com a pergunta (barras no lugar do texto), o datashow no teto com o feixe em amarela, a câmera com o cone de leitura tracejado, e alunos sentados levantando cartões com marcador e etiquetas "#NN ✓"; o cartão ainda não lido tem contorno tracejado. Piso e paredes em tons da pauta, camisas em azul, vermelho, tinta e amarela. O feixe e o cone usam degradê só como luz, nunca como preenchimento de interface. `role="img"` e `aria-label` vêm do próprio SVG. Sem sombras.

### Landing: seções de apoio
- **Metodologias ativas ("Metodologias ativas, prontas para a aula"):** coluna esquerda com título Inter e um parágrafo em 1.125rem a 85%. Coluna direita: lista entre filetes de 1px na linha de pauta (`divide-y` e filetes no topo e na base), cada ideia com título Inter 700 (1.5rem) e parágrafo simples em 1.125rem a 85% (máx. 42rem); nas duas primeiras, ao final, uma ação em texto azul em negrito com seta ("Abrir Pergunta rápida", "Abrir Grupo com sorteio") que abre o modelo; a seta desliza 0.25rem no hover, só com movimento permitido. Sem cartões, sem fundos.
- **Entrada das seções (`Reveal`):** cada seção abaixo da abertura sobe 28px e aparece (opacidade) uma única vez ao entrar na tela (limiar 15%), 0.8s `cubic-bezier(0.16, 1, 0.3, 1)`. Sem efeito sob `prefers-reduced-motion: reduce`, e sem `IntersectionObserver` aparece direto.
- **Faixa "O que você precisa para começar":** única faixa azul da página, raio 28px, padding 3.5rem a 3.5rem lateral, título Inter. Três necessidades em linha: bloco de ícone de 3.5rem (raio 12px) translúcido, preenchimento branco a 10% com anel de 1px branco a 35%, ícone branco de 1.75rem; título em Inter 700 (1.25rem) e apoio em 1.125rem a 85%. Embaixo, a linha de privacidade dos dados (1rem, a 80%) e o botão amarela "Abrir a biblioteca" com seta. O botão do topo é azul.

### Landing: simulação "Experimente" (componente assinatura)
Duas metades, rotuladas como simulação com turma de exemplo ("Na aula, a câmera lê os cartões de papel de verdade").
- **Projeção (esquerda):** a tela do datashow como objeto: painel azul, raio 28px, padding 1.75rem a 2.25rem, chapado. Pergunta em Inter 700 (1.5rem a 1.875rem), quatro linhas de alternativa (`aria-live="polite"`): pílula de letra de 2.75rem (raio 12px, branco a 15%, letra branca em Inter 700), rótulo em 1.125rem 600, trilho de barra de 1rem (branco a 15%) com preenchimento branco a 70% que cresce em largura (0.5s, só com movimento permitido) e contagem tabular. Quando todos foram lidos, a alternativa certa vira amarela: letra em amarela com texto tinta e barra amarela. Linha de estado embaixo em 1.125rem 600 ("Esperando os cartões da turma." / "A câmera leu N de 8 cartões…" / "Resposta certa: B. N de 8 acertaram.").
- **Visitante (direita):** painel branco com borda de pauta, raio 28px, padding 1.75rem a 2.25rem. "Levante o seu cartão": quatro cartões A-D (4rem x 5rem, raio 8px, borda de 2px tinta, letra em Inter 700 de 1.875rem); no hover sobem 0.375rem e a borda vira azul. O escolhido sobe 0.5rem, vira amarela (texto tinta) e leva apoio de objeto (`0 12px 14px -8px rgb(16 24 32 / 0.5)`); os outros esmaecem para pauta com texto a 40% e ficam desabilitados.
- **A turma:** grade de 4 colunas, oito alunos (Você, #02 a #08); cada um é um quadro de proporção 5:4 que vira azul ao ser lido, com busto de cor de pele e o cartão branco lido (letra em tinta, 0.75rem 800) no canto; ainda não lido é pauta com borda tracejada. Os sete alunos de exemplo são lidos um a um a cada ~420ms (o primeiro após 500ms).
- **Reiniciar:** depois da escolha aparece o botão ghost pequeno "Jogar de novo" com ícone de seta circular.

### Livro Aberto (página do modelo)
Duas metades sob uma única sombra de apoio. Esquerda: capa de tecido (cor e moldura do `bindingFor`, lombada, padding 2.5rem com 3.5rem à esquerda) com nome em Display, objetivo em 1.25rem, minutos, formato e número de etapas, e o emblema `lg` centralizado no espaço restante. Direita: folha branca de padding 2.25rem a 2.5rem com "Etapas" (círculos azul de 2rem numerando cada passo, texto 1.125rem), "Material" (selos de fundo pauta com borda de pauta) e o botão azul grande "Preparar aula" no pé. Botão "Biblioteca" de volta acima, em pílula pequena.

### Lista de Perguntas (condução)
Cartões de padding 1rem, raio 16px, borda de pauta; selecionado fica opaco com realce, não selecionado a 70% de opacidade. Duas colunas a partir de `lg`.

## Do's and Don'ts

### Do:
- **Do** mostrar a aula antes de explicá-la na landing: ilustração da sala num painel com filete, com cartões levantados e etiquetas de leitura.
- **Do** reutilizar `AnswerCardShape` para qualquer cartão desenhado dentro de outro SVG do app, para que o cartão seja o mesmo em todo o app.
- **Do** manter a navegação com quatro destinos (Início, Biblioteca, Turma, Desempenho) e o estado da câmera como botão que leva ao teste.
- **Do** manter a biblioteca sobre a papel pautado (#f3f5fa), como as demais telas, e pousar objetos coloridos (livros) sobre ela.
- **Do** dar a todo livro lombada à esquerda com dois frisos, cantos 2px/12px e camadas de profundidade em `translateZ`.
- **Do** usar texto tinta (#000000) sobre amarela e branco sobre vermelho e azul.
- **Do** virar o livro tanto em hover quanto em foco-visível, e condicionar o movimento a `prefers-reduced-motion: no-preference`.
- **Do** manter o texto corrido dos livros em 0.875rem ou mais, com títulos em Inter 700.
- **Do** usar contorno de foco azul (#0040dd) de 4px nos livros.
- **Do** usar como emblema de capa o cartão de resposta que o modelo realmente usa; destacar só o cartão em jogo e esmaecer os ignorados.
- **Do** deixar etapas e material para a página do modelo; a biblioteca só mostra título, objetivo, minutos, formato e abertura por clique.
- **Do** deixar a grade crescer com o acervo (colunas `auto-fill` de 17rem) e manter o cabeçalho compacto.
- **Do** deixar a landing mostrar o fluxo funcionando (levantar o cartão, a câmera ler, a projeção contar) em simulação rotulada como exemplo.
- **Do** fazer cada seção da landing subir uma única vez ao entrar na tela, e desligar o movimento sob `prefers-reduced-motion`.
- **Do** dizer cada mensagem uma só vez na landing, nomeando metodologias e benefícios em linguagem simples de professor.
- **Do** abrir modelos a partir das ideias das metodologias por ação em texto, não por cartão.
- **Do** manter itens futuros pequenos, tracejados e na lateral, abaixo do painel de preparo.

### Don't:
- **Don't** repetir a faixa azul ou o botão amarela fora do fechamento da landing (a única exceção é a projeção da simulação, que é a tela do datashow e não uma faixa de seção), nem usar grade de cartões para benefícios: as metodologias usam lista entre filetes.
- **Don't** pôr sombra na cena da landing; só os cartões pousados têm apoio.
- **Don't** voltar a usar Literata ou outra serifa, nem afirmar na landing resultados que o próprio ClassPlay produziria, nem citar autores, estudos ou números de pesquisa.
- **Don't** usar simbologia de jogo de azar (ficha, feltro, bingo, dado, baralho); o tom é de ferramenta séria. O cartão de resposta de papel é o próprio instrumento da aula e pode aparecer, sempre como cartão branco com marcador e letra.
- **Don't** voltar ao campo azul escuro, à classe `.desk`, ao cabeçalho com parágrafo de apresentação nem à tábua da estante.
- **Don't** voltar a livros "em breve" como livros de contorno na grade; eles são itens pequenos na lateral.
- **Don't** abrir o livro na biblioteca nem reintroduzir a guarda "Material" ou a capa que gira 180°; a página dupla pertence só à página do modelo.
- **Don't** colorir seções inteiras de amarela ou vermelho nem pôr texto branco sobre amarela.
- **Don't** pôr sombra em botões, pílulas, selos, blocos de ícone, painéis ou na barra de navegação.
- **Don't** introduzir um segundo movimento de destaque além do livro que vira e da subida (livros na biblioteca, seções na landing); a resposta da simulação (cartão que sobe, barra que enche) é reação a um clique, não decoração.
- **Don't** reintroduzir o mundo anterior de blocos de brinquedo (amarelo vivo, azul de bloco, bordas grossas).
