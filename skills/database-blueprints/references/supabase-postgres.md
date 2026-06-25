# Supabase / Postgres

## Escolha padrão

Em projetos Supabase, use:

- Postgres para dados de negócio.
- Supabase Auth para identidade.
- Row Level Security para tenant e papéis.
- Supabase Storage para arquivos.
- Edge Functions para webhooks, pagamentos e WhatsApp.

## Convenções

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`
- `organization_id uuid not null references organizations(id)` em tabelas multi-tenant
- `jsonb` para eventos brutos
- índices em `organization_id`, `status`, `created_at` e FKs

## Auth

Não copie senha ou token do Supabase Auth.

Recomendado:

- `auth.users.id` como origem da identidade.
- `public.users.id` pode referenciar `auth.users.id`.
- Dados isolados por `organization_id`.
- `user_roles` define permissões no tenant.

## RLS base

- Usuário lê seu próprio registro.
- Membro lê dados da própria organização.
- Admin/owner escreve configurações.
- Service role só em backend confiável.
- Webhook não deve depender de permissões anon abertas.

## Storage

Salve metadados: bucket, path, nome original, mime type, tamanho, owner e uploader.

Arquivos de clientes, animais, documentos ou ordens de serviço devem ser privados por padrão, com signed URLs.

## Problemas comuns

### Inseriu mas não aparece

Verifique RLS, `organization_id`, filtros da query, retorno do insert e cache da UI.

### `function_search_path_mutable`

Corrija a assinatura exata da função e defina `search_path`.

### Vários GoTrueClient

Centralize a criação do client em um singleton.

## Webhook

Fluxo: validar assinatura, salvar evento bruto, aplicar idempotência por `provider + event_id`, atualizar tabelas em transação e registrar status.
