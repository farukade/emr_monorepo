import { Controller, Get, Query, Post, UsePipes, ValidationPipe, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionDto } from './dto/transaction.dto';
import { ProcessTransactionDto } from './dto/process-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { Pagination } from '../../../common/paginate/paginate.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('transactions')
export class TransactionsController {
    constructor(private transactionsService: TransactionsService) {
    }

    @Get('')
    getTransactions(
        @Query() urlParams,
        @Request() request,
    ): Promise<Pagination> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;

        return this.transactionsService.fetchList({ page, limit }, urlParams);
    }

    @Get('pending')
    getPendingTransactions(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        const limit = request.query.hasOwnProperty('limit') ? parseInt(request.query.limit, 10) : 10;
        const page = request.query.hasOwnProperty('page') ? parseInt(request.query.page, 10) : 1;
        return this.transactionsService.fetchPending({ page, limit }, urlParams);
    }

    @Get('print-pending')
    printBill(
        @Query() urlParams,
        @Request() request,
    ): Promise<any> {
        return this.transactionsService.printBill(urlParams);
    }

    @Post('')
    @UsePipes(ValidationPipe)
    saveTransaction(
      @Body() transactionDto: any,
      @Request() req,
    ): Promise<any> {
        return this.transactionsService.saveRequest(transactionDto, req.user.username);
    }

    @Post('/:id/process')
    @UsePipes(ValidationPipe)
    processTransaction(
        @Param('id') id: number,
        @Body() transactionDto: ProcessTransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.processTransaction(id, transactionDto, req.user.username);
    }

    @Post('/process-bulk')
    @UsePipes(ValidationPipe)
    processBulkTransaction(
        @Body() transactionDto: ProcessTransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.processBulkTransaction(transactionDto, req.user.username);
    }

    @Post('/credit-account')
    @UsePipes(ValidationPipe)
    creditAccount(
        @Body() params,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.creditAccount(params, req.user.username);
    }

    @Post('/process-credit')
    @UsePipes(ValidationPipe)
    processCredit(
        @Body() transactionDto: ProcessTransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.processCreditTransaction(transactionDto, req.user.username);
    }

    @Patch('/:id/transfer')
    @UsePipes(ValidationPipe)
    transferTransaction(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.transfer(id, req.user.username);
    }

    @Patch('/:id/approve')
    @UsePipes(ValidationPipe)
    approveTransaction(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.approve(id, req.user.username);
    }

    @Patch('/:id/pay')
    @UsePipes(ValidationPipe)
    hmoCode(
        @Param('id') id: string,
        @Body() transactionDto: TransactionDto,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.payWithHmoCode(id, transactionDto, req.user.username);
    }

    @Delete('/:id')
    deleteTransaction(
        @Param('id') id: number,
        @Request() req,
    ): Promise<any> {
        return this.transactionsService.deleteTransaction(id, req.user.username);
    }
}
