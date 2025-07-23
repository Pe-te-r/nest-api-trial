import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { AssignmentStatus, formatResponse, OrderStatus } from 'src/types/types'
import { Driver } from './entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { OrderItem } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'
import { UserRole } from 'src/utils/enums'

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
  const pendingAssignments = driver.assignments.filter(a => a.status === AssignmentStatus.PENDING).length;
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
    pending_assignments: pendingAssignments,
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
  
    // Fetch all assignments with enhanced relations
    const assignments = await this.assignmentRepository.find({
      where: { driver: { id: driver.id } },
      relations: [
        'orderItem',
        'orderItem.order',
        'orderItem.order.customer',
        'orderItem.order.constituency',
        'orderItem.order.constituency.county',
        'orderItem.order.pickStation',
        'orderItem.order.pickStation.constituency',
        'orderItem.order.pickStation.constituency.county',
        'orderItem.product',
        'orderItem.product.store',
        'orderItem.product.store.constituency',
        'orderItem.product.store.constituency.county',
        'orderItem.vendor',
        'orderItem.vendor.constituency',
        'orderItem.vendor.constituency.county'
      ],
      order: { created_at: 'DESC' }
    });

    console.log(assignments);
  
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
      const firstAssignment = batchAssignments[0];
      const order = firstAssignment.orderItem.order;
      const customer = order.customer;
      const orderItemIds = this.getOrderItemIds(assignments);
  
      // Get all products in this batch with vendor details
      const products = batchAssignments.map((assignment: Assignment) => {
        const orderItem = assignment.orderItem;
        const product = orderItem.product;
        const vendor = orderItem.vendor;
        const store = product.store;

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
            contactPhone: vendor.businessContact,
            location: {
              constituency: vendor.constituency?.name,
              county: vendor.constituency?.county?.county_name,
              fullAddress: `${vendor.businessName}, ${vendor.constituency?.name}, ${vendor.constituency?.county?.county_name} County`
            }
          } : null,
          store: store ? {
            id: store.id,
            name: store.businessName,
            contactPhone: store.businessContact,
            location: {
              constituency: store.constituency?.name,
              county: store.constituency?.county?.county_name,
              fullAddress: `${store.businessName}, ${store.constituency?.name}, ${store.constituency?.county?.county_name} County`
            }
          } : null
        };
      });

      // Calculate totals
      const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
      const totalAmount = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

      // Prepare pickup locations (unique vendors/stores)
      const pickupLocations = products.reduce((locations, product) => {
        if (product.vendor) {
          const vendorKey = `${product.vendor.id}-${product.vendor.location?.fullAddress}`;
          if (!locations.vendors[vendorKey]) {
            locations.vendors[vendorKey] = {
              type: 'vendor',
              ...product.vendor
            };
          }
        }
        if (product.store) {
          const storeKey = `${product.store.id}-${product.store.location?.fullAddress}`;
          if (!locations.stores[storeKey]) {
            locations.stores[storeKey] = {
              type: 'store',
              ...product.store
            };
          }
        }
        return locations;
      }, { vendors: {}, stores: {} });

      // Combine all pickup locations
      const allPickupLocations = [
        ...Object.values(pickupLocations.vendors),
        ...Object.values(pickupLocations.stores)
      ];

      // Prepare destination details
      const isPickup = order.deliveryOption === 'pickup';
      const destinationDetails = isPickup ? {
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
      } : {
        type: 'delivery',
        location: {
          constituency: order.constituency?.name,
          county: order.constituency?.county?.county_name,
          countyCode: order.constituency?.county?.county_code,
          fullAddress: `${order.constituency?.name}, ${order.constituency?.county?.county_name} County`
        }
      };

      return {
        batchId: batchId === 'ungrouped' ? null : batchId,
        orderId: order.id,
        orderItemIds: orderItemIds,
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
          name: `${customer.first_name} ${customer.last_name || ''}`.trim(),
          phone: customer.phone,
          email: customer.email
        } : null,
        products,
        pickupLocations: allPickupLocations,
        destination: destinationDetails,
        timeline: {
          created: order.created_at,
          readyForPickup: order.status === OrderStatus.READY_FOR_PICKUP ? order.updated_at : null,
          pickedUp: order.status === OrderStatus.IN_TRANSIT ? order.updated_at : null,
          delivered: order.status === OrderStatus.COMPLETED ? order.updated_at : null
        },
        verification: {
          pickupCode: isPickup ? firstAssignment.orderItem.randomCode : null,
          requiresVerification: isPickup
        }
      };
    });
  
    return {
      status: 'success',
      message: 'Driver orders fetched successfully',
      data: {
        driver: {
          id: driver.id,
          name: `${driver.user.first_name} ${driver.user.last_name || ''}`.trim(),
          status: driver.status,
          vehicleType: driver.vehicle_type,
          licensePlate: driver.license_plate,
          contactPhone: driver.user.phone
        },
        orders: groupedOrders
      }
    };
}
private  getOrderItemIds(assignments: any[]): string[] {
  return assignments
    .map((assignment) => assignment?.orderItem?.id)
    .filter(Boolean); // removes undefined/null entries
}
}
