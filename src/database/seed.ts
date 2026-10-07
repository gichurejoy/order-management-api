import { DataSource } from 'typeorm';
import AppDataSource from './data-source';
import { Customer } from '../modules/customers/entities/customer.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderStatus } from '../modules/orders/enums/order-status.enum';

export async function runSeed(dataSource: DataSource): Promise<void> {
  const customerRepo = dataSource.getRepository(Customer);
  const orderRepo = dataSource.getRepository(Order);

  console.log('--- Starting Database Seeding ---');

  // Clear existing orders and customers for fresh seed run
  await orderRepo.createQueryBuilder().delete().execute();
  await customerRepo.createQueryBuilder().delete().execute();

  const customerData = [
    {
      name: 'Acme Global Logistics',
      email: 'contact@acmegloballogistics.example.com',
    },
    {
      name: 'Starlight Retail Ventures',
      email: 'ops@starlightretail.example.com',
    },
    {
      name: 'Horizon Media Solutions',
      email: 'billing@horizonmedia.example.com',
    },
    {
      name: 'Nexus Health Diagnostics',
      email: 'supplies@nexushealthdiag.example.com',
    },
    {
      name: 'Pinnacle Software Labs',
      email: 'accounts@pinnaclesoftware.example.com',
    },
    {
      name: 'Vanguard Industrial Supply',
      email: 'procurement@vanguardindustrial.example.com',
    },
    {
      name: 'Cascade Artisan Coffee',
      email: 'roastery@cascadeartisancoffee.example.com',
    },
    {
      name: 'Solstice Renewable Energy',
      email: 'projects@solsticegreen.example.com',
    },
    { name: 'Echo Peak Ventures', email: 'finance@echopeak.example.com' },
    {
      name: 'Summit Gear Outfitters',
      email: 'purchasing@summitgearoutfitters.example.com',
    },
  ];

  const createdCustomers: Customer[] = [];
  for (const c of customerData) {
    const customer = customerRepo.create(c);
    const saved = await customerRepo.save(customer);
    createdCustomers.push(saved);
  }

  console.log(`Successfully seeded ${createdCustomers.length} customers.`);

  const orderData = [
    // Customer 0: Acme Global Logistics
    {
      customerIdx: 0,
      orderNumber: 'ORD-2026-1001',
      status: OrderStatus.COMPLETED,
      totalAmount: 1420.5,
      currency: 'USD',
    },
    {
      customerIdx: 0,
      orderNumber: 'ORD-2026-1002',
      status: OrderStatus.PROCESSING,
      totalAmount: 890.0,
      currency: 'USD',
    },
    {
      customerIdx: 0,
      orderNumber: 'ORD-2026-1003',
      status: OrderStatus.PENDING,
      totalAmount: 215.75,
      currency: 'USD',
    },

    // Customer 1: Starlight Retail Ventures
    {
      customerIdx: 1,
      orderNumber: 'ORD-2026-1004',
      status: OrderStatus.COMPLETED,
      totalAmount: 3200.0,
      currency: 'EUR',
    },
    {
      customerIdx: 1,
      orderNumber: 'ORD-2026-1005',
      status: OrderStatus.COMPLETED,
      totalAmount: 1150.25,
      currency: 'EUR',
    },
    {
      customerIdx: 1,
      orderNumber: 'ORD-2026-1006',
      status: OrderStatus.CANCELLED,
      totalAmount: 450.0,
      currency: 'EUR',
    },

    // Customer 2: Horizon Media Solutions
    {
      customerIdx: 2,
      orderNumber: 'ORD-2026-1007',
      status: OrderStatus.COMPLETED,
      totalAmount: 675.0,
      currency: 'USD',
    },
    {
      customerIdx: 2,
      orderNumber: 'ORD-2026-1008',
      status: OrderStatus.PROCESSING,
      totalAmount: 1540.8,
      currency: 'USD',
    },

    // Customer 3: Nexus Health Diagnostics
    {
      customerIdx: 3,
      orderNumber: 'ORD-2026-1009',
      status: OrderStatus.COMPLETED,
      totalAmount: 4890.0,
      currency: 'USD',
    },
    {
      customerIdx: 3,
      orderNumber: 'ORD-2026-1010',
      status: OrderStatus.COMPLETED,
      totalAmount: 2310.5,
      currency: 'USD',
    },
    {
      customerIdx: 3,
      orderNumber: 'ORD-2026-1011',
      status: OrderStatus.PROCESSING,
      totalAmount: 980.0,
      currency: 'USD',
    },

    // Customer 4: Pinnacle Software Labs
    {
      customerIdx: 4,
      orderNumber: 'ORD-2026-1012',
      status: OrderStatus.COMPLETED,
      totalAmount: 120.0,
      currency: 'GBP',
    },
    {
      customerIdx: 4,
      orderNumber: 'ORD-2026-1013',
      status: OrderStatus.PENDING,
      totalAmount: 350.0,
      currency: 'GBP',
    },

    // Customer 5: Vanguard Industrial Supply
    {
      customerIdx: 5,
      orderNumber: 'ORD-2026-1014',
      status: OrderStatus.COMPLETED,
      totalAmount: 5600.0,
      currency: 'USD',
    },
    {
      customerIdx: 5,
      orderNumber: 'ORD-2026-1015',
      status: OrderStatus.CANCELLED,
      totalAmount: 820.0,
      currency: 'USD',
    },
    {
      customerIdx: 5,
      orderNumber: 'ORD-2026-1016',
      status: OrderStatus.PROCESSING,
      totalAmount: 2430.7,
      currency: 'USD',
    },

    // Customer 6: Cascade Artisan Coffee
    {
      customerIdx: 6,
      orderNumber: 'ORD-2026-1017',
      status: OrderStatus.COMPLETED,
      totalAmount: 340.5,
      currency: 'USD',
    },
    {
      customerIdx: 6,
      orderNumber: 'ORD-2026-1018',
      status: OrderStatus.COMPLETED,
      totalAmount: 410.25,
      currency: 'USD',
    },
    {
      customerIdx: 6,
      orderNumber: 'ORD-2026-1019',
      status: OrderStatus.PENDING,
      totalAmount: 195.0,
      currency: 'USD',
    },

    // Customer 7: Solstice Renewable Energy
    {
      customerIdx: 7,
      orderNumber: 'ORD-2026-1020',
      status: OrderStatus.COMPLETED,
      totalAmount: 7800.0,
      currency: 'EUR',
    },
    {
      customerIdx: 7,
      orderNumber: 'ORD-2026-1021',
      status: OrderStatus.PROCESSING,
      totalAmount: 3120.0,
      currency: 'EUR',
    },

    // Customer 8: Echo Peak Ventures
    {
      customerIdx: 8,
      orderNumber: 'ORD-2026-1022',
      status: OrderStatus.COMPLETED,
      totalAmount: 890.0,
      currency: 'USD',
    },
    {
      customerIdx: 8,
      orderNumber: 'ORD-2026-1023',
      status: OrderStatus.PENDING,
      totalAmount: 640.0,
      currency: 'USD',
    },

    // Customer 9: Summit Gear Outfitters
    {
      customerIdx: 9,
      orderNumber: 'ORD-2026-1024',
      status: OrderStatus.COMPLETED,
      totalAmount: 1450.0,
      currency: 'USD',
    },
    {
      customerIdx: 9,
      orderNumber: 'ORD-2026-1025',
      status: OrderStatus.PROCESSING,
      totalAmount: 2190.4,
      currency: 'USD',
    },
  ];

  for (const o of orderData) {
    const customer = createdCustomers[o.customerIdx];
    const order = orderRepo.create({
      customerId: customer.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      currency: o.currency,
    });
    await orderRepo.save(order);
  }

  console.log(`Successfully seeded ${orderData.length} orders.`);
  console.log('--- Database Seeding Complete ---');
}

async function bootstrap() {
  await AppDataSource.initialize();
  try {
    await runSeed(AppDataSource);
  } finally {
    await AppDataSource.destroy();
  }
}

if (require.main === module) {
  bootstrap().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}
