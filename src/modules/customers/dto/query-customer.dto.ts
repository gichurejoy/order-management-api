import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class QueryCustomerDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Case-insensitive search term matching customer name or email',
    example: 'acme',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
