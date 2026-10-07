import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Customer } from '../customers/entities/customer.entity';
import { OrderStatus } from './enums/order-status.enum';

describe('OrdersService', () => {
  let service: OrdersService;

  const mockCustomer: Customer = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Acme Global Logistics',
    email: 'contact@acmegloballogistics.example.com',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    orders: [],
  };

  const mockOrder: Order = {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    customerId: mockCustomer.id,
    orderNumber: 'ORD-2026-1001',
    status: OrderStatus.PENDING,
    totalAmount: 1420.5,
    currency: 'USD',
    createdAt: new Date('2026-01-02T00:00:00Z'),
    customer: mockCustomer,
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockOrder], 1]),
  };

  const mockOrderRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({
        id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
        ...entity,
      }),
    ),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockCustomerRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new order', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockOrderRepository.findOne.mockResolvedValue(null);

      const dto = {
        customerId: mockCustomer.id,
        orderNumber: 'ORD-2026-1001',
        status: OrderStatus.PENDING,
        totalAmount: 1420.5,
        currency: 'USD',
      };

      const result = await service.create(dto);

      expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
        where: { id: dto.customerId },
      });
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { orderNumber: dto.orderNumber },
      });
      expect(result.orderNumber).toBe(dto.orderNumber);
      expect(result.id).toBeDefined();
    });

    it('should throw NotFoundException if referenced customer does not exist', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      const dto = {
        customerId: 'non-existent-customer-id',
        orderNumber: 'ORD-2026-1001',
        totalAmount: 500,
      };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if orderNumber already exists', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const dto = {
        customerId: mockCustomer.id,
        orderNumber: 'ORD-2026-1001',
        totalAmount: 500,
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated orders', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockOrderRepository.createQueryBuilder).toHaveBeenCalledWith(
        'order',
      );
      expect(result.data).toEqual([mockOrder]);
      expect(result.meta.totalItems).toBe(1);
    });

    it('should apply status filter if provided', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        status: OrderStatus.COMPLETED,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.status = :status',
        { status: OrderStatus.COMPLETED },
      );
    });

    it('should apply customerId filter if provided', async () => {
      await service.findAll({
        page: 1,
        limit: 10,
        customerId: mockCustomer.id,
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'order.customerId = :customerId',
        { customerId: mockCustomer.id },
      );
    });
  });

  describe('findOne', () => {
    it('should return order by id with customer relation', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne(mockOrder.id);

      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockOrder.id },
        relations: ['customer'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update order status and totalAmount', async () => {
      mockOrderRepository.findOne.mockResolvedValue({ ...mockOrder });

      const result = await service.update(mockOrder.id, {
        status: OrderStatus.COMPLETED,
        totalAmount: 1500,
      });

      expect(result.status).toBe(OrderStatus.COMPLETED);
      expect(result.totalAmount).toBe(1500);
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          status: OrderStatus.COMPLETED,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated orderNumber collides', async () => {
      mockOrderRepository.findOne
        .mockResolvedValueOnce({ ...mockOrder })
        .mockResolvedValueOnce({
          id: 'other-order-id',
          orderNumber: 'ORD-DUPLICATE',
        });

      await expect(
        service.update(mockOrder.id, { orderNumber: 'ORD-DUPLICATE' }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
