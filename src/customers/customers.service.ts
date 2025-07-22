import { Injectable } from '@nestjs/common'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'
import { Order } from 'src/orders/entities/order.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}

  private formatResponse(status: 'success' | 'error', message: string, data: any) {
    return { status, message, data }
  }

  async findOne(id: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id } })
      if (!user) {
        return this.formatResponse('error', 'User not found', null)
      }
      return this.formatResponse('success', 'User found', user)
    } catch (error) {
      return this.formatResponse('error', 'An error occurred while fetching user', null)
    }
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
          'constituency',
        ],
        order: {
          created_at: 'DESC',
        },
      })

      const formattedOrders = orders.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        deliveryOption: order.deliveryOption,
        deliveryFee: order.deliveryFee,
        deliveryInstructions: order.deliveryInstructions,
        paymentMethod: order.paymentMethod,
        paymentPhone: order.paymentPhone,
        createdAt: order.created_at,
        pickStation: order.pickStation ?? null,
        constituency: order.constituency ?? null,
        itemCount: order.itemCount,
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
      }))

      return this.formatResponse('success', 'Orders fetched successfully', formattedOrders)
    } catch (error) {
      return this.formatResponse('error', 'An error occurred while fetching orders', null)
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
