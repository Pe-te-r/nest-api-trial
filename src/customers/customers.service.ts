import { Injectable } from '@nestjs/common'
import { CreateCustomerDto } from './dto/create-customer.dto'
import { UpdateCustomerDto } from './dto/update-customer.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Customer } from './entities/customer.entity'
import { User } from 'src/user/entities/user.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){}

  async findOne(id: string) {
      return await this.userRepository.findOne({ where: { id } })
  }

  async findOrders(userId: string) {
    const user = await this.findOne(userId)
    return await this.customerRepository.find({ where: { id: user?.id } })
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
