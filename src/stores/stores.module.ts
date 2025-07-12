import { Module } from '@nestjs/common'
import { StoresService } from './stores.service'
import { StoresController } from './stores.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from 'src/user/entities/user.entity'
import { Store } from './entities/store.entity'
import { Constituency } from 'src/constituency/entities/constituency.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User, Store, Constituency])],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
