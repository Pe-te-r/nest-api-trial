import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from 'src/orders/entities/order.entity'
import { formatResponse, OrderStatus } from 'src/types/types'
import { Driver } from './entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { OrderItem } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'
import { UserRole } from 'src/utils/enums'

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
  async findDriverOrders(userId: string) {
    // Verify user exists
    const user = await this.userRepository.findOne({ 
      where: { id: userId } 
    });
    
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
  
    // Find driver with user relation
    const driver = await this.driverRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });
  
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
  
    // Fetch all assignments with correct relations
    const assignments = await this.assignmentRepository.find({
      where: { driver: { id: driver.id } },
      relations: [
        'orderItem',
        'orderItem.order',
        'orderItem.order.customer',
        'orderItem.order.constituency',
        'orderItem.order.constituency.county',
        'orderItem.order.pickStation',
        'orderItem.product',
        'orderItem.product.store',
        'orderItem.vendor'
      ],
      order: { created_at: 'DESC' }
    });
  
    if (!assignments || assignments.length === 0) {
      throw new NotFoundException('No orders found for this driver');
    }
  
    // Group assignments by batchGroupId
    const groupedByBatch = assignments.reduce((acc, assignment) => {
      const batchId = assignment.orderItem.batchGroupId || 'ungrouped';
      if (!acc[batchId]) {
        acc[batchId] = [];
      }
      acc[batchId].push(assignment);
      return acc;
    }, {});
  
    // Transform grouped data for frontend
    const groupedOrders = Object.entries(groupedByBatch).map(([batchId, batchAssignments]: [string, Assignment[]]) => {
      // Take the first assignment as reference for common order details
      const firstAssignment = batchAssignments[0] as Assignment;
      const order = firstAssignment.orderItem.order;
      const customer = order.customer;
  
      // Get all products in this batch
      const products = batchAssignments.map((assignment: Assignment) => {
        const orderItem = assignment.orderItem;
        const product = orderItem.product;
        const vendor = orderItem.vendor;
  
        return {
          assignmentId: assignment.id,
          assignmentStatus: assignment.status,
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: orderItem.quantity,
          itemStatus: orderItem.itemStatus,
          vendor: vendor ? {
            id: vendor.id,
            name: vendor.businessName,
            contactPhone: vendor.businessContact
          } : null
        };
      });
  
      // Calculate total quantity and amount for the batch
      const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
      const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  
      return {
        batchId: batchId === 'ungrouped' ? null : batchId,
        orderId: order.id,
        orderStatus: order.status,
        orderCreatedAt: order.created_at,
        orderUpdatedAt: order.updated_at,
        deliveryOption: order.deliveryOption,
        deliveryFee: order.deliveryFee,
        totalAmount,
        totalQuantity,
        specialInstructions: order.specialInstructions,
        deliveryInstructions: order.deliveryInstructions,
        paymentMethod: order.paymentMethod,
        customer: customer ? {
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          phone: customer.phone,
          email: customer.email
        } : null,
        products,
        location: {
          type: order.deliveryOption === 'pickup' ? 'pickup' : 'delivery',
          pickupStation: order.pickStation ? {
            id: order.pickStation.id,
            name: order.pickStation.name,
            contactPhone: order.pickStation.contactPhone,
            openingTime: order.pickStation.openingTime,
            closingTime: order.pickStation.closingTime,
            isOpenNow: order.pickStation.isOpenNow()
          } : null,
          deliveryAddress: order.constituency ? {
            constituency: order.constituency.name,
            county: order.constituency.county?.county_name,
            countyCode: order.constituency.county?.county_code
          } : null
        },
        timeline: {
          created: order.created_at,
          readyForPickup: order.status === OrderStatus.READY_FOR_PICKUP ? order.updated_at : null,
          pickedUp: order.status === OrderStatus.IN_TRANSIT ? order.updated_at : null,
          delivered: order.status === OrderStatus.COMPLETED ? order.updated_at : null
        }
      };
    });
  
    return formatResponse('success', 'Driver orders fetched successfully', {
      driver: {
        id: driver.id,
        name: `${driver.user.first_name} ${driver.user.last_name}`,
        status: driver.status,
        vehicleType: driver.vehicle_type,
        licensePlate: driver.license_plate
      },
      orders: groupedOrders
    });
  }
}
