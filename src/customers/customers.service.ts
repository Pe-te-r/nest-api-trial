import { Injectable } from '@nestjs/common'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { DriverStatus, formatResponse, OrderStatus } from 'src/types/types'
import { AuthSession } from 'src/auth/entities/auth.entity'
import { AccountStatus, UserRole } from 'src/utils/enums'
import { Product } from 'src/products/entities/product.entity'
import { Store } from 'src/stores/entities/store.entity'
import { Driver } from 'src/driver/entities/driver.entity'
import { Category } from 'src/category/entities/category.entity'
import { SubCategory } from 'src/sub_category/entities/sub_category.entity'
import { County } from 'src/county/entities/county.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { PickStation } from 'src/pick_station/entities/pick_station.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'

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
    private authSessionRepository: Repository<AuthSession>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory) private subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(County) private countyRepository: Repository<County>,
    @InjectRepository(PickStation) private pickStationRepository: Repository<PickStation>,
    @InjectRepository(Constituency) private constituencyRepository: Repository<Constituency>,
    @InjectRepository(Assignment) private assignmentRepository: Repository<Assignment>,

      
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

 
  async getAdminDashboardStat() {
    // User statistics
    const totalUsers = await this.userRepository.count();
    const customersCount = await this.userRepository.count({ where: { role: UserRole.CUSTOMER } });
    const storeOwnersCount = await this.userRepository.count({ where: { role: UserRole.VENDOR } });
    const driversCount = await this.userRepository.count({ where: { role: UserRole.DRIVER } });
    const adminsCount = await this.userRepository.count({ where: { role: UserRole.ADMIN } });
    
    // Store statistics
    const totalStores = await this.storeRepository.count();
    const activeStores = await this.storeRepository.count();
    
    // Product statistics
    const totalProducts = await this.productRepository.count();
    const availableProducts = await this.productRepository.count({ where: { isAvailable: true } });
    const outOfStockProducts = await this.productRepository.count({ where: { stock: 0 } });
    
    // Order statistics
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
    const processingOrders = await this.orderRepository.count({ where: { status: OrderStatus.READY_FOR_PICKUP } });
    const completedOrders = await this.orderRepository.count({ where: { status: OrderStatus.COMPLETED } });
    const cancelledOrders = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });
    
    // Driver statistics
    const totalDrivers = await this.driverRepository.count();
    const availableDrivers = await this.driverRepository.count({ where: { status: DriverStatus.AVAILABLE } });
    const onDeliveryDrivers = await this.driverRepository.count({ where: { status: DriverStatus.OFFLINE } });
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.created_at >= :date', { date: sevenDaysAgo })
      .getCount();
      
    const recentOrders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.created_at >= :date', { date: sevenDaysAgo })
      .getCount();
    
  
    // Prepare the data object
    const data = {
      users: {
        total: totalUsers,
        customers: customersCount,
        storeOwners: storeOwnersCount,
        drivers: driversCount,
        admins: adminsCount,
        recent: recentUsers,
      },
      stores: {
        total: totalStores,
        active: activeStores,
      },
      products: {
        total: totalProducts,
        available: availableProducts,
        outOfStock: outOfStockProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        completed: completedOrders,
        cancelled: cancelledOrders,
        recent: recentOrders,
      },
      drivers: {
        total: totalDrivers,
        available: availableDrivers,
        onDelivery: onDeliveryDrivers,
      },
    };

    return formatResponse('success', 'Dashboard stats retrieved successfully', data);
  }

  async findOrders(userId: string) {
    try{
      const orders = await this.orderRepository.find({
        where:{
          customer: { id: userId },
        },
        relations:{items:true}
      })
        orders.forEach((order)=>{
          this.synchronizeOrderStatus(order)
        })
      const data = orders.map(order => ({
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
        constituency: order.constituency ?? null,
      }))
      return formatResponse('success', 'Orders fetched successfully', data)
    }catch (error) {
      return formatResponse('error', 'An error occurred while fetching orders', null)
    }
  }
  async findOrdersDetails(orderId: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
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
      })
      if (!order) {
        return formatResponse('error', 'Order not found', null)
      }
      await this.synchronizeOrderStatus(order);
      const pickStation = order.pickStation
      const pickUpLocation = pickStation
        ? {
            id: pickStation.id,
            name: pickStation.name,
            contactPhone: pickStation.contactPhone,
            openingTime: pickStation.openingTime,
            closingTime: pickStation.closingTime,
            isOpenNow: pickStation.isOpenNow(), // invokes the method
            constituency: pickStation.constituency?.name ?? 'N/A',
            county: pickStation.constituency?.county.county_name ?? 'N/A',
          }
        : null
      const formattedOrder = {
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
      }
      return formatResponse('success', 'Order fetched successfully', formattedOrder)
    } catch (error) {
      return formatResponse('error', 'An error occurred while fetching order', null)
    }
  }

  async synchronizeOrderStatus(order: Order) {
  if (!order.items || order.items.length === 0) return;

  // Get all unique item statuses
  const itemStatuses = [...new Set(order.items.map(item => item.itemStatus))];

  // Check if all items are in the same status
  if (itemStatuses.length === 1) {
    const unifiedStatus = itemStatuses[0];
    
    // Only update if the order status is different from the unified items status
    if (order.status !== unifiedStatus) {
      order.status = unifiedStatus;
      await this.orderRepository.save(order);
    }
    return;
  }
  const orderItems = this.determineOrderStatusFromItems(order.items)

  // Handle cases where items have different statuses
  if (order.status !== orderItems) {
    order.status = orderItems
    await this.orderRepository.save(order);
  }
}

private determineOrderStatusFromItems(items: OrderItem[]): OrderStatus {
  const statusHierarchy = [
    OrderStatus.REJECTED,
    OrderStatus.CANCELLED,
    OrderStatus.COMPLETED,
    OrderStatus.DELIVERED,
    OrderStatus.IN_TRANSIT,
    OrderStatus.READY_FOR_PICKUP,
    OrderStatus.PENDING
  ];

  // Find the highest priority status (lowest in the hierarchy array)
  let highestPriorityStatus = OrderStatus.PENDING;
  
  for (const item of items) {
    const itemPriority = statusHierarchy.indexOf(item.itemStatus);
    const currentPriority = statusHierarchy.indexOf(highestPriorityStatus);
    
    if (itemPriority > currentPriority) {
      highestPriorityStatus = item.itemStatus;
    }
  }

  // Special case: If any item is rejected/cancelled but others are completed
  if ([OrderStatus.REJECTED, OrderStatus.CANCELLED].includes(highestPriorityStatus)) {
    const hasCompletedItems = items.some(item => 
      item.itemStatus === OrderStatus.COMPLETED || 
      item.itemStatus === OrderStatus.DELIVERED
    );
    
    // if (hasCompletedItems) {
    //   return OrderStatus.PARTIALLY_COMPLETED; // You might want to add this status
    // }
  }

  return highestPriorityStatus;
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
