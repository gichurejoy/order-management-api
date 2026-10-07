import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { OrderStatus } from './enums/order-status.enum';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrder: Order = {
    id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    customerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    orderNumber: 'ORD-2026-1001',
    status: OrderStatus.PENDING,
    totalAmount: 1420.5,
    currency: 'USD',
    createdAt: new Date('2026-01-02T00:00:00Z'),
  };

  const mockOrdersService = {
    create: jest.fn().mockResolvedValue(mockOrder),
    findAll: jest
      .fn()
      .mockResolvedValue(new PaginatedResponseDto([mockOrder], 1, 1, 10)),
    findOne: jest.fn().mockResolvedValue(mockOrder),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockOrder, status: OrderStatus.COMPLETED }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an order', async () => {
    const dto = {
      customerId: mockOrder.customerId,
      orderNumber: 'ORD-2026-1001',
      totalAmount: 1420.5,
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockOrder);
  });

  it('should return paginated orders', async () => {
    const query = { page: 1, limit: 10 };
    const result = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result.data).toEqual([mockOrder]);
  });

  it('should return order by id', async () => {
    const result = await controller.findOne(mockOrder.id);
    expect(service.findOne).toHaveBeenCalledWith(mockOrder.id);
    expect(result).toEqual(mockOrder);
  });

  it('should update order by id', async () => {
    const dto = { status: OrderStatus.COMPLETED };
    const result = await controller.update(mockOrder.id, dto);
    expect(service.update).toHaveBeenCalledWith(mockOrder.id, dto);
    expect(result.status).toBe(OrderStatus.COMPLETED);
  });
});
