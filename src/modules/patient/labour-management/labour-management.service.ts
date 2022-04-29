import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LabourEnrollmentRepository } from './repositories/labour-enrollment.repository';
import { LabourEnrollmentDto } from './dto/labour-enrollment.dto';
import { PatientRepository } from '../repositories/patient.repository';
import * as moment from 'moment';
import { LabourEnrollment } from './entities/labour_enrollment.entity';
import { PaginationOptionsInterface } from '../../../common/paginate';
import { getStaff } from '../../../common/utils/utils';
import { AntenatalEnrollmentRepository } from '../antenatal/enrollment.repository';
import { getConnection } from 'typeorm';

@Injectable()
export class LabourManagementService {
	constructor(
		@InjectRepository(LabourEnrollmentRepository)
		private labourEnrollmentRepository: LabourEnrollmentRepository,
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(AntenatalEnrollmentRepository)
		private ancEnrollmentRepository: AntenatalEnrollmentRepository,
	) {}

	async getLabours(options: PaginationOptionsInterface, urlParams): Promise<any> {
		const { startDate, endDate, patient_id } = urlParams;

		const page = options.page - 1;

		const query = this.labourEnrollmentRepository.createQueryBuilder('q').select('q.*');

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

		const labours = await query
			.offset(page * options.limit)
			.limit(options.limit)
			.orderBy('q.createdAt', 'DESC')
			.getRawMany();

		const total = await query.getCount();

		let result = [];
		for (const labour of labours) {
			labour.patient = await this.patientRepository.findOne(labour.patient_id, {
				relations: ['nextOfKin', 'immunization', 'hmo'],
			});

			labour.staff = await getStaff(labour.createdBy);
			labour.antenatal = labour.antenatal_id ? await this.ancEnrollmentRepository.findOne(labour.antenatal_id) : null;

			result = [...result, labour];
		}

		return {
			result,
			lastPage: Math.ceil(total / options.limit),
			itemsPerPage: options.limit,
			totalPages: total,
			currentPage: options.page,
		};
	}

	async saveEnrollment(params: LabourEnrollmentDto, createdBy): Promise<any> {
		try {
			const { patient_id, antenatal_id, father, alive, miscarriage, present_pregnancies, lmp } = params;

			const requestCount = await getConnection().createQueryBuilder().select('*').from(LabourEnrollment, 'q').withDeleted().getCount();

			const nextId = `00000${requestCount + 1}`;
			const code = `LB${moment().format('YY')}/${moment().format('MM')}/${nextId.slice(-5)}`;

			const patient = await this.patientRepository.findOne(patient_id);

			const antenatal = antenatal_id && antenatal_id !== '' ? await this.ancEnrollmentRepository.findOne(antenatal_id) : null;

			const enrollment = new LabourEnrollment();
			enrollment.serial_code = code;
			enrollment.patient = patient;
			enrollment.antenatal = antenatal;
			enrollment.father = father;
			enrollment.alive = alive;
			enrollment.miscarriage = miscarriage;
			enrollment.present_pregnancies = present_pregnancies;
			enrollment.lmp = lmp;
			enrollment.status = 0;
			enrollment.createdBy = createdBy;

			const rs = await this.labourEnrollmentRepository.save(enrollment);

			patient.labour_id = rs.id;
			await patient.save();

			return { success: true, enrollment: rs };
		} catch (err) {
			return { success: false, message: err.message };
		}
	}

