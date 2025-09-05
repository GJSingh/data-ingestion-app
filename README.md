# Data Ingestion API (PostgreSQL + Docker)

Node.js/Express API that ingests JSON files into PostgreSQL and serves the data via REST endpoints.

## Features

- PostgreSQL-backed storage (JSONB)
- Auto table creation and initial data load on first run
- CORS + Helmet enabled
- Dockerfile + docker-compose for local stack
- Health check and simple search endpoint

## Environment Variables (.env)

Create a UTF-8 encoded `.env` (no BOM) in the project root:

```
DB_HOST=postgres            # use 'postgres' inside docker compose; 'localhost' if app runs locally
DB_PORT=5432               # 5432 in compose; host port (e.g., 5433) if running only DB in a container
DB_NAME=data_ingest_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=*
```

Tip (Windows): if you see an error like unexpected character "" in `.env`, recreate the file in UTF-8 without BOM.

## Quick Start (Docker Desktop)

Requires Docker Desktop running.

1. Build and start services

```
docker compose up -d --build
```

This starts:

- `postgres` on 5432
- `app` on http://localhost:3000

2. Verify

- API health: http://localhost:3000/health
- Data: http://localhost:3000/amd_final, `/data_final`, `/ru_final`
- Search: `GET /search/:table/:term` (tables: `amd_final`, `data_final`, `ru_final`)

3. Logs

```
docker logs data_ingest_postgres
docker logs data_ingest_app
```

4. Stop

```
docker compose down
```

## Alternative: App locally, Postgres in Docker

If port 5432 is in use, map DB to 5433:

```
docker run -d --name postgres-db \
  -e POSTGRES_DB=data_ingest_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 postgres:15
```

Then set in `.env`:

```
DB_HOST=localhost
DB_PORT=5433
```

Start the app:

```
npm install
npm start
```

## Database Schema

Tables created automatically on startup:

- `amd_final (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`
- `data_final (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`
- `ru_final (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`

Indexes on `created_at` for each table.

## Using psql

With Docker Compose:

```
docker exec -it data_ingest_postgres psql -U postgres -d data_ingest_db
```

Commands inside psql:

```
\dt
SELECT COUNT(*) FROM amd_final;
SELECT COUNT(*) FROM data_final;
SELECT COUNT(*) FROM ru_final;
SELECT id, created_at, data FROM amd_final LIMIT 5;
```

## API

- `GET /health` – status + record counts
- `GET /amd_final` – all rows
- `GET /data_final` – all rows
- `GET /ru_final` – all rows
- `GET /search/:table/:term` – ILIKE against JSON text

Response shape

```
{
  "success": true,
  "count": 123,
  "data": [
    {
      "id": 1,
      "data": { /* original JSON */ },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

- Port 3000 in use:
  - `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
- Port 5432 in use:
  - Change compose mapping to `"5433:5432"` and set `DB_PORT=5433` when app runs outside compose
- Docker Desktop pipe “Access is denied”:
  - Run as Administrator, ensure `com.docker.service` is running, enable WSL2 backend, try Troubleshoot → Reset to factory defaults
- `.env` encoding error:
  - Recreate `.env` as UTF-8 (without BOM)

## Development

```
npm install
npm run dev
npm test
```

## License

MIT
