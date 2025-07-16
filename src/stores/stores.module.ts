import { Module } from '@nestjs/common'
import { StoresService } from './stores.service'
import { StoresController } from './stores.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Store } from './entities/store.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'
import { OrderItem } from 'src/orders/entities/order.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, OrderItem, Constituency])],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
