import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IvfEnrollmentRepository } from './ivf_enrollment.repository';
import { IvfEnrollmentDto } from './dto/ivf_enrollment.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { IvfEnrollment } from './entities/ivf_enrollment.entity';
import {IvfDownRegulationChartDto} from './dto/ivf-down-regulation-chart.dto';
import {IvfDownRegulationChartEntity} from './entities/ivf_down_regulation_chart.entity';
import {IvfHcgAdministrationChartEntity} from './entities/ivf_hcg_administration_chart.entity';
import {getRepository} from 'typeorm';
import {IvfTheaterProcedureListEntity} from './entities/ivf_theater_procedure_lists.entity';

@Injectable()
export class IvfService {
    constructor(
        @InjectRepository(IvfEnrollmentRepository)
        private ivfEnrollmentRepo: IvfEnrollmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
    ) {}

    async saveEnrollment(ivfEnrollmentDto: IvfEnrollmentDto, userId): Promise<any> {
        const { wife_id, husband_id } = ivfEnrollmentDto;
        // find user
        const user  = await this.staffRepository.findOne(userId);
        try {
            // wife patient details
            ivfEnrollmentDto.wife = await this.patientRepository.findOne(wife_id);
            // husband patient details
            ivfEnrollmentDto.husband = await this.patientRepository.findOne(husband_id);
            // save enrollment details
            const data = await this.ivfEnrollmentRepo.save(ivfEnrollmentDto);
            return {success: true, data};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async getHistory(patientId): Promise<IvfEnrollment[]> {
        // get patient details
        const patient = await this.patientRepository.findOne(patientId);

        if (patient.gender === 'Female') {
            return await this.ivfEnrollmentRepo.find({where: {wife: patient}, relations: ['wife']});
        }  else {
            return await this.ivfEnrollmentRepo.find({where: {husband: patient}, relations: ['husband']});
        }
    }

    async getEnrollments({page}) {
        const limit = 30;
        return await this.ivfEnrollmentRepo.find({ relations: ['wife', 'husband'], take: limit, skip: (page * limit) - limit});
    }

    async doSaveDownRegulationChart(param: IvfDownRegulationChartDto, user) {
        const {ivf_enrollment_id, agent, charts, cycle} = param;

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

            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

    async doSaveHCGAdministration(params, user) {
        const {patient_id, ivf_enrollment_id, timeOfEntry, timeOfAdmin, typeOfDosage, typeOfHcg, routeOfAdmin, nurse_id, remarks, id } = params;

        try {
            // find patient
            const patient = await this.patientRepository.findOne(patient_id);

            // find ivf enrollment
            const ivfEnrollment = await this.ivfEnrollmentRepo.findOne(ivf_enrollment_id);

            // find staff details
            const staffDetails = await this.staffRepository.findOne(nurse_id);
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
            } else { // update existing hcg administration
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

            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

    async doSaveTheatreProcedure(params, user) {
        const {patient_id, ivf_enrollment_id, schedule, remarks, procedure, folicile, id } = params;

        try {
            // find patient
            const patient = await this.patientRepository.findOne(patient_id);

            // find ivf enrollment
            const ivfEnrollment = await this.ivfEnrollmentRepo.findOne(ivf_enrollment_id);

            // find staff details
            // const staffDetails = await this.staffRepository.findOne(nurse_id);
            if (!id) {
                // save new hcg administration
                const theaterProcedure          = new IvfTheaterProcedureListEntity();
                theaterProcedure.patient        = patient;
                theaterProcedure.ivfEnrollment  = ivfEnrollment;
                theaterProcedure.schedule       = schedule;
                theaterProcedure.procedure      = procedure;
                theaterProcedure.folicile       = folicile;
                theaterProcedure.remarks        = remarks;
                await theaterProcedure.save();
            } else { // update existing hcg administration
                const theaterProcedure = await getRepository(IvfTheaterProcedureListEntity).findOne(id);
                theaterProcedure.patient        = patient;
                theaterProcedure.ivfEnrollment  = ivfEnrollment;
                theaterProcedure.schedule       = schedule;
                theaterProcedure.procedure      = procedure;
                theaterProcedure.folicile       = folicile;
                theaterProcedure.remarks        = remarks;
                await theaterProcedure .save();
            }

            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

}
