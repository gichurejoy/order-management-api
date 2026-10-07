import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';
import { PaginatedResponseDto } from '../../common/dto/paginated-response.dto';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: CustomersService;

  const mockCustomer: Customer = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Acme Global Logistics',
    email: 'contact@acmegloballogistics.example.com',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    orders: [],
  };

  const mockCustomersService = {
    create: jest.fn().mockResolvedValue(mockCustomer),
    findAll: jest
      .fn()
      .mockResolvedValue(new PaginatedResponseDto([mockCustomer], 1, 1, 10)),
    findOne: jest.fn().mockResolvedValue(mockCustomer),
    update: jest
      .fn()
      .mockResolvedValue({ ...mockCustomer, name: 'Acme Updated' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const dto = {
      name: 'Acme Global Logistics',
      email: 'contact@acmegloballogistics.example.com',
    };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockCustomer);
  });

  it('should return paginated customers', async () => {
    const query = { page: 1, limit: 10 };
    const result = await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result.data).toEqual([mockCustomer]);
  });

  it('should return customer by id', async () => {
    const result = await controller.findOne(mockCustomer.id);
    expect(service.findOne).toHaveBeenCalledWith(mockCustomer.id);
    expect(result).toEqual(mockCustomer);
  });

  it('should update customer by id', async () => {
    const dto = { name: 'Acme Updated' };
    const result = await controller.update(mockCustomer.id, dto);
    expect(service.update).toHaveBeenCalledWith(mockCustomer.id, dto);
    expect(result.name).toBe('Acme Updated');
  });
});
