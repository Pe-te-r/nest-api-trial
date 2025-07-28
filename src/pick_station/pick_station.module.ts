import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PickStationService } from './pick_station.service'
import { PickStationController } from './pick_station.controller'
import { PickStation } from './entities/pick_station.entity'
import { Constituency } from '../constituency/entities/constituency.entity'
import { Order } from 'src/orders/entities/order.entity'

@Module({
  imports: [TypeOrmModule.forFeature([PickStation, Constituency, Order])],
  controllers: [PickStationController],
  providers: [PickStationService],
})
export class PickStationModule {}
