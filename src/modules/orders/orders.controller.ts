import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order for an existing customer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Order created successfully.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Validation failed.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Referenced customer does not exist.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Order with this orderNumber already exists.',
  })
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary:
      'Retrieve paginated orders with optional status and customer filters',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Paginated order list retrieved successfully.',
  })
  findAll(@Query() query: QueryOrderDto): Promise<PaginatedResponseDto<Order>> {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details by UUID including customer info',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order retrieved successfully.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found.',
  })
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order details by UUID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Order UUID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Order updated successfully.',
    type: Order,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order or referenced customer not found.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Order number already exists on another order.',
  })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }
}
