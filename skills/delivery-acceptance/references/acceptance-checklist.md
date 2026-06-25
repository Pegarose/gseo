# Checklist de Aceitação

## Validação básica

Antes de entregar, verificar:

1. App inicia sem erro visível.
2. Página inicial abre.
3. Navegação principal funciona.
4. Login e logout funcionam.
5. Formulários críticos submetem.
6. Dados permanecem após refresh.
7. Lista, detalhe e edição mostram dados consistentes.
8. Erros têm mensagens úteis.
9. Mobile não tem quebra bloqueante.

## CRUD

Para cada entidade: criar, listar, detalhar, editar, excluir/arquivar, atualizar página e checar permissões.

## Contas e permissões

Verifique admin, usuário comum, menu protegido, erros de senha, papéis e regras premium/basic/trial.

## Fluxos de negócio

Teste o fluxo real: ordem de serviço, ingresso, resgate animal, e-commerce/pedido ou qualquer fluxo central do usuário.

## Formato de falha

```text
Falha:
- Caminho:
- Passos:
- Esperado:
- Atual:
- Causa provável:
- Arquivos a alterar:
- Como retestar:
```

## Definição de pronto

Fluxo central rodou, falhas conhecidas foram corrigidas ou listadas, itens corrigidos foram retestados e riscos restantes estão claros.
