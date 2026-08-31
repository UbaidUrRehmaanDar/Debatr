# Deployment

## Architecture

```
Cloudflare Pages (SvelteKit) ──proxy /api/*──> Koyeb (Fastify API)
       ↕                                            ↕
  Cloudflare CDN                             Neon PostgreSQL
                                            OpenCode Zen (AI)
                                            Resend (Email)
```

- **Frontend**: SvelteKit on Cloudflare Pages (global CDN, free tier)
- **Backend**: Fastify API on Koyeb (always-on Node service, free tier)
- **Database**: Neon PostgreSQL (free tier, production branch)

## Prerequisites

- GitHub repository with the Debatr code pushed
- [Cloudflare](https://dash.cloudflare.com) account
- [Koyeb](https://app.koyeb.com) account
- [Neon](https://console.neon.tech) project with a production branch
- [Resend](https://resend.com) API key with a verified domain
- [OpenCode Zen](https://opencode.ai) API key

---

## 1. Code changes required

### 1.1 Switch SvelteKit adapter to Cloudflare

**Install the Cloudflare adapter:**

```bash
cd apps/web
pnpm add -D @sveltejs/adapter-cloudflare
```

**Update `apps/web/svelte.config.js`:**

```js
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      '$lib': 'src/lib',
    },
    csp: {
      mode: 'nonce',
      directives: {
        'default-src': ['self'],
        'script-src': ['self'],
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'blob:'],
        'font-src': ['self'],
        'connect-src': ['self'],
        'frame-ancestors': ['none'],
        'base-uri': ['self'],
        'form-action': ['self'],
      },
    },
  },
};

export default config;
```

### 1.2 Add Cloudflare type declarations

**Create `apps/web/src/app.d.ts`:**

```ts
declare global {
  namespace App {
    interface Platform {
      env: {
        // Cloudflare Pages bindings go here
      };
      context: {
        waitUntil(promise: Promise<unknown>): void;
      };
      cf: CfProperties;
    }
  }
}

export {};
```

### 1.3 Add API proxy rules

**Create `apps/web/_routes.json`** to proxy `/api` requests from Cloudflare Pages to Koyeb:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [],
  "rules": [
    {
      "paths": ["/api/*"],
      "headers": {
        "X-API-Proxy": "true"
      }
    }
  ]
}
```

The actual proxy is configured in the Cloudflare Pages dashboard (see 3.3).

---

## 2. Backend — Koyeb

### 2.1 Create a Koyeb service

1. Go to [Koyeb](https://app.koyeb.com) → **Create App**
2. Choose **GitHub** as the deployment method
3. Select your Debatr repository and branch
4. Configure the service:

| Setting | Value |
|---|---|
| **Builder** | Buildpack |
| **Build command** | `pnpm install && pnpm --filter @debatr/api build` |
| **Run command** | `cd apps/api && node dist/index.js` |
| **Port** | `3000` |
| **Health check** | `/api/health` |

### 2.2 Set environment variables

Add every variable from `.env` with production values:

| Variable | Production value |
|---|---|
| `NODE_ENV` | `production` |
| `WEB_ORIGIN` | Your Cloudflare Pages URL (e.g. `https://debatr.pages.dev`) |
| `API_ORIGIN` | Your Koyeb service URL (e.g. `https://debatr-xxx.koyeb.app`) |
| `DATABASE_URL` | Neon **production** branch pooled URL |
| `BETTER_AUTH_SECRET` | `openssl rand -hex 32` output (new, not the dev one) |
| `BETTER_AUTH_URL` | Same as `API_ORIGIN` |
| `OPENCODE_API_KEY` | Your OpenCode Zen key |
| `OPENCODE_BASE_URL` | `https://opencode.ai/zen/v1` |
| `AI_LAWYER_MODEL` | `deepseek-v4-flash-free` |
| `AI_JUDGE_MODEL` | `deepseek-v4-flash-free` |
| `AI_FACT_CHECKER_MODEL` | `deepseek-v4-flash-free` |
| `RESEND_API_KEY` | Your Resend API key |
| `EMAIL_FROM` | Your verified Resend sender |
| `AI_MAX_TOKENS_PER_REQUEST` | `8192` |
| `AI_MAX_TOKENS_PER_DEBATE` | `50000` |
| `AI_REQUEST_TIMEOUT_MS` | `60000` |
| `AI_MAX_RETRIES` | `3` |
| `DEBATE_DEFAULT_ROUNDS` | `4` |
| `DEBATE_DEFAULT_TURN_MINUTES` | `5` |
| `DEBATE_DEFAULT_MAX_CHARACTERS` | `2000` |

### 2.3 Apply database migrations

After the service deploys, run migrations against the production database:

```bash
# From your local machine, with DATABASE_URL pointing at the production Neon branch:
pnpm --filter @debatr/api exec tsx src/db/migrate.ts
```

Or use Koyeb's **Console** feature to run the command on the deployed instance.

### 2.4 Bootstrap an admin account

```bash
curl -X POST https://your-koyeb-service/api/admin/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"secure-password","name":"Admin"}'
```

---

## 3. Frontend — Cloudflare Pages

### 3.1 Connect the repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click **Create** → **Pages** → **Connect to Git**
3. Select your Debatr repository
4. Configure the build:

| Setting | Value |
|---|---|
| **Framework preset** | SvelteKit (or None) |
| **Build command** | `pnpm install && pnpm --filter @debatr/web build` |
| **Build output directory** | `apps/web/build` |
| **Root directory** | (leave blank — root of repo) |

### 3.2 Set environment variables (Cloudflare Pages)

| Variable | Value |
|---|---|
| `WEB_ORIGIN` | Same as your Pages URL (e.g. `https://debatr.pages.dev`) |
| `API_ORIGIN` | Your Koyeb service URL |

These are build-time vars used by SvelteKit. All server-side secrets stay on Koyeb.

### 3.3 Configure API proxy

In Cloudflare Pages dashboard:

1. Go to your project → **Settings** → **Functions**
2. Add a **Proxy** rule: all requests to `/api/*` forward to your Koyeb URL
3. Or add a `_redirects` file in the build output:

```
/api/*  https://your-koyeb-service.koyeb.app/api/:splat  200
```

### 3.4 Custom domain (optional)

1. In Cloudflare Pages → your project → **Custom domains**
2. Add your domain (e.g. `debatr.yourdomain.com`)
3. Cloudflare handles DNS + SSL automatically

---

## 4. Verification checklist

After deployment, verify each flow:

1. **Health**: `GET https://your-koyeb-service/api/health` returns `ok`
2. **Sign-up**: Create an account at the Cloudflare URL
3. **Auth**: Sign in, sign out, check the session persists across page reloads
4. **Create debate**: Create a debate, copy the invite link
5. **Join debate**: Sign in as another user, join via the link
6. **Take turns**: Send messages, watch the turn advance, verify realtime updates
7. **Lawyer**: Open the Lawyer panel on a debate you're in
8. **Judge**: Complete a debate, run the Judge, view the report
9. **Export**: Download the JSON export and re-import it
10. **Email**: Trigger a password reset and check the email arrives
11. **WebSocket**: Open two browser windows — changes reflect in realtime

---

## 5. Production considerations

- **Neon**: Use separate branches for dev and prod. Enable point-in-time restore.
- **Secrets**: Rotate `BETTER_AUTH_SECRET`, `OPENCODE_API_KEY`, and `RESEND_API_KEY` if ever exposed.
- **Migrations**: Always review and test migrations against a staging DB before applying to production.
- **Monitoring**: Koyeb provides logs and metrics. Add Sentry or similar for error tracking if needed.
- **Backups**: Neon handles automated backups. Test a restore procedure before storing real debate data.

---

## 6. Local dev vs production

| Aspect | Local | Production |
|---|---|---|
| Frontend URL | `http://localhost:5173` | `https://debatr.pages.dev` |
| API URL | `http://localhost:3000` | `https://debatr-xxx.koyeb.app` |
| Database | Neon dev branch | Neon production branch |
| AI provider | OpenCode Zen | OpenCode Zen |
| Email | Resend sandbox | Resend verified domain |
| Adapter | `adapter-node` | `adapter-cloudflare` |
