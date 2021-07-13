import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BanksRepository } from '../../common/repositories/banks.repository';
import { CountryRepository } from '../../common/repositories/country.repository';
import { StateRepository } from '../../common/repositories/state.repository';
import { Country } from '../../common/entities/country.entity';
import { Bank } from '../../common/entities/bank.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { getRepository, IsNull, Not } from 'typeorm';
import { PaymentMethod } from '../settings/entities/payment-method.entity';
import { PaymentMethodRepository } from '../settings/payment-methods/pm.repository';

@Injectable()
export class UtilityService {
    constructor(
        @InjectRepository(BanksRepository)
        private bankRepository: BanksRepository,
        @InjectRepository(CountryRepository)
        private countryRepository: CountryRepository,
        @InjectRepository(StateRepository)
        private stateRepository: StateRepository,
        @InjectRepository(PaymentMethodRepository)
        private paymentMethodRepository: PaymentMethodRepository,
    ) {
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        return await this.paymentMethodRepository.find({ where: { status: 1 } });
    }

    async getCountries(): Promise<Country[]> {
        return await this.countryRepository.find();
    }

    async getBanks(): Promise<Bank[]> {
        return await this.bankRepository.find();
    }

    async getActiveDoctors(): Promise<StaffDetails[]> {
        return await getRepository(StaffDetails)
            .find({
                select: ['id', 'first_name', 'last_name', 'room'],
                where: {
                    room: Not(IsNull()), isActive: true,
                },
                relations: ['room'],
            });
    }
}
