import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BanksRepository } from '../../common/repositories/banks.repository';
import { CountryRepository } from '../../common/repositories/country.repository';
import { StateRepository } from '../../common/repositories/state.repository';
import { Country } from '../../common/entities/country.entity';
import { Bank } from '../../common/entities/bank.entity';

@Injectable()
export class UtilityService {
    constructor(
        @InjectRepository(BanksRepository)
        private bankRepository: BanksRepository,
        @InjectRepository(CountryRepository)
        private countryRepository: CountryRepository,
        @InjectRepository(StateRepository)
        private stateRepository: StateRepository,
    ) {}

    async getCountries(): Promise<Country[]> {
        const countries = await this.countryRepository.find();

        return countries;
    }

    async getBanks(): Promise<Bank[]> {
        const banks = await this.bankRepository.find();

        return banks;
    }
}
