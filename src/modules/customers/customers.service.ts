import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException(
        `Customer with email "${createCustomerDto.email}" already exists`,
      );
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      email: createCustomerDto.email.toLowerCase(),
    });

    const saved = await this.customerRepository.save(customer);
    this.logger.log(`Created customer: ${saved.id} (${saved.email})`);
    return saved;
  }

  async findAll(
    query: QueryCustomerDto,
  ): Promise<PaginatedResponseDto<Customer>> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const qb = this.customerRepository.createQueryBuilder('customer');

    if (query.search) {
      const searchTerm = `%${query.search.toLowerCase()}%`;
      qb.where(
        'LOWER(customer.name) LIKE :searchTerm OR LOWER(customer.email) LIKE :searchTerm',
        { searchTerm },
      );
    }

    qb.orderBy('customer.createdAt', 'DESC').skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return new PaginatedResponseDto(items, total, page, limit);
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['orders'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });

    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }

    if (
      updateCustomerDto.email &&
      updateCustomerDto.email.toLowerCase() !== customer.email.toLowerCase()
    ) {
      const emailExists = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email.toLowerCase() },
      });
      if (emailExists) {
        throw new ConflictException(
          `Customer with email "${updateCustomerDto.email}" already exists`,
        );
      }
      customer.email = updateCustomerDto.email.toLowerCase();
    }

    if (updateCustomerDto.name !== undefined) {
      customer.name = updateCustomerDto.name;
    }

    const updated = await this.customerRepository.save(customer);
    this.logger.log(`Updated customer: ${updated.id}`);
    return updated;
  }
}
