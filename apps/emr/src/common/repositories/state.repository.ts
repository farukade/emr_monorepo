import { EntityRepository, Repository } from 'typeorm';
import { State } from '../entities/state.entity';

@EntityRepository(State)
export class StateRepository extends Repository<State> {
  async getStateById(id: string): Promise<State> {
    const state = await this.findOne(id);
    return state;
  }

  async getStatesByCountryId(countryId: string): Promise<State[]> {
    const states = await this.find({
      where: { country_id: countryId, relations: ['districts'] },
    });
    return states;
  }
}
