---
name: database-and-data-modeling
description: >
  Comprehensive guide for database schema design, migration strategies, ORM patterns,
  indexing, query optimization, and common data modeling patterns. Covers relational and
  NoSQL databases with actionable best practices for production systems.
version: 1.0.0
trigger_keywords:
  - database
  - schema
  - migration
  - query
  - SQL
  - ORM
  - index
  - normalization
  - PostgreSQL
  - MySQL
  - MongoDB
  - SQLite
  - data model
  - foreign key
  - join
  - N+1
---

# Database & Data Modeling

## 1. Schema Design Principles

### 1.1 Normalization Forms

Design schemas starting from 3NF and denormalize intentionally with documented justification.

| Normal Form | Rule | Example Violation |
|-------------|------|-------------------|
| **1NF** | Atomic values, no repeating groups | `tags: "a,b,c"` stored as CSV in a column |
| **2NF** | No partial dependencies on composite keys | `order_items(order_id, product_id, product_name)` — `product_name` depends only on `product_id` |
| **3NF** | No transitive dependencies | `employees(id, dept_id, dept_name)` — `dept_name` depends on `dept_id`, not `id` |
| **BCNF** | Every determinant is a candidate key | Rare edge cases in composite key tables |

### 1.2 Denormalization Trade-offs

| Strategy | When to Use | Cost |
|----------|-------------|------|
| **Materialized views** | Expensive read queries, stale data acceptable | Storage + refresh cost |
| **Computed columns** | Frequently derived values | Write overhead |
| **Duplicate columns** | Cross-table joins on hot paths | Data consistency risk |
| **Summary tables** | Reporting / analytics dashboards | ETL complexity |
| **JSON columns** | Flexible schema subsections | Harder to query/index |

> **Rule of thumb**: Normalize for writes, denormalize for reads. Always measure before denormalizing.

### 1.3 Naming Conventions

```
Tables:        snake_case, plural          → users, order_items
Columns:       snake_case, singular        → first_name, created_at
Primary keys:  id (or table_singular_id)   → id, user_id
Foreign keys:  referenced_table_id         → user_id, order_id
Indexes:       idx_{table}_{columns}       → idx_users_email
Constraints:   {type}_{table}_{columns}    → uq_users_email, fk_orders_user_id
```

### 1.4 Standard Column Set

Every table should include these columns unless there is a documented reason not to:

```sql
CREATE TABLE example (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ... domain columns ...
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by  UUID REFERENCES users(id),
    updated_by  UUID REFERENCES users(id)
);
```

---

## 2. Migration Strategy

### 2.1 Versioned Migrations

Use sequential, timestamped migration files. Never edit a migration that has been applied to any shared environment.

```
migrations/
├── 20240101_000001_create_users.sql
├── 20240101_000002_create_orders.sql
├── 20240115_000001_add_users_phone.sql
└── 20240120_000001_create_order_items.sql
```

### 2.2 Migration Checklist

| Step | Action | Details |
|------|--------|---------|
| 1 | **Write UP migration** | The forward change |
| 2 | **Write DOWN migration** | Reversible rollback |
| 3 | **Test on staging** | With production-like data volume |
| 4 | **Backup production** | Point-in-time snapshot before applying |
| 5 | **Apply in maintenance window** | Or use zero-downtime strategy |
| 6 | **Verify** | Run health checks and smoke tests |
| 7 | **Monitor** | Watch error rates for 15–30 minutes |

### 2.3 Zero-Downtime Migration Patterns

#### Adding a Column
```
Step 1: ALTER TABLE ADD COLUMN (nullable, no default)  →  deploy
Step 2: Backfill data in batches                        →  deploy
Step 3: Application code starts writing to new column   →  deploy
Step 4: SET NOT NULL / add constraints                  →  deploy
```

#### Renaming a Column
```
Step 1: Add new column                  →  deploy
Step 2: Dual-write to old + new column  →  deploy
Step 3: Backfill new column             →  run
Step 4: Read from new column            →  deploy
Step 5: Stop writing old column         →  deploy
Step 6: Drop old column                 →  deploy (after grace period)
```

#### Dropping a Column
```
Step 1: Stop reading the column in app code   →  deploy
Step 2: Stop writing the column               →  deploy
Step 3: DROP COLUMN in migration              →  deploy (after grace period)
```

### 2.4 Rollback Plans

- **Always test rollback** on staging before production deployment.
- Keep rollback scripts in the same migration file (UP/DOWN).
- For destructive changes (DROP TABLE, DROP COLUMN), the rollback must restore from backup — document this explicitly.
- Set a **rollback decision deadline**: if issues aren't resolved within 15 minutes, execute rollback.

