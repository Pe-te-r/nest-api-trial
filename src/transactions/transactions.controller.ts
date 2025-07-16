import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('customer-payment')
  createCustomerPayment(
    @Body() body: { amount: number; customerAccountId: string; siteAccountId: string; orderId: string }
  ) {
    return this.transactionsService.createCustomerPayment(
      body.amount,
      body.customerAccountId,
      body.siteAccountId,
      body.orderId
    );
  }

  @Post('payout-store')
  payoutToStore(
    @Body() body: { amount: number; siteAccountId: string; storeAccountId: string; orderId: string }
  ) {
    return this.transactionsService.payoutToStore(
      body.amount,
      body.siteAccountId,
      body.storeAccountId,
      body.orderId
    );
  }

  @Post('payout-driver')
  payoutToDriver(
    @Body() body: { amount: number; siteAccountId: string; driverAccountId: string; orderId: string }
  ) {
    return this.transactionsService.payoutToDriver(
      body.amount,
      body.siteAccountId,
      body.driverAccountId,
      body.orderId
    );
  }

  @Get('account-balance')
  getAccountBalance(@Query('accountId') accountId: string) {
    return this.transactionsService.getAccountBalance(accountId);
  }
}
