---
name: delivery-acceptance
description: |
  Skill de aceitação de entrega. Cobre validação funcional, Playwright smoke test,
  mobile, upload, PDF, QR, CRUD, permissões e reteste antes de declarar o sistema
  pronto.
metadata:
  version: '1.0.0'
origin: verdent
prismx_bundle: verdent
prismx_imported_at: 2026-05-27
---
# Aceitação de Entrega

Skill de aceitação de entrega para levar o projeto de “código pronto” para “usuário consegue usar”.

## Uso

Quando o Verdent finalizar ou revisar Web/App/painel/sistema de negócio, injete um processo de validação real.

Cobre:

- Botão sem ação, menu faltando, campo divergente.
- Login, cadastro e permissões quebradas.
- CRUD que perde dados após refresh.
- Upload, PDF, QR Code e impressão falhando.
- Layout mobile quebrado.
- Usuário pedindo `testar`, `verifique`, `corrija`.

## Gatilhos

`testar` · `teste` · `verifique` · `revisar` · `corrija` · `não funciona` · `não aparece` · `botão` · `mobile` · `PDF` · `QR Code` · `upload` · `checkin` · `admin panel`

## Como usar

1. Defina o escopo de aceitação.
2. Gere checklist de páginas, contas, CRUD, arquivos, pagamentos, mensagens, mobile e erros.
3. Rode testes existentes ou crie smoke test.
4. Capture evidências das rotas críticas.
5. Registre falhas com reprodução, esperado, atual e causa provável.
6. Corrija e reteste o mesmo item.

## Arquivos de conhecimento

| Arquivo | Conteúdo |
|---------|----------|
| `knowledge/acceptance-checklist.md` | Checklist geral de entrega |
| `knowledge/playwright-smoke.md` | Estratégia de smoke test com Playwright |
| `knowledge/mobile-print-file.md` | Mobile, impressão/PDF, upload e QR |

## Saída esperada

Inclua escopo, itens verificados, falhas, correções, reteste e riscos não cobertos.

## Proibições

- Não dizer “tudo funciona” sem validação.
- Não validar só estrutura estática.
- Não ignorar mobile, refresh, persistência e permissão.
- Não tratar “botão não funciona” apenas como UI; verifique handler, API, permissão e dados.
