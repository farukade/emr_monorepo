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
    ) {}

    async getAdmissions(options: PaginationOptionsInterface, {startDate, endDate, patient_id}) {
        const query = this.admissionRepository.createQueryBuilder('q');

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

        const admissions = await query.take(options.limit).skip(options.page * options.limit).getRawMany();

        return admissions;
    }

    async saveAdmission(id: string, createDto: CreateAdmissionDto, createdBy): Promise<any> {
        const {pcg, healthState, riskToFall, reason, room_id, discharge_date, care_givers, tasks} = createDto;
        // find primary care giver
        const staff = await this.staffRepository.findOne(pcg);
        // find patient info
        const patient = await this.patientRepository.findOne(id);
        // find room
        const room = await getConnection().getRepository(RoomRepository).findOne(room_id);
        try {
            // save admission info
            const admission = await this.admissionRepository.save({
                patient, healthState, riskToFall, reason, room,
                anticipatedDischargeDate: discharge_date,
                careGiver: staff,
                createdBy,
            });
            // save care givers
            await this.saveCareGivers(admission, care_givers);
            // save tasks
            await this.saveClinicalTasks(admission, tasks);

            return {succes: true, admission};
        } catch (err) {
            return {success: false, message: err.message};
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
