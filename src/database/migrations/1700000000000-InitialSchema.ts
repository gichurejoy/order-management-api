import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    await queryRunner.query(`
      CREATE TYPE "orders_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED');
    `);

    await queryRunner.query(`
      CREATE TABLE "customers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
        CONSTRAINT "PK_customers_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_customers_email" ON "customers" ("email");
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "customerId" uuid NOT NULL,
        "orderNumber" character varying(50) NOT NULL,
        "status" "orders_status_enum" NOT NULL DEFAULT 'PENDING',
        "totalAmount" numeric(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_orders_orderNumber" UNIQUE ("orderNumber"),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_orders_customerId" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT
      );
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_customerId" ON "orders" ("customerId");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_orderNumber" ON "orders" ("orderNumber");
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_status" ON "orders" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_orders_status";`);
    await queryRunner.query(`DROP INDEX "IDX_orders_orderNumber";`);
    await queryRunner.query(`DROP INDEX "IDX_orders_customerId";`);
    await queryRunner.query(`DROP TABLE "orders";`);
    await queryRunner.query(`DROP INDEX "IDX_customers_email";`);
    await queryRunner.query(`DROP TABLE "customers";`);
    await queryRunner.query(`DROP TYPE "orders_status_enum";`);
  }
}
