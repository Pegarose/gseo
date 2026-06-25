---
name: database-blueprints
description: |
  Skill de desenho de tabelas e segurança de migrações. Cobre Supabase/Postgres,
  MySQL, Prisma, RLS, foreign keys, ordem de migração, validação de persistência
  e schemas comuns para SMB no Brasil.
metadata:
  version: '1.0.0'
origin: verdent
prismx_bundle: verdent
prismx_imported_at: 2026-05-27
---
# Blueprints de Banco de Dados

Skill de desenho de tabelas e segurança de migrações para transformar requisitos em schema executável.

## Uso

Quando o Verdent desenvolver sistemas de negócio, corrigir problemas de dados ou integrar Supabase/Postgres/MySQL/Prisma, injete este contexto de engenharia de banco de dados.

- **Extração de entidades** — clientes, pedidos, pagamentos, arquivos, mensagens, permissões e auditoria
- **Schema reutilizável** — estruturas para SMB/SaaS, WhatsApp, PIX, ordem de serviço, ingressos e resgate animal
- **Segurança de migração** — ordem de execução, dependências, preservação de dados, rollback e seed
- **Validação de persistência** — alinhamento entre formulário, API, DTO, banco e UI
- **Permissões e conformidade** — Supabase RLS, papéis, consentimento LGPD e logs de auditoria

## Gatilhos

`database` · `banco` · `tabela` · `schema` · `migration` · `supabase` · `mysql` · `postgres` · `prisma` · `drizzle` · `dados não salvam` · `RLS` · `foreign key`

## Como usar

1. Extraia entidades antes de escrever SQL.
2. Identifique o alvo: Supabase/Postgres, MySQL, Prisma ou SQLite.
3. Gere lista de tabelas e ordem de migração.
4. Preserve dados existentes; evite drop/rename direto em produção.
5. Valide persistência de cada campo.
6. Classifique erros: schema mismatch, foreign key, RLS, conexão, ordem de migration ou mapeamento.

## Arquivos de conhecimento

| Arquivo | Conteúdo |
|---------|----------|
| `knowledge/core-schema.md` | Tabelas centrais e extensões por negócio |
| `knowledge/supabase-postgres.md` | Supabase/Postgres, RLS, Storage e Edge Functions |
| `knowledge/mysql.md` | MySQL, foreign keys, charset e erros comuns |
| `knowledge/prisma.md` | Prisma schema, relations, migrations e seed |
| `knowledge/migration-safety.md` | Ordem, preservação de dados, rollback e checklist |

## Saída esperada

Inclua tabelas, responsabilidades, campos, chaves, índices, ordem de migração, permissões, seed, validação de persistência e plano de rollback.

## Proibições

- Não sugerir apagar dados de produção sem backup.
- Não gerar migrations sem ordem de execução.
- Não corrigir só o front-end sem verificar colunas e DTOs.
- Não guardar identidade, pagamento ou permissões apenas em localStorage.
- Não esquecer RLS ou limites da service role no Supabase.
