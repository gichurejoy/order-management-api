import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const customer = await this.customerRepository.findOne({
      where: { id: createOrderDto.customerId },
    });

    if (!customer) {
      throw new NotFoundException(
        `Customer with ID "${createOrderDto.customerId}" does not exist`,
      );
    }

    const existingOrder = await this.orderRepository.findOne({
      where: { orderNumber: createOrderDto.orderNumber },
    });

    if (existingOrder) {
      throw new ConflictException(
        `Order with order number "${createOrderDto.orderNumber}" already exists`,
      );
    }

    const order = this.orderRepository.create(createOrderDto);
    const saved = await this.orderRepository.save(order);
    this.logger.log(`Created order: ${saved.id} (${saved.orderNumber})`);
    return saved;
  }

  async findAll(query: QueryOrderDto): Promise<PaginatedResponseDto<Order>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.customerId) {
      qb.andWhere('order.customerId = :customerId', {
        customerId: query.customerId,
      });
    }

    qb.orderBy('order.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    if (
      updateOrderDto.customerId &&
      updateOrderDto.customerId !== order.customerId
    ) {
      const customer = await this.customerRepository.findOne({
        where: { id: updateOrderDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException(
          `Customer with ID "${updateOrderDto.customerId}" does not exist`,
        );
      }
      order.customerId = updateOrderDto.customerId;
    }

    if (
      updateOrderDto.orderNumber &&
      updateOrderDto.orderNumber !== order.orderNumber
    ) {
      const existing = await this.orderRepository.findOne({
        where: { orderNumber: updateOrderDto.orderNumber },
      });
      if (existing) {
        throw new ConflictException(
          `Order with order number "${updateOrderDto.orderNumber}" already exists`,
        );
      }
      order.orderNumber = updateOrderDto.orderNumber;
    }

    if (updateOrderDto.status !== undefined) {
      order.status = updateOrderDto.status;
    }

    if (updateOrderDto.totalAmount !== undefined) {
      order.totalAmount = updateOrderDto.totalAmount;
    }

    if (updateOrderDto.currency !== undefined) {
      order.currency = updateOrderDto.currency;
    }

    const updated = await this.orderRepository.save(order);
    this.logger.log(`Updated order: ${updated.id}`);
    return updated;
  }
}