	// async doSaveMeasurement(id: number, dto: LabourMeasurementDto, createdBy): Promise<any> {
	//     try {
	//         const { labTests, examiner_id } = dto;
	//
	//         const enrollment = await this.labourEnrollmentRepository.findOne(id);
	//
	//         const measure = new LabourMeasurement();
	//         measure.lastChangedBy = createdBy;
	//         measure.enrollment = enrollment;
	//         measure.examiner = await this.staffRepository.findOne(examiner_id);
	//
	//         const measurement = await this.labourMeasurementRepo.save(measure);
	//
	//         // TODO: request for lab tests
	//
	//         // let mappedIds = [];
	//         //
	//         // if (labTests.length > 0) {
	//         //     mappedIds = labTests.map(id => {
	//         //         id;
	//         //     });
	//         //     let labRequest = await PatientRequestHelper.handleLabRequest({
	//         //         requestBody: mappedIds,
	//         //         request_note: 'IVF enrollment lab tests',
	//         //     }, enrollment.patient, createdBy);
	//         //     if (labRequest.success) {
	//         //         // save transaction
	//         //         const payment = await RequestPaymentHelper.clinicalLabPayment(labRequest.data, enrollment.patient, createdBy);
	//         //         labRequest = { ...payment.labRequest };
	//         //
	//         //         this.appGateway.server.emit('paypoint-queue', { payment: payment.transactions });
	//         //     }
	//         // }
	//
	//         return { success: true, data: measurement };
	//     } catch (err) {
	//         return { success: false, message: err.message };
	//     }
	// }
	//
	// async doSaveVital(id: string, dto: LabourVitalDto, createdBy): Promise<any> {
	//     try {
	//         dto.createdBy = createdBy;
	//         dto.lastChangedBy = createdBy;
	//         dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
	//         const vitals = await this.labourVitalRepo.save(dto);
	//         return { success: true, data: vitals };
	//     } catch (err) {
	//         return { success: false, message: err.message };
	//     }
	// }
	//
	// async doSaveRiskAssessment(id: string, dto: LabourRistAssesmentDto, createdBy): Promise<any> {
	//     try {
	//         dto.createdBy = createdBy;
	//         dto.lastChangedBy = createdBy;
	//         dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
	//         const assessment = await this.labourRiskAssessmentRepo.save(dto);
	//         return { success: true, data: assessment };
	//     } catch (err) {
	//         return { success: false, message: err.message };
	//     }
	// }
	//
	// async doSaveDeliveryRecord(id: string, dto: LabourDeliveryRecordDto, createdBy): Promise<any> {
	//     try {
	//         dto.createdBy = createdBy;
	//         dto.lastChangedBy = createdBy;
	//         dto.pediatrician = await this.staffRepository.findOne(dto.pediatrician_id);
	//         dto.enrollment = await this.labourEnrollmentRepository.findOne(id);
	//         const assessment = await this.labourDeliveryRepo.save(dto);
	//         return { success: true, data: assessment };
	//     } catch (err) {
	//         return { success: false, message: err.message };
	//     }
	// }
	//
	// async fetchMeasurement(id: number): Promise<LabourMeasurement[]> {
	//     const enrollment = await this.labourEnrollmentRepository.findOne(id);
	//     const results = await this.labourMeasurementRepo.find({ where: { enrollment } });
	//
	//     for (const result of results) {
	//         // find service record
	//         // const enrollment_lab_tests = [];
	//         // TODO: pick labs from request
	//         // if (result.labTests !== null) {
	//         //     const iterators = String(result.labTests).split(',');
	//         //     for (const labTestId of iterators) {
	//         //         // find service record
	//         //         const sertest = await this.labTestRepository.findOne(labTestId);
	//         //         enrollment_lab_tests.push(sertest);
	//         //     }
	//         // }
	//         //
	//         // result.labTests = enrollment_lab_tests;
	//     }
	//     return results;
	// }
	//
	// async fetchVital(id: string): Promise<LabourVital[]> {
	//     const enrollment = await this.labourEnrollmentRepository.findOne(id);
	//     const results = await this.labourVitalRepo.find({ where: { enrollment } });
	//     return results;
	// }
	//
	// async fetchRiskAssessment(id: string): Promise<LabourRiskAssessment[]> {
	//     const enrollment = await this.labourEnrollmentRepository.findOne(id);
	//     const results = await this.labourRiskAssessmentRepo.find({ where: { enrollment } });
	//     return results;
	// }
	//
	// async fetchDeliveryRecord(id: string): Promise<LabourDeliveryRecord[]> {
	//     const enrollment = await this.labourEnrollmentRepository.findOne(id);
	//     const results = await this.labourDeliveryRepo.find({ where: { enrollment } });
	//     return results;
	// }
}
