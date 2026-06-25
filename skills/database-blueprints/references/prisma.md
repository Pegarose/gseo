# Prisma

## Quando usar

Carregue este arquivo se houver `schema.prisma`, `prisma migrate`, `prisma generate`, `PrismaClient` ou erro `Invalid prisma.<model>.<action>() invocation`.

## Checklist de campo novo

1. Campo existe no `schema.prisma`.
2. Migration foi gerada.
3. Banco executou a migration.
4. API envia campo válido.
5. Front-end usa nome correto.

## Relações

Inclua o campo scalar da FK e o campo relation. Tipos devem bater e campos filtrados com frequência devem ter `@@index`.

## Erros comuns

### Unknown argument

A API envia um campo inexistente no model. Atualize o schema, crie migration e rode `prisma generate`.

### Migration drift

Não resete produção. Compare schema real com migrations, use diff e valide em staging.

### PrismaClient múltiplo

Em dev com hot reload, use singleton para evitar excesso de conexões.

## Seed

Inclua dados mínimos: organization, admin, roles, customer, order/service order e payment. Nunca use tokens reais.

## Validação

```bash
npx prisma format
npx prisma validate
npx prisma migrate dev
npx prisma generate
npm test
```

Em produção, use `prisma migrate deploy`.
