import { Controller, Get } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { Country } from '../../common/entities/country.entity';
import { Bank } from '../../common/entities/bank.entity';

@Controller('utility')
export class UtilityController {
    constructor(private utilityService: UtilityService) {}

    @Get('countries')
    listCountries(): Promise<Country[]> {
        return this.utilityService.getCountries();
    }

    @Get('banks')
    listBanks(): Promise<Bank[]> {
        return this.utilityService.getBanks();
    }
}
