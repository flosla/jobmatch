# JobMatch

A demo job-search platform that matches a candidate's CV against job postings and
surfaces the top 10 matches for the day. Built end-to-end in TypeScript (React +
TanStack Start on the frontend, a typed Node API behind it) with a Python data
pipeline for CV parsing and matching, seeded with one representative user —
**John Doe**, an AI Engineer.

This repo is a **static, self-contained demo**: no live job-board scraping, no
database, no real LLM calls. Everything runs locally against one deterministically
generated, seeded dataset. Sections further down describe the production
architecture this demo is a scaled-down stand-in for.

## Quick start

Prerequisites: Node 22+, Python 3.10+, npm.

```bash
npm install                 # installs all workspaces
npm run pipelines:seed      # generates pipelines/output/{profile,jobs,matches}.json
npm run dev                 # starts the API (:4000) and the web app (:3000)
```

Open **http://localhost:3000**. `npm run dev` builds `packages/shared` first
(via the `predev` hook) so both apps can resolve `@jobmatch/shared`.

If you see "Seed data not found" when the API starts, you skipped the seed
step above — run `npm run pipelines:seed` and restart `npm run dev`.

Other useful commands, run from the repo root:

```bash
npm run typecheck           # tsc across shared + api, then web
npm run build                # builds shared, then api, then web
npm run lint                  # oxlint across the whole repo
npm run pipelines:test       # python unittest sanity checks on the scoring pipeline
npm test -w apps/api          # Fastify route smoke tests (node:test)
```

## Monorepo layout

```
jobmatch/
  apps/
    web/            TanStack Start frontend (React, SSR, file-based routing)
    api/             Fastify + Zod typed HTTP API
  packages/
    shared/         @jobmatch/shared -- Zod schemas + inferred TS types, the
                     single source of truth for the web <-> api contract
  pipelines/
    generate_demo_data.py   entrypoint: parse CV -> score jobs -> rank -> rationale -> JSON
    data/            John Doe's raw CV text + ~20 demo job postings
    matching/         deterministic CV parsing, scoring, and rationale templating
    output/           generated JSON consumed by apps/api (gitignored)
    tests/            unittest sanity checks
```

Package manager: **npm workspaces** (`apps/*`, `packages/*`).

## Demo architecture

```
 pipelines/generate_demo_data.py
   |  parse_cv.py --------- deterministic CV -> structured profile
   |  scoring.py ----------- deterministic weighted match score per job
   |  rationale.py --------- MOCK LLM step: templated "why this match" text
   v
 pipelines/output/{profile,jobs,matches}.json
   v
 apps/api  (Fastify, :4000)
   |  seedStore.ts --------- loads the JSON above into memory at boot
   |  routes/*.ts ---------- GET/PUT /api/profile, GET /api/matches[/:jobId],
   |                          GET /api/jobs/:id, POST /api/cv/parse-preview,
   |                          POST /api/matches/:jobId/rationale/regenerate
   |  llm/azureFoundryClient.ts -- MOCK Azure AI Foundry client (see below)
   v
 apps/web  (TanStack Start, :3000)
   |  route loaders call apps/api over HTTP via lib/apiClient.ts
   |  responses are validated against the same Zod schemas apps/api
   |  used to validate them (packages/shared) -- the contract is enforced
   |  by literally sharing the schema objects, not by hand-synced types
   v
 Browser: /profile, /matches, /matches/:jobId
```

## Data flow walkthrough

1. `pipelines/data/cv_raw.py` holds John Doe's CV as plain, section-delimited
   text (`EDUCATION:`, `EXPERIENCE:`, `SKILLS:`, ...) -- standing in for
   whatever a real PDF/DOCX text-extraction step would hand off.
2. `pipelines/matching/parse_cv.py` deterministically parses that text into
   structured fields (name, contact info, education, experience, skills) via
   section splitting and regexes. No LLM involved -- extracting clearly
   delimited fields is a textbook deterministic-parsing task.
3. `pipelines/matching/scoring.py` scores each of the ~20 demo job postings
   against the parsed profile: a weighted blend of skill overlap (50%),
   title similarity (20%), seniority fit (15%), and years-of-experience fit
   (15%). Fully deterministic, no LLM.
4. `pipelines/matching/rationale.py` generates a templated, human-readable
   "why this match" sentence for each of the top 10 -- this is the one step
   that is conceptually an LLM's job (turning a score into prose) but is
   implemented as a **mock**, so the pipeline has zero network dependency.
