# Order Management API

A professional, production-grade NestJS REST API designed for managing customer records and order lifecycles. Built with TypeScript, TypeORM, PostgreSQL, Jest, and OpenAPI/Swagger.

---

## Table of Contents

- [Project Purpose](#project-purpose)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [PostgreSQL Database Setup](#postgresql-database-setup)
  - [Option A: Docker Compose (Recommended for macOS / Linux)](#option-a-docker-compose-recommended-for-macos--linux)
  - [Option B: Existing Local PostgreSQL Instance](#option-b-existing-local-postgresql-instance)
  - [Connecting with DBeaver](#connecting-with-dbeaver)
- [Database Migrations & Seeding](#database-migrations--seeding)
- [Running the Application](#running-the-application)
- [Automated Testing](#automated-testing)
- [Code Quality & Linting](#code-quality--linting)
- [Interactive API Documentation (Swagger)](#interactive-api-documentation-swagger)
- [Existing API Endpoints](#existing-api-endpoints)
- [Example API Requests (cURL)](#example-api-requests-curl)
- [Upcoming Engineering Tasks (Not Yet Implemented)](#upcoming-engineering-tasks-not-yet-implemented)

---

## Project Purpose

This project serves as the foundational order-management backend for a commerce and logistics platform. It manages:

1. **Customers**: Core entity storing customer identification, contact details, timestamps, and relationships.
2. **Orders**: Transaction records associated with customers, tracking order numbers, monetary amounts, currencies, and lifecycle statuses (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`).

The starting codebase establishes industry-standard backend patterns including schema migrations, DTO validation, error handling filters, pagination, relation joins, and automated unit/e2e test suites.

---

## Architecture & Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Express platform)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (strict typing mode)
- **ORM**: [TypeORM](https://typeorm.io/) with custom DataSource configuration
- **Database**: [PostgreSQL](https://www.postgresql.org/) (relational schema with foreign keys, indexes, and enum types)
- **Validation**: `class-validator` and `class-transformer` via global `ValidationPipe`
- **Documentation**: `@nestjs/swagger` with OpenAPI 3.0 specs
- **Testing**: [Jest](https://jestjs.io/) and [Supertest](https://github.com/ladjs/supertest)

### Project Directory Structure

```text
order-management-api/
├── dist/                          # Compiled production output
├── src/
│   ├── common/                    # Shared cross-cutting concerns
│   │   ├── dto/                   # Generic pagination & response wrappers
│   │   └── filters/               # Unified HttpException filter
│   ├── config/                    # Config modules & database config loaders
│   ├── database/
│   │   ├── migrations/            # TypeORM schema migrations
│   │   ├── data-source.ts         # TypeORM CLI DataSource configuration
│   │   └── seed.ts                # Synthetic data seeder (idempotent)
│   ├── modules/
│   │   ├── customers/             # Customer module (controller, service, entity, DTOs, tests)
│   │   └── orders/                # Order module (controller, service, entity, DTOs, tests)
│   ├── app.module.ts              # Root application module
│   └── main.ts                    # Entry bootstrap with Swagger & validation pipes
├── test/                          # End-to-end integration test suite
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── docker-compose.yml             # Local PostgreSQL 16 Alpine container
├── .env.example                   # Example environment configuration
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js**: `v18.x`, `v20.x`, or `v22.x` (LTS recommended)
- **npm**: `v9.x` or higher
- **PostgreSQL**: Local service or Docker Desktop installed (native Apple Silicon Mac `linux/arm64` and x86_64 compatible)
- **DBeaver** or **Postman** (optional, for inspecting data and testing)

---

## Installation

Clone or open the project folder in Visual Studio Code:

```bash
cd order-management-api
npm install
```

---

## Environment Variables

Copy `.env.example` to `.env` and adjust credentials to match your local setup:

```bash
cp .env.example .env
```

| Variable | Description | Default Local Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Application environment (`development`, `test`, `production`) | `development` |
| `PORT` | HTTP port for the REST API | `3000` |
| `DB_HOST` | PostgreSQL hostname | `localhost` |
| `DB_PORT` | PostgreSQL TCP port | `5432` |
| `DB_USERNAME` | PostgreSQL database user | `app_user` (or `postgres`) |
| `DB_PASSWORD` | PostgreSQL user password | `app_password` |
| `DB_NAME` | PostgreSQL database name | `order_management_db` |
| `DB_SYNCHRONIZE` | Auto-sync TypeORM schema (disabled in favor of migrations) | `false` |
| `DB_LOGGING` | Enable TypeORM SQL query logging | `false` |

---

## PostgreSQL Database Setup

### Option A: Docker Compose (Recommended for macOS / Linux)

Run the included Docker Compose configuration (works seamlessly on Apple Silicon Mac via multi-arch Alpine image):

```bash
docker compose up -d
```

This spins up PostgreSQL 16 on port `5432` with database `order_management_db` and user `app_user`.

### Option B: Existing Local PostgreSQL Instance

If you are running PostgreSQL natively, ensure the database and user exist:

```sql
CREATE DATABASE order_management_db;
CREATE USER app_user WITH PASSWORD 'app_password';
GRANT ALL PRIVILEGES ON DATABASE order_management_db TO app_user;
```

### Connecting with DBeaver

Open **DBeaver** and create a new **PostgreSQL Connection**:

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `order_management_db`
- **Username**: `app_user` (or `postgres`)
- **Password**: `app_password` (or your local postgres password)

Once connected, you will see the `customers` and `orders` tables under the `public` schema.

---

## Database Migrations & Seeding

### 1. Run Schema Migrations

Execute the TypeORM migration to create the tables, enums, indexes, and constraints:

```bash
npm run migration:run
```

*(To revert a migration, run `npm run migration:revert`)*

### 2. Run Seed Script

Populate the database with realistic synthetic seed data (10 fictional corporate customers and 25 realistic orders):

```bash
npm run seed
```

---

## Running the Application

### Development Mode (with hot-reload)

```bash
npm run start:dev
```

### Production Build & Execution

```bash
npm run build
npm run start:prod
```

The API will be available at: **`http://localhost:3000`**

---

## Automated Testing

### Unit & Controller Tests

Runs all isolated unit tests covering services, controllers, and validation rules:

```bash
npm test
```

To run in watch mode:

```bash
npm run test:watch
```

### End-to-End (e2e) Tests

Runs the full HTTP lifecycle tests against the NestJS application and database:

```bash
npm run test:e2e
```

### Test Coverage Report

```bash
npm run test:cov
```

---

## Code Quality & Linting

Run ESLint to check for compliance with TypeScript best practices:

```bash
npm run lint
```

Automatically format and fix issues:

```bash
npm run lint:fix
```

---

## Interactive API Documentation (Swagger)

Interactive Swagger UI is automatically generated and accessible when the application is running:

- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **OpenAPI JSON Spec**: [http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)

---

## Existing API Endpoints

### Customer Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/customers` | Retrieve paginated customers. Supports `?page=1&limit=10&search=acme` |
| `GET` | `/customers/:id` | Get single customer by UUID (includes order history relation) |
| `POST` | `/customers` | Create a new customer (`name`, `email`) |
| `PATCH` | `/customers/:id` | Update customer details (`name`, `email`) |

### Order Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/orders` | Retrieve paginated orders. Supports `?page=1&limit=10&status=COMPLETED&customerId=<UUID>` |
| `GET` | `/orders/:id` | Get single order by UUID (includes customer relation) |
| `POST` | `/orders` | Create an order (`customerId`, `orderNumber`, `totalAmount`, `currency`, `status`) |
| `PATCH` | `/orders/:id` | Update order details (`status`, `totalAmount`, `currency`, etc.) |

---

## Example API Requests (cURL)

### 1. List Customers (Paginated with Search)

```bash
curl -X GET "http://localhost:3000/customers?page=1&limit=5&search=Logistics"
```

### 2. Get Customer by ID

```bash
curl -X GET "http://localhost:3000/customers/<CUSTOMER_UUID>"
```

### 3. Create a New Customer

```bash
curl -X POST "http://localhost:3000/customers" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pacific Freight Solutions",
    "email": "ops@pacificfreight.example.com"
  }'
```

### 4. Update a Customer

```bash
curl -X PATCH "http://localhost:3000/customers/<CUSTOMER_UUID>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pacific Freight Global"
  }'
```

### 5. List Orders (Filtered by Status)

```bash
curl -X GET "http://localhost:3000/orders?status=COMPLETED&page=1&limit=5"
```

### 6. Create a New Order

```bash
curl -X POST "http://localhost:3000/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "<CUSTOMER_UUID>",
    "orderNumber": "ORD-2026-9999",
    "totalAmount": 1250.75,
    "currency": "USD",
    "status": "PENDING"
  }'
```

### 7. Update an Order Status

```bash
curl -X PATCH "http://localhost:3000/orders/<ORDER_UUID>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }'
```

---

## Upcoming Engineering Tasks (Not Yet Implemented)

> **Notice for Developers**:
> The following feature is **intentionally NOT implemented** in this initial codebase:
>
> - **Customer Order Summary Endpoint**: A dedicated endpoint (e.g., `GET /customers/:id/order-summary` or equivalent aggregation service) that calculates aggregated customer metrics such as:
>   - Total number of lifetime orders
>   - Aggregate order value / total spend
>   - Orders broken down by status (`COMPLETED`, `PENDING`, `CANCELLED`, etc.)
>   - Average order value (AOV)
>   - Most recent order details
>
> This functionality is left for the next engineering task. The starting codebase provides the clean modular entities, repositories, and relationships necessary to implement this feature smoothly.
