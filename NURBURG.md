---
title: Redis Sample Project
video: https://www.youtube.com/watch?v=7ySVWcFHz98
tags:
  - redis
  - express
  - nodejs
  - cache
summary: This is the summary of a sample project
---

This is a Redis in-memory experiment project demonstrating a Node.js Express API with Redis for caching and data storage.

## Features

- **Redis Integration**: Uses the latest `redis` v4 client with modern async/await syntax
- **Express API**: RESTful endpoints for user management and caching
- **Load Testing**: K6 scripts for performance testing including cache operations
- **Connection Management**: Redis client with automatic reconnection strategies
- **Dual Purpose Storage**: Both structured data (users) and key-value caching

## Key Redis Features Used

- **Hash Operations**: `hSet`, `hGetAll` for structured user data storage
- **String Operations**: `set`, `get`, `setEx` for simple key-value caching
- **Counters**: `incr` for auto-incrementing user IDs
- **Key Management**: `keys`, `exists` for data discovery and validation
- **TTL Support**: Time-to-live for cache expiration
- **Transactions**: `multi().exec()` for atomic operations
- **Connection Events**: Error handling and reconnection strategies

## API Endpoints

### User Management

- `GET /api/health` - Health check with Redis ping
- `GET /api/users` - List all users (from Redis hashes)
- `GET /api/users/:id` - Get specific user by ID
- `POST /api/users` - Create new user with email uniqueness check

### Caching

- `GET /api/cache/:key` - Get cached value by key
- `POST /api/cache` - Set cache value with optional TTL

## Environment Variables

- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis password (optional)
- `REDIS_DB` - Redis database number (default: 0)
- `PORT` - Server port (default: 3000)

## Data Storage Patterns

### Users (Hash Storage)

- Key pattern: `user:{id}`
- Email uniqueness: `email:{email}` -> `{userId}`
- Auto-incrementing IDs: `user:counter`

### Cache (String Storage)

- Flexible key-value pairs
- Optional TTL for automatic expiration
- Simple get/set operations

## Development

```bash
npm install
npm run dev    # Development with file watching
npm start      # Production server
npm test       # K6 load testing with cache operations
```
