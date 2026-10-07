import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('Order Management API (e2e)', () => {
  let app: INestApplication;
  let testCustomerId: string;
  let testOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('/customers', () => {
    it('POST /customers - should reject request with invalid email (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({
          name: 'Invalid Customer',
          email: 'not-an-email',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('POST /customers - should create a customer (201)', async () => {
      const uniqueEmail = `test.e2e.${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({
          name: 'E2E Test Customer',
          email: uniqueEmail,
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('E2E Test Customer');
      expect(response.body.email).toBe(uniqueEmail);

      testCustomerId = response.body.id;
    });

    it('GET /customers - should return paginated list (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers?page=1&limit=5')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });

    it('GET /customers/:id - should return single customer (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${testCustomerId}`)
        .expect(200);

      expect(response.body.id).toBe(testCustomerId);
    });

    it('PATCH /customers/:id - should update customer (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/customers/${testCustomerId}`)
        .send({ name: 'E2E Customer Updated' })
        .expect(200);

      expect(response.body.name).toBe('E2E Customer Updated');
    });

    it('GET /customers/:id - should return 404 for unknown UUID', async () => {
      await request(app.getHttpServer())
        .get('/customers/a0000000-0000-4000-8000-000000000000')
        .expect(404);
    });
  });

  describe('/orders', () => {
    it('POST /orders - should reject request with negative totalAmount (400)', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId: testCustomerId,
          orderNumber: `ORD-TEST-${Date.now()}`,
          totalAmount: -50,
        })
        .expect(400);
    });

    it('POST /orders - should reject request with non-existent customer (404)', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId: 'a0000000-0000-4000-8000-000000000000',
          orderNumber: `ORD-TEST-${Date.now()}`,
          totalAmount: 150.0,
        })
        .expect(404);
    });

    it('POST /orders - should create an order (201)', async () => {
      const uniqueOrderNumber = `ORD-E2E-${Date.now()}`;
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          customerId: testCustomerId,
          orderNumber: uniqueOrderNumber,
          totalAmount: 299.99,
          currency: 'USD',
        })
        .expect(201);

      expect(response.body.id).toBeDefined();
      expect(response.body.orderNumber).toBe(uniqueOrderNumber);
      expect(response.body.status).toBe('PENDING');

      testOrderId = response.body.id;
    });

    it('GET /orders - should return paginated orders (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?page=1&limit=10')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toBeDefined();
    });

    it('GET /orders - should filter by status (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders?status=PENDING')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      response.body.data.forEach((o: any) => {
        expect(o.status).toBe('PENDING');
      });
    });

    it('GET /orders/:id - should return single order with customer (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.id).toBe(testOrderId);
      expect(response.body.customer).toBeDefined();
      expect(response.body.customer.id).toBe(testCustomerId);
    });

    it('PATCH /orders/:id - should update order status (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body.status).toBe('COMPLETED');
    });
  });
});
