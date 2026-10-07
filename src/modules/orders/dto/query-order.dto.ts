import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { OrderStatus } from '../enums/order-status.enum';

export class QueryOrderDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: OrderStatus,
    description:
      'Filter orders by status (PENDING, PROCESSING, COMPLETED, CANCELLED)',
    example: OrderStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter orders by customer UUID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsOptional()
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  customerId?: string;
}
