import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { In, Repository } from 'typeorm'
import { allUserQuery, AssignmentStatus, formatResponse, OrderStatus, userIdQueryType } from 'src/types/types'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRole } from 'src/utils/enums'
import { AuthService } from 'src/auth/auth.service'
import { Product } from 'src/products/entities/product.entity'
import { Store } from 'src/stores/entities/store.entity'
import { Order } from 'src/orders/entities/order.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { Driver } from 'src/driver/entities/driver.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    @InjectRepository(Assignment) private assignmentRepository: Repository<Assignment>,
    private readonly authService: AuthService,
  ) {}
  create(createUserDto: CreateUserDto) {
    console.log(createUserDto)
    return 'This action adds a new user'
  }

  // get users details for admin fetch based on query role
  async findUsersDetails(id:string, query: allUserQuery) {

    if(query.admin=='true' || query.superadmin=='true') {
     return this.getAdminDetails(id)
    }

    if(query.vendor=='true') {
      console.log('query', query.vendor)
     return this.getVendorDetailsForAdmin(id)
    }

    if(query.driver=='true') {
    return this.getDriverDetailsForAdmin(id)
    }

    if(query.customers=='true') {
    return  this.findCustomerForAdmin(id)
    }
    throw new NotFoundException('No user details found for the given query')
  }

  // find admin/superadmin details for admin
  async getAdminDetails(userId: string) {
  // Fetch the admin/superadmin user with their session info
  const user = await this.userRepository.findOne({
    where: { 
      id: userId,
    },
    relations: ['session'],
    select: [
      'id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'role',
      'is_verified',
      'account_status',
      'created_at',
      'updated_at'
    ]
  });

  if (!user) {
    throw new NotFoundException(`Admin user with ID ${userId} not found`);
  }

  // Format the response
  const response = {
    id: user.id,
    personalDetails: {
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.is_verified,
      accountStatus: user.account_status,
      createdAt: user.created_at,
      lastUpdated: user.updated_at
    },
    securityDetails: {
      lastLogin: user.session?.last_login,
      otpEnabled: user.session?.otp_enabled,
      ipAddress: user.session?.ip_address
    }
  };

  return formatResponse('success', 'Admin details retrieved successfully', response);
}

  // find vendors details for admin
  async getVendorDetailsForAdmin(vendorId: string) {

      const vendor = await this.userRepository.findOne({
    where: { 
      id: vendorId,
    },
    relations: [
      'store',
      'store.constituency',
      'store.constituency.county',
      'store.products',
      'session'
    ],
  });

  if (!vendor) {
    throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
  }

  if (!vendor.store) {
    throw new NotFoundException(`No store found for vendor ${vendorId}`);
  }

  // Get order statistics for this vendor's store
  const orderStats = await this.orderRepository
    .createQueryBuilder('order')
    .innerJoin('order.items', 'item')
    .select([
      'COUNT(DISTINCT order.id) as total_orders',
      'SUM(item.quantity) as total_items_sold',
    ])
    .where('item.vendor_id = :storeId', { storeId: vendor.store.id })
    .getRawOne();

  // Format the response
  const response = {
    id: vendor.id,
    personalDetails: {
      firstName: vendor.first_name,
      lastName: vendor.last_name,
      email: vendor.email,
      phone: vendor.phone,
      isVerified: vendor.is_verified,
      accountStatus: vendor.account_status,
      lastLogin: vendor.session?.last_login,
      memberSince: vendor.created_at,
    },
    storeDetails: {
      id: vendor.store.id,
      businessName: vendor.store.businessName,
      businessDescription: vendor.store.businessDescription,
      businessType: vendor.store.businessType,
      contact: vendor.store.businessContact,
      address: vendor.store.streetAddress,
      approvalStatus: vendor.store.approved,
      termsAccepted: vendor.store.termsAccepted,
      location: {
        constituency: vendor.store.constituency?.name,
        county: vendor.store.constituency?.county?.county_name,
      },
    },
    businessActivity: {
      hasProducts: vendor.store.products.length > 0,
      productCount: vendor.store.products.length,
      totalOrders: parseInt(orderStats.total_orders) || 0,
      totalItemsSold: parseInt(orderStats.total_items_sold) || 0,
    },
    metadata: {
      lastUpdated: vendor.updated_at,
    }
  };

  return formatResponse('success', 'Vendor details retrieved successfully', response);
}
  // find driver details for admin
  async getDriverDetailsForAdmin(driverId: string) {
  const driver = await this.driverRepository.findOne({
    where: { user: { id: driverId } },
    relations: [
      'user',
      'assignments',
      'assignments.orderItem',
      'assignments.orderItem.order',
      'assignments.orderItem.vendor'
    ],
  });

  if (!driver) {
    throw new NotFoundException(`Driver with ID ${driverId} not found`);
  }

  // Calculate assignment statistics
  const assignmentStats = await this.assignmentRepository
    .createQueryBuilder('assignment')
    .select([
      'COUNT(assignment.id) as total_assignments',
      `SUM(CASE WHEN assignment.status = '${AssignmentStatus.PENDING}' THEN 1 ELSE 0 END) as pending_assignments`,
      `SUM(CASE WHEN assignment.status = '${AssignmentStatus.IN_PROGRESS}' THEN 1 ELSE 0 END) as in_progress_assignments`,
      `SUM(CASE WHEN assignment.status = '${AssignmentStatus.COMPLETED}' THEN 1 ELSE 0 END) as completed_assignments`,
      `SUM(CASE WHEN assignment.status = '${AssignmentStatus.CANCELLED}' THEN 1 ELSE 0 END) as cancelled_assignments`,
    ])
    .where('assignment.driverId = :driverId', { driverId })
    .getRawOne();

  // Get recent assignments (last 5)
  const recentAssignments = driver.assignments
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(assignment => ({
      id: assignment.id,
      status: assignment.status,
      createdAt: assignment.created_at,
      orderItem: {
        id: assignment.orderItem?.id,
        product: assignment.orderItem?.product?.name,
        quantity: assignment.orderItem?.quantity,
        vendor: assignment.orderItem?.vendor?.businessName,
        orderId: assignment.orderItem?.order?.id,
        orderStatus: assignment.orderItem?.order?.status,
      }
    }));

  // Format the response
  const response = {
    id: driver.id,
    personalDetails: {
      userId: driver.user.id,
      firstName: driver.user.first_name,
      lastName: driver.user.last_name,
      email: driver.user.email,
      phone: driver.user.phone,
      accountStatus: driver.user.account_status,
      isVerified: driver.user.is_verified,
      lastLogin: driver.user.session?.last_login,
    },
    vehicleDetails: {
      type: driver.vehicle_type,
      licensePlate: driver.license_plate,
      status: driver.status,
    },
    activityStats: {
      totalAssignments: parseInt(assignmentStats.total_assignments) || 0,
      pendingAssignments: parseInt(assignmentStats.pending_assignments) || 0,
      inProgressAssignments: parseInt(assignmentStats.in_progress_assignments) || 0,
      completedAssignments: parseInt(assignmentStats.completed_assignments) || 0,
      cancelledAssignments: parseInt(assignmentStats.cancelled_assignments) || 0,
      completionRate: assignmentStats.total_assignments > 0 
        ? ((parseInt(assignmentStats.completed_assignments) / parseInt(assignmentStats.total_assignments) * 100).toFixed(2) + '%')
        : '0%',
    },
    recentActivity: recentAssignments || [],
    metadata: {
      createdAt: driver.created_at,
      lastUpdated: driver.updated_at,
    }
  };

  return formatResponse('success', 'Driver details retrieved successfully', response);
}


    // Find customer details for admin
  async findCustomerForAdmin(id: string) {
  const customer = await this.userRepository.findOne({
    where: { id, },
    relations: [
      'orders',
      'orders.items',
      'orders.items.vendor',
      'session'
    ],
  });

  if (!customer) {
    throw new NotFoundException('Customer not found');
  }

  // Get additional order statistics
  const orderStats = await this.orderRepository
    .createQueryBuilder('order')
    .select([
      'COUNT(order.id) as total_orders',
      `SUM(CASE WHEN order.status = '${OrderStatus.PENDING}' THEN 1 ELSE 0 END) as pending_orders`,
      `SUM(CASE WHEN order.status = '${OrderStatus.COMPLETED}' THEN 1 ELSE 0 END) as completed_orders`,
      `SUM(CASE WHEN order.status = '${OrderStatus.CANCELLED}' THEN 1 ELSE 0 END) as cancelled_orders`,
      'SUM(order.totalAmount) as total_spent',
    ])
    .where('order.customerId = :id', { id })
    .getRawOne();

  // Format the response
  const response = {
    id: customer.id,
    personalDetails: {
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      isVerified: customer.is_verified,
      accountStatus: customer.account_status,
      memberSince: customer.created_at,
      lastUpdated: customer.updated_at,
    },
    sessionInfo: {
      lastLogin: customer.session?.last_login,
      otpEnabled: customer.session?.otp_enabled,
      ipAddress: customer.session?.ip_address,
    },
    orderStatistics: {
      totalOrders: parseInt(orderStats.total_orders) || 0,
      pendingOrders: parseInt(orderStats.pending_orders) || 0,
      completedOrders: parseInt(orderStats.completed_orders) || 0,
      cancelledOrders: parseInt(orderStats.cancelled_orders) || 0,
      totalSpent: parseFloat(orderStats.total_spent) || 0,
      averageOrderValue: orderStats.total_orders > 0 
        ? (parseFloat(orderStats.total_spent) / parseInt(orderStats.total_orders)).toFixed(2)
        : 0,
    },
    recentOrders: customer.orders?.slice(0, 5).map(order => ({
      id: order.id,
      date: order.created_at,
      status: order.status,
      totalAmount: order.totalAmount,
      itemCount: order.itemCount,
      vendors: order.vendors.map(v => v.businessName),
    })),
  };

  return formatResponse('success', 'Customer details retrieved', response);
  }

  async findAll(query: allUserQuery) {
    if (query.customers === 'true') {
      const customers = await this.userRepository.find({
        where: {
          role: UserRole.CUSTOMER,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!customers) {
        throw new NotFoundException('no customer details found')
      }
      return formatResponse('success', 'customers found', customers)
    } else if (query.driver === 'true') {
      const drivers = await this.userRepository.find({
        where: {
          role: UserRole.DRIVER,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!drivers) {
        throw new NotFoundException('no drivers details found')
      }
      return formatResponse('success', 'drivers found', drivers)
    } else if (query.admin === 'true') {
      const admins = await this.userRepository.find({
        where: {
          role: UserRole.ADMIN,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!admins) {
        throw new NotFoundException('no admins details found')
      }
      return formatResponse('success', 'admins found', admins)
    } else if (query.vendor === 'true') {
      const vendors = await this.userRepository.find({
        where: {
          role: UserRole.VENDOR,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!vendors) {
        throw new NotFoundException('no vendor details found')
      }
      return formatResponse('success', 'vendor found', vendors)
    }
    return {
      message: `This action returns all user`,
    }
  }

  async findProducts(userId: string) {
    // First find the user with their store relation
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['store'], // This ensures the store relation is loaded
    })

    if (!user) throw new NotFoundException('User not found')

    console.log('user', user)

    const store = user.store
    if (!store) throw new NotFoundException('This vendor has no store')

    // Then find all products for this store
    const products = await this.productRepository.find({
      where: { store: { id: store.id } },
      relations: ['subCategory'], // Optional: load any relations you need
    })

    if (!products || products.length === 0) {
      throw new NotFoundException('No products found for this user')
    }

    return formatResponse('success', 'Products retrieved', products)
  }
  async findOne(id: string, query: userIdQueryType) {
    if (query.account_modal === 'true') {
      const userModal = await this.userRepository.findOne({
        where: {
          id,
        },
        relations: {
          session: true,
        },
      })
      if (!userModal) {
        throw new NotFoundException(`user with id:${id} not found`)
      }
      const userModalData = {
        firstName: userModal?.first_name,
        lastName: userModal?.last_name,
        email: userModal?.email,
        phone: userModal?.phone,
        joinedAt: userModal?.created_at,
        role: userModal?.role,
        isTwoFactorEnabled: userModal?.session.otp_enabled,
        status: userModal?.account_status,
        lastLogin: userModal?.session.last_login,
      }
      return formatResponse('success', 'User data found', userModalData)
    }
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) throw new NotFoundException('user not found')
    return formatResponse('success', 'account_modal', user)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    // Avoid overwriting password
    if ('password' in updateUserDto) {
      delete updateUserDto['password']
    }

    // Safely update fields
    if (updateUserDto.firstName) {
      user.first_name = updateUserDto.firstName
    }
    if (updateUserDto.lastName) {
      user.last_name = updateUserDto.lastName
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone
    }

    // Save to database
    await this.userRepository.save(user)

    return formatResponse('success', 'User data updated successfully', null)
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return formatResponse('success', `User #${id} has been deleted`, null)
  }
}
