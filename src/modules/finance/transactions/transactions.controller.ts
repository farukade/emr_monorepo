import { Controller, Get, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transactions } from './transaction.entity';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Get('list')
    getTransactions(
        @Query() urlParams,
    ): Promise<Transactions[]> {
        return this.transactionsService.fetchList(urlParams);
    }
}
