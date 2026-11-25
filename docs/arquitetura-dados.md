# Arquitetura de dados do ClassPlay

## Decisão: local-first

Tudo roda e fica no navegador do notebook do professor. Não há servidor e o desenvolvedor nunca recebe dados de alunos. Isso responde às três restrições do uso em sala:

- **Internet ruim ou ausente:** depois de abrir o app, a aula não depende de rede.
- **Computador modesto:** a leitura dos cartões e a estimativa de domínio rodam localmente, sem esperar servidor.
- **LGPD, art. 14 (crianças e adolescentes):** sem nuvem, a exposição é mínima. As rodadas guardam só `número do cartão → resposta`; o nome fica na turma, no mesmo computador.

A nuvem (sincronização entre dispositivos) fica para a fase 2, depois de definir com a escola quem é o controlador dos dados.

## Modelo de dados (versão 3)

| Dado | Escopo | Observação |
|---|---|---|
| Turmas e alunos | por turma | número do cartão de 1 a 199, pode repetir entre turmas |
| Turma ativa | global | escolhida na barra de navegação |
| Perguntas | global | o banco é do professor, compartilhado entre as turmas |
| Rodadas | por turma (`classroomId`) | rodadas de exemplo marcadas com `demo: true` |
| Última formação de grupos | por turma | |

`src/services/storageService.ts` é a única camada que conhece o armazenamento. A migração da versão com uma turma só é automática e não apaga nada.

## O que já está feito (fase 1)

- Várias turmas, com rodadas, grupos e desempenho separados por turma.
- Cópia de segurança em arquivo (baixar e restaurar, com validação) e "Apagar tudo deste computador".
- Pedido de armazenamento persistente (`navigator.storage.persist()`) ao salvar uma rodada.
- Content-Security-Policy no build: só código, fontes e mídia do próprio app; `wasm-unsafe-eval` para o MediaPipe.
- Planilha exportada sem injeção de fórmula (OWASP, CSV Injection).
- Carregamento sob demanda: telas, MediaPipe e confetti. O carregamento inicial caiu de 564 kB para 213 kB (65 kB comprimido).
- Histórico legado de perguntas não é mais gravado (duplicava dados de alunos).

## Próximos passos

**Fase 1, ainda no TCC**

| Item | Por quê | Esforço |
|---|---|---|
| IndexedDB com Dexie, com migração do localStorage | o localStorage tem ~5 MB; 30 turmas × 200 rodadas passam disso, e gravar o histórico inteiro a cada rodada trava a tela | 3 a 4 dias |
| PWA (vite-plugin-pwa): app e MediaPipe em cache, atualização só fora da aula | abrir e usar sem internet depois do primeiro acesso | 1 a 1,5 dia |
| Lembrete de cópia ("última cópia há X dias") | o navegador pode apagar dados; a cópia é a proteção real | 2 horas |
| Atualizar `@mediapipe/tasks-vision` (1.1.1 → 1.2.3) junto com `public/mediapipe` | correções do fornecedor | 2 horas |

**Fase 2, depois do TCC**

| Item | Esforço |
|---|---|
| Login do professor e banco na nuvem (Supabase/Postgres no Brasil) com RLS | 1 a 2 semanas |
| Sincronização local-first, sem enviar nomes de alunos | 1 a 2 semanas |
| Documentação LGPD: termo escola–plataforma, política de privacidade, registro das operações, retenção | 1 semana |

## Fontes

- MDN, *Storage quotas and eviction criteria*: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- web.dev, *Persistent storage*: https://web.dev/articles/persistent-storage
- WebKit, limite de 7 dias para armazenamento de script: https://webkit.org/blog/10218
- LGPD, Lei 13.709/2018, art. 14: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- ANPD, Enunciado CD/ANPD nº 1/2023 e Guia de Agentes de Tratamento: https://www.gov.br/anpd
- OWASP, *CSV Injection*: https://owasp.org/www-community/attacks/CSV_Injection
