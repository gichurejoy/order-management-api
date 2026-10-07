import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './entities/customer.entity';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomer: Customer = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Acme Global Logistics',
    email: 'contact@acmegloballogistics.example.com',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    orders: [],
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockCustomer], 1]),
  };

  const mockRepository = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) =>
      Promise.resolve({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        ...entity,
      }),
    ),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new customer', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const dto = {
        name: 'Acme Global Logistics',
        email: 'contact@acmegloballogistics.example.com',
      };

      const result = await service.create(dto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: dto.email.toLowerCase() },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...dto,
        email: dto.email.toLowerCase(),
      });
      expect(result.name).toBe(dto.name);
      expect(result.id).toBeDefined();
    });

    it('should throw ConflictException if email is already registered', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);

      const dto = {
        name: 'Another Acme',
        email: 'contact@acmegloballogistics.example.com',
      };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'customer',
      );
      expect(result.data).toEqual([mockCustomer]);
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should apply search filter if search term is provided', async () => {
      await service.findAll({ page: 1, limit: 10, search: 'acme' });

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(customer.name) LIKE :searchTerm OR LOWER(customer.email) LIKE :searchTerm',
        { searchTerm: '%acme%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return customer by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne(mockCustomer.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCustomer.id },
        relations: ['orders'],
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw NotFoundException when customer does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('00000000-0000-0000-0000-000000000000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update customer name and return updated customer', async () => {
      mockRepository.findOne.mockResolvedValue({ ...mockCustomer });

      const result = await service.update(mockCustomer.id, {
        name: 'Acme Global Logistics Updated',
      });

      expect(result.name).toBe('Acme Global Logistics Updated');
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if updated email already exists for another customer', async () => {
      mockRepository.findOne
        .mockResolvedValueOnce({ ...mockCustomer })
        .mockResolvedValueOnce({
          id: 'different-id',
          email: 'duplicate@example.com',
        });

      await expect(
        service.update(mockCustomer.id, { email: 'duplicate@example.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if customer to update does not exist', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('00000000-0000-0000-0000-000000000000', {
          name: 'New Name',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
