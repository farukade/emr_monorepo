import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { IvfEnrollmentRepository } from './repositories/ivf_enrollment.repository';
import { IvfEnrollmentDto } from './dto/ivf_enrollment.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { IvfEnrollment } from './entities/ivf_enrollment.entity';
import { IvfDownRegulationChartDto } from './dto/ivf-down-regulation-chart.dto';
import { IvfDownRegulationChartEntity } from './entities/ivf_down_regulation_chart.entity';
import { IvfHcgAdministrationChartEntity } from './entities/ivf_hcg_administration_chart.entity';
import { IvfTheaterProcedureListEntity } from './entities/ivf_theater_procedure_lists.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { Pagination } from '../../../common/paginate/paginate.interface';
import * as moment from 'moment';
import { AppGateway } from '../../../app.gateway';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';
import { getStaff } from '../../../common/utils/utils';
import { Patient } from '../entities/patient.entity';
import { IvfHcgRepository } from './repositories/hcg.repository';
const { log } = console;

@Injectable()
export class IvfService {
  constructor(
    @InjectRepository(PatientRequestRepository)
    private patientRequestRepository: PatientRequestRepository,
    @InjectRepository(PatientRequestItemRepository)
    private patientRequestItemRepository: PatientRequestItemRepository,
    @InjectRepository(IvfEnrollmentRepository)
    private ivfEnrollmentRepo: IvfEnrollmentRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(IvfHcgRepository)
    private hcgRepository: IvfHcgRepository,
    private readonly appGateway: AppGateway,
  ) { }

