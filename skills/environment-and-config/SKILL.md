---
name: environment-and-config
description: Environment and configuration management — .env files, validation with Zod/envalid, feature flags, secrets management (Vault, AWS), Docker/container patterns, CI/CD injection, and security best practices.
version: 1.0.0
trigger_keywords:
  - env
  - config
  - environment
  - feature flag
  - secrets
  - .env
  - dotenv
  - configuration
  - environment variable
  - secrets management
---

# Environment & Configuration Management

## Configuration Hierarchy

```
Priority (highest → lowest):
┌──────────────────────────────┐
│ 1. CLI arguments / flags     │  --port=8080
├──────────────────────────────┤
│ 2. Environment variables     │  PORT=8080
├──────────────────────────────┤
│ 3. .env.local (git-ignored)  │  Local overrides
├──────────────────────────────┤
│ 4. .env.[environment]        │  .env.production
├──────────────────────────────┤
│ 5. .env                      │  Shared defaults
├──────────────────────────────┤
│ 6. Application defaults      │  Code fallbacks
└──────────────────────────────┘
```

---

## 1. .env File Management

### File Naming Convention

| File | Purpose | Git-tracked | Contains Secrets |
|------|---------|-------------|-----------------|
| `.env` | Shared defaults for all environments | ✅ Yes | ❌ No |
| `.env.local` | Local developer overrides | ❌ No | ⚠️ Local only |
| `.env.development` | Development-specific config | ✅ Yes | ❌ No |
| `.env.staging` | Staging-specific config | ✅ Yes | ❌ No |
| `.env.production` | Production-specific config | ✅ Yes | ❌ No |
| `.env.development.local` | Local dev overrides | ❌ No | ⚠️ Local only |
| `.env.production.local` | Local prod overrides | ❌ No | ⚠️ Local only |
| `.env.test` | Test environment config | ✅ Yes | ❌ No |
| `.env.example` | Template with all keys (no values) | ✅ Yes | ❌ No |

### Load Order (Next.js / Vite conventions)

```
.env                    ← Always loaded
.env.local              ← Always loaded, git-ignored
.env.[environment]      ← Loaded for specific NODE_ENV
.env.[environment].local ← Loaded for specific NODE_ENV, git-ignored

Later files override earlier ones.
```

### .env File Best Practices

```bash
# .env — Committed, shared defaults (NO SECRETS)
NODE_ENV=development
APP_NAME=my-app
API_BASE_URL=http://localhost:3000
LOG_LEVEL=debug
ENABLE_ANALYTICS=false

# Feature flags (non-sensitive)
NEXT_PUBLIC_FEATURE_NEW_DASHBOARD=false
NEXT_PUBLIC_FEATURE_DARK_MODE=true
```

```bash
# .env.local — Git-ignored, local secrets
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-dev-secret-change-in-prod
STRIPE_SECRET_KEY=sk_test_xxxxx
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxxxx
```

```bash
# .env.example — Committed, documents all required variables
# Copy to .env.local and fill in values

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Auth
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d

# External services
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
SENDGRID_API_KEY=SG.xxx

# Optional
LOG_LEVEL=debug    # debug | info | warn | error
ENABLE_ANALYTICS=false
```

### .gitignore Patterns

```gitignore
# Environment files with secrets
.env.local
.env.*.local
.env.development.local
.env.staging.local
.env.production.local

# Never commit these
*.pem
*.key
*.p12
*.jks
service-account.json
credentials.json

# IDE-specific env
.idea/
.vscode/*.env

# Docker env overrides
docker-compose.override.yml
```

---

## 2. Environment Variable Validation

### Zod Validation

```ts
// src/env.ts — Validate ALL env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  REDIS_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // External Services
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  SENDGRID_API_KEY: z.string().startsWith('SG.').optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z.coerce.boolean().default(false),
  ENABLE_NEW_DASHBOARD: z.coerce.boolean().default(false),
});

// Validate and export — fail fast at startup
function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }

  return result.data;
}

export const env = validateEnv();

// TypeScript gets full type safety:
// env.PORT        → number
// env.NODE_ENV    → 'development' | 'staging' | 'production' | 'test'
// env.REDIS_URL   → string | undefined
```