### 2.5 Migration Tools

| Tool | Language/Framework | Notes |
|------|--------------------|-------|
| **Flyway** | Java / any SQL | Version-based, mature |
| **Liquibase** | Java / any SQL | XML/YAML/JSON changelog |
| **Alembic** | Python / SQLAlchemy | Auto-generates diffs |
| **Knex** | Node.js | JS-based migrations |
| **Prisma Migrate** | Node.js / TypeScript | Schema-first approach |
| **Django Migrations** | Python / Django | Auto-detects model changes |
| **ActiveRecord** | Ruby / Rails | Convention-based |
| **golang-migrate** | Go | SQL file-based |

---

## 3. ORM Patterns & Anti-Patterns

### 3.1 The N+1 Query Problem

**Anti-pattern** — fetching related records in a loop:

```python
# BAD: N+1 — 1 query for orders + N queries for users
orders = Order.objects.all()
for order in orders:
    print(order.user.name)  # Each access triggers a query
```

**Fix** — eager loading:

```python
# GOOD: 2 queries total (1 for orders, 1 for users)
orders = Order.objects.select_related('user').all()
for order in orders:
    print(order.user.name)  # No additional query
```

### 3.2 Loading Strategies

| Strategy | ORM Syntax | When to Use |
|----------|-----------|-------------|
| **Eager loading** | `select_related()` (Django), `include()` (Prisma), `eager_load()` (Rails) | Always needed relations, list views |
| **Lazy loading** | Default in most ORMs | Single object access, rarely traversed relations |
| **Explicit loading** | `prefetch_related()` (Django), manual JOIN | Conditional loading based on business logic |
| **Batch loading** | DataLoader pattern (GraphQL) | GraphQL resolvers, fan-out queries |

### 3.3 ORM Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **N+1 queries** | Hundreds of queries for a list page | Eager loading / JOINs |
| **Fat models** | Business logic in ORM models | Service layer / use cases |
| **Raw SQL everywhere** | Loses ORM safety, portability | Use ORM; raw SQL only for complex analytics |
| **Ignoring query count** | Performance degrades silently | Use query logging / `django-debug-toolbar` / `prisma.$queryRaw` |
| **Over-fetching** | `SELECT *` when only 2 columns needed | Use `.only()`, `.select()`, projections |
| **Mixing ORM + raw SQL** | Inconsistent data access patterns | Establish a clear data access layer |

### 3.4 When to Bypass the ORM

- Complex reporting queries with CTEs, window functions
- Bulk operations (INSERT 100k+ rows)
- Database-specific features (PostgreSQL `LISTEN/NOTIFY`, full-text search)
- Performance-critical hot paths after profiling

---

## 4. Index Strategy

### 4.1 Index Types

| Type | Syntax (PostgreSQL) | Best For |
|------|---------------------|----------|
| **B-tree** (default) | `CREATE INDEX idx ON t(col)` | Equality, range, sorting, `LIKE 'prefix%'` |
| **Hash** | `CREATE INDEX idx ON t USING hash(col)` | Equality only (rarely better than B-tree) |
| **GIN** | `CREATE INDEX idx ON t USING gin(col)` | Full-text search, JSONB, arrays |
| **GiST** | `CREATE INDEX idx ON t USING gist(col)` | Geometric data, range types, nearest-neighbor |
| **BRIN** | `CREATE INDEX idx ON t USING brin(col)` | Large tables with natural ordering (e.g., timestamps) |

### 4.2 Composite Indexes

Column order matters — the index is useful for queries that filter on a **left prefix** of the columns.

```sql
-- Index on (country, city, zip_code)
CREATE INDEX idx_address_lookup ON addresses(country, city, zip_code);

-- ✅ Uses index: WHERE country = 'US'
-- ✅ Uses index: WHERE country = 'US' AND city = 'NYC'
-- ✅ Uses index: WHERE country = 'US' AND city = 'NYC' AND zip_code = '10001'
-- ❌ Cannot use index: WHERE city = 'NYC' (missing left prefix)
-- ❌ Cannot use index: WHERE zip_code = '10001'
```

**Rule**: Put equality filters first, then range filters, then sort columns.

### 4.3 Partial Indexes

Index only the rows you actually query:

```sql
-- Only index active users (90% of queries filter on active=true)
CREATE INDEX idx_users_active_email ON users(email) WHERE active = true;

-- Only index unprocessed orders
CREATE INDEX idx_orders_pending ON orders(created_at) WHERE status = 'pending';
```

### 4.4 Covering Indexes (Index-Only Scans)

Include all columns needed by a query so the database never reads the table:

