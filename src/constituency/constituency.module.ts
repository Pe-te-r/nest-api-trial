import { Module } from '@nestjs/common'
import { ConstituencyService } from './constituency.service'
import { ConstituencyController } from './constituency.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Constituency } from './entities/constituency.entity'
import { County } from 'src/county/entities/county.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Constituency, County])],
  controllers: [ConstituencyController],
  providers: [ConstituencyService],
})
export class ConstituencyModule {}