  async getEnrollments(options: PaginationOptionsInterface, params): Promise<Pagination> {
    const { startDate, endDate, patient_id } = params;

    const page = options.page - 1;

    const query = this.ivfEnrollmentRepo.createQueryBuilder('q').select('q.*');

    if (startDate && startDate !== '') {
      const start = moment(startDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt >= '${start}'`);
    }
    if (endDate && endDate !== '') {
      const end = moment(endDate).endOf('day').toISOString();
      query.andWhere(`q.createdAt <= '${end}'`);
    }

    if (patient_id && patient_id !== '') {
      query.andWhere('q.wife_id = :patient_id', { patient_id });
    }

    const ivfs = await query
      .offset(page * options.limit)
      .limit(options.limit)
      .orderBy('q.createdAt', 'DESC')
      .getRawMany();

    const total = await query.getCount();

    let result = [];
    for (const ivf of ivfs) {
      if (ivf.husband_id) {
        ivf.husband = await this.patientRepository.findOne(ivf.husband_id);
      }

      if (ivf.wife_id) {
        ivf.wife = await this.patientRepository.findOne(ivf.wife_id, { relations: ['hmo'] });
      }

      const requests = await this.patientRequestRepository.find({ where: { ivf }, relations: ['item'] });

      ivf.staff = await getStaff(ivf.createdBy);

      result = [...result, { ...ivf, requests }];
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async saveEnrollment(ivfEnrollmentDto: IvfEnrollmentDto, createdBy): Promise<any> {
    try {
      const { wife, husband } = ivfEnrollmentDto;

      const requestCount = await getConnection()
        .createQueryBuilder()
        .select('*')
        .from(IvfEnrollment, 'q')
        .withDeleted()
        .getCount();

      const nextId = `00000${requestCount + 1}`;
      const code = `IVF${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

      // wife patient details
      ivfEnrollmentDto.wife = await this.patientRepository.findOne(wife.id);

      // husband patient details
      ivfEnrollmentDto.husband = await this.patientRepository.findOne(husband.id);

      // save enrollment details
      const data = await this.ivfEnrollmentRepo.save({ ...ivfEnrollmentDto, serial_code: code, createdBy });

      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async getHistory(patientId): Promise<IvfEnrollment[]> {
    // get patient details
    const patient = await this.patientRepository.findOne(patientId);

    if (patient.gender === 'Female') {
      return await this.ivfEnrollmentRepo.find({ where: { wife: patient }, relations: ['wife'] });
    } else {
      return await this.ivfEnrollmentRepo.find({ where: { husband: patient }, relations: ['husband'] });
    }
  }

  async doSaveDownRegulationChart(param: IvfDownRegulationChartDto, user) {
    const { ivf_enrollment_id, agent, charts, cycle } = param;

    try {
      // find ivf enrollment
      const ivfEnrollment = await this.ivfEnrollmentRepo.findOne(ivf_enrollment_id);
      // save chart
      const downRegulationChart = new IvfDownRegulationChartEntity();
      downRegulationChart.agent = agent;
      downRegulationChart.cycle = cycle;
      downRegulationChart.charts = charts;
      downRegulationChart.ivfEnrollment = ivfEnrollment;
      downRegulationChart.createdBy = user.id;
      downRegulationChart.lastChangedBy = user.id;
      await downRegulationChart.save();

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async doSaveHCGAdministration(params, username) {
    const {
      patient_id,
      ivf_enrollment_id,
      timeOfEntry,
      timeOfAdmin,
      typeOfDosage,
      typeOfHcg,
      routeOfAdmin,
      nurse_id,
      remarks,
      id,
    } = params;

    try {
      // find patient
      const patient = await this.patientRepository.findOne(patient_id);

      // find ivf enrollment
      const ivfEnrollment = await this.ivfEnrollmentRepo.findOne(ivf_enrollment_id);

      // find staff details
      const staffDetails = await getStaff(username);
      if (!id) {
        // save new hcg administration
        const hcgAdministration = new IvfHcgAdministrationChartEntity();
        hcgAdministration.patient = patient;
        hcgAdministration.ivfEnrollment = ivfEnrollment;
        hcgAdministration.timeOfEntry = timeOfEntry;
        hcgAdministration.timeOfAdmin = timeOfAdmin;
        hcgAdministration.routeOfAdmin = routeOfAdmin;
        hcgAdministration.typeOfDosage = typeOfDosage;
        hcgAdministration.typeOfHcg = typeOfHcg;
        hcgAdministration.staff = staffDetails;
        hcgAdministration.remarks = remarks;
        await hcgAdministration.save();
      } else {
        // update existing hcg administration
        const hcgAdministration = await getRepository(IvfHcgAdministrationChartEntity).findOne(id);
        hcgAdministration.patient = patient;
        hcgAdministration.ivfEnrollment = ivfEnrollment;
        hcgAdministration.timeOfEntry = timeOfEntry;
        hcgAdministration.timeOfAdmin = timeOfAdmin;
        hcgAdministration.routeOfAdmin = routeOfAdmin;
        hcgAdministration.typeOfDosage = typeOfDosage;
        hcgAdministration.typeOfHcg = typeOfHcg;
        hcgAdministration.staff = staffDetails;
        hcgAdministration.remarks = remarks;
        await hcgAdministration.save();
      }

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async doSaveTheatreProcedure(params, user) {
    const { patient_id, ivf_enrollment_id, schedule, remarks, procedure, folicile, id } = params;

    try {
      // find patient
      const patient = await this.patientRepository.findOne(patient_id);

      // find ivf enrollment
      const ivfEnrollment = await this.ivfEnrollmentRepo.findOne(ivf_enrollment_id);

      // find staff details
      // const staffDetails = await this.staffRepository.findOne(nurse_id);
      if (!id) {
        // save new hcg administration
        const theaterProcedure = new IvfTheaterProcedureListEntity();
        theaterProcedure.patient = patient;
        theaterProcedure.ivfEnrollment = ivfEnrollment;
        theaterProcedure.schedule = schedule;
        theaterProcedure.procedure = procedure;
        theaterProcedure.folicile = folicile;
        theaterProcedure.remarks = remarks;
        await theaterProcedure.save();
      } else {
        // update existing hcg administration
        const theaterProcedure = await getRepository(IvfTheaterProcedureListEntity).findOne(id);
        theaterProcedure.patient = patient;
        theaterProcedure.ivfEnrollment = ivfEnrollment;
        theaterProcedure.schedule = schedule;
        theaterProcedure.procedure = procedure;
        theaterProcedure.folicile = folicile;
        theaterProcedure.remarks = remarks;
        await theaterProcedure.save();
      }

      return { success: true };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }

  async deleteIVF(id: number, username: string): Promise<any> {
    const ivf = await this.ivfEnrollmentRepo.findOne(id);

    if (!ivf) {
      throw new NotFoundException(`ivf with ID '${id}' not found`);
    }
    ivf.deletedBy = username;
    await ivf.save();

    return ivf.softRemove();
  }

  async getHcg(params) {
    try {
      const { hcg_id } = params;

      if ((!hcg_id || hcg_id == "")) {
        return { success: false, message: "no patient ID or HCG ID added to url params" };
      };

      let hcg: IvfHcgAdministrationChartEntity;
      if (hcg_id && hcg_id != "") {
        hcg = await this.hcgRepository.findOne(hcg_id, {
          relations: ['patient', 'staff']
        });
      };

      let ivf;
      if (hcg.patient.ivf_id) {
        ivf = await this.ivfEnrollmentRepo.findOne(hcg.patient.ivf_id);
      };
      const result = { ...hcg, ivf };
      return { success: true, result };

    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }
}
