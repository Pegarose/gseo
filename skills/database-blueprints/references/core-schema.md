# Blueprint de Schema Central

## Princípios

Transforme requisitos em entidades estáveis antes de criar tabelas. Não empilhe campos apenas porque aparecem em uma tela.

Confirme sempre:

1. Quem usa o sistema: `users`, `roles`, `organizations`.
2. O que é gerenciado: `customers`, `orders`, `service_orders`, `tickets`, `animals`, `inventory_items`.
3. Como o dinheiro circula: `payments`, `pix_payments`, `subscriptions`.
4. Como arquivos são salvos: `files`, `attachments`, `photos`.
5. Como mensagens são sincronizadas: `messages`, `whatsapp_messages`, `webhook_events`.
6. Quem alterou o quê: `audit_logs`.
7. Como configurar: `settings`.

## Tabelas centrais SMB/SaaS

| Tabela | Responsabilidade | Campos principais |
|--------|------------------|-------------------|
| `organizations` | Empresa, comerciante ou tenant | `id`, `name`, `tax_id`, `status`, `created_at` |
| `users` | Usuários de login | `id`, `email`, `name`, `phone`, `status`, `created_at` |
| `roles` | Papéis | `id`, `name`, `description` |
| `user_roles` | Relação usuário-papel | `user_id`, `role_id`, `organization_id` |
| `customers` | Clientes/contatos | `id`, `organization_id`, `name`, `phone`, `email`, `document` |
| `orders` | Pedidos ou documentos de negócio | `id`, `organization_id`, `customer_id`, `status`, `total_amount` |
| `order_items` | Itens do pedido | `id`, `order_id`, `name`, `quantity`, `unit_price` |
| `payments` | Pagamentos | `id`, `order_id`, `provider`, `status`, `amount`, `paid_at` |
| `subscriptions` | Planos e assinaturas | `id`, `organization_id`, `plan`, `status`, `trial_ends_at` |
| `files` | Metadados de arquivos | `id`, `organization_id`, `owner_type`, `owner_id`, `storage_path` |
| `messages` | Mensagens genéricas | `id`, `organization_id`, `channel`, `direction`, `body`, `status` |
| `webhook_events` | Eventos brutos de provedores | `id`, `provider`, `event_id`, `payload`, `processed_at` |
| `audit_logs` | Auditoria | `id`, `actor_user_id`, `action`, `entity_type`, `entity_id`, `changes` |
| `settings` | Configurações do tenant | `id`, `organization_id`, `key`, `value` |

## Extensões brasileiras

- `pix_payments`: QR, copia-e-cola, expiração e vínculo com `payments`.
- `whatsapp_contacts`: telefone E.164, nome e opt-in.
- `whatsapp_messages`: WAMID, template, status e contato.
- `lgpd_consents`: finalidade, concessão e revogação.

## Verticais

### Ordem de serviço

Use `service_orders`, `service_order_photos`, `inventory_items`, `service_order_parts`.

### Resgate animal

Use `animals`, `triages`, `approvals`, `animal_photos`.

### Ingressos

Use `events`, `tickets`, `ticket_checkins`, `ticket_batches`.

## Convenções

- UUID como chave primária por padrão.
- `created_at` e `updated_at` em tabelas de negócio.
- `deleted_at` para soft delete.
- Dinheiro em centavos inteiros ou `numeric(12,2)`, nunca float.
- Telefone em E.164, por exemplo `+5511999999999`.
- Webhook deve guardar payload bruto para auditoria e replay.

## Validação de persistência

Para cada campo novo, valide: formulário, API, coluna no banco, gravação, refresh, listagem, detalhe e permissões.
