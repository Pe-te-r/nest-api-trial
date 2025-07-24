import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from './entities/transaction.entity'
import { TransactionLedger } from './entities/transaction-ledger.entity'
import { formatResponse, PaystackVerificationResponse } from 'src/types/types'
const  PAYSTACK_SECRET_KEY ='sk_test_1bf93a41516eaed4f14ffa21a2c30cffa2dafcbd';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(TransactionLedger)
    private readonly ledgerRepository: Repository<TransactionLedger>,
  ) {}
  
  async createTransaction(amount: number, email: string) {
    try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount, //amount in kes
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment initialization failed');
    }
    const json_data = await response.json();

    return formatResponse('success', 'Transaction created successfully', json_data)
  } catch (error) {
    console.error('Payment error:', error);
    throw new Error(error instanceof Error ? error.message : 'Payment initialization failed');
  }
  }


async verifyTransaction(reference: string) {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Transaction verification failed');
    }

    const data: PaystackVerificationResponse = await response.json();
    console.log('paystack data', data);
    
    if (!data.status || data.data.status !== 'success') {
      throw new Error(data.message || 'Transaction not successful');
    }

    return formatResponse('success', 'Transaction verified successfully', data.data.status);
  } catch (error) {
    console.error('Verification error:', error);
    throw new Error(error instanceof Error ? error.message : 'Transaction verification failed');
  }
}

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
