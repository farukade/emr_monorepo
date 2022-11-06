import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsInterface } from 'apps/emr/src/common/paginate';
import { OocyteDto } from './dto/oocyte.dto';
import { SpermDto } from './dto/sperm.dto';
import { EmbFreezingRepository } from './freezing.repository';
import { SpermOocyteDonorRepository } from './repositories/donor.repository';
import { OocyteRepository } from './repositories/oocyte.repository';
import { SpermRepository } from './repositories/sperm.repository';

@Injectable()
export class EmbFreezingService {
  constructor(
    @InjectRepository(SpermOocyteDonorRepository)
    private donorRepository: SpermOocyteDonorRepository,
    @InjectRepository(OocyteRepository)
    private oocyteRepository: OocyteRepository,
    @InjectRepository(SpermRepository)
    private spermRepository: SpermRepository,
    @InjectRepository(EmbFreezingRepository)
    private embFreezingRepository: EmbFreezingRepository,
  ) {}

  async saveOocyte(data: OocyteDto) {
    try {
      const { donor, ...restOocyte } = data;
      donor.gender = 'female';

      if (donor) {
        const donorObj = this.donorRepository.create(donor);
        await this.donorRepository.save(donorObj);

        const oocyte = this.oocyteRepository.create(restOocyte);
        oocyte.donor = donorObj;
        const freezing = this.embFreezingRepository.create();
        await this.oocyteRepository.save(oocyte);
        freezing.oocyte = oocyte;
        await this.embFreezingRepository.save(freezing);

        return {
          success: true,
          message: 'oocyte and donor saved successfully',
          oocyte,
        };
      } else {
        const oocyte = this.oocyteRepository.create(restOocyte);
        const freezing = this.embFreezingRepository.create();
        await this.oocyteRepository.save(oocyte);
        freezing.oocyte = oocyte;
        await this.embFreezingRepository.save(freezing);

        return {
          success: true,
          message: 'oocyte saved successfully',
          oocyte,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'could not save data',
      };
    }
  }

  async saveSperm(data: SpermDto) {
    try {
      const { donor, ...restSperm } = data;
      donor.gender = 'male';

      if (donor) {
        const donorObj = this.donorRepository.create(donor);
        await this.donorRepository.save(donorObj);

        const sperm = this.spermRepository.create(restSperm);
        sperm.donor = donorObj;
        const freezing = this.embFreezingRepository.create();
        await this.spermRepository.save(sperm);
        freezing.sperm = sperm;
        await this.embFreezingRepository.save(freezing);

        return {
          success: true,
          message: 'sperm and donor saved successfully',
          freezing,
        };
      } else {
        const sperm = this.spermRepository.create(restSperm);
        const freezing = this.embFreezingRepository.create();
        await this.spermRepository.save(sperm);
        freezing.sperm = sperm;
        await this.embFreezingRepository.save(freezing);

        return {
          success: true,
          message: 'sperm saved successfully',
          sperm,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'could not save data',
      };
    }
  }

  async getByFreezingId(urlParams) {
    try {
      const { freezingid } = urlParams;
      const freezing = await this.embFreezingRepository.findOne(freezingid, {
        relations: ['sperm', 'oocyte'],
      });

      if (!freezing) {
        return {
          success: false,
          message: 'data not found',
        };
      }

      if (freezing.sperm) {
        const { sperm, oocyte, ...restFreezing } = freezing;
        return {
          success: true,
          freezing: {
            freezing: restFreezing,
            sperm,
          },
        };
      }

      if (freezing.oocyte) {
        const { sperm, oocyte, ...restFreezing } = freezing;
        return {
          success: true,
          freezing: {
            freezing: restFreezing,
            oocyte,
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'could not fetch data',
      };
    }
  }

  async getAllEmbFreezing(options: PaginationOptionsInterface) {
    try {
      const { limit } = options;
      const page = options.page - 1;

      const [result, total] = await this.embFreezingRepository.findAndCount({
        take: options.limit,
        skip: page * limit,
        relations: ['oocyte', 'sperm'],
      });

      return {
        result,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalPages: total,
        currentPage: options.page,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'could not fetch data',
      };
    }
  }
}
