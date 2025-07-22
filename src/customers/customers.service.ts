import { Injectable } from '@nestjs/common'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { formatResponse, OrderStatus } from 'src/types/types'
import { AuthSession } from 'src/auth/entities/auth.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(AuthSession)
    private authSessionRepository: Repository<AuthSession>
  ){}


  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } })
      if (!user) {
        return formatResponse('error', 'User not found', null)
      }
      return formatResponse('success', 'User found', user)
    } catch (error) {
      return formatResponse('error', 'An error occurred while fetching user', null)
    }
  }
async findDashboardStat(userId: string) {
    // Get user details
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'first_name', 'last_name', 'email', 'phone', 'role', 'is_verified', 'account_status', 'created_at'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user's auth session details
    const authSession = await this.authSessionRepository.findOne({
      where: { userId },
      select: ['last_login', 'otp_enabled', 'created_at'],
    });

    // Get order statistics
    const orderStats = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'COUNT(order.id) as total_orders',
        `SUM(CASE WHEN order.status = '${OrderStatus.PENDING}' THEN 1 ELSE 0 END) as pending_orders`,
        `SUM(CASE WHEN order.status = '${OrderStatus.READY_FOR_PICKUP}' THEN 1 ELSE 0 END) as ready_orders`,
        `SUM(CASE WHEN order.status = '${OrderStatus.IN_TRANSIT}' THEN 1 ELSE 0 END) as transit_orders`,
        `SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN 1 ELSE 0 END) as completed_orders`,
        `SUM(CASE WHEN order.status = '${OrderStatus.CANCELLED}' THEN 1 ELSE 0 END) as cancelled_orders`,
        'SUM(order.totalAmount) as total_spent',
      ])
      .where('order.customerId = :userId', { userId })
      .getRawOne();

    // Get recent orders (last 5)
    const recentOrders = await this.orderRepository.find({
      where: { customer: { id: userId } },
      order: { created_at: 'DESC' },
      take: 5,
      relations: ['items', 'items.product', 'items.vendor'],
      select: [
        'id',
        'totalAmount',
        'status',
        'created_at',
        'deliveryOption',
        'paymentMethod',
      ],
    });

    // Format recent orders data
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.created_at,
      deliveryOption: order.deliveryOption,
      paymentMethod: order.paymentMethod,
      itemCount: order.items?.length || 0,
      vendors: [...new Set(order.items?.map(item => item.vendor?.businessName))].filter(name => name),
    }));

    // Prepare the dashboard data
    const data = {
      user: {
        ...user,
        last_login: authSession?.last_login,
        otp_enabled: authSession?.otp_enabled,
        member_since: user.created_at,
      },
      stats: {
        total_orders: parseInt(orderStats.total_orders) || 0,
        pending_orders: parseInt(orderStats.pending_orders) || 0,
        processing_orders: parseInt(orderStats.processing_orders) || 0,
        completed_orders: parseInt(orderStats.completed_orders) || 0,
        cancelled_orders: parseInt(orderStats.cancelled_orders) || 0,
        total_spent: parseFloat(orderStats.total_spent) || 0,
        avg_order_value: orderStats.total_orders > 0 
          ? (parseFloat(orderStats.total_spent) / parseInt(orderStats.total_orders)).toFixed(2)
          : 0,
      },
      recent_orders: formattedRecentOrders,
    };

    return formatResponse('success', 'Dashboard stats retrieved successfully', data);
  }


  async findOrders(userId: string) {
    try {
      const orders = await this.orderRepository.find({
        where: {
          customer: { id: userId },
        },
        relations: [
          'customer',
          'items',
          'items.product',
          'items.vendor',
          'items.vendor.constituency',
          'pickStation',
          'pickStation.constituency',
          'pickStation.constituency.county',
          'constituency',
        ],
        order: {
          created_at: 'DESC',
        },
      })

      const formattedOrders = orders.map((order) => {
        const pickStation = order.pickStation;
      
        const pickUpLocation = pickStation
          ? {
              id: pickStation.id,
              name: pickStation.name,
              contactPhone: pickStation.contactPhone,
              openingTime: pickStation.openingTime,
              closingTime: pickStation.closingTime,
              isOpenNow: pickStation.isOpenNow(), // invokes the method
              constituency: pickStation.constituency?.name ?? 'N/A',
              country: pickStation.constituency?.county.county_name ?? 'N/A',
            }
          : null;
      
        return {
          id: order.id,
          status: order.status,
          totalAmount: order.totalAmount,
          deliveryOption: order.deliveryOption,
          deliveryFee: order.deliveryFee,
          deliveryInstructions: order.deliveryInstructions,
          paymentMethod: order.paymentMethod,
          paymentPhone: order.paymentPhone,
          createdAt: order.created_at,
          itemCount: order.itemCount,
          pickUpLocation, // ✅ now included
          constituency: order.constituency ?? null,
          items: order.items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            itemStatus: item.itemStatus,
            product: {
              id: item.product.id,
              name: item.product.name,
              price: item.product.price,
            },
            vendor: {
              id: item.vendor.id,
              businessName: item.vendor.businessName,
              location: item.vendor.constituency?.name ?? 'N/A',
            },
            randomCode: item.randomCode,
          })),
        };
      });
      
      return formatResponse('success', 'Orders fetched successfully', formattedOrders)
    } catch (error) {
      return formatResponse('error', 'An error occurred while fetching orders', null)
    }
  }


  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer'
  }

  findAll() {
    return `This action returns all customers`
  }

  
  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`
  }

  remove(id: number) {
    return `This action removes a #${id} customer`
  }
}