### Envalid Validation

```ts
// src/env.ts — Using envalid
import { cleanEnv, str, port, bool, url, num } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'staging', 'production', 'test'] }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: url(),
  REDIS_URL: url({ default: undefined }),
  JWT_SECRET: str({ desc: 'Secret key for JWT signing' }),
  STRIPE_SECRET_KEY: str({ desc: 'Stripe secret API key' }),
  LOG_LEVEL: str({ choices: ['debug', 'info', 'warn', 'error'], default: 'info' }),
  ENABLE_ANALYTICS: bool({ default: false }),
  MAX_UPLOAD_SIZE_MB: num({ default: 10 }),
});

// env.isProduction  → boolean helper
// env.isDev         → boolean helper
```

### Client-Side Env Validation (Next.js / T3 Env)

```ts
// src/env.mjs — Separate client and server validation
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_FEATURE_DARK_MODE: z.coerce.boolean().default(false),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_FEATURE_DARK_MODE: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE,
  },
});
```

---

## 3. Feature Flags

### Simple JSON-Based Feature Flags

```ts
// src/features/flags.ts — Simplest approach
interface FeatureFlags {
  newDashboard: boolean;
  darkMode: boolean;
  betaSearch: boolean;
  maxUploadSizeMB: number;
  maintenanceMode: boolean;
}

const flags: Record<string, FeatureFlags> = {
  development: {
    newDashboard: true,
    darkMode: true,
    betaSearch: true,
    maxUploadSizeMB: 50,
    maintenanceMode: false,
  },
  staging: {
    newDashboard: true,
    darkMode: true,
    betaSearch: true,
    maxUploadSizeMB: 25,
    maintenanceMode: false,
  },
  production: {
    newDashboard: false,
    darkMode: true,
    betaSearch: false,
    maxUploadSizeMB: 10,
    maintenanceMode: false,
  },
};

export function getFlags(): FeatureFlags {
  return flags[process.env.NODE_ENV ?? 'development'];
}

export function isEnabled(flag: keyof FeatureFlags): boolean {
  return !!getFlags()[flag];
}
```

```tsx
// Usage in React
function Dashboard() {
  if (!isEnabled('newDashboard')) {
    return <LegacyDashboard />;
  }
  return <NewDashboard />;
}
```

### LaunchDarkly Integration

```ts
// src/features/launchdarkly.ts
import * as LaunchDarkly from 'launchdarkly-node-server-sdk';

let ldClient: LaunchDarkly.LDClient;

export async function initLaunchDarkly() {
  ldClient = LaunchDarkly.init(process.env.LAUNCHDARKLY_SDK_KEY!);
  await ldClient.waitForInitialization();
}

export async function getFlag(
  flagKey: string,
  user: { key: string; email?: string; custom?: Record<string, any> },
  defaultValue: boolean = false,
): Promise<boolean> {
  const context: LaunchDarkly.LDContext = {
    kind: 'user',
    key: user.key,
    email: user.email,
    ...user.custom,
  };
  return ldClient.variation(flagKey, context, defaultValue);
}

// Usage
const showNewUI = await getFlag('new-checkout-flow', {
  key: userId,
  email: user.email,
  custom: { plan: 'pro', region: 'us-east' },
});
```

### Unleash Integration

```ts
// src/features/unleash.ts
import { initialize, isEnabled } from 'unleash-client';

const unleash = initialize({
  url: process.env.UNLEASH_URL!,
  appName: 'my-app',
  customHeaders: {
    Authorization: process.env.UNLEASH_API_KEY!,
  },
});

unleash.on('ready', () => console.log('Unleash ready'));

export function checkFeature(name: string, context?: { userId?: string }): boolean {
  return isEnabled(name, context);
}
```

### Feature Flag Best Practices

