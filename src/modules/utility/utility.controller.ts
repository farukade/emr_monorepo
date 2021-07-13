import { Controller, Get, Query, Request } from '@nestjs/common';
import { UtilityService } from './utility.service';
import { Country } from '../../common/entities/country.entity';
import { Bank } from '../../common/entities/bank.entity';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { PaymentMethod } from '../settings/entities/payment-method.entity';

@Controller('utility')
export class UtilityController {
    constructor(private utilityService: UtilityService) {
    }

    @Get('payment-methods')
    getMethods(): Promise<PaymentMethod[]> {
        return this.utilityService.getPaymentMethods();
    }

    @Get('countries')
    listCountries(): Promise<Country[]> {
        return this.utilityService.getCountries();
    }

    @Get('banks')
    listBanks(): Promise<Bank[]> {
        return this.utilityService.getBanks();
    }

    @Get('active-doctors')
    fetchActiveDoctors(): Promise<StaffDetails[]> {
        return this.utilityService.getActiveDoctors();
    }
}
