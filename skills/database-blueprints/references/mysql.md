# MySQL

## Configuração padrão

Use `utf8mb4`, InnoDB e collation consistente com o projeto.

Campos de chave estrangeira devem ter tipo, unsigned, tamanho e charset compatíveis com a coluna referenciada.

## Convenções

- Chave primária: `char(36)` UUID ou `bigint unsigned auto_increment`, seguindo o projeto.
- `created_at`, `updated_at` e, quando necessário, `deleted_at`.
- Dinheiro em `decimal(12,2)`.
- Índices em `organization_id`, `status`, `created_at`, `customer_id`.

## Erro errno 150

Verifique:

1. Tipos iguais dos dois lados.
2. Campo referenciado é primary ou unique.
3. Ambas as tabelas usam InnoDB.
4. Charset/collation consistentes.
5. Tabela pai criada antes.
6. Sem dados órfãos.

## Ordem de migrations

Use arquivos numerados:

```text
001_create_organizations.sql
002_create_users_roles.sql
003_create_customers.sql
004_create_orders.sql
005_create_payments.sql
006_create_files_messages.sql
007_create_indexes.sql
008_seed_initial_data.sql
```

Nunca faça o usuário adivinhar a ordem.

## Mapeamento de campos

Quando um campo salva errado, verifique: `name` do formulário, state do front-end, request body, DTO, model ORM, coluna e query de listagem/detalhe.

## Segurança

Não hardcode senha admin, não use root no app, não exponha SQL debug em produção e mantenha tokens em variáveis de ambiente.
