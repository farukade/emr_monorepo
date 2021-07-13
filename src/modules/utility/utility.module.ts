import { Module } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { UtilityController } from './utility.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from '../../common/repositories/country.repository';
import { StateRepository } from '../../common/repositories/state.repository';
import { BanksRepository } from '../../common/repositories/banks.repository';
import { PaymentMethodRepository } from '../settings/payment-methods/pm.repository';

@Module({
    imports: [TypeOrmModule.forFeature([
        BanksRepository,
        CountryRepository,
        StateRepository,
        PaymentMethodRepository,
    ])],
    providers: [UtilityService],
    controllers: [UtilityController],
})
export class UtilityModule {
}
