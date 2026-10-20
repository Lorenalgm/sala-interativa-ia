---
version: 1
slug: "src-components-library-librarypage-tsx"
primary_target: "src/components/Library/LibraryPage.tsx"
related_targets: ["src/components/Library/ScriptPage.tsx"]
---

# Biblioteca (LibraryPage)

Modo: Operate (catálogo de roteiros que vai crescer; não é landing page, a apresentação da proposta do produto fica numa página própria). Ação principal: abrir um roteiro disponível.

Público e tarefa: professor do fundamental e médio escolhe o roteiro de amanhã. Prova real: `steps`, `format` e `minutes` de `src/data/scripts.ts`. Sem números, depoimentos ou escolas inventados. Restrição da Lorena: nada com tom de aposta (sem carta, bingo, dado, ficha de cassino).

## Direction contract

THESIS: A biblioteca é uma escrivaninha com livros de roteiro: cada roteiro é um livro fechado que vira na lombada ao receber foco, com profundidade; as etapas e o material ficam na página do roteiro, depois do clique. Recusa a grade de cards iguais e qualquer simbologia de jogo de azar (carta, ficha, feltro de cassino, bingo, dado). Tom sério de ferramenta, sem pergunta lúdica no título.

OWN-WORLD: Campo azul-petróleo chapado (#0a4d4a), capas de livro em mostarda #f2a900 e vermelho #d62839 com lombada escura de dois frisos, páginas brancas com borda de folhas, guardas em tom escuro da capa, tinta #101820. Display Bricolage Grotesque 800; texto em Atkinson Hyperlegible Next. Reconhecível sem conteúdo: capas coloridas com lombada sobre campo teal.

STORY: O professor vê o acervo como livros de roteiro, abre um para ler as etapas e o material sem sair da tela, e entra no roteiro que quer conduzir.

FIRST VIEWPORT: Fundo verde clarinho como o resto do app, barra teal fina no topo. Cabeçalho enxuto: "Biblioteca de roteiros" com uma linha de apoio e filtros por formato à direita. Grade de livros em pé de 17rem x 25rem que cresce com o acervo (mostarda e vermelho, cartão de resposta na capa), e uma coluna lateral discreta com "Antes da aula" e "Em breve" (itens pequenos de contorno). Os livros viram na lombada ao receber foco; o clique abre a página do roteiro, que é uma página aberta numa tela.

FORM: Estante de Livros, derivada do Baralho de Roteiros (seed:7696d8f8974afb33, primeira rodada, escolha do impeccable) por pedido da Lorena: voltar ao visual teal anterior, trocar cartas por livros interativos e o título lúdico pelo tom sério.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
