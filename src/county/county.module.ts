import { Module } from '@nestjs/common'
import { CountyService } from './county.service'
import { CountyController } from './county.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { County } from './entities/county.entity'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [TypeOrmModule.forFeature([County]), DatabaseModule],
  controllers: [CountyController],
  providers: [CountyService],
})
export class CountyModule {}
