import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './entities/user.entity'
import { Repository } from 'typeorm'
import { allUserQuery, formatResponse, userIdQueryType } from 'src/types/types'
import { InjectRepository } from '@nestjs/typeorm'
import { UserRole } from 'src/utils/enums'

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
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
      console.log('query', query)
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
        throw new NotFoundException('no customer details found')
      }
      return formatResponse('success', 'customers found', drivers)
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
    }
    return {
      message: `This action returns all user`,
    }
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

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(updateUserDto)
    return `This action updates a #${id} user`
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }
}
