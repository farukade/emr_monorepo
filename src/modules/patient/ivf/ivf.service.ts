import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getConnection, getRepository } from 'typeorm';
import { IvfEnrollmentRepository } from './ivf_enrollment.repository';
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
import { PatientRequest } from '../entities/patient_requests.entity';
import * as moment from 'moment';
import { RequestPaymentHelper } from '../../../common/utils/RequestPaymentHelper';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';
import { AppGateway } from '../../../app.gateway';
import { PatientRequestItem } from '../entities/patient_request_items.entity';
import { User } from '../../hr/entities/user.entity';
import { StaffDetails } from '../../hr/staff/entities/staff_details.entity';
import { PatientRequestItemRepository } from '../repositories/patient_request_items.repository';
import { PatientRequestRepository } from '../repositories/patient_request.repository';

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
        private readonly appGateway: AppGateway,
    ) {
    }

    async saveEnrollment(ivfEnrollmentDto: IvfEnrollmentDto, userId, createdBy): Promise<any> {
        try {
            const { wife_id, husband_id, labTests } = ivfEnrollmentDto;

            // find user
            const user = await this.staffRepository.findOne(userId);

            // wife patient details
            const patient = await this.patientRepository.findOne(wife_id, { relations: ['hmo'] });
            ivfEnrollmentDto.wife = patient;
            // husband patient details
            ivfEnrollmentDto.husband = await this.patientRepository.findOne(husband_id);
            // save enrollment details
            const data = await this.ivfEnrollmentRepo.save(ivfEnrollmentDto);

            // TODO: add lab tests
            let mappedIds = []
            let requests = [];
            if(labTests.length > 0 ){
                labTests.forEach(id=>mappedIds.push({id}))
                console.log(mappedIds)
                let labRequest = await PatientRequestHelper.handleLabRequest({tests:mappedIds, 
                    request_note:"IVF enrollment lab tests", requestType:'ivf'}, patient, createdBy);
                if (labRequest.success) {
                    // save transaction
                    const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, patient, createdBy);
                    
                    for (const request of labRequest.data) {
                        const labRequest = await getConnection().getRepository(PatientRequest).findOne(request.id, { relations: ['items'] });
                        
                        labRequest.ivf = data;
                        await labRequest.save();
                        requests = [...requests, labRequest]
                    }            
                    this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
                }
            }
            return { success: true, data: {...data, requests} };
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

    async getEnrollments(options: PaginationOptionsInterface, params): Promise<Pagination> {
        const { startDate, endDate, patient_id } = params;
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
            query.andWhere('q.wife_patient_id = :wife_patient_id', { wife_patient_id: patient_id });
        }

        const ivfs = await query.offset(options.page * options.limit)
            .limit(options.limit)
            .orderBy('q.createdAt', 'DESC')
            .getRawMany();

        const total = await query.getCount();
        let objInplace = [];
        for (const ivf of ivfs) {

            if (ivf.husband_patient_id) {
                ivf.husband = await this.patientRepository.findOne(ivf.husband_patient_id);
            }

            if (ivf.wife_patient_id) {
                ivf.wife = await this.patientRepository.findOne(ivf.wife_patient_id);
            }
            const requests = await this.patientRequestRepository.find({ where: { ivf }, relations: ['items'] });
            objInplace = [...objInplace, {id: ivf.id, requests}]
        }

        const collection = ivfs.map(ivf=>{
            const obj = objInplace.find(obj=>obj.id === ivf.id);
            return({...ivf, requests: obj.requests});
        })

        return {
            result: collection,
            lastPage: Math.ceil(total / options.limit),
            itemsPerPage: options.limit,
            totalPages: total,
            currentPage: options.page + 1,
        };
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

    async doSaveHCGAdministration(params, user) {
        const { patient_id, ivf_enrollment_id, timeOfEntry, timeOfAdmin, typeOfDosage, typeOfHcg, routeOfAdmin, nurse_id, remarks, id } = params;

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
            } else { // update existing hcg administration
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

}
