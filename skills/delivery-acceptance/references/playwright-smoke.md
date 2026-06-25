# Smoke Test com Playwright

## Quando usar

Use em Web apps quando o usuário pedir teste, correção de botão, validação de página, mobile ou entrega.

## Cobertura mínima

- Carregar home.
- Login ou modo demo.
- Navegar pelo fluxo principal.
- Criar dado central.
- Dar refresh e confirmar persistência.
- Testar viewport mobile.

## Viewports

- Desktop: `1280x720`
- Mobile: `390x844`

## Seletores

Prefira role, label, texto e test id. Evite classes CSS frágeis.

## Quando não automatizar

Se houver captcha, pagamento real, WhatsApp real ou aprovação externa, use mock/sandbox ou descreva validação manual. Não finja aprovação.

## Evidências

Capture prints de login, formulário, lista após submissão, detalhe, mobile e PDF/print quando aplicável.

## Falhas

Após falha, verifique DOM, URL, console, network, logs backend e escrita no banco.
