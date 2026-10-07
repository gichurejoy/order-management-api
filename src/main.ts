import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global exception filter for unified error response structure
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe for strict DTO validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable Cross-Origin Resource Sharing
  app.enableCors();

  // Swagger / OpenAPI documentation configuration
  const config = new DocumentBuilder()
    .setTitle('Order Management API')
    .setDescription(
      'RESTful API for managing customers and customer order lifecycles.',
    )
    .setVersion('1.0.0')
    .addTag('Customers', 'Customer management and order lookup operations')
    .addTag('Orders', 'Order processing and lifecycle operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Order Management API - Swagger UI',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`,
  );
}

bootstrap();
