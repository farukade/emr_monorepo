import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, Request } from '@nestjs/common';
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
        @Request() request,
    ) {
        const limit = request.query.hasOwnProperty('limit') ? request.query.limit : 2;
        const page = request.query.hasOwnProperty('page') ? request.query.page : 0;
        return this.transactionsService.fetchList({page, limit}, urlParams);
    }

    @Get('show/:id')
    getTransaction(
        @Param('id') id: string,
    ): Promise<Transactions> {
        return this.transactionsService.getTransaction(id);
    }

    @Get('dashboard')
    getDashboardTransaction(
        @Query() urlParams,
    ): Promise<any> {
        return this.transactionsService.fetchDashboardTransactions();
    }

    @Get('cafeteria-daily')
    getCafeteriaDailytotal() {
        return this.transactionsService.cafeteriaDailyTotal();
    }

    @Get('dashboard-list')
    getDashboardTransactionList(
        @Query() urlParams,
    ): Promise<any> {
        return this.transactionsService.listDashboardTransactions(urlParams);
    }

    @Post()
    @UsePipes(ValidationPipe)
    saveTransaction(
        @Body() transactionDto: TransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.save(transactionDto, req.user.username);
    }

    @Patch('/:id/update')
    @UsePipes(ValidationPipe)
    updateTransaction(
        @Param('id') id: string,
        @Body() transactionDto: TransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.update(id, transactionDto, req.user.username);
    }

    @Patch('/:id/process')
    @UsePipes(ValidationPipe)
    processTransaction(
        @Param('id') id: string,
        @Body() transactionDto: ProcessTransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.processTransaction(id, transactionDto, req.user.username);
    }

    @Delete('/:id')
    deleteTransaction(@Param('id') id: string): Promise<void> {
        return this.transactionsService.delete(id);
    }
}
