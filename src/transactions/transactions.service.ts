import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from './entities/transaction.entity'
import { TransactionLedger } from './entities/transaction-ledger.entity'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionLedger)
    private readonly ledgerRepository: Repository<TransactionLedger>,
  ) {}

  async createCustomerPayment(
    amount: number,
    customerAccountId: string,
    siteAccountId: string,
    orderId: string,
  ) {
    const transaction = this.transactionRepository.create({
      type: 'customer_payment',
      amount,
      fromAccountId: customerAccountId,
      toAccountId: siteAccountId,
      orderId,
    })
    const savedTx = await this.transactionRepository.save(transaction)
    await this.ledgerRepository.save([
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'debit',
        accountId: customerAccountId,
      }),
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'credit',
        accountId: siteAccountId,
      }),
    ])
    return savedTx
  }

  async payoutToStore(
    amount: number,
    siteAccountId: string,
    storeAccountId: string,
    orderId: string,
  ) {
    const transaction = this.transactionRepository.create({
      type: 'payout_store',
      amount,
      fromAccountId: siteAccountId,
      toAccountId: storeAccountId,
      orderId,
    })
    const savedTx = await this.transactionRepository.save(transaction)
    await this.ledgerRepository.save([
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'debit',
        accountId: siteAccountId,
      }),
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'credit',
        accountId: storeAccountId,
      }),
    ])
    return savedTx
  }

  async payoutToDriver(
    amount: number,
    siteAccountId: string,
    driverAccountId: string,
    orderId: string,
  ) {
    const transaction = this.transactionRepository.create({
      type: 'payout_driver',
      amount,
      fromAccountId: siteAccountId,
      toAccountId: driverAccountId,
      orderId,
    })
    const savedTx = await this.transactionRepository.save(transaction)
    await this.ledgerRepository.save([
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'debit',
        accountId: siteAccountId,
      }),
      this.ledgerRepository.create({
        transactionId: savedTx.id,
        amount,
        direction: 'credit',
        accountId: driverAccountId,
      }),
    ])
    return savedTx
  }

  async getAccountBalance(accountId: string) {
    const credits = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'sum')
      .where('ledger.accountId = :accountId', { accountId })
      .andWhere('ledger.direction = :dir', { dir: 'credit' })
      .getRawOne()
    const debits = await this.ledgerRepository
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'sum')
      .where('ledger.accountId = :accountId', { accountId })
      .andWhere('ledger.direction = :dir', { dir: 'debit' })
      .getRawOne()
    return (Number(credits.sum) || 0) - (Number(debits.sum) || 0)
  }
}
