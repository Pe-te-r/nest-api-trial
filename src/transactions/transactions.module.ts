import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { Transaction } from './entities/transaction.entity'
import { TransactionLedger } from './entities/transaction-ledger.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionLedger])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
