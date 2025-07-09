import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { allUserQuery, formatResponse, userIdQueryType } from 'src/types/types'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRole } from 'src/utils/enums'
import { AuthService } from 'src/auth/auth.service'
import { Product } from 'src/products/entities/product.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    private readonly authService: AuthService,
  ) {}
  create(createUserDto: CreateUserDto) {
    console.log(createUserDto)
    return 'This action adds a new user'
  }

  async findAll(query: allUserQuery) {
    if (query.customers === 'true') {
      const customers = await this.userRepository.find({
        where: {
          role: UserRole.CUSTOMER,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!customers) {
        throw new NotFoundException('no customer details found')
      }
      return formatResponse('success', 'customers found', customers)
    } else if (query.driver === 'true') {
      const drivers = await this.userRepository.find({
        where: {
          role: UserRole.DRIVER,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!drivers) {
        throw new NotFoundException('no drivers details found')
      }
      return formatResponse('success', 'drivers found', drivers)
    } else if (query.admin === 'true') {
      const admins = await this.userRepository.find({
        where: {
          role: UserRole.ADMIN,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!admins) {
        throw new NotFoundException('no admins details found')
      }
      return formatResponse('success', 'admins found', admins)
    } else if (query.vendor === 'true') {
      const vendors = await this.userRepository.find({
        where: {
          role: UserRole.VENDOR,
        },
        select: [
          'email',
          'first_name',
          'last_name',
          'account_status',
          'created_at',
          'id',
          'is_verified',
          'phone',
        ],
      })
      if (!vendors) {
        throw new NotFoundException('no vendor details found')
      }
      return formatResponse('success', 'vendor found', vendors)
    }
    return {
      message: `This action returns all user`,
    }
  }

  async findProducts(id: string) {
    const products = await this.productRepository.find({ where: { createdBy: { id: id } } })
    if (!products) throw new NotFoundException(`No products for these user found`)
    return formatResponse('success', 'Products retrived', products)
  }

  async findOne(id: string, query: userIdQueryType) {
    if (query.account_modal === 'true') {
      const userModal = await this.userRepository.findOne({
        where: {
          id,
        },
        relations: {
          session: true,
        },
      })
      if (!userModal) {
        throw new NotFoundException(`user with id:${id} not found`)
      }
      const userModalData = {
        firstName: userModal?.first_name,
        lastName: userModal?.last_name,
        email: userModal?.email,
        phone: userModal?.phone,
        joinedAt: userModal?.created_at,
        role: userModal?.role,
        isTwoFactorEnabled: userModal?.session.otp_enabled,
        status: userModal?.account_status,
        lastLogin: userModal?.session.last_login,
      }
      return formatResponse('success', 'User data found', userModalData)
    }
    return formatResponse('success', 'account_modal', null)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } })

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    // Avoid overwriting password
    if ('password' in updateUserDto) {
      delete updateUserDto['password']
    }

    // Safely update fields
    if (updateUserDto.firstName) {
      user.first_name = updateUserDto.firstName
    }
    if (updateUserDto.lastName) {
      user.last_name = updateUserDto.lastName
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone
    }

    // Save to database
    await this.userRepository.save(user)

    return formatResponse('success', 'User data updated successfully', null)
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id)

    if (result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`)
    }

    return formatResponse('success', `User #${id} has been deleted`, null)
  }
}
