import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateOrderDto, CreateOrderItemDto } from './dto/create-order.dto'
import { UpdateOrderDto } from './dto/update-order.dto'
import { Order, OrderItem } from './entities/order.entity'
import { Customer } from '../customers/entities/customer.entity'
import { Store } from '../stores/entities/store.entity'
import { Product } from '../products/entities/product.entity'

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const customer = await this.customerRepository.findOne({ where: { user: { id: createOrderDto.customer_id } } })
    if (!customer) throw new Error('Customer not found')

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
    return await this.orderRepository.save(order)
  }

  findAll() {
    return this.orderRepository.find({ relations: ['customer', 'items', 'items.product', 'items.vendor'] })
  }

  findOne(id: string) {
    return this.orderRepository.findOne({ where: { id }, relations: ['customer', 'items', 'items.product', 'items.vendor'] })
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