5. `generate_demo_data.py` ranks, takes the top 10, and writes
   `pipelines/output/{profile,jobs,matches}.json`.
6. `apps/api`'s `seedStore.ts` loads those files into memory once at boot and
   serves them over a typed REST API.
7. `apps/web` fetches from that API in TanStack Router route loaders and
   renders the profile, match-list, and job-detail pages.

## Mocked Azure AI Foundry integration

The brief calls for LLMs "hosted in Azure AI Foundry" used "for reasoning
where needed." In this demo, **that reasoning step is fully mocked**: no
network calls to Azure happen anywhere in the code that runs, and no Azure
credentials are required.

Two mock implementations exist, deliberately kept separate:

- **`pipelines/matching/rationale.py`** -- generates the rationale baked into
  `matches.json` during the batch pipeline run.
- **`apps/api/src/llm/azureFoundryClient.ts`** -- a Node-side `LlmClient`
  interface (`generateMatchRationale`, `extractCvFields`) with a
  `mockAzureFoundryClient` implementation, exercised live via
  `POST /api/matches/:jobId/rationale/regenerate` (wired to the "Regenerate"
  button on the job detail page) and by `POST /api/cv/parse-preview`.

The real integration point is documented directly in
`azureFoundryClient.ts` and would read:

| Env var | Purpose |
|---|---|
| `AZURE_AI_FOUNDRY_ENDPOINT` | Foundry project/resource endpoint |
| `AZURE_AI_FOUNDRY_API_KEY` | key, or use `DefaultAzureCredential` / managed identity instead |
| `AZURE_AI_FOUNDRY_DEPLOYMENT_NAME` | the deployed model (e.g. a GPT deployment) |
| `AZURE_AI_FOUNDRY_API_VERSION` | API version |
| `USE_REAL_AZURE_LLM` | defaults to `false`; a real client would only be constructed when `true` |

See `apps/api/.env.example` for the full list. **The exported `llmClient` in
this repo is always the mock** -- flipping `USE_REAL_AZURE_LLM` today does
nothing, by design, until that real client is implemented.

## Telegram daily summary

Unlike the Azure AI Foundry integration above, **this one is real, not
mocked**. A "Send today's summary" button on the matches page (below the
title/filters, above the list) sends the *currently displayed* matches --
respecting whatever filters are active -- to a Telegram chat via the real
Telegram Bot API (`apps/api/src/notifications/telegramClient.ts`).

It's inert until you configure two env vars in `apps/api/.env`:

| Env var | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | your bot's token from @BotFather |
| `TELEGRAM_CHAT_ID` | the numeric chat id to send messages to |

