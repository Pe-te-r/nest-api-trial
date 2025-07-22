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
      relations: ['session'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all orders for the user
    const orders = await this.orderRepository.find({
      where: { customer: { id: userId } },
      relations: ['items', 'items.product', 'items.vendor'],
    });

    // Calculate order statistics
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (order) => order.status === OrderStatus.PENDING,
    ).length;
    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.COMPLETED,
    ).length;
    const cancelledOrders = orders.filter(
      (order) => order.status === OrderStatus.CANCELLED,
    ).length;

    // Calculate total spending
    const totalSpent = orders
      .filter((order) => order.status === OrderStatus.COMPLETED)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.created_at,
        itemCount: order.itemCount,
        deliveryOption: order.deliveryOption,
      }));

    // Prepare dashboard data
    const data = {
      user: {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        isVerified: user.is_verified,
        lastLogin: user.session?.last_login,
      },
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalSpent: totalSpent,
        averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      },
      recentActivity: {
        recentOrders,
      },
  
    };

    return formatResponse('success', 'Dashboard stats retrieved', data);
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
