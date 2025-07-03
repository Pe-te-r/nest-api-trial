import { Module } from '@nestjs/common'
import { ConstituencyService } from './constituency.service'
import { ConstituencyController } from './constituency.controller'

@Module({
  controllers: [ConstituencyController],
  providers: [ConstituencyService],
})
export class ConstituencyModule {}