**Setup:**
1. Message [@BotFather](https://t.me/BotFather) on Telegram, send `/newbot`,
   and follow the prompts. It gives you a token like `123456:ABC-...`.
2. Open a chat with your new bot and send it any message (e.g. `/start`) --
   Telegram only lets a bot message users who have messaged it first.
3. Find your numeric chat id: message [@userinfobot](https://t.me/userinfobot)
   (it replies with your id), or call
   `https://api.telegram.org/bot<TOKEN>/getUpdates` after step 2 and read
   `result[0].message.chat.id` from the response.
4. Copy `apps/api/.env.example` to `apps/api/.env` and fill in both values,
   then restart `npm run dev -w apps/api` (env vars are read at request time,
   so a restart isn't strictly required, but `tsx watch` picks up `.env`
   changes on its own restart anyway if you're loading it via your shell).

Until configured, clicking the button surfaces a clear "Telegram is not
configured on the server" error in the UI instead of failing silently.

## Production target architecture

The sections below describe how this would look as a real, always-on
product -- not what's running in this demo.

**Ingestion.** Scheduled jobs (Azure Functions timer triggers or Container
Apps Jobs) pull postings from job-board APIs / ATS integrations / scraping,
landing raw documents in Azure Blob Storage (a "raw" zone), then normalize
and dedupe (by content hash) into Azure Database for PostgreSQL.

**CV upload & parsing.** A user uploads a PDF/DOCX to Blob Storage (private
container, encrypted, short-lived SAS URL for the upload). A Blob-triggered
Event Grid function extracts text, then an **Azure AI Foundry-hosted LLM
deployment** parses it into structured fields (this is where the demo's
`parse_cv.py`/`parseCv.ts` would be replaced by a real model call, since
real-world CVs are far less structured than the demo's clean section
headers). Extracted fields are minimized/pseudonymized before being written
to Postgres.

**Embeddings & matching.** A nightly batch job (Container Apps Jobs or Azure
Batch, fanned out via Durable Functions) computes embeddings for postings and
profiles via a Foundry embedding deployment, stored in `pgvector` (or Azure
AI Search if hybrid keyword+vector search is needed at scale). A hybrid
ranker combines vector similarity with the deterministic features this demo
already computes (skill overlap, seniority fit, etc.) -- deterministic
signals stay deterministic; the LLM layer adds semantic matching on top,
rather than replacing it.

**Rationale generation.** A Foundry chat-completion deployment generates the
per-match rationale with a constrained prompt (profile summary + job summary
+ score breakdown), cached per match rather than regenerated on every view.

**Serving.** `apps/api`'s Fastify service, containerized, running on
Container Apps behind Azure API Management and Azure Front Door (WAF, TLS
termination, rate limiting). `apps/web`'s TanStack Start SSR app runs the
same way, or as an Azure Static Web App if edge rendering suffices.

**Orchestration.** Container Apps Jobs / Functions Timer Triggers decouple
the ingestion -> parsing -> embedding -> matching stages via Azure Service
Bus queues, so a slow or failing stage doesn't block the others.

**Storage.**

| Concern | Service |
|---|---|
| Raw CVs & postings | Azure Blob Storage |
| Structured data + vectors | Azure Database for PostgreSQL Flexible Server + `pgvector` |
| Hot "today's matches" cache | Azure Cache for Redis |
| Inter-stage queues | Azure Service Bus |
| Secrets | Azure Key Vault |
| Observability | Application Insights |

## Security & PII protection

- **Encryption.** At rest via Azure Storage Service Encryption (optionally
  customer-managed keys via Key Vault); in transit via TLS everywhere, with
  private endpoints / VNet integration between services so traffic never
  traverses the public internet.
- **PII minimization.** Identifying fields (name, email, phone) are stored
  separately from the features used for matching (skills, embeddings,
  seniority); logs and telemetry use pseudonymized profile IDs, never raw PII.
- **Access control.** Azure AD-backed RBAC, least-privilege managed
  identities per service (the matching batch job's identity can read Blob +
  write Postgres, but has no reason to hold a Key Vault secret the API uses,
  and vice versa).
- **Retention & deletion.** A defined retention window for raw CVs, with a
  GDPR right-to-erasure flow that cascades a deletion request across Blob,
  Postgres, the vector index, and the Redis cache -- with an audit trail of
  what was deleted and when.
- **Secrets management.** Exclusively via Key Vault + managed identity; no
  secrets in code, config files, or environment variables in production
  (the `.env.example` files in this repo are for local demo use only).
- **Network isolation.** VNet-integrated services, private endpoints for
  Postgres/Blob/Key Vault, WAF on Front Door, no public inbound access to
  data stores.
- **Audit & compliance.** PII-redacted structured logging, an audit trail for
  data access and deletion events, and attention to data residency and any
  DPAs required for third-party job-posting data sources.

## What this repo actually runs today vs. the target

| Concern | This demo | Production target |
|---|---|---|
| Job ingestion | ~20 hardcoded fictional postings | Scheduled scraping/ATS APIs -> Blob -> Postgres |
| CV upload | Pre-seeded `.txt`; re-upload flow parses & previews but doesn't persist a new file | Blob upload -> Event Grid -> Foundry-based parsing |
| CV/rationale "reasoning" | Deterministic parsing + templated rationale (mocked LLM) | Real Azure AI Foundry model deployments |
| Matching | Keyword/heuristic scoring only | Heuristics + embeddings (`pgvector`/Azure AI Search) |
| Batch schedule | One manual script run (`npm run pipelines:seed`) | Nightly scheduled batch via Functions/Container Apps Jobs |
| Storage | Local JSON files, in-memory API state | Postgres, Blob, Redis, Service Bus |
| Auth | None (single demo user) | Azure AD, per-user data isolation |
| Hosting | Local dev servers | Container Apps / Static Web Apps behind Front Door + APIM |

## Known limitations

- The API loads seed data once at boot; re-running `npm run pipelines:seed`
  requires restarting `npm run dev -w apps/api` to pick up the new data.
- Profile edits (including "apply extracted CV fields") are in-memory only
  and reset on API restart -- there is no persistence layer in this demo.
- The job detail page is a real route (`/matches/$jobId`), not a
  modal/overlay, favoring SSR correctness and shareable URLs over a modal UI.
