import { EntityRepository, Repository } from 'typeorm';
import { Country } from '../entities/country.entity';

@EntityRepository(Country)
export class CountryRepository extends Repository<Country> {
  async getCountryById(id: string): Promise<Country> {
    const country = await this.findOne(id);
    return country;
  }

  async getAllCountries(): Promise<Country[]> {
    const countries = await this.find({ relations: ['states'] });
    return countries;
  }
}
