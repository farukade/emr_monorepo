import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffRepository } from 'src/modules/hr/staff/staff.repository';
import { Patient } from '../../entities/patient.entity';
import { PatientRepository } from '../../repositories/patient.repository';
import { EmbryoAssessmentDto } from './dto/embryo-assessment.dto';
import { EmbryoTransferDto } from './dto/embryo-transfer.dto';
import { EmbryoIcsiDto } from './dto/icsi.dto';
import { EmbryoSpermPrepDto } from './dto/sperm-prep.dto';
import { EmbryoTreatmentDto } from './dto/treatment.dto';
import { IvfEmbryologyRepository } from './embryology.repository';
import { IvfEmbryoAssessmentRepository } from './repositories/embryo-assessment.repository';
import { EmbryoTransRecordRepository } from './repositories/embryo-trans-record.repository';
import { IvfEmbryoTranferRepository } from './repositories/embryo-transfer.repository';
import { IvfICSIRepository } from './repositories/icsi.repository';
import { IvfSpermPrepRepository } from './repositories/sperm-prep.repository';
import { IvfTreatmentRepository } from './repositories/treatment.repository';

@Injectable()
export class IvfEmbryologyService {
	constructor(
		@InjectRepository(PatientRepository)
		private patientRepository: PatientRepository,
		@InjectRepository(IvfEmbryologyRepository)
		private embryologyRepository: IvfEmbryologyRepository,
		@InjectRepository(IvfEmbryoAssessmentRepository)
		private embryoAssessmentRepository: IvfEmbryoAssessmentRepository,
		@InjectRepository(IvfEmbryoTranferRepository)
		private embryoTranferRepository: IvfEmbryoTranferRepository,
		@InjectRepository(IvfICSIRepository)
		private icsiRepository: IvfICSIRepository,
		@InjectRepository(IvfSpermPrepRepository)
		private spermPrepRepository: IvfSpermPrepRepository,
		@InjectRepository(IvfTreatmentRepository)
		private embryoTreatmentRepository: IvfTreatmentRepository,
		@InjectRepository(EmbryoTransRecordRepository)
		private embryoTransRecordRepository: EmbryoTransRecordRepository,
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
	) {}

	async saveAssessment(data: EmbryoAssessmentDto) {
		try {
			let embryology;
			const { patientId, embryologyId, ...restData } = data;
			const patient = await this.patientRepository.findOne(patientId);

			if (embryologyId) {
				embryology = await this.embryologyRepository.findOne(embryologyId);
			}

			if (!embryology || embryology.isSubmitted == true) {
				embryology = this.embryologyRepository.create();
				embryology.patient = patient;
				embryology.isSubmitted = false;
				await this.patientRepository.save(patient);
				await this.embryologyRepository.save(embryology);
			}

			const newAssessment = this.embryoAssessmentRepository.create(restData);
			await this.embryoAssessmentRepository.save(newAssessment);

			embryology.embryoAssessment = newAssessment;
			await this.embryologyRepository.save(embryology);

			return {
				success: true,
				message: 'form successfully saved',
				embryology,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async saveTransfer(data: EmbryoTransferDto) {
		try {
			const { ivfEmbryoTranferRecord, embryologyId, ...restTransfer } = data;

			const embryology = await this.embryologyRepository.findOne(embryologyId);

			const transRecord = this.embryoTransRecordRepository.create(ivfEmbryoTranferRecord);
			await this.embryoTransRecordRepository.save(transRecord);

			const newTransfer = this.embryoTranferRepository.create(restTransfer);

			newTransfer.ivfEmbryoTranferRecord = transRecord;
			await this.embryoTranferRepository.save(newTransfer);

			embryology.embryoTransfer = newTransfer;
			await this.embryologyRepository.save(embryology);

			return {
				success: true,
				message: 'form successfully saved',
				embryology,
			};
		} catch (error) {
			console.log(error);
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async saveIcsi(data: EmbryoIcsiDto) {
		try {
			const { embryologyId, embryologistId, ...restIcsi } = data;
			const embryology = await this.embryologyRepository.findOne(embryologyId);
			const embryologist = await this.staffRepository.findOne(embryologistId);

			const newIcsi = this.icsiRepository.create(restIcsi);
			newIcsi.embryologist = embryologist;
			await this.icsiRepository.save(newIcsi);

			embryology.icsi = newIcsi;
			await this.embryologyRepository.save(embryology);

			return {
				success: true,
				message: 'form successfully saved',
				embryology,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async saveSpermPrep(data: EmbryoSpermPrepDto) {
		try {
			const { embryologyId, embryologistId, ...restSpermPrep } = data;
			const embryology = await this.embryologyRepository.findOne(embryologyId);
			const embryologist = await this.staffRepository.findOne(embryologistId);

			const spermPrep = this.spermPrepRepository.create(restSpermPrep);
			spermPrep.embryologist = embryologist;
			await this.spermPrepRepository.save(spermPrep);

			embryology.spermPreparation = spermPrep;
			await this.embryologyRepository.save(embryology);

			return {
				success: true,
				message: 'form successfully saved',
				embryology,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async saveTreatment(data: EmbryoTreatmentDto) {
		try {
			const { patientId } = data;
			const embryology = this.embryologyRepository.create();

			let patient = null;
			if (patientId) {
				patient = await this.patientRepository.findOne(patientId);
			};

			if (!patient) return { success: false, message: "patient not found" };

			embryology.patient = patient;
			embryology.isSubmitted = false;
			await this.patientRepository.save(patient);

			const treatment = this.embryoTreatmentRepository.create(data);
			await this.embryoTreatmentRepository.save(treatment);

			embryology.ivfTreatment = treatment;
			embryology.isSubmitted = true;
			await this.embryologyRepository.save(embryology);

			return {
				success: true,
				message: 'form successfully saved',
				embryology,
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async getEmbryologyById(urlParams) {
		try {
			const { embryologyid, patientid } = urlParams;

			if (embryologyid) {
				const embryology = await this.embryologyRepository.findOne(embryologyid, {
					relations: ['embryoAssessment', 'embryoTransfer', 'icsi', 'spermPreparation', 'ivfTreatment'],
				});

				if (!embryology) {
					return {
						success: false,
						message: 'not found',
					};
				}

				return {
					success: true,
					embryology,
				};
			}

			if (patientid) {
				const patient = await this.patientRepository.findOne(patientid, {
					relations: ['embryology'],
				});

				if (!patient) {
					return {
						success: false,
						message: 'not found',
					};
				}

				return {
					success: true,
					patient,
				};
			}

			return {
				success: false,
				message: 'no parameter added to url',
			};
		} catch (error) {
			return {
				success: false,
				message: error.message || 'could not fetch data',
			};
		}
  }
}
