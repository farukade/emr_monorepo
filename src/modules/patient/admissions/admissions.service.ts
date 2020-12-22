import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdmissionsRepository } from './repositories/admissions.repository';
import { AdmissionClinicalTaskRepository } from './repositories/admission-clinical-tasks.repository';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { getConnection } from 'typeorm';
import { RoomRepository } from '../../settings/room/room.repository';
import { Admission } from './entities/admission.entity';
import { AdmissionCareGiver } from './entities/admission-care-giver.entity';
import { AdmissionClinicalTask } from './entities/admission-clinical-task.entity';
import * as moment from 'moment';
import { AppGateway } from '../../../app.gateway';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { PatientVitalRepository } from '../repositories/patient_vitals.repository';
import { PatientRequestHelper } from '../../../common/utils/PatientRequestHelper';

@Injectable()
export class AdmissionsService {
    constructor(
        @InjectRepository(AdmissionsRepository)
        private admissionRepository: AdmissionsRepository,
        @InjectRepository(AdmissionClinicalTaskRepository)
        private clinicalTaskRepository: AdmissionClinicalTaskRepository,
        @InjectRepository(PatientRepository)
        private patientRepository: PatientRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
        @InjectRepository(RoomRepository)
        private roomRepository: RoomRepository,
        private readonly appGateway: AppGateway,
        @InjectRepository(PatientVitalRepository)
        private patientVitalRepository: PatientVitalRepository,
    ) {
    }

    async getAdmissions(options: PaginationOptionsInterface, { startDate, endDate, patient_id, status, type, name }) {
        const query = this.admissionRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.patient', 'patient')
            .leftJoinAndSelect('q.room', 'room')
            .select('q.createdAt as admission_date, q.createdBy as admitted_by, q.reason')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber as patient_name, patient.gender as patient_gender')
            .addSelect('room.name as suite, room.floor as floor');

        if (type === 'in-admission') {
            query.innerJoinAndSelect('q.room', 'room')
                .leftJoin('room.category', 'category')
                .addSelect('room.name as room_no, category.name as room_type');
        }

        if (startDate && startDate !== '') {
            const start = moment(startDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt >= '${start}'`);
        }

        if (endDate && endDate !== '') {
            const end = moment(endDate).endOf('day').toISOString();
            query.andWhere(`q.createdAt <= '${end}'`);
        }

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        if (status) {
            query.andWhere('q.status = :status', { status });
        }

        if (name) {
            query.where('q.patient_name like :name', { name: `%${name}%` });
        }

        return await query.take(options.limit).skip(options.page * options.limit).getRawMany();
    }

    async saveAdmission(id: string, createDto: CreateAdmissionDto, createdById): Promise<any> {
        const { healthState, riskToFall, reason, discharge_date } = createDto;
        // find primary care giver
        const staff = await this.staffRepository.createQueryBuilder('staff')
            .where('staff.user_id = :createdById', { createdById })
            .getOne();
        // find patient info
        const patient = await this.patientRepository.findOne(id);

        try {
            // save admission info
            const admission = await this.admissionRepository.save({
                patient, healthState, riskToFall, reason,
                anticipatedDischargeDate: discharge_date,
                // careGiver: staff,
                createdBy: staff.first_name + ' ' + staff.last_name,
            });
            // save care givers
            // await this.saveCareGivers(admission, care_givers);
            // save tasks
            // await this.saveClinicalTasks(admission, tasks);
            // update patient admission status
            patient.isAdmitted = true;
            await patient.save();

            // send new opd socket message
            this.appGateway.server.emit('new-admission', admission);

            return { success: true, admission };
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    async saveAssignBed({ admission_id, room_id }) {
        try {
            // find room
            const room = await this.roomRepository.findOne(room_id);
            // find admission
            const admission = await this.admissionRepository.findOne(admission_id);
            admission.room = room;
            await admission.save();

            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    }

    private async saveCareGivers(admission: Admission, careGivers) {
        for (const giver of careGivers) {
            // find staff details
            const staff = await this.staffRepository.findOne(giver);
            const careGiver = new AdmissionCareGiver();
            careGiver.admission = admission;
            careGiver.staff = staff;
            await careGiver.save();
        }
    }

    async getTasks(options: PaginationOptionsInterface, { patient_id }) {
        const query = this.clinicalTaskRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.patient', 'patient')
            .leftJoinAndSelect('q.request', 'request')
            .select('q.*')
            .addSelect('CONCAT(patient.surname || \' \' || patient.other_names) as patient_name, patient.id as patient_id, patient.fileNumber as patient_file, patient.gender as patient_gender')
            .addSelect('request.status as request_status');

        if (patient_id && patient_id !== '') {
            query.andWhere('q.patient_id = :patient_id', { patient_id });
        }

        const count = await query.getCount();

        query.orderBy({ 'q.completed': 'ASC', 'q.nextTime': 'ASC' });

        // const getSql = query.take(options.limit).skip(options.page * options.limit).getSql();
        // console.log(getSql);
        const result = await query.take(options.limit).skip(options.page * options.limit).getRawMany();

        let results = [];
        for (const request of result) {
            const vitals = await this.patientVitalRepository.find({
                where: { task: request.id },
                order: { createdAt: 'DESC' },
            });

            const admission = await this.admissionRepository.findOne({
                where: { admission: request.admission },
                relations: ['room'],
            });

            const data = {
                ...request,
                vitals,
                admission,
            };
            results = [...results, data];
        }

        return {
            result: results,
            lastPage: Math.ceil(count / options.limit),
            itemsPerPage: options.limit,
            totalPages: count,
            currentPage: options.page + 1,
        };
    }

    async saveClinicalTasks(patientId: number, params, createdById): Promise<any> {
        try {
            const { tasks, prescription } = params;

            const patient = await this.patientRepository.findOne(patientId);
            const admission = await this.admissionRepository.findOne({ where: { patientId: patient.id } });
            const staff = await this.staffRepository.findOne({ where: { user_id: createdById }, relations: ['user'] });

            let request;
            if (prescription.requestBody && prescription.requestBody.length > 0) {
                request = await PatientRequestHelper.handlePharmacyRequest(prescription, patient, staff.user.username);
            }

            let results = [];
            for (const task of tasks) {
                const newTask = new AdmissionClinicalTask();

                if (task.title === 'Medication') {
                    newTask.task = task.title;
                    newTask.title = `Give ${task.dose}dose(s) of ${task.drug.name} every ${task.interval}${task.intervalType}`;
                    newTask.taskType = 'regimen';
                    newTask.dose = task.dose;
                    newTask.drug = task.drug;
                    newTask.request = request?.data;
                    newTask.frequency = task.frequency;
                    newTask.taskCount = task.taskNumber;
                } else {
                    newTask.task = task.name;
                    newTask.title = `Check ${task.name} every ${task.interval}${task.intervalType}`;
                    newTask.taskType = 'vitals';
                    newTask.taskCount = task.taskCount;
                }

                newTask.interval = task.interval;
                newTask.intervalType = task.intervalType;
                newTask.startTime = moment(task.startTime).format('YYYY-MM-DD HH:mm:ss');
                newTask.nextTime = moment(task.startTime).format('YYYY-MM-DD HH:mm:ss');
                newTask.patient = patient;
                newTask.admission = admission;
                newTask.createdBy = staff.user.username;

                const rs = await newTask.save();
                results = [...results, rs];
            }

            return { success: true, results };
        } catch (err) {
            console.log(err);
            return { success: false, message: err.message };
        }
    }
}
