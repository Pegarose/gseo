# Segurança de Migração

## Princípio

Migrações devem preservar dados, ter ordem clara, validação e rollback.

## Fluxo

1. Levantar estado atual: banco, tabelas, migrations e dados reais.
2. Projetar schema alvo: tabelas, campos, FKs, índices e permissões.
3. Dividir: base, negócio, relacionamentos, backfill, constraints, índices e seed.
4. Validar em banco vazio e staging com dados.
5. Definir rollback.

## Padrões seguros

### Renomear campo

Adicionar campo novo, backfill, código lê novo/antigo, verificar, remover antigo.

### Alterar tipo

Criar campo temporário, converter, validar, trocar código, remover antigo.

### Campo not null

Adicionar nullable, preencher, validar sem null, aplicar `not null`.

### Foreign key

Criar pai primeiro, limpar órfãos, conferir tipos, criar índice e só então adicionar FK.

## Numeração

```text
001_create_core_identity_tables
002_create_customer_tables
003_create_order_tables
004_create_payment_tables
005_create_file_message_tables
006_add_indexes
007_add_rls_policies
008_seed_demo_data
```

## Checklist de produção

Backup, staging, rollback, ordem confirmada, índices, integridade de FK, DTO/front-end atualizados e teste de salvar/refresh/listar/editar/excluir.

## Casos comuns

- “precisa atualizar a tabela no banco?”: compare campos esperados pelo código com colunas reais.
- “banco não está abrindo”: verifique conexão, serviço, migration, permissão e pool.
- “não sei qual script rodar primeiro”: renumerar e documentar ordem.
- “dados não aparecem”: verificar insert, select, RLS, cache e coluna errada.
