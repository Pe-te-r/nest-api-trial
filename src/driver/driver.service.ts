import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateDriverDto } from './dto/create-driver.dto'
import { UpdateDriverDto } from './dto/update-driver.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Order } from 'src/orders/entities/order.entity'
import { formatResponse } from 'src/types/types'
import { Driver } from './entities/driver.entity'
import { Assignment } from 'src/assignment/entities/assignment.entity'
import { OrderItem } from 'src/orders/entities/order.entity'
import { User } from 'src/user/entities/user.entity'
import { UserRole } from 'src/utils/enums'

@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}
  async create(createDriverDto: CreateDriverDto) {
    const { userId,  status, vehicle_type, license_plate } = createDriverDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if(!user){
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const driver = this.driverRepository.create({
      
      status: status as import('src/types/types').DriverStatus,
      vehicle_type: vehicle_type as import('src/types/types').VehicleType,
      license_plate,
      user: user,
    });
    user.role = 'driver' as UserRole;
    await this.userRepository.save(user);
    await this.driverRepository.save(driver);
    return formatResponse('success', 'Driver created successfully', null);
  }

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find({ relations: ['user', 'assignments'] });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['user', 'assignments'],
    });
    if (!driver) throw new NotFoundException(`Driver with id ${id} not found`);
    return driver;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const driver = await this.driverRepository.findOne({ where: { id } });
    if (!driver) throw new NotFoundException(`Driver with id ${id} not found`);
    if (updateDriverDto.userId) {
      driver.user = { id: updateDriverDto.userId } as any;
    }
    if (updateDriverDto.status !== undefined) driver.status = updateDriverDto.status as import('src/types/types').DriverStatus;
    if (updateDriverDto.vehicle_type !== undefined) driver.vehicle_type = updateDriverDto.vehicle_type as import('src/types/types').VehicleType;
    if (updateDriverDto.license_plate !== undefined) driver.license_plate = updateDriverDto.license_plate;
    return await this.driverRepository.save(driver);
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.driverRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Driver with id ${id} not found`);
    return { deleted: true };
  }
  async findDriverOrders(id: string) {
    const orders = await this.orderItemRepository
    .createQueryBuilder('orderItem')
    .innerJoin('orderItem.assignment', 'assignment')
    .innerJoin('assignment.driver', 'driver')
    .where('driver.id = :driverId', { driverId: id })
    .getMany();
    if(!orders){
      throw new NotFoundException('No orders found for this driver')
    }
    return formatResponse('success', 'Orders fetched successfully', orders)
  }
}
