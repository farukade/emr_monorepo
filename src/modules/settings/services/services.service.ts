import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDto } from './dto/service.dto';
import { ServiceCategoryDto } from './dto/service.category.dto';
import { ServiceCategory } from '../entities/service_category.entity';
import { Service } from '../entities/service.entity';
import { ServiceCategoryRepository } from './repositories/service_category.repository';
import {
  formatCurrency,
  formatPID,
  generatePDF,
  parseDescriptionB,
  parseSource,
  slugify,
} from '../../../common/utils/utils';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import { Raw } from 'typeorm';
import { HmoSchemeRepository } from '../../hmo/repositories/hmo_scheme.repository';
import { LabTestCategoryRepository } from '../lab/repositories/lab.category.repository';
import { LabTestRepository } from '../lab/repositories/lab.test.repository';
import { ServiceRepository } from './repositories/service.repository';
import { ServiceCostRepository } from './repositories/service_cost.repository';
import { ServiceCost } from '../entities/service_cost.entity';
import { DrugRepository } from '../../inventory/pharmacy/drug/drug.repository';
import { RoomCategoryRepository } from '../room/room.category.repository';
import * as path from 'path';
import * as moment from 'moment';
import { PatientRepository } from 'src/modules/patient/repositories/patient.repository';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Excel = require('exceljs');

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(ServiceRepository)
    private serviceRepository: ServiceRepository,
    @InjectRepository(ServiceCategoryRepository)
    private serviceCategoryRepository: ServiceCategoryRepository,
    @InjectRepository(LabTestRepository)
    private labTestRepository: LabTestRepository,
    @InjectRepository(HmoSchemeRepository)
    private hmoSchemeRepository: HmoSchemeRepository,
    @InjectRepository(ServiceCostRepository)
    private serviceCostRepository: ServiceCostRepository,
    @InjectRepository(DrugRepository)
    private drugRepository: DrugRepository,
    @InjectRepository(RoomCategoryRepository)
    private roomCategoryRepository: RoomCategoryRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
  ) {}

  async getAllServices(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { q, hmo_id, category_id } = params;

    const page = options.page - 1;

    const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

    let where = {};

    if (q && q !== '') {
      where = { ...where, name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
    }

    if (category_id && category_id !== '') {
      const category = await this.serviceCategoryRepository.findOne(category_id);
      where = { ...where, category };
    }

    const [result, total] = await this.serviceRepository.findAndCount({
      where,
      relations: ['category'],
      order: { name: 'ASC' },
      take: options.limit,
      skip: page * options.limit,
    });

    let rs = [];
    for (const item of result) {
      const service = await this.serviceCostRepository.findOne({ where: { code: item.code, hmo } });

      rs = [...rs, { ...item, service }];
    }

    return {
      result: rs,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async getServicesByCategory(slug: string, options: PaginationOptionsInterface, params) {
    const { q, hmo_id, nsc } = params;

    const page = options.page - 1;

    const category = await this.serviceCategoryRepository.findOne({ where: { slug } });

    let hmo = await this.hmoSchemeRepository.findOne(hmo_id);
    if (!hmo) {
      hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });
    }

    let where = {};

    if (q && q !== '') {
      where = { ...where, name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`) };
    }

    const [query, total] = await this.serviceRepository.findAndCount({
      where: { ...where, category },
      relations: ['category'],
      order: { name: 'ASC' },
      take: options.limit,
      skip: page * options.limit,
    });

    if (!nsc || (nsc && nsc === '')) {
      let result = [];
      for (const item of query) {
        const serviceCost = await this.serviceCostRepository.findOne({ where: { code: item.code, hmo } });

        result = [...result, { ...item, serviceCost }];
      }

      return result;
    }

    return {
      result: query,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async download(categoryId: string, params) {
    try {
      const { hmo_id } = params;

      const category = await this.serviceCategoryRepository.findOne(categoryId);
      const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

      const filename = `${category.slug}-${slugify(hmo.name)}${moment().unix()}.xlsx`;
      const filepath = path.resolve(__dirname, `../../../../public/downloads/${filename}`);

      let result = [];
      const query = await this.serviceRepository.find({ where: { category }, order: { code: 'ASC' } });
      for (const item of query) {
        let serviceCost = await this.serviceCostRepository.findOne({ where: { code: item.code, hmo } });

        if (!serviceCost) {
          const cost = new ServiceCost();
          cost.code = item.code;
          cost.item = item;
          cost.hmo = hmo;
          cost.tariff = 0;
          serviceCost = await cost.save();
        }

        result = [...result, { ...item, serviceCost }];
      }

      const services: ServicesInterface[] = result.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        tariff: s.serviceCost?.tariff || 0,
      }));

      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet(`${category.name} HMO Tariffs`);

      worksheet.columns = [
        { header: 'SN', key: 'id', width: 10 },
        { header: 'Code', key: 'code', width: 20 },
        { header: 'Name', key: 'name', width: 70 },
        { header: 'Tariff', key: 'tariff', width: 20 },
      ];

      services.forEach((data) => {
        worksheet.addRow({ ...data });
      });

      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
      });

      await workbook.xlsx.writeFile(filepath);

      return { url: `${process.env.ENDPOINT}/downloads/${filename}` };
    } catch (e) {
      throw e;
    }
  }

  async upload(categoryId: number, file, params): Promise<any> {
    try {
      const { hmo_id } = params;

      const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

      const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile(file.path);
      const worksheet = workbook.getWorksheet(1);

      let items = [];
      worksheet.eachRow({ includeEmpty: true }, (row) => {
        items = [...items, { ...row.values }];
      });

      for (const item of items) {
        const row = Object.values(item);
        const serviceCost = await this.serviceCostRepository.findOne({ where: { code: row[1], hmo } });
        console.log(serviceCost?.code);
        if (serviceCost) {
          serviceCost.tariff = parseFloat(row[3].toString());
          await serviceCost.save();
        }
      }

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async getPrivateServiceByCode(code: string): Promise<ServiceCost> {
    try {
      const hmo = await this.hmoSchemeRepository.findOne({ where: { name: 'Private' } });

      return await this.serviceCostRepository.findOne({
        where: { code, hmo },
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  async createService(serviceDto: ServiceDto): Promise<Service> {
    const { category_id, tariff } = serviceDto;

    const category = await this.serviceCategoryRepository.findOne(category_id);

    const lastService = await this.serviceRepository.findOne({
      where: { category },
      order: { code: 'DESC' },
    });

    let alphaCode;
    let code;
    if (lastService) {
      alphaCode = lastService.code.substring(0, 2);
      const num = lastService.code.slice(2);
      const index = parseInt(num, 10) + 1;
      code = `${alphaCode.toLocaleUpperCase()}${formatPID(index, lastService.code.length - 2)}`;
    } else {
      const names = category.name.split(' ');
      alphaCode = names.length > 1 ? names.map((n) => n.substring(0, 1)).join('') : category.name.substring(0, 2);
      code = `${alphaCode.toLocaleUpperCase()}${formatPID(1)}`;
    }

    const service = await this.serviceRepository.createService(serviceDto, category, code);

    const schemes = await this.hmoSchemeRepository.find();

    for (const scheme of schemes) {
      const serviceCost = new ServiceCost();
      serviceCost.code = service.code;
      serviceCost.item = service;
      serviceCost.hmo = scheme;
      serviceCost.tariff = tariff;

      await serviceCost.save();
    }

    return service;
  }

  async getServiceById(id: string): Promise<Service> {
    const found = this.serviceRepository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Service with ID '${id}' not found`);
    }

    return found;
  }

  async updateService(id: string, serviceDto: ServiceDto): Promise<any> {
    const { name, category_id, hmo_id, tariff, update_tariff } = serviceDto;

    const category = await this.serviceCategoryRepository.findOne(category_id);

    const service = await this.getServiceById(id);
    service.name = name;
    service.category = category;
    await service.save();

    switch (category.slug) {
      case 'drugs':
        const drug = await this.drugRepository.findOne({ where: { code: service.code } });
        drug.name = name;
        await drug.save();
        break;
      case 'labs':
        const lab = await this.labTestRepository.findOne({ where: { code: service.code } });
        lab.name = name;
        await lab.save();
        break;
      case 'ward':
        const room = await this.roomCategoryRepository.findOne({ where: { code: service.code } });
        room.name = name;
        await room.save();
        break;
    }

    const hmo = await this.hmoSchemeRepository.findOne(hmo_id);

    const serviceCost = await this.serviceCostRepository.findOne({
      where: { code: service.code, hmo },
    });
    if (update_tariff && update_tariff !== '' && update_tariff === 1) {
      if (serviceCost) {
        serviceCost.tariff = tariff;
        await serviceCost.save();
      } else {
        await this.serviceCostRepository.save({
          item: service,
          hmo,
          code: service.code,
          tariff,
        });
      }
    }

    const cost = await this.serviceCostRepository.findOne({
      where: { code: service.code, hmo },
    });

    return { ...service, service: cost };
  }

  async deleteService(id: number, username: string): Promise<any> {
    const service = await this.serviceRepository.findOne(id);

    if (!service) {
      throw new NotFoundException(`Service with ID '${id}' not found`);
    }

    service.deletedBy = username;
    await service.save();

    return service.softRemove();
  }

  /*
    Service CATEGORY SERVICES
  */
  async getServicesCategory(params: any): Promise<ServiceCategory[]> {
    const { paypoint } = params;

    if (paypoint && paypoint === '1') {
      return this.serviceCategoryRepository.find({ where: [{ slug: 'labs' }, { slug: 'scans' }] });
    }

    return this.serviceCategoryRepository.find();
  }

  async getServicesCategoryBySlug(slug: string): Promise<ServiceCategory> {
    return this.serviceCategoryRepository.findOne({ where: { slug } });
  }

  async createServiceCategory(serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
    return this.serviceCategoryRepository.createCategory(serviceCategoryDto);
  }

  async updateServiceCategory(id: number, serviceCategoryDto: ServiceCategoryDto): Promise<ServiceCategory> {
    const { name } = serviceCategoryDto;
    const category = await this.serviceCategoryRepository.findOne(id);
    category.name = name;
    await category.save();
    return category;
  }

  async deleteServiceCategory(id: number, username: string): Promise<any> {
    const category = await this.serviceCategoryRepository.findOne(id);

    if (!category) {
      throw new NotFoundException(`Service category with ID '${id}' not found`);
    }

    category.deletedBy = username;
    await category.save();

    return category.softRemove();
  }

  async printServices(params) {
    try {
      const { services, patientId } = params;

      const idArr = services.split('-');
      console.log(idArr);
      let serviceCost = [];
      for (const item of idArr) {
        serviceCost = [...serviceCost, await this.serviceCostRepository.findOne(item)];
      }

      const patient = await this.patientRepository.findOne(patientId);

      const date = new Date();
      const filename = `bill-${date.getTime()}.pdf`;
      const filepath = path.resolve(__dirname, `../../../../public/outputs/${filename}`);
      const dob = moment(patient.date_of_birth, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');

      const results = serviceCost.map((t) => {
        return {
          date: moment().format('DD-MMMM-YYYY h:mm A'),
          source: parseSource(t.item.category.name),
          description: t.item.name,
          amount: formatCurrency(t.tariff, true),
          rawAmount: t.tariff,
        };
      });

      const total = results.reduce((a, b) => a - b.rawAmount, 0);

      const data = {
        patient,
        age: moment().diff(dob, 'years'),
        filepath,
        results,
        patient_id: formatPID(patientId),
        logo: `${process.env.ENDPOINT}/images/logo.png`,
        totalAmount: formatCurrency(total, true),
        displayDate: moment().format('DD-MMMM-YYYY h:mm A'),
      };

      await generatePDF('pending-bill', data);

      return {
        success: true,
        url: `${process.env.ENDPOINT}/outputs/${filename}`,
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || 'an error occured' };
    }
  }
}
