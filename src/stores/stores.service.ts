import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CreateStoreDto } from './dto/create-store.dto'
import { UpdateStoreDto } from './dto/update-store.dto'
import { Store } from './entities/store.entity'
import { User } from 'src/user/entities/user.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { formatResponse } from 'src/types/types'
import { UserRole } from 'src/utils/enums'
import { OrderItem } from 'src/orders/entities/order.entity'

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OrderItem)
    private readonly ordersItemsRepository: Repository<OrderItem>,
    @InjectRepository(Constituency)
    private readonly constituencyRepository: Repository<Constituency>,
  ) { }

  async create(createStoreDto: CreateStoreDto) {
    console.log('data received', createStoreDto)
    // Verify user exists
    const user = await this.userRepository.findOneBy({ id: createStoreDto.userId })
    if (!user) {
      throw new NotFoundException(`User with ID ${createStoreDto.userId} not found`)
    }

    // Verify constituency exists
    const constituency = await this.constituencyRepository.findOneBy({
      id: createStoreDto.constituencyId,
    })
    if (!constituency) {
      throw new NotFoundException(`Constituency with ID ${createStoreDto.constituencyId} not found`)
    }

    // Create new store
    const store = this.storeRepository.create({
      ...createStoreDto,
      user,
      constituency,
    })

    await this.storeRepository.save(store)
    return formatResponse('success', 'Store created success wait for review', null)
  }

  async findAll(): Promise<Store[]> {
    return this.storeRepository.find({
      relations: ['user', 'constituency', 'constituency.county'],
    })
  }
  async findForAdmin() {
    const shops = await this.storeRepository.find({
      relations: {
        user: true,
        constituency: true,
      },
      select: {
        id: true,
        businessName: true,
        businessDescription: true,
        businessType: true,
        businessContact: true,
        streetAddress: true,
        approved: true,
        user: {
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
        },
        constituency: {
          name: true,
        },
      },
    })

    const formattedShops = shops.map((shop) => ({
      id: shop.id,
      businessName: shop.businessName,
      businessDescription: shop.businessDescription,
      businessType: shop.businessType,
      businessContact: shop.businessContact,
      streetAddress: shop.streetAddress,
      approved: shop.approved,
      user: {
        first_name: shop.user.first_name,
        last_name: shop.user.last_name,
        email: shop.user.email,
        phone: shop.user.phone,
      },
      constituency: {
        name: shop.constituency.name,
      },
    }))

    return formatResponse('success', 'Shops retrieved successfully', formattedShops)
  }
  async findOne(id: string): Promise<Store> {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['user', 'constituency', 'constituency.county'],
    })

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }

    return store
  }
  async findVendorOrders(vendorId: string) {
    const orders = await this.ordersItemsRepository.find({
      where: {
        vendor: { user: { id: vendorId } },
      },
      relations: [
        'order',
        'order.customer',
        'order.pickStation',
        'order.constituency',
        'product',
        'vendor'
      ],
      select: {
        id: true,
        quantity: true,
        itemStatus: true,
        order: {
          id: true,
          status: true,
          totalAmount: true,
          created_at: true,
          deliveryOption: true,
          deliveryInstructions: true,
          customer: {
            id: true,
            first_name: true,
            last_name: true,
          },
          pickStation: {
            id: true,
            name: true,
            constituency:{
              name:true,
            }

          },
          constituency: {
            id: true,
            name: true,
          }
        },
        product: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
        },
        vendor: {
          id: true,
          businessName: true,
        },
      },
      order: {
        order: {
          created_at: 'DESC',
        },
      },
    });

    if (!orders.length) {
      throw new NotFoundException('No orders found for this vendor');
    }

    // Optionally, shape the response to show only the relevant location
    const result = orders.map(item => ({
      ...item,
      deliveryLocation:
        item.order.deliveryOption === 'pickup'
          ? item.order.pickStation
          : item.order.constituency,
      deliveryType: item.order.deliveryOption,
    }));

    return formatResponse('success', 'Vendor orders retrieved', result);
  }
  
  async checkIfApplied(id: string) {
    const user = await this.userRepository.findOne({ where: { id }, relations: { store: true } })
    if (!user) throw new NotFoundException('These user not found')
    const store = user.store
    return formatResponse('success', 'Applied already available', store?.approved)
  }

  async update(id: string, updateStoreDto: UpdateStoreDto) {
    // Start a transaction to ensure both updates succeed or fail together
    return this.storeRepository.manager.transaction(async (transactionalEntityManager) => {
      // Find the store with its user relation
      const store = await transactionalEntityManager.findOne(Store, {
        where: { id },
        relations: ['user'], // Make sure to include the user relation
      })

      if (!store) {
        throw new NotFoundException(`Store with ID ${id} not found`)
      }

      // Update store properties
      Object.assign(store, updateStoreDto)

      // If the store is being approved and the user is currently a customer
      if (updateStoreDto.approved && store.user.role === UserRole.CUSTOMER) {
        // Update the user's role
        store.user.role = UserRole.VENDOR
        await transactionalEntityManager.save(store.user)
      }

      // Save the store
      await transactionalEntityManager.save(store)

      return formatResponse('success', 'Store updated successfully', null)
    })
  }

  async remove(id: string): Promise<void> {
    const result = await this.storeRepository.delete(id)
    if (result.affected === 0) {
      throw new NotFoundException(`Store with ID ${id} not found`)
    }
  }
}