```sql
-- PostgreSQL: INCLUDE clause
CREATE INDEX idx_orders_covering ON orders(user_id, status) INCLUDE (total, created_at);

-- This query can be answered entirely from the index:
SELECT total, created_at FROM orders WHERE user_id = 123 AND status = 'completed';
```

### 4.5 Indexing Checklist

| Rule | Details |
|------|---------|
| Index all foreign keys | Prevents full table scans on JOINs and CASCADE deletes |
| Index columns in WHERE clauses | If selectivity > 10–15% (i.e., the filter excludes most rows) |
| Index columns in ORDER BY | Avoids expensive filesort |
| Don't over-index | Each index slows down writes and uses storage |
| Monitor unused indexes | `pg_stat_user_indexes` → `idx_scan = 0` means unused |
| Rebuild bloated indexes | `REINDEX` or `pg_repack` for PostgreSQL |

---

## 5. Query Optimization

### 5.1 Using EXPLAIN

```sql
-- PostgreSQL
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) 
SELECT * FROM orders WHERE user_id = 42 AND status = 'active';
```

**Key things to look for in EXPLAIN output:**

| Indicator | Concern | Action |
|-----------|---------|--------|
| **Seq Scan** on large table | Missing index | Add appropriate index |
| **Nested Loop** with high row count | N+1 at database level | Consider Hash Join (check `work_mem`) |
| **Sort** with high cost | Missing index on ORDER BY columns | Add index or covering index |
| **Rows (estimated)** ≠ **Rows (actual)** | Stale statistics | Run `ANALYZE` on the table |
| **Buffers: shared read** very high | Cold cache or table too large | Check index usage, consider partitioning |

### 5.2 Slow Query Detection

| Database | Configuration |
|----------|---------------|
| **PostgreSQL** | `log_min_duration_statement = 200` (log queries > 200ms) |
| **MySQL** | `slow_query_log = 1`, `long_query_time = 0.2` |
| **MongoDB** | `db.setProfilingLevel(1, { slowms: 200 })` |

### 5.3 Pagination Patterns

| Pattern | Pros | Cons |
|---------|------|------|
| **OFFSET/LIMIT** | Simple, supports random page access | Slow on large offsets, inconsistent with concurrent writes |
| **Cursor-based (keyset)** | Fast at any depth, consistent | No random page access, requires unique sort key |
| **Seek method** | Variant of cursor, very fast | Same as cursor-based |

```sql
-- ❌ OFFSET pagination (slow at page 1000)
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 19980;

-- ✅ Cursor pagination (fast at any depth)
SELECT * FROM orders WHERE id > :last_seen_id ORDER BY id LIMIT 20;
```

### 5.4 Common Optimization Techniques

| Technique | Details |
|-----------|---------|
| **Batch inserts** | Insert 1000 rows at a time instead of one-by-one |
| **Connection pooling** | Use PgBouncer, ProxySQL, or built-in pool (Prisma, HikariCP) |
| **Read replicas** | Route read queries to replicas for horizontal scaling |
| **Materialized views** | Pre-compute expensive aggregations, refresh periodically |
| **Partitioning** | Split large tables by date range, hash, or list |
| **VACUUM / ANALYZE** | PostgreSQL: prevent bloat and keep stats current |

---

## 6. Common Data Patterns

### 6.1 Soft Delete

```sql
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- "Delete" a record
UPDATE users SET deleted_at = NOW() WHERE id = 42;

-- Query only active records
SELECT * FROM users WHERE deleted_at IS NULL;

-- Partial index for performance
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;
```

**Considerations:**
- Add `deleted_at IS NULL` to all queries (use a default scope in ORM)
- Unique constraints must include `deleted_at` or use partial unique indexes
- Schedule hard-delete jobs for GDPR/data retention compliance

### 6.2 Audit Trails

```sql
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  VARCHAR(100) NOT NULL,
    record_id   UUID NOT NULL,
    action      VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE
    old_data    JSONB,
    new_data    JSONB,
    changed_by  UUID REFERENCES users(id),
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Implementation options:**
- **Application level**: Middleware / ORM hooks (simpler, less reliable)
- **Database triggers**: Captures all changes including raw SQL (more reliable)
- **CDC (Change Data Capture)**: Debezium, AWS DMS (best for streaming)

### 6.3 Multi-Tenancy

| Strategy | Isolation | Complexity | Best For |
|----------|-----------|------------|----------|
| **Shared database, shared schema** (tenant_id column) | Low | Low | SaaS with many small tenants |
| **Shared database, separate schemas** | Medium | Medium | Moderate isolation needs |
| **Separate databases** | High | High | Enterprise / regulated industries |

```sql
-- Shared schema approach: every table gets a tenant_id
CREATE TABLE orders (
    id         UUID PRIMARY KEY,
    tenant_id  UUID NOT NULL REFERENCES tenants(id),
    -- ... columns ...
);

