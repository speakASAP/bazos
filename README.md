# Bazos Service

Bazos.cz classifieds automation service for the unified e-commerce platform.

## Overview

The Bazos Service automates Bazos classified ad creation and updates. It uses central microservices (catalog, warehouse, order) as the single source of truth.

## Port Configuration

**Port Range**: 39xx

| Service | Subdomain | Port |
| ------- | --------- | ---- |
| bazos-service | bazos.alfares.cz | 3900 |
| api-gateway | bazos.alfares.cz | 3901 |
| gateway-proxy | bazos.alfares.cz | 3904 |

## Features

- Automate Bazos classified ad creation/updates
- Subscribe to `stock.updated` events → update ads
- Manage multiple Bazos accounts
- Handle ad renewal/expiration

## Architecture

- Uses `catalog-microservice` (3200) for product data
- Uses `warehouse-microservice` (3201) for stock levels
- Uses `orders-microservice` (3203) for order processing
- Subscribes to RabbitMQ `stock.updated` events

## Database

Database: `bazos_db`

**Tables**:
- `BazosAccount` - Bazos account credentials
- `BazosAd` - Bazos ads linked to catalog products
- `BazosCategory` - Bazos category mappings

## API Endpoints

Base URL: `https://bazos.alfares.cz/api` (or `http://localhost:3901/api` in dev)

- `GET /api/accounts` - List Bazos accounts
- `POST /api/accounts` - Add Bazos account
- `GET /api/ads` - List Bazos ads
- `POST /api/ads` - Create ad on Bazos
- `POST /api/ads/sync` - Sync products from catalog to Bazos
- `POST /api/ads/:id/renew` - Renew ad
- `GET /api/categories` - List category mappings

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

Deploy using `nginx-microservice/scripts/blue-green/deploy-smart.sh`:

```bash
cd /home/statex/bazos-service
./nginx-microservice/scripts/blue-green/deploy-smart.sh
```

## Development

```bash
npm run start:dev
```

