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
import { Biopsy } from './entities/biopsy.entity';
import { CellInfo } from './entities/cell-info.entity';
import { IcsiDayRecord } from './entities/day-record.entity';
import { IvfEmbryoTransferRecord } from './entities/embryo-trans-record.entity';
import { BiopsyRepository } from './repositories/biopsy.repository';
import { CellInfoRepository } from './repositories/cell-info.repository';
import { DayRecordsRepository } from './repositories/day-records.repository';
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
		@InjectRepository(CellInfoRepository)
		private cellInfoRepository: CellInfoRepository,
		@InjectRepository(DayRecordsRepository)
		private dayRepository: DayRecordsRepository,
		@InjectRepository(BiopsyRepository)
		private biopsyRepository: BiopsyRepository,
		@InjectRepository(StaffRepository)
		private staffRepository: StaffRepository,
	) { }

	async saveAssessment(data: EmbryoAssessmentDto) {
		try {
			let embryology;
			const { patientId, embryologyId, biopsy, ...restData } = data;
			embryology = await this.embryologyRepository.findOne(embryologyId);

			if (!embryology) {
				return { success: false, message: "embryology not found" }
			};

			const newAssessment = this.embryoAssessmentRepository.create(restData);
			await this.embryoAssessmentRepository.save(newAssessment);

			embryology.embryoAssessment = newAssessment;
			await this.embryologyRepository.save(embryology);

			if (biopsy.length) {
				let biopsyData = [];
				for (const item of biopsy) {
					biopsyData = [{
						type: item.type,
						one: item.one,
						two: item.two,
						three: item.three,
						four: item.four,
						five: item.five,
						six: item.six,
						seven: item.seven,
						eight: item.eight,
						nine: item.nine,
						ten: item.ten,
						eleven: item.eleven,
						twelve: item.twelve,
						assessment: newAssessment
					},
					...biopsyData
					]
				};
				await this.biopsyRepository
					.createQueryBuilder()
					.insert()
					.into(Biopsy)
					.values(biopsyData)
					.execute();
			};

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

	async saveTransfer(data: EmbryoTransferDto) {
		try {
			const { transRecord, embryologistId, embryologyId, ...restTransfer } = data;

			const embryology = await this.embryologyRepository.findOne(embryologyId);
			const embryologist = await this.staffRepository.findOne(embryologistId);

			if (!embryology || !embryologist) {
				return { success: false, message: "embryology or embryologist not found" }
			};

			const newTransfer = this.embryoTranferRepository.create(restTransfer);
			newTransfer.embryologist = embryologist;
			await this.embryoTranferRepository.save(newTransfer);

			embryology.embryoTransfer = newTransfer;
			await this.embryologyRepository.save(embryology);

			if (transRecord.length) {
				let transData = [];
				for (const item of transRecord) {
					transData = [{
						stage: item.stage,
						grade: item.grade,
						comments: item.comments,
						icsi: item.icsi,
						ivf: item.ivf,
						ivf_transfer: item.ivf_transfer
					},
					...transData
					]
				};
				await this.embryoTransRecordRepository
					.createQueryBuilder()
					.insert()
					.into(IvfEmbryoTransferRecord)
					.values(transData)
					.execute();
			};

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
			const { embryologyId, dayOne, embryologistId, ...restIcsi } = data;
			const embryology = await this.embryologyRepository.findOne(embryologyId);
			const embryologist = await this.staffRepository.findOne(embryologistId);

			if (!embryology || !embryologist) {
				return { success: false, message: "embryology or embryologist not found" }
			};

			const newIcsi = this.icsiRepository.create(restIcsi);
			newIcsi.embryologist = embryologist;
			await this.icsiRepository.save(newIcsi);

			embryology.icsi = newIcsi;
			await this.embryologyRepository.save(embryology);

			if (dayOne.length) {
				let dayData = [];
				for (const item of dayOne) {
					dayData = [{
						type: item.type,
						one_pn: item.one_pn,
						two_pn: item.two_pn,
						three_pn: item.three_pn,
						mil: item.mil,
						ml: item.ml,
						gv: item.gv,
						others: item.others,
						comment: item.comment,
						witness: item.witness,
						embryologist: embryologist.user.username,
						icsi: newIcsi
					},
					...dayData
					]
				};
				await this.dayRepository
					.createQueryBuilder()
					.insert()
					.into(IcsiDayRecord)
					.values(dayData)
					.execute();
			};

			return {
				success: true,
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

	async saveSpermPrep(data: EmbryoSpermPrepDto) {
		try {
			const { embryologyId, cellInfo, embryologistId, ...restSpermPrep } = data;
			const embryology = await this.embryologyRepository.findOne(embryologyId);
			const embryologist = await this.staffRepository.findOne(embryologistId);

			if (!embryology || !embryologist) {
				return { success: false, message: "embryology or embryologist not found" }
			};

			const spermPrep = this.spermPrepRepository.create(restSpermPrep);
			spermPrep.embryologist = embryologist;
			await this.spermPrepRepository.save(spermPrep);

			embryology.spermPreparation = spermPrep;
			await this.embryologyRepository.save(embryology);

			if (cellInfo.length) {
				let cellData = [];
				for (const item of cellInfo) {
					cellData = [{
						type: item.type,
						volume: item.volume,
						cells: item.cells,
						density: item.density,
						motility: item.motility,
						prog: item.prog,
						abnor: item.abnor,
						agglutination: item.agglutination,
						sperm_prep: spermPrep
					},
					...cellData
					]
				};
				await this.cellInfoRepository
					.createQueryBuilder()
					.insert()
					.into(CellInfo)
					.values(cellData)
					.execute();
			};

			return {
				success: true,
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
			console.log(error);
			return {
				success: false,
				message: error.message || 'could not save form',
			};
		}
	}

	async getEmbryologyById(urlParams) {
		try {
			const { embryology_id, patient_id } = urlParams;

			if ((!embryology_id || embryology_id == "") && (!patient_id || patient_id == "")) {
				return {
					success: false,
					message: 'no parameter added to url',
				};
			};

			let embryology = null;
			let patient = null;

			if (embryology_id) {
				embryology = await this.embryologyRepository.findOne(embryology_id, {
					relations: ['embryoAssessment', 'embryoTransfer', 'icsi', 'spermPreparation', 'ivfTreatment'],
				});

				if (!embryology) {
					return {
						success: false,
						message: 'embryology not found',
					};
				};
			};

			if (patient_id) {
				patient = await this.patientRepository.findOne(patient_id, {
					relations: [ 
						'embryology', 
						'embryology.embryoAssessment', 
						'embryology.embryoTransfer',
						'embryology.icsi',
						'embryology.spermPreparation',
						'embryology.ivfTreatment'
					],
				});

				if (!patient) {
					return {
						success: false,
						message: 'patient not found',
					};
				};
			};

			if (embryology) {
				return {
					success: true,
					embryology
				}
			} else if (patient) {
				return {
					success: true,
					patient,
				};
			} else {
				return {
					success: false,
					message: 'embryology or patient not found',
				};
			};

		} catch (error) {
			console.log(error);
			return {
				success: false,
				message: error.message || 'could not fetch data',
			};
		}
	}
}