-- Row-Level Security (PostgreSQL)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON orders
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

### 6.4 Polymorphic Associations

| Approach | Pros | Cons |
|----------|------|------|
| **Single Table Inheritance (STI)** | Simple queries, one table | Sparse columns, wide rows |
| **Class Table Inheritance (CTI)** | Clean schema per type | JOINs needed for full record |
| **Polymorphic FK** (`commentable_type` + `commentable_id`) | Flexible | No real FK constraint, harder to query |
| **Join table per association** | Real FK constraints | More tables |

**Recommended approach** — use a join table or separate FK columns:

```sql
-- Instead of polymorphic (commentable_type, commentable_id):
CREATE TABLE comments (
    id          UUID PRIMARY KEY,
    body        TEXT NOT NULL,
    post_id     UUID REFERENCES posts(id),      -- nullable
    photo_id    UUID REFERENCES photos(id),     -- nullable
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT one_parent CHECK (
        (post_id IS NOT NULL)::int + (photo_id IS NOT NULL)::int = 1
    )
);
```

### 6.5 Temporal Data / Slowly Changing Dimensions

```sql
-- Type 2 SCD: keep full history
CREATE TABLE product_prices (
    id          BIGSERIAL PRIMARY KEY,
    product_id  UUID NOT NULL REFERENCES products(id),
    price       DECIMAL(10,2) NOT NULL,
    valid_from  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to    TIMESTAMPTZ,  -- NULL = current
    EXCLUDE USING gist (
        product_id WITH =,
        tstzrange(valid_from, valid_to) WITH &&
    )
);
```

---

## 7. Database Selection Guide

| Criteria | PostgreSQL | MySQL | MongoDB | SQLite |
|----------|-----------|-------|---------|--------|
| **Type** | Relational | Relational | Document | Embedded relational |
| **ACID compliance** | Full | Full (InnoDB) | Per-document | Full |
| **JSON support** | Excellent (JSONB) | Good (JSON) | Native | Basic (JSON1 ext) |
| **Full-text search** | Built-in (tsvector) | Built-in (InnoDB) | Built-in (Atlas Search) | FTS5 extension |
| **Horizontal scaling** | Citus, read replicas | Group replication, Vitess | Native sharding | N/A |
| **Best for** | Complex queries, data integrity, extensibility | Web apps, read-heavy workloads | Flexible schemas, rapid prototyping, document data | Embedded apps, testing, edge/mobile |
| **Avoid when** | Extreme write throughput needed | Complex queries, advanced types | Strong consistency across documents required | Concurrent writes, multi-user server apps |
| **Max practical size** | Petabytes (with Citus) | Terabytes | Petabytes | ~1 TB (practical: < 100 GB) |
| **License** | PostgreSQL License (permissive) | GPL v2 (or commercial) | SSPL | Public domain |

### Decision Flowchart

```
Need embedded/serverless DB? → SQLite
Need flexible document schema? → MongoDB
Need advanced SQL, types, extensions? → PostgreSQL
Need simple relational with broad hosting? → MySQL
High write throughput, time-series? → Consider TimescaleDB (PostgreSQL ext) or ClickHouse
Need graph relationships? → Consider Neo4j or PostgreSQL + Apache AGE
```

---

## 8. Quick Reference Commands

### PostgreSQL

```sql
-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;

-- Unused indexes
SELECT indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0 ORDER BY pg_relation_size(indexrelid) DESC;

-- Running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;

-- Kill a query
SELECT pg_cancel_backend(pid);

-- Table bloat estimate
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;
```

### MySQL

```sql
-- Table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY size_mb DESC;

-- Running queries
SHOW PROCESSLIST;

-- Kill a query
KILL <process_id>;
```

---

## 9. Anti-Pattern Checklist

| ❌ Anti-Pattern | ✅ Better Approach |
|----------------|-------------------|
| Storing money as `FLOAT` | Use `DECIMAL(19,4)` or integer cents |
| Using `SELECT *` in application code | Explicitly list needed columns |
| No index on foreign keys | Always index FK columns |
| Storing files in BLOB columns | Store file path/URL; files go to object storage |
| Using `ENUM` types excessively | Use a reference/lookup table instead |
| No `created_at` / `updated_at` | Include on every table |
| Trusting ORM-generated queries blindly | Review queries in development, log slow queries |
| Running migrations without backup | Always snapshot before destructive changes |
| Ignoring connection pool limits | Configure pool size based on max_connections |
| Using `OFFSET` for deep pagination | Use cursor/keyset pagination |
