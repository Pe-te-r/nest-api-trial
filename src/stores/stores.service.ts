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
import { Order, OrderItem } from 'src/orders/entities/order.entity'

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
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
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

async findOne(id: string, isAdmin: boolean = true) {
  const store = await this.storeRepository.findOne({
    where: { id },
    relations: [
      'user',
      'constituency',
      'constituency.county',
      'products' // We'll use this to check product existence
    ],
  });

  if (!store) {
    throw new NotFoundException(`Store with ID ${id} not found`);
  }

  // Get order count for this store
  const orderCount = await this.orderRepository.count({
    where: {
      items: {
        vendor: { id: store.id }
      }
    }
  });

  const baseResponse = {
    id: store.id,
    businessName: store.businessName,
    businessDescription: store.businessDescription,
    businessType: store.businessType,
    businessContact: store.businessContact,
    streetAddress: store.streetAddress,
    approved: store.approved,
    hasProducts: store.products.length > 0,
    productCount: store.products.length,
    orderCount,
    location: {
      constituency: store.constituency?.name,
      county: store.constituency?.county?.county_name,
    },
    createdAt: store.user?.created_at,
    updatedAt: store.user?.updated_at,
  };

  if (isAdmin) {
    const adminResponse = {
      ...baseResponse,
      vendorDetails: {
        id: store.user?.id,
        firstName: store.user?.first_name,
        lastName: store.user?.last_name,
        email: store.user?.email,
        phone: store.user?.phone,
        role: store.user?.role,
        isVerified: store.user?.is_verified,
        accountStatus: store.user?.account_status,
        lastLogin: store.user?.session?.last_login,
      },
      termsAccepted: store.termsAccepted,
      approvalStatus: store.approved,
      // Add any other admin-specific fields
    };

    return formatResponse('success', 'Store details retrieved (admin view)', adminResponse);
  }

  return formatResponse('success', 'Store details retrieved', baseResponse);
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
        'order.pickStation.constituency',
        'order.pickStation.constituency.county',
        'order.constituency',
        'order.constituency.county',
        'product',
        'vendor'
      ],
      select: {
        id: true,
        quantity: true,
        itemStatus: true,
        randomCode: true,
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
            contactPhone: true,
            constituency: {
              id: true,
              name: true,
              county: {
                id: true,
                county_name: true,
              }
            }
          },
          constituency: {
            id: true,
            name: true,
            county: {
              id: true,
              county_name: true,
            }
          }
        },
        product: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
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
    
    // Transform the response to include proper location information
    const result = orders.map(item => {
      const isPickup = item.order.deliveryOption === 'pickup';
      
      const locationInfo = isPickup
        ? {
            type: 'pickup',
            station: {
              id: item.order.pickStation?.id,
              name: item.order.pickStation?.name,
              contactPhone: item.order.pickStation?.contactPhone,
            },
            constituency: {
              id: item.order.pickStation?.constituency?.id,
              name: item.order.pickStation?.constituency?.name,
            },
            county: {
              id: item.order.pickStation?.constituency?.county?.id,
              name: item.order.pickStation?.constituency?.county?.county_name,
            }
          }
        : {
            type: 'delivery',
            constituency: {
              id: item.order.constituency?.id,
              name: item.order.constituency?.name,
            },
            county: {
              id: item.order.constituency?.county?.id,
              name: item.order.constituency?.county?.county_name,
            }
          };
    
      return {
        id: item.id,
        quantity: item.quantity,
        status: item.itemStatus,
        randomCode: item.randomCode,
        product: item.product,
        order: {
          id: item.order.id,
          status: item.order.status,
          totalAmount: item.order.totalAmount,
          createdAt: item.order.created_at,
          customer: item.order.customer,
          deliveryOption: item.order.deliveryOption,
          deliveryInstructions: item.order.deliveryInstructions,
          location: locationInfo
        }
      };
    });
    
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
