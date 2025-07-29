import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreatePickStationDto } from './dto/create-pick_station.dto'
import { UpdateOrderItemDto, UpdateOrderItemsStatusDto, UpdatePickStationDto } from './dto/update-pick_station.dto'
import { PickStation } from './entities/pick_station.entity'
import { Constituency } from '../constituency/entities/constituency.entity'
import { formatResponse, OrderStatus } from 'src/types/types'
import { Order, OrderItem } from 'src/orders/entities/order.entity'
interface ItemT {
  itemId: string;
  status: OrderStatus;
}


@Injectable()
export class PickStationService {
  constructor(
    @InjectRepository(PickStation)
    private readonly pickStationRepository: Repository<PickStation>,
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>

  ) {}

 async updateItemsStatus(orderId: string, items: UpdateOrderItemDto[]) {
  
    // First, verify the order exists and get all its items
    const orderItems = await this.orderItemRepository.find({ where: { order: { id: orderId } } });
    
    if (!orderItems || orderItems.length === 0) {
      throw new Error(`No items found for order ${orderId}`);
    }
  

    // Create a map of items to update for faster lookup
    const itemsToUpdateMap = new Map<string, OrderStatus>();
    items.forEach(item => itemsToUpdateMap.set(item.itemId, item.status));

    // Prepare the updates
    const updates = orderItems
      .filter(item => itemsToUpdateMap.has(item.id))
      .map(item => ({
        id: item.id,
        itemStatus: itemsToUpdateMap.get(item.id),
      }));

    // Batch update the items
    if (updates.length > 0) {
      await this.orderItemRepository.save(updates);
    }
    return formatResponse('success','items update success',null)
  }

  async create(createPickStationDto: CreatePickStationDto) {
    const constituency = await this.constituencyRepository.findOne({
      where: { id: createPickStationDto.constituencyId },
    })
    if (!constituency) throw new Error('Constituency not found')
    const pickStation = this.pickStationRepository.create({
      ...createPickStationDto,
      constituency,
    })
    return this.pickStationRepository.save(pickStation)
  }

  async findAll() {
    const stations = await this.pickStationRepository.find({
      relations: ['constituency', 'constituency.county'],
    })
    return stations.map((station) => {
      const { constituency, ...rest } = station
      const { county, ...constituencyData } = constituency
      return {
        ...rest,
        county,
        constituency: constituencyData,
      }
    })
  }

  async findOne(id: string) {
    const pickUpstations = await this.pickStationRepository.findOne({
  where: {
    owner: { id }
  },
  relations: {
    orders: {
      customer: true, // Include customer details
      // items: true    // Include order items if needed
    },
    // constituency: true // Include constituency if needed
  },
  select: {
    orders: {
      id: true,
      status: true,
      specialInstructions: true,
      created_at: true,
      deliveryOption: true,
      deliveryInstructions: true,
      customer: {
        id: true,
        first_name: true,
        last_name: true,
        phone: true,
        email: true
      }
    },
    id:true,
    name:true,
  }
});
    return formatResponse('success','pick up station fetched', pickUpstations)
  }

  findByCounty(countyId: string) {
    return this.pickStationRepository.find({
      where: { constituency: { county: { id: countyId } } },
      relations: ['constituency'],
    })
  }

  async update(id: string, updatePickStationDto: UpdatePickStationDto) {
    await this.pickStationRepository.update(id, updatePickStationDto)
    return this.findOne(id)
  }


  async getOrderDetailsForPickupStation(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items',
        'pickStation',
        'items.assignment'
      ],
      select: [
        'id',
        'totalAmount',
        'status',
        'created_at',
        'updated_at',
        'deliveryOption',
        'deliveryFee',
        'paymentMethod',
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Transform the order data to hide sensitive information
    const sanitizedOrder = {
      id: order.id,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      deliveryOption: order.deliveryOption,
      deliveryFee: order.deliveryFee,
      paymentMethod: order.paymentMethod,
      itemCount: order.itemCount,
      items: order.items?.map(item => ({
        id: item.id,
        batchGroupId: item.batchGroupId,
        randomCode: item.randomCode,
        quantity: item.quantity,
        itemStatus: item.itemStatus,
        assignmentStatus: item.assignment?.status || null,
      })) || [],
    };

    return formatResponse('success', 'Order details for pickup station', sanitizedOrder);
  }

async dashboardStat(id: string) {
  const pickUpStation = await this.pickStationRepository.findOne({
    where: { owner: { id } },
    relations: [
      'owner',
      'constituency',
      'orders',
      'orders.customer',
      'orders.items'
    ]
  });

  if (!pickUpStation) {
    throw new NotFoundException(`Pickup station not found for owner with id: ${id}`);
  }

  // Count orders by status
  const orderStatusCounts = pickUpStation.orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<OrderStatus, number>);

  // Get recent orders (last 5)
  const recentOrders = pickUpStation.orders
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(order => ({
      id: order.id,
      customer: {
        name: `${order.customer.first_name} ${order.customer.last_name}`,
        phone: order.customer.phone
      },
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.created_at,
      itemCount: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0
    }));

  // Calculate total revenue from delivered/completed orders
  const totalRevenue = pickUpStation.orders
    ?.filter(order => ['delivered', 'completed'].includes(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount), 0) || 0;

  const dashStat = {
    stationDetails: {
      id: pickUpStation.id,
      name: pickUpStation.name,
      contactPhone: pickUpStation.contactPhone,
      openingTime: pickUpStation.openingTime,
      closingTime: pickUpStation.closingTime,
      isOpen: pickUpStation.isOpenNow(),
      constituency: pickUpStation.constituency?.name || null,
      createdAt: pickUpStation.createdAt,
      updatedAt: pickUpStation.updatedAt
    },
    ownerDetails: {
      id: pickUpStation.owner.id,
      name: `${pickUpStation.owner.first_name} ${pickUpStation.owner.last_name}`,
      email: pickUpStation.owner.email,
      phone: pickUpStation.owner.phone,
      role: pickUpStation.owner.role,
      accountStatus: pickUpStation.owner.account_status
    },
    statistics: {
      totalOrders: pickUpStation.orders?.length || 0,
      orderStatusCounts: orderStatusCounts || {},
      totalRevenue,
      averageOrderValue: pickUpStation.orders?.length 
        ? totalRevenue / pickUpStation.orders.length 
        : 0
    },
    recentOrders,
    // additionalInfo: {
    //   // Add any other relevant info here
    //   hasSpecialInstructions: pickUpStation.orders?.some(
    //     order => order.specialInstructions || order.deliveryInstructions
    //   ) || false
    // }
  };

  return formatResponse('success', 'Pickup station dashboard data', dashStat);
}
  async remove(id: string) {
    await this.pickStationRepository.delete(id)
    return { deleted: true }
  }
}
