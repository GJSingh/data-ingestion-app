# Data Ingestion API (PostgreSQL + Docker) - Consolidated Schema

Node.js/Express API that ingests consolidated JSON files into PostgreSQL and serves the data via REST endpoints.

## Features

- PostgreSQL-backed storage (JSONB) with consolidated schema
- Auto table creation and initial data load on first run
- CORS + Helmet enabled
- Dockerfile + docker-compose for local stack
- Health check and simple search endpoint
- Consolidated data structure with time-series data

## Database Schema

Tables created automatically on startup:

- `consolidated_charge (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`
- `consolidated_rate (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`
- `consolidated_volume (id SERIAL, data JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)`

Indexes on `created_at` for each table.

## Data Structure

### Consolidated files (new input format)

The consolidated JSON files now have raw keys like:

- "('amd_num','','','')"
- "('amd_start_date', '', '', '')"
- "('ru','','','')"
- "('ru_status', '', '', '')"
- "(4, 40, 2025, 'January')" for monthly values

On ingestion, the app normalizes each record to a clean structure:

```json
{
  "amd_num": 125.1,
  "amd_start_date": "2025-01-01T00:00:00.000",
  "ru": "Migrant Images (Credit)",
  "ru_status": "Existing",
  "monthly": {
    "2025-01": 0.0,
    "2025-02": 0.0,
    "2025-03": 0.0
  }
}
```

Notes:

- Month names in tuple keys are mapped to `YYYY-MM` in `monthly`.
- Unknown keys are ignored.

## Environment Variables (.env)

Create a UTF-8 encoded `.env` (no BOM) in the project root. Choose ONE of the setups:

Compose (run both app and DB with docker compose):

```
DB_HOST=postgres
DB_PORT=5432
DB_NAME=data_ingest_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=*
```

Local app + DB in container on host port 5433:

```
DB_HOST=localhost
DB_PORT=5433
DB_NAME=data_ingest_db
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development
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
- Consolidated data: http://localhost:3000/consolidated_charge, `/consolidated_rate`, `/consolidated_volume`
- Ingestion/annual data: http://localhost:3000/ingestion_volume, `/ingestion_charge`, `/ingestion_rate`, `/annual_charge`
- Index endpoints: `/index_consolidated_rus`, `/index_consolidated_amd`, `/index_ingestion_amd`, `/index_ingestion_rus`
- Search: `GET /search/:table/:term` (tables: `consolidated_charge`, `consolidated_rate`, `consolidated_volume`, `ingestion_volume`, `ingestion_charge`, `ingestion_rate`, `annual_charge`)

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
SELECT COUNT(*) FROM consolidated_charge;
SELECT COUNT(*) FROM consolidated_rate;
SELECT COUNT(*) FROM consolidated_volume;
SELECT COUNT(*) FROM ingestion_volume;
SELECT COUNT(*) FROM ingestion_charge;
SELECT COUNT(*) FROM ingestion_rate;
SELECT COUNT(*) FROM annual_charge;
SELECT id, created_at, data FROM ingestion_volume LIMIT 5;
```

## API

- `GET /health` – status + record counts
- `GET /consolidated_charge` – consolidated charge (supports filters)
- `GET /consolidated_rate` – consolidated rate (supports filters)
- `GET /consolidated_volume` – consolidated volume (supports filters)
- `GET /ingestion_volume` – ingestion volume (supports filters)
- `GET /ingestion_charge` – ingestion charge (supports filters)
- `GET /ingestion_rate` – ingestion rate (supports filters)
- `GET /annual_charge` – annual charge (supports filters)
- `GET /index_consolidated_rus` – consolidated RUS index (supports filters)
- `GET /index_consolidated_amd` – consolidated AMD index (supports filters)
- `GET /index_ingestion_amd` – ingestion AMD index (supports filters)
- `GET /index_ingestion_rus` – ingestion RUS index (supports filters)
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

### Filtering

All list endpoints accept these optional query parameters:

- `amd_num` (partial match)
- `ru` (partial match)
- `ru_status` (partial match)
- `created_from`, `created_to` (ISO date)
- `updated_from`, `updated_to` (ISO date)
- `limit` (default 100, max 1000)
- `offset` (default 0)
- `order_by` (`created_at` or `updated_at`, default `created_at`)
- `order_dir` (`ASC` or `DESC`, default `DESC`)

Examples:

```
GET /ingestion_volume?ru=network&ru_status=Existing&limit=50
GET /annual_charge?amd_num=125.1&created_from=2025-01-01T00:00:00.000Z
GET /consolidated_rate?order_by=updated_at&order_dir=ASC&offset=100
GET /index_consolidated_rus?amd_num=131.1
GET /index_consolidated_amd?ru=network
GET /index_ingestion_amd?ru_status=Existing&limit=50
GET /index_ingestion_rus?amd_num=200.5&order_by=created_at
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
- Compose warning about `version` key:
  - Safe to remove the `version` line from `docker-compose.yml` on recent Docker Compose

## Development

```
npm install
npm run dev
npm test
```

## License

MIT