| Practice | Details |
|----------|---------|
| **Short-lived flags** | Remove flags after rollout (< 2 weeks for release flags) |
| **Naming convention** | `enable-new-checkout`, `experiment-pricing-v2`, `ops-maintenance-mode` |
| **Default to off** | New features default to disabled in production |
| **Flag types** | Release (temporary), Experiment (A/B), Ops (kill switches), Permission (entitlement) |
| **Audit trail** | Log all flag changes with who, when, why |
| **Testing** | Test both flag states in unit/integration tests |
| **Cleanup** | Track flag age, alert on flags older than 30 days |

---

## 4. Secrets Management

### Secrets Management Comparison

| Solution | Self-hosted | Cloud | Rotation | Dynamic Secrets | Cost |
|----------|------------|-------|----------|----------------|------|
| **HashiCorp Vault** | ✅ | ✅ (HCP) | ✅ | ✅ | Free (OSS) / Paid |
| **AWS Secrets Manager** | ❌ | ✅ | ✅ | ❌ | $0.40/secret/month |
| **AWS SSM Parameter Store** | ❌ | ✅ | ❌ | ❌ | Free (standard) |
| **GCP Secret Manager** | ❌ | ✅ | ✅ | ❌ | $0.06/10k access |
| **Azure Key Vault** | ❌ | ✅ | ✅ | ❌ | $0.03/10k operations |
| **1Password CLI** | ❌ | ✅ | ❌ | ❌ | $7.99/user/month |
| **Doppler** | ❌ | ✅ | ❌ | ❌ | Free tier available |
| **SOPS** | ✅ | ✅ | ❌ | ❌ | Free |

### AWS Secrets Manager

```ts
// src/secrets/aws.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

// Cache secrets in memory to avoid repeated API calls
const secretsCache = new Map<string, { value: string; expiresAt: number }>();

export async function getSecret(secretName: string, cacheTTL = 300): Promise<string> {
  const cached = secretsCache.get(secretName);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.value;
  }

  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);
  const value = response.SecretString!;

  secretsCache.set(secretName, {
    value,
    expiresAt: Date.now() + cacheTTL * 1000,
  });

  return value;
}

// Usage
const dbCredentials = JSON.parse(await getSecret('prod/database'));
const connectionString = `postgresql://${dbCredentials.username}:${dbCredentials.password}@${dbCredentials.host}:5432/${dbCredentials.dbname}`;
```

### 1Password CLI

```bash
# Install and sign in
op signin

# Reference secrets in .env using 1Password references
# .env (committed)
DATABASE_URL=op://Development/Database/connection-string
STRIPE_SECRET_KEY=op://Development/Stripe/secret-key

# Run app with secrets injected
op run --env-file=.env -- npm run dev

# Get a single secret
op read "op://Development/Database/password"

# Create a secret reference in code
op inject < .env.template > .env.local
```

### SOPS (Secrets OPerationS) — Encrypted Files in Git

```bash
# Install and configure
brew install sops

# Create .sops.yaml configuration
cat > .sops.yaml << 'EOF'
creation_rules:
  - path_regex: secrets/.*\.yaml$
    age: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
EOF

# Encrypt a secrets file
sops --encrypt --in-place secrets/production.yaml

# Edit encrypted file (decrypts in editor, re-encrypts on save)
sops secrets/production.yaml

# Decrypt in CI/CD
sops --decrypt secrets/production.yaml > .env.production
```

```yaml
# secrets/production.yaml (encrypted in git)
database:
  url: ENC[AES256_GCM,data:xxxx,iv:xxxx,tag:xxxx]
  password: ENC[AES256_GCM,data:xxxx,iv:xxxx,tag:xxxx]
stripe:
  secret_key: ENC[AES256_GCM,data:xxxx,iv:xxxx,tag:xxxx]
sops:
  age:
    - recipient: age1ql3z7hjy54pw3hyww5ayyfg7zqgvc7w3j2elw8zmrj2kg5sfn9aqmcac8p
```

---

## 5. Config Per Environment

### Structured Config Module

```ts
// src/config/index.ts
import { env } from '../env';

