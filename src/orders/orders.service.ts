import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateOrderDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order, OrderItem } from './entities/order.entity'
import { Customer } from '../customers/entities/customer.entity'
import { Store } from '../stores/entities/store.entity'
import { Product } from '../products/entities/product.entity'
import { formatResponse } from 'src/types/types'
import { User } from 'src/user/entities/user.entity'

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
  ) { }

  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.userRepository.findOne({
      where: { id: createOrderDto.customer_id },
    })
    console.log('User found:', customer)
    if (!customer) throw new NotFoundException('Customer not found')

    // Map products to OrderItems
    const items: OrderItem[] = []
    for (const prod of createOrderDto.products) {
      const product = await this.productRepository.findOne({ where: { id: prod.item_id } })
      const vendor = await this.storeRepository.findOne({ where: { id: prod.store_id } })
      if (!product || !vendor) throw new Error('Product or Store not found')
      const item = this.orderItemRepository.create({
        product,
        vendor,
        quantity: prod.quantity,
      })
      items.push(item)
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
      // scheduledPickupTime: createOrderDto.delivery.scheduledPickupTime, // Uncomment if you add this to DTO/entity
    })
    await this.orderRepository.save(order)
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

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product', 'items.vendor'],
      select: {
        id: true,
        totalAmount: true,
        status: true,
        specialInstructions: true,
        deliveryOption: true,
        deliveryFee: true,
        deliveryInstructions: true,
        paymentMethod: true,
        paymentPhone: true,
        created_at: true,
        updated_at: true,
        customer: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          account_status: true,
        },
        items: {
          id: true,
          quantity: true,
          itemStatus: true,
          product: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            description: true,
            isAvailable: true,
          },
          vendor: {
            id: true,
            businessName: true,
            businessContact: true,
            streetAddress: true,
            approved: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return formatResponse('success', 'Order retrieved successfully', order);
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.orderRepository.update(id, updateOrderDto)
    return this.findOne(id)
  }

  async remove(id: string) {
    await this.orderRepository.delete(id)
    return { deleted: true }
  }
}
