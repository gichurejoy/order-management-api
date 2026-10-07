import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderStatus } from '../enums/order-status.enum';

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string | number): number {
    return parseFloat(data as string);
  }
}

@Entity('orders')
export class Order {
  @ApiProperty({
    example: 'e5f6a1b2-c3d4-7890-ef12-34567890abcd',
    description: 'Unique order identifier (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'Identifier of the customer placing the order',
  })
  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @ApiProperty({
    example: 'ORD-2026-1001',
    description: 'Unique business order reference code',
  })
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
    description: 'Current lifecycle status of the order',
  })
  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiProperty({
    example: 450.75,
    description: 'Total order monetary amount',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  totalAmount: number;

  @ApiProperty({
    example: 'USD',
    description: 'ISO-4217 three-letter currency code',
  })
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @ApiProperty({
    example: '2026-03-01T11:45:00.000Z',
    description: 'Timestamp when the order was placed',
  })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer?: Customer;
}
