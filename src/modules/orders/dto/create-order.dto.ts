import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums/order-status.enum';

export class CreateOrderDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'UUID of the existing customer',
  })
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({
    example: 'ORD-2026-1001',
    description: 'Unique business order identifier',
  })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiPropertyOptional({
    enum: OrderStatus,
    example: OrderStatus.PENDING,
    description: 'Order status (defaults to PENDING)',
    default: OrderStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus = OrderStatus.PENDING;

  @ApiProperty({
    example: 249.99,
    description: 'Total order monetary amount (must be positive)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  totalAmount: number;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'ISO-4217 three-letter currency code (e.g., USD, EUR, GBP)',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  @Length(3, 3, { message: 'currency must be a 3-letter ISO code' })
  currency?: string = 'USD';
}