export const config = {
  app: {
    name: 'my-app',
    port: env.PORT,
    env: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    isDevelopment: env.NODE_ENV === 'development',
  },
  database: {
    url: env.DATABASE_URL,
    pool: {
      min: env.NODE_ENV === 'production' ? 5 : 1,
      max: env.NODE_ENV === 'production' ? 20 : 5,
    },
    logging: env.NODE_ENV === 'development',
  },
  redis: {
    url: env.REDIS_URL,
    keyPrefix: `${env.NODE_ENV}:`,
  },
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    bcryptRounds: env.NODE_ENV === 'production' ? 12 : 4,
  },
  cors: {
    origin: env.NODE_ENV === 'production'
      ? ['https://myapp.com', 'https://www.myapp.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
  },
  logging: {
    level: env.LOG_LEVEL,
    format: env.NODE_ENV === 'production' ? 'json' : 'pretty',
  },
  email: {
    from: 'noreply@myapp.com',
    replyTo: 'support@myapp.com',
    sandbox: env.NODE_ENV !== 'production', // Don't send real emails in dev/staging
  },
} as const;
```

---

## 6. Docker / Container Environment Patterns

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '${PORT:-3000}:3000'
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    env_file:
      - .env
      - .env.local          # Overrides (git-ignored)
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ${DB_USER:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-postgres}
      POSTGRES_DB: ${DB_NAME:-myapp}
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD:-redis}

volumes:
  pgdata:
```

### Dockerfile Best Practices

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Don't bake secrets into image!
# ❌ COPY .env.production .
# ❌ ARG DATABASE_URL
# ❌ ENV STRIPE_SECRET_KEY=sk_live_xxx

# ✅ Accept only non-secret build args
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Build stage
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Secrets injected at RUNTIME, not build time
# docker run --env-file .env.production myapp
CMD ["node", "dist/index.js"]
```

### Kubernetes Secrets

```yaml
# k8s/secrets.yaml (apply with: kubectl apply -f -)
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: production
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@db:5432/myapp"
  JWT_SECRET: "super-secret-key-here"
  STRIPE_SECRET_KEY: "sk_live_xxx"

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      containers:
        - name: app
          image: myapp:latest
          envFrom:
            - secretRef:
                name: app-secrets
            - configMapRef:
                name: app-config
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: password
```

---

## 7. CI/CD Environment Injection

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production    # ← GitHub Environment with secrets
    steps:
      - uses: actions/checkout@v4

      - name: Build
        env:
          # Non-sensitive build vars
          NEXT_PUBLIC_API_URL: https://api.myapp.com
          NEXT_PUBLIC_ANALYTICS_ID: ${{ vars.ANALYTICS_ID }}   # GitHub Variables (non-secret)
        run: npm run build

      - name: Deploy
        env:
          # Secrets from GitHub Secrets
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          # Deploy script has access to secrets as env vars
          ./scripts/deploy.sh
```

### GitLab CI

```yaml
# .gitlab-ci.yml
deploy:
  stage: deploy
  environment:
    name: production
  variables:
    NODE_ENV: production
    NEXT_PUBLIC_API_URL: https://api.myapp.com
  script:
    # $DATABASE_URL and $JWT_SECRET set in GitLab CI/CD → Variables (masked)
    - npm run build
    - npm run deploy
  only:
    - main
```

### Vercel Environment Variables

```bash
# Set via Vercel CLI
vercel env add DATABASE_URL production    # Production only
vercel env add JWT_SECRET production
vercel env add NEXT_PUBLIC_API_URL production

# Or in vercel.json (non-sensitive only!)
# vercel.json
{
  "env": {
    "NEXT_PUBLIC_APP_NAME": "MyApp"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "https://api.myapp.com"
    }
  }
}
```

---

## 8. Never Commit Secrets Checklist

### Pre-Commit Hook with detect-secrets

```bash
# Install
pip install detect-secrets

# Initialize baseline
detect-secrets scan > .secrets.baseline

# Add pre-commit hook
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
        args: ['--baseline', '.secrets.baseline']
```

### git-secrets (AWS)

