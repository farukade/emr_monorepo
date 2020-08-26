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
import { PaginationOptionsInterface } from '../../../common/paginate';

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
    ) {}

    async getAdmissions(options: PaginationOptionsInterface, {startDate, endDate, patient_id, status, type}) {
        const query = this.admissionRepository.createQueryBuilder('q')
            .leftJoinAndSelect('q.patient', 'patient')
            .select('q.createdAt as admission_date, q.createdBy as admitted_by, q.reason')
            .addSelect('CONCAT(patient.surname, patient.other_names) as patient_name, patient.id as patient_id');

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
            query.andWhere('q.patient_id = :patient_id', {patient_id});
        }

        if (status) {
            query.andWhere('q.status = :status', {status});
        }

        return await query.take(options.limit).skip(options.page * options.limit).getRawMany();

    }

    async saveAdmission(id: string, createDto: CreateAdmissionDto, createdById): Promise<any> {
        const {healthState, riskToFall, reason, discharge_date} = createDto;
        // find primary care giver
        const staff = await this.staffRepository.createQueryBuilder('staff')
            .where('staff.user_id = :createdById', {createdById})
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

            return {success: true, admission};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async saveAssignBed({admission_id, room_id}) {
        try {
            // find room
            const room = await this.roomRepository.findOne(room_id);
            // find admission
            const admission = await this.admissionRepository.findOne(admission_id);
            admission.room = room;
            await admission.save();

            return {success: true};
        } catch (e) {
            return {success: false, message: e.message};
        }
    }

    private async saveCareGivers(admission: Admission, careGivers) {
        for (const giver of careGivers) {
            // find staff details
            const staff = await this.staffRepository.findOne(giver);
            const careGiver = new AdmissionCareGiver();
            careGiver.admission = admission;
            careGiver.staff  = staff;
            await careGiver.save();
        }
    }

    private async saveClinicalTasks(admission, tasks: ITasksInterface[]) {
        for (const task of tasks) {
            const newTask = new AdmissionClinicalTask();
            newTask.task            = task.task;
            newTask.interval        = task.interval;
            newTask.intervalType    = task.intervalType;
            newTask.taskCount       = task.taskCount;
            newTask.startTime       = task.startTime;
            await newTask.save();
        }
    }
}
