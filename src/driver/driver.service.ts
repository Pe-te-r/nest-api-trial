import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AssignmentStatus, formatResponse, OrderStatus } from 'src/types/types'
import { Driver } from './entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'
import { UserRole } from 'src/utils/enums'
import { Store } from 'src/stores/entities/store.entity'

type Assignments = {
  id: string;
  driver: any;
  orderItem: {
    id: string;
    [key: string]: any;
  };
  [key: string]: any;
};

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}
  async create(createDriverDto: CreateDriverDto) {
    const { userId,  status, vehicle_type, license_plate } = createDriverDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user){
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const driver = this.driverRepository.create({
      
      status: status as import('src/types/types').DriverStatus,
      vehicle_type: vehicle_type as import('src/types/types').VehicleType,
      license_plate,
      user: user,
    });
    user.role = 'driver' as UserRole;
    await this.userRepository.save(user);
    await this.driverRepository.save(driver);
    return formatResponse('success', 'Driver created successfully', null);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({ relations: ['user', 'assignments'] });
  }

async findDriverDashboard(id: string) {
  const driver = await this.driverRepository.findOne({
    where: { user: { id } },
    relations: ['user', 'assignments', 'assignments.orderItem'],
  });

  if (!driver) throw new NotFoundException(`Driver with id ${id} not found`);

  const totalAssignments = driver.assignments.length;
  const completedAssignments = driver.assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length;
  const inProgressAssignments = driver.assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length;

  const dashboardData = {
    id: driver.id,
    name: `${driver.user.first_name} ${driver.user.last_name ?? ''}`.trim(),
    email: driver.user.email,
    phone: driver.user.phone,
    status: driver.status,
    vehicle_type: driver.vehicle_type,
    license_plate: driver.license_plate,
    total_assignments: totalAssignments,
    completed_assignments: completedAssignments,
    in_progress_assignments: inProgressAssignments,
    created_at: driver.created_at,
    updated_at: driver.updated_at,
  };

  return formatResponse('success', 'Driver dashboard fetched successfully', dashboardData);
}


  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['user', 'assignments'],
    });
    if (!driver) throw new NotFoundException(`Driver with id ${id} not found`);
    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.driverRepository.findOne({ where: { id } });
    if (!driver) throw new NotFoundException(`Driver with id ${id} not found`);
    if (updateDriverDto.userId) {
      driver.user = { id: updateDriverDto.userId } as any;
    }
    if (updateDriverDto.status !== undefined) driver.status = updateDriverDto.status as import('src/types/types').DriverStatus;
    if (updateDriverDto.vehicle_type !== undefined) driver.vehicle_type = updateDriverDto.vehicle_type as import('src/types/types').VehicleType;
    if (updateDriverDto.license_plate !== undefined) driver.license_plate = updateDriverDto.license_plate;
    return await this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.driverRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Driver with id ${id} not found`);
    return { deleted: true };
  }
async findDriverOrders(userId: string, status?: AssignmentStatus) {
  // Verify user exists
  const user = await this.userRepository.findOne({ 
    where: { id: userId } 
  });
  
  if (!user) {
    throw new NotFoundException(`User with id ${userId} not found`);
  }
  console.log('User found:', user.id, user.first_name, user.last_name);

  // Find driver with user relation
  const driver = await this.driverRepository.findOne({
    where: { user: { id: userId } },
    relations: ['user']
  });

  if (!driver) {
    throw new NotFoundException('Driver not found');
  }
  console.log('driver found:', driver.id, driver.user.first_name, driver.user.last_name);

  // Build where clause based on status filter
  const where: any = { driver: { id: driver.id } };
  if (status) {
    where.status = status;
  }
  console.log('Fetching assignments with where clause:', where);

  // Fetch all assignments with enhanced relations
  const assignments = await this.assignmentRepository.find({
    where,
    relations: [
      'orderItems',
      'orderItems.order',
      'orderItems.order.customer',
      'orderItems.order.constituency',
      'orderItems.order.constituency.county',
      'orderItems.order.pickStation',
      'orderItems.order.pickStation.constituency',
      'orderItems.order.pickStation.constituency.county',
      'orderItems.product',
      'orderItems.vendor',
      'orderItems.vendor.constituency',
      'orderItems.vendor.constituency.county'
    ],
    order: { created_at: 'DESC' }
  });
  console.log('Assignments fetched:', assignments.length);

  if (!assignments || assignments.length === 0) {
    return formatResponse('success', 'No orders found for this driver', {
      driver: this.mapDriverDetails(driver),
      assignments: []
    });
  }

  // Process each assignment
  const processedAssignments = assignments.map(assignment => {
    // All order items in an assignment should have the same vendor
    const firstOrderItem = assignment.orderItems[0];
    const vendor = firstOrderItem.vendor;
    console.log('Processing assignment:', assignment.id, 'with vendor:', vendor.id);
    
    // Group order items by their order (since one assignment can have items from multiple orders)
    const ordersMap = new Map<string, any>();
    
    assignment.orderItems.forEach(orderItem => {
      console.log('Processing order item:', orderItem.id);
      const order = orderItem.order;
      if (!ordersMap.has(order.id)) {
        ordersMap.set(order.id, {
          ...order,
          items: [],
          destination: this.getDestinationDetails(order)
        });
      }
      ordersMap.get(order.id).items.push(this.mapOrderItemDetails(orderItem));
    });

    return {
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
      createdAt: assignment.created_at,
      updatedAt: assignment.updated_at,
      vendor: this.mapVendorDetails(vendor),
      orders: Array.from(ordersMap.values()).map(order => ({
        orderId: order.id,
        customer: this.mapCustomerDetails(order.customer),
        status: order.status,
        deliveryOption: order.deliveryOption,
        deliveryFee: order.deliveryFee,
        totalAmount: order.totalAmount,
        specialInstructions: order.specialInstructions,
        deliveryInstructions: order.deliveryInstructions,
        paymentMethod: order.paymentMethod,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        destination: order.destination,
        items: order.items
      }))
    };
  });

  return formatResponse('success', 'Driver orders fetched successfully', {
    driver: this.mapDriverDetails(driver),
    assignments: processedAssignments
  });
}

// Helper methods for mapping entities to DTOs
private mapDriverDetails(driver: Driver) {
  return {
    id: driver.id,
    name: `${driver.user.first_name} ${driver.user.last_name || ''}`.trim(),
    status: driver.status,
    vehicleType: driver.vehicle_type,
    licensePlate: driver.license_plate,
    contactPhone: driver.user.phone
  };
}

private mapVendorDetails(vendor: Store) {
  return {
    id: vendor.id,
    name: vendor.businessName,
    contactPhone: vendor.businessContact,
    location: {
      constituency: vendor.constituency?.name,
      county: vendor.constituency?.county?.county_name,
      fullAddress: `${vendor.businessName}, ${vendor.constituency?.name}, ${vendor.constituency?.county?.county_name} County`
    }
  };
}

private mapCustomerDetails(customer: User) {
  return {
    id: customer.id,
    name: `${customer.first_name} ${customer.last_name || ''}`.trim(),
    phone: customer.phone,
    email: customer.email
  };
}

private mapOrderItemDetails(orderItem: OrderItem) {
  return {
    id: orderItem.id,
    productId: orderItem.product.id,
    productName: orderItem.product.name,
    price: orderItem.product.price,
    imageUrl: orderItem.product.imageUrl,
    quantity: orderItem.quantity,
    itemStatus: orderItem.itemStatus,
    randomCode: orderItem.randomCode
  };
}

private getDestinationDetails(order: Order) {
  const isPickup = order.deliveryOption === 'pickup';
  
  if (isPickup) {
    return {
      type: 'pickup',
      station: {
        id: order.pickStation?.id,
        name: order.pickStation?.name,
        contactPhone: order.pickStation?.contactPhone,
        openingHours: `${order.pickStation?.openingTime} - ${order.pickStation?.closingTime}`,
        isOpenNow: order.pickStation?.isOpenNow(),
        location: {
          constituency: order.pickStation?.constituency?.name,
          county: order.pickStation?.constituency?.county?.county_name,
          fullAddress: `${order.pickStation?.name}, ${order.pickStation?.constituency?.name}, ${order.pickStation?.constituency?.county?.county_name} County`
        }
      }
    };
  } else {
    return {
      type: 'delivery',
      location: {
        constituency: order.constituency?.name,
        county: order.constituency?.county?.county_name,
        countyCode: order.constituency?.county?.county_code,
        fullAddress: `${order.constituency?.name}, ${order.constituency?.county?.county_name} County`
      }
    };
  }
}
private  getOrderItemIds(assignments: any[]): string[] {
  return assignments
    .map((assignment) => assignment?.orderItem?.id)
    .filter(Boolean); // removes undefined/null entries
}
}
