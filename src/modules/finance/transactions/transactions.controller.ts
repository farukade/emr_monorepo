import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { ProcessTransactionDto } from './dto/process-transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {}

    @Get('list')
    getTransactions(
        @Query() urlParams,
    ): Promise<Transactions[]> {
        return this.transactionsService.fetchList(urlParams);
    }

    @Post()
    @UsePipes(ValidationPipe)
    saveTransaction(
        @Body() transactionDto: TransactionDto,
    ): Promise<any> {
        return this.transactionsService.save(transactionDto);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateTransaction(
        @Param('id') id: string,
        @Body() transactionDto: TransactionDto,
    ): Promise<any> {
        return this.transactionsService.update(id, transactionDto);
    }

    @Patch('/:id/process')
    @UsePipes(ValidationPipe)
    processTransaction(
        @Param('id') id: string,
        @Body() transactionDto: ProcessTransactionDto,
    ): Promise<any> {
        return this.transactionsService.processTransaction(id, transactionDto);
    }

    @Delete('/:id')
    deleteTransaction(@Param('id') id: string): Promise<void> {
        return this.transactionsService.delete(id);
    }
}
