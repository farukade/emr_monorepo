import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsRepository } from './transactions.repository';
import { PatientRepository } from '../../patient/repositories/patient.repository';

@Module({
    imports: [TypeOrmModule.forFeature([TransactionsRepository, PatientRepository])],
    controllers: [TransactionsController],
    providers: [TransactionsService],
})
export class TransactionModule {}
