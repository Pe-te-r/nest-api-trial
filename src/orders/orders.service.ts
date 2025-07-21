import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto, UpdateOrderItemDto } from './dto/update-order.dto'
import { Order, OrderItem } from './entities/order.entity'
import { Customer } from '../customers/entities/customer.entity'
import { Store } from '../stores/entities/store.entity'
import { Product } from '../products/entities/product.entity'
import { AssignmentStatus, DriverStatus, formatResponse, OrderStatus } from 'src/types/types'
import { User } from 'src/user/entities/user.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { PickStation } from 'src/pick_station/entities/pick_station.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { Driver } from 'src/driver/entities/driver.entity'
import { DataSource } from 'typeorm'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
    @InjectRepository(PickStation)
    private readonly pickStationRepository: Repository<PickStation>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly dataSource: DataSource,
  ) {}

  async addCodeToOrder(batchGroupId: string) {
    const batchItems = await this.orderItemRepository.find({ where: { batchGroupId } });
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    await this.orderItemRepository.update(batchItems.map(item => item.id), { randomCode: code });
  }
  
  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.userRepository.findOne({
      where: { id: createOrderDto.customer_id },
    });
    if (!customer) throw new NotFoundException('Customer not found');
  
    const items: OrderItem[] = [];
    for (const prod of createOrderDto.products) {
      const product = await this.productRepository.findOne({ 
        where: { id: prod.item_id },
        relations: ['store']
      });
      const vendor = await this.storeRepository.findOne({ 
        where: { id: prod.store_id },
        relations: ['constituency.county']
      });
      
      if (!product || !vendor) throw new Error('Product or Store not found');
      
      // Check stock and reduce quantity
      if (product.stock < prod.quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }
      await this.productRepository.decrement(
        { id: product.id },
        'stock',
        prod.quantity
      );
  
      // Create item with batch group
      const item = this.orderItemRepository.create({
        product,
        vendor,
        quantity: prod.quantity,
        batchGroupId: `${vendor.id}-${vendor.constituency.county.id}`
      });
      items.push(item);
    }
    let constituency: Constituency | null = null
    let pickStation: PickStation | null = null
    if( createOrderDto.delivery.option === 'delivery'){
      constituency = await this.constituencyRepository.findOne({ where: { id: createOrderDto.subCounty } })
      if(!constituency) throw new NotFoundException('Constituency not found')
    }else if(createOrderDto.delivery.option === 'pickup'){
      pickStation = await this.pickStationRepository.findOne({ where: { id: createOrderDto.subCounty } })
      if(!pickStation) throw new NotFoundException('Pick station not found')
    }
    const order = this.orderRepository.create({
      customer,
      totalAmount: createOrderDto.totalAmount,
      specialInstructions: createOrderDto.delivery.instructions,
      deliveryOption: createOrderDto.delivery.option,
      deliveryFee: createOrderDto.delivery.fee,
      deliveryInstructions: createOrderDto.delivery.instructions,
      paymentMethod: createOrderDto.payment.method,
      paymentPhone: createOrderDto.payment.phone,
      items,
      constituency,
      pickStation
    })
    await this.orderRepository.save(order);

    // Get all unique batchGroupIds from the items
    const uniqueBatchGroupIds = [...new Set(items.map(item => item.batchGroupId))];

    // For each batchGroupId, assign a random code to all items in that group
    for (const batchGroupId of uniqueBatchGroupIds) {
      await this.addCodeToOrder(batchGroupId);
    }
    return formatResponse('success', 'Order created successfully', null)
  }

  // Get all orders (summary view)
  async findAll() {
    const orders = await this.orderRepository.find({
      relations: ['customer', 'items'], // Basic relations
      select: {
        id: true,
        totalAmount: true,
        status: true,
        paymentMethod: true,
        created_at: true,
        paymentPhone: true,
        customer: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
      },
      order: {
        created_at: 'DESC',
        
      },
    })
    return formatResponse('success', 'Orders retrieved successfully', orders)
  }
  async findOne(id: string, viewType: 'admin' | 'customer' = 'admin') {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'items',
        'items.product',
        'items.vendor',
        'items.vendor.constituency',
        'items.vendor.constituency.county',
        'pickStation',
        'pickStation.constituency',
        'pickStation.constituency.county',
        'constituency',
        'constituency.county',
        'items.assignment',
        'items.assignment.driver',
        'items.assignment.driver.user'
      ],
    });
  
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    // Base response structure
    const baseResponse = {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      deliveryOption: order.deliveryOption,
      deliveryFee: order.deliveryFee,
      deliveryInstructions: order.deliveryInstructions,
      paymentMethod: order.paymentMethod,
      paymentPhone: order.paymentPhone,
      specialInstructions: order.specialInstructions,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    };
  
    // Enhanced location details
    const locationDetails = {
      pickupDetails: order.deliveryOption === 'pickup' && order.pickStation ? {
        id: order.pickStation.id,
        name: order.pickStation.name,
        contactPhone: order.pickStation.contactPhone,
        openingHours: `${order.pickStation.openingTime} - ${order.pickStation.closingTime}`,
        constituency: order.pickStation.constituency?.name,
        county: order.pickStation.constituency?.county?.county_name,
        fullAddress: [
          order.pickStation.name,
          order.pickStation.constituency?.name,
          order.pickStation.constituency?.county?.county_name
        ].filter(Boolean).join(', ')
      } : null,
      deliveryDetails: order.deliveryOption === 'delivery' && order.constituency ? {
        constituency: order.constituency.name,
        county: order.constituency.county?.county_name,
        fullAddress: [
          order.constituency.name,
          order.constituency.county?.county_name
        ].filter(Boolean).join(', ')
      } : null
    };
  
    if (viewType === 'admin') {
      // Admin view - full details
      const adminResponse = {
        ...baseResponse,
        ...locationDetails,
        customer: {
          id: order.customer?.id,
          name: `${order.customer?.first_name} ${order.customer?.last_name}`,
          email: order.customer?.email,
          phone: order.customer?.phone,
          accountStatus: order.customer?.account_status
        },
        items: order.items?.map(item => ({
          id: item.id,
          product: {
            id: item.product?.id,
            name: item.product?.name,
            price: item.product?.price,
            imageUrl: item.product?.imageUrl,
            description: item.product?.description
          },
          vendor: {
            id: item.vendor?.id,
            businessName: item.vendor?.businessName,
            contact: item.vendor?.businessContact,
            address: item.vendor?.streetAddress,
            location: item.vendor?.constituency ? {
              constituency: item.vendor.constituency.name,
              county: item.vendor.constituency.county?.county_name
            } : null
          },
          quantity: item.quantity,
          status: item.itemStatus,
          assignedDriver: item.assignment?.driver ? {
            id: item.assignment.driver.id,
            name: `${item.assignment.driver.user.first_name} ${item.assignment.driver.user.last_name}`,
            phone: item.assignment.driver.user.phone,
            vehicleType: item.assignment.driver.vehicle_type,
            licensePlate: item.assignment.driver.license_plate,
            assignmentStatus: item.assignment.status
          } : null
        })) || []
      };
      return formatResponse('success', 'Order details retrieved', adminResponse);
    } else {
      // Customer view - limited details
      const customerResponse = {
        ...baseResponse,
        ...locationDetails,
        customer: {
          name: `${order.customer?.first_name} ${order.customer?.last_name}`
        },
        items: order.items?.map(item => ({
          id: item.id,
          product: {
            name: item.product?.name,
            price: item.product?.price,
            imageUrl: item.product?.imageUrl
          },
          quantity: item.quantity,
          status: item.itemStatus,
          estimatedDelivery: item.itemStatus === 'in_transit' ? 
            new Date(item.order.created_at.getTime() + 2*60*60*1000).toISOString() : null
        })) || [],
        supportContact: {
          phone: '+254712345678',
          email: 'support@example.com'
        }
      };
      return formatResponse('success', 'Order details retrieved', customerResponse);
    }
  }
  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.orderRepository.update(id, updateOrderDto)
    return this.findOne(id)
  }

    async updateStatusItem(id: string, updateOrderDto: UpdateOrderItemDto) {
      const item = await this.orderItemRepository.findOne({ where: { id } });
      if (!item) throw new NotFoundException('Item not found');
    
      await this.orderItemRepository.update(id, { 
        itemStatus: updateOrderDto.itemStatus,
      });
    
      // Check if batch is ready
      if (updateOrderDto.itemStatus === OrderStatus.READY_FOR_PICKUP && item.batchGroupId) {
        await this.checkBatchReadiness(item.batchGroupId);
      }
  
    
      return formatResponse('success', 'Item status updated successfully', null);
  }

  async remove(id: string) {
    await this.orderRepository.delete(id)
    return formatResponse('success', 'Order deleted successfully', null)  
  }

  private async checkBatchReadiness(batchGroupId: string) {
    // Get all items in this batch
    const batchItems = await this.orderItemRepository.find({
      where: { batchGroupId },
      relations: ['vendor.constituency.county']
    });

    // Check if all items in batch are ready
    const allReady = batchItems.every(
      item => item.itemStatus === OrderStatus.READY_FOR_PICKUP
    );

    if (allReady) {
      await this.assignDriverToBatch(batchGroupId);
    }
  }

  private async assignDriverToBatch(batchGroupId: string) {
    const [vendorId, countyId] = batchGroupId.split('-');
    
    // 1. Find available driver
    const driver = await this.driverRepository.findOne({ where: { status: DriverStatus.AVAILABLE } });
    if (!driver) {
      throw new NotFoundException('No available drivers in this county');
    }

    // 2. Get all items in batch
    const batchItems = await this.orderItemRepository.find({
      where: { batchGroupId }
    });

    // 3. Create assignments for each item
    const assignments = await this.dataSource.transaction(async manager => {
      const assignmentRepo = manager.getRepository(Assignment);
      
      const createdAssignments = await Promise.all(
        batchItems.map(item => 
          assignmentRepo.save(
            assignmentRepo.create({
              driver,
              orderItem: item,
              status: AssignmentStatus.ACCEPTED
            })
          )
        )
      );
      })

    // 4. Update all items to ready for pickup
    // await this.orderItemRepository.update(
    //   { id: In(batchItems.map(i => i.id)) },
    //   { itemStatus: OrderStatus.READY_FOR_PICKUP }
    // );

  } 

}
