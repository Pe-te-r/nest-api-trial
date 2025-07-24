import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { UserD } from 'src/common/decorators/user.decorator'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // should receive amount and email
  @Post('create')
  createTransaction(
    @Body()body: {amount: number},
    @UserD('email') email: string,
  ) {
    return this.transactionsService.createTransaction(body.amount, email)
  }

  @Get('verify/:reference')
  verifyTransaction(@Param('reference') reference: string) {
    return this.transactionsService.verifyTransaction(reference)
  }

  @Post('customer-payment')
  createCustomerPayment(
    @Body()
    body: {
      amount: number
      customerAccountId: string
      siteAccountId: string
      orderId: string
    },
  ) {
    return this.transactionsService.createCustomerPayment(
      body.amount,
      body.customerAccountId,
      body.siteAccountId,
      body.orderId,
    )
  }

  @Post('payout-store')
  payoutToStore(
    @Body()
    body: {
      amount: number
      siteAccountId: string
      storeAccountId: string
      orderId: string
    },
  ) {
    return this.transactionsService.payoutToStore(
      body.amount,
      body.siteAccountId,
      body.storeAccountId,
      body.orderId,
    )
  }

  @Post('payout-driver')
  payoutToDriver(
    @Body()
    body: {
      amount: number
      siteAccountId: string
      driverAccountId: string
      orderId: string
    },
  ) {
    return this.transactionsService.payoutToDriver(
      body.amount,
      body.siteAccountId,
      body.driverAccountId,
      body.orderId,
    )
  }

  @Get('account-balance')
  getAccountBalance(@Query('accountId') accountId: string) {
    return this.transactionsService.getAccountBalance(accountId)
  }
}
