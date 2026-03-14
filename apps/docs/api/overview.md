# API Overview

The Nexus API provides programmatic access to documentation search, memory, and server registry.

## Base URL

```
https://api.nexus.yogan.dev
```

## Authentication

Memory write operations require authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Documentation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/libraries` | List libraries |
| GET | `/libraries/:id` | Get library info |
| POST | `/libraries/:id/query` | Search documentation |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/memories` | List memories |
| POST | `/memories` | Create memory |
| GET | `/memories/:id` | Get memory |
| PATCH | `/memories/:id` | Update memory |
| DELETE | `/memories/:id` | Delete memory |
| POST | `/memories/search` | Search memories |

### Servers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/servers` | List servers |
| GET | `/servers/:id` | Get server info |
| GET | `/servers/:id/config` | Get install config |

## Response Format

All responses are JSON:

```json
{
  "data": { ... },
  "meta": {
    "requestId": "req_abc123"
  }
}
```

## Errors

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Library not found"
  }
}
```
