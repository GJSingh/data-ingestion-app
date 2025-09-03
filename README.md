# Data Ingest API

A Node.js/Express application that ingests JSON data files and serves them via REST API endpoints.

## Features

- 🚀 Fast Express.js server
- 📊 Three data endpoints for different JSON files
- 🔒 Security middleware (Helmet, CORS)
- 🐳 Containerized with Podman/Docker
- 💚 Health check endpoint
- 📝 Comprehensive error handling

## API Endpoints

| Endpoint      | Description                             | Method |
| ------------- | --------------------------------------- | ------ |
| `/`           | API information and available endpoints | GET    |
| `/health`     | Health check endpoint                   | GET    |
| `/amd_final`  | AMD Final data from `amd_final.json`    | GET    |
| `/data_final` | Data Final from `data_final.json`       | GET    |
| `/ru_final`   | RU Final data from `ru_final.json`      | GET    |

## Data Structure

### AMD Final Data

```json
{
  "amd_num": 100,
  "amd_desc": "ABC Services",
  "last_sign_date": "2024-01-15",
  "amd_effec_date": "2024-01-25",
  "amd_start_date": "2024-01-30",
  "svc_exp_date": "2027-01-15"
}
```

### Data Final

```json
{
  "amd_num": 100,
  "amd_start_date": "2024-01-30",
  "svc_exp_date": "2027-01-15",
  "ru": "This is a ru1",
  "month": "2025-01-01",
  "rate": 1245,
  "volume": 1.0,
  "monthly_charge": "1245"
}
```

## Quick Start

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start the server:**

   ```bash
   npm start
   ```

3. **Development mode (with auto-reload):**

   ```bash
   npm run dev
   ```

4. **Access the API:**
   - Main API: http://localhost:3000
   - Health check: http://localhost:3000/health
   - AMD Final: http://localhost:3000/amd_final
   - Data Final: http://localhost:3000/data_final
   - RU Final: http://localhost:3000/ru_final

### Containerized Deployment

#### Using Podman

1. **Build the container:**

   ```bash
   podman build -t data-ingest-app .
   ```

2. **Run the container:**

   ```bash
   podman run -d --name data-ingest-api -p 3000:3000 data-ingest-app
   ```

3. **Check container status:**
   ```bash
   podman ps
   podman logs data-ingest-api
   ```

#### Using Docker

1. **Build the container:**

   ```bash
   docker build -t data-ingest-app .
   ```

2. **Run the container:**
   ```bash
   docker run -d --name data-ingest-api -p 3000:3000 data-ingest-app
   ```

## Environment Variables

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `PORT`   | `3000`  | Server port |

## Project Structure

```
my-data-ingest-app/
├── input_file/
│   ├── amd_final.json
│   ├── data_final.json
│   └── ru_final.json
├── server.js          # Main Express server
├── package.json       # Dependencies and scripts
├── Dockerfile         # Container configuration
├── .dockerignore      # Docker ignore file
└── README.md          # This file
```

## API Response Format

All endpoints return JSON responses with the following structure:

```json
{
  "success": true,
  "count": 2,
  "data": [...],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

The API includes comprehensive error handling:

- **404**: Endpoint not found
- **500**: Internal server error
- **Graceful degradation**: Returns empty arrays if JSON files are missing or invalid

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Non-root user**: Container runs as non-root user
- **Input validation**: JSON parsing with error handling

## Monitoring

- **Health check endpoint**: `/health`
- **Container health checks**: Built into Dockerfile
- **Logging**: Console output for debugging

## Troubleshooting

### Common Issues

1. **Port already in use:**

   ```bash
   # Change port in environment
   PORT=3001 npm start
   ```

2. **Container won't start:**

   ```bash
   # Check logs
   podman logs data-ingest-api
   ```

3. **Data not loading:**
   - Ensure JSON files exist in `input_file/` directory
   - Check file permissions
   - Verify JSON syntax

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
