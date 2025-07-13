import { Module } from '@nestjs/common'
import { PickStationService } from './pick_station.service'
import { PickStationController } from './pick_station.controller'

@Module({
  controllers: [PickStationController],
  providers: [PickStationService],
})
export class PickStationModule {}
