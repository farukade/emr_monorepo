import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transactions } from './transaction.entity';
import { TransactionDto } from './dto/transaction.dto';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {
    }

    @Get('list')
    getTransactions(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;

        return this.transactionsService.fetchList({ page, limit }, urlParams);
    }

    @Get('list/pending')
    getPendingTransactions(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 0;
        return this.transactionsService.fetchPending({ page: page - 1, limit }, urlParams);
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

    @Get('personal-cafetaria-bill')
    getPersonalCafeteriaBill(@Request() req) {
        return this.transactionsService.personalCafeterialBill(req.user.username);
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
        return this.transactionsService.update(id, transactionDto, req.user.username, req.query.hmo_approval_code);
    }

    @Patch('/:id/process')
    @UsePipes(ValidationPipe)
    processTransaction(
        @Param('id') id: number,
        @Body() transactionDto: ProcessTransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.processTransaction(id, transactionDto, req.user.username);
    }

    @Delete('/:id')
    deleteTransaction(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.deleteTransaction(id, req.user.username);
    }
}