```bash
# Install
brew install git-secrets

# Register AWS patterns
git secrets --register-aws

# Add custom patterns
git secrets --add 'sk_live_[a-zA-Z0-9]+'    # Stripe live keys
git secrets --add 'whsec_[a-zA-Z0-9]+'      # Stripe webhook secrets

# Install hooks for this repo
git secrets --install

# Scan entire history
git secrets --scan-history
```

### Secret Patterns to Block

| Service | Pattern | Example |
|---------|---------|---------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | `AKIAIOSFODNN7EXAMPLE` |
| AWS Secret Key | `[0-9a-zA-Z/+=]{40}` | 40-char base64 string |
| Stripe Live Key | `sk_live_[a-zA-Z0-9]+` | `sk_live_51J...` |
| GitHub Token | `gh[ps]_[a-zA-Z0-9]{36}` | `ghp_xxxx...` |
| Google API Key | `AIza[0-9A-Za-z_-]{35}` | `AIzaSyA...` |
| JWT Secret | String > 32 chars in JWT context | — |
| Private Key | `-----BEGIN (RSA )?PRIVATE KEY-----` | PEM file content |
| Connection String | `(mysql\|postgresql\|mongodb)://.*:.*@` | `postgresql://user:pass@host` |

### Emergency: Secret Was Committed

```bash
# 1. Immediately rotate the compromised secret
# 2. Remove from git history
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch path/to/.env.local' \
  --prune-empty --tag-name-filter cat -- --all

# Or use BFG Repo-Cleaner (faster)
bfg --delete-files .env.local
bfg --replace-text replacements.txt  # Replace specific strings

# 3. Force push
git push origin --force --all
git push origin --force --tags

# 4. GitHub: Contact support to purge from caches
# 5. Add to .gitignore to prevent recurrence
```

---

## 9. Quick Reference Tables

### Environment Variable Naming Conventions

| Convention | Example | Framework |
|------------|---------|-----------|
| `NEXT_PUBLIC_*` | `NEXT_PUBLIC_API_URL` | Next.js (exposed to browser) |
| `VITE_*` | `VITE_API_URL` | Vite (exposed to browser) |
| `REACT_APP_*` | `REACT_APP_API_URL` | Create React App (exposed) |
| `NUXT_PUBLIC_*` | `NUXT_PUBLIC_API_URL` | Nuxt 3 (exposed to browser) |
| `EXPO_PUBLIC_*` | `EXPO_PUBLIC_API_URL` | Expo (exposed to client) |
| No prefix | `DATABASE_URL` | Server-side only (all frameworks) |

### Validation Library Comparison

| Library | Type Coercion | Custom Validators | Error Messages | Bundle Size |
|---------|--------------|-------------------|----------------|-------------|
| **Zod** | ✅ `z.coerce` | ✅ `.refine()` | ✅ Custom | ~13 kB |
| **envalid** | ✅ Built-in | ✅ `makeValidator` | ✅ Built-in | ~3 kB |
| **Joi** | ✅ | ✅ `.custom()` | ✅ | ~36 kB |
| **@t3-oss/env** | ✅ (via Zod) | ✅ (via Zod) | ✅ | ~2 kB + Zod |

### Security Checklist

- [ ] `.env.local` and `.env.*.local` are in `.gitignore`
- [ ] `.env.example` documents all required variables (no real values)
- [ ] Environment variables validated at application startup (fail fast)
- [ ] `NEXT_PUBLIC_` / `VITE_` prefix used only for truly public values
- [ ] Secrets stored in secrets manager (not env files) for production
- [ ] Pre-commit hook blocks secret patterns (detect-secrets or git-secrets)
- [ ] CI/CD secrets set via platform UI, not committed in workflow files
- [ ] Docker images don't contain baked-in secrets
- [ ] Secrets have rotation schedule (90 days recommended)
- [ ] Access to secrets is audited and follows least privilege
- [ ] No secrets in logs (redact in logging middleware)
- [ ] No secrets in error messages sent to clients
- [ ] `.env` files never served by web server (check static file serving config)
