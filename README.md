## My First Web Server "Chirpy"

This project is a small Node.js/TypeScript web server built with **Express**, **Postgres**, and **Drizzle ORM**. It exposes a simple API for:

- **Health and metrics** (readiness and Prometheus-style metrics)
- **User management** (sign‑up and profile update)
- **Authentication** (JWT access tokens + refresh tokens)
- **Chirp management** (create/retrieve/get/delete short messages)

The server also serves a static frontend from the `/app` path.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Web framework**: Express
- **Database**: PostgreSQL
- **ORM / Migrations**: Drizzle ORM + drizzle‑kit
- **Auth**: JSON Web Tokens (JWT) + refresh tokens

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- PostgreSQL instance you can connect to

### Install dependencies

```bash
npm install
```

### Environment variables

The server is configured via environment variables (see `src/config.ts`). Create a `.env` file in the project root (or otherwise set these in your environment):

```bash
PORT=3000               # Port where the HTTP server will listen
PLATFORM=local          # Arbitrary identifier for the deployment platform
JWT_SECRET=replace_me   # Secret key used to sign JWTs
POLKA_KEY=replace_me    # API key expected by the Polka webhook
DB_URL=postgres://user:password@localhost:5432/my_first_web_server
```

All of these variables are **required**; the server will throw on startup if any are missing.

### Database migrations

This project uses Drizzle migrations stored under `src/db/migrations`.

1. (Optional) Generate migrations from the schema:

   ```bash
   npm run generate
   ```

2. Apply migrations:

   ```bash
   npm run migrate
   ```

On startup, `src/index.ts` also runs migrations using the configured `MigrationConfig`.

### Running the server

#### Development

Compile TypeScript and start the server:

```bash
npm run dev
```

This runs `tsc` and then starts `node dist/index.js`.

#### Production

Build once, then start:

```bash
npm run build
npm start
```

The server will log a message like:

```text
Server is running at http://localhost:<PORT>
```

---

## Available Scripts

- **`npm test`**: Run the test suite via `vitest --run`.
- **`npm run build`**: Compile TypeScript to JavaScript in the `dist` folder.
- **`npm start`**: Run the compiled server from `dist/index.js`.
- **`npm run dev`**: Compile TypeScript and start the server in one step.
- **`npm run generate`**: Generate Drizzle migrations.
- **`npm run migrate`**: Apply Drizzle migrations.

---

## API Overview

Base URL (local): `http://localhost:<PORT>`

### Health & Admin

- **GET** `/api/healthz`  
  Returns plain text `"OK"`. Used for readiness / health checks.

- **GET** `/admin/metrics`  
  Returns metrics (e.g., for Prometheus scraping).

- **POST** `/admin/reset`  
  Resets server state (implementation‑specific; useful in tests).

### Authentication

- **POST** `/api/login`  
  Body:

  ```json
  {
    "email": "user@example.com",
    "password": "plain-text-password"
  }
  ```

  Response (200):

  ```json
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "token": "jwt-access-token",
    "refreshToken": "refresh-token-string",
    "isChirpyRed": false
  }
  ```

- **POST** `/api/refresh`  
  Uses a refresh token passed as a Bearer token in the `Authorization` header:

  ```http
  Authorization: Bearer <refresh-token>
  ```

  Response (200):

  ```json
  {
    "token": "new-jwt-access-token"
  }
  ```

- **POST** `/api/revoke`  
  Revokes the refresh token passed as a Bearer token:
  ```http
  Authorization: Bearer <refresh-token>
  ```
  Response: `204 No Content`.

### Users

- **POST** `/api/users` – create a user  
  Body:

  ```json
  {
    "email": "user@example.com",
    "password": "plain-text-password"
  }
  ```

  Response (201):

  ```json
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "isChirpyRed": false
  }
  ```

- **PUT** `/api/users` – update the authenticated user  
  Requires a valid JWT access token in the `Authorization` header:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
  Body:
  ```json
  {
    "email": "new-email@example.com",
    "password": "new-plain-text-password"
  }
  ```
  Response (200): same shape as the `POST /api/users` response.

### Chirps

All chirp‑writing operations require a valid JWT access token in the `Authorization` header.

- **POST** `/api/chirps` – create a chirp  
  Headers:

  ```http
  Authorization: Bearer <jwt-access-token>
  ```

  Body:

  ```json
  {
    "body": "Hello from my first web server!"
  }
  ```

  The server:
  - Enforces a max length of 140 characters.
  - Replaces certain “bad words” (`kerfuffle`, `sharbert`, `fornax`) with `"****"`.

  Response (201): created chirp.

- **GET** `/api/chirps` – list chirps  
  Query parameters:
  - `authorId` (optional): filter chirps by author.
  - `sort` (optional): `"asc"` (default) or `"desc"` by creation time.

  Response (200): array of chirps.

- **GET** `/api/chirps/:chirpId` – get a single chirp  
  Response (200): chirp object, or `404` if not found.

- **DELETE** `/api/chirps/:chirpId` – delete a chirp  
  Requires a valid JWT access token belonging to the chirp’s author:
  ```http
  Authorization: Bearer <jwt-access-token>
  ```
  Response: `204 No Content` on success, `403` if the user does not own the chirp.

### Webhooks

- **POST** `/api/polka/webhooks`  
  Endpoint for handling incoming webhooks from a (mock) “Polka” payments service.  
  The exact payload and behavior are defined in `src/api/webhooks.ts` and the `POLKA_KEY` environment variable.

---

## Static Frontend

Static assets under `src/app` are served at:

```text
GET /app/*
```

This is wired via:

```ts
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
```

You can place a simple frontend there that consumes the API.

---

## Testing

To run the test suite:

```bash
npm test
```

Tests are powered by `vitest` and live alongside the source files.

---

## License

This project is licensed under the ISC License.
