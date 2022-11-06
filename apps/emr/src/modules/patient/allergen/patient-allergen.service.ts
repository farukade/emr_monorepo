import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PatientAllergyDto } from '../dto/patient.allergy.dto';
import { PatientRepository } from '../repositories/patient.repository';
import { Raw } from 'typeorm';
import { PatientNoteRepository } from '../repositories/patient_note.repository';
import { PatientNote } from '../entities/patient_note.entity';
import { DrugGenericRepository } from '../../inventory/pharmacy/generic/generic.repository';
import { AdmissionsRepository } from '../admissions/repositories/admissions.repository';
import { NicuRepository } from '../nicu/nicu.repository';

@Injectable()
export class PatientAllergenService {
  constructor(
    @InjectRepository(PatientNoteRepository)
    private patientNoteRepository: PatientNoteRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(DrugGenericRepository)
    private drugGenericRepository: DrugGenericRepository,
    @InjectRepository(AdmissionsRepository)
    private admissionRepository: AdmissionsRepository,
    @InjectRepository(NicuRepository)
    private nicuRepository: NicuRepository,
  ) {}

  async getAllergies(options, urlParams): Promise<any> {
    const { q, patient_id } = urlParams;

    const page = options.page - 1;

    let result;
    let total = 0;

    const patient = await this.patientRepository.findOne(patient_id);

    if (q && q.length > 0) {
      [result, total] = await this.patientNoteRepository.findAndCount({
        where: {
          name: Raw((alias) => `LOWER(${alias}) Like '%${q.toLowerCase()}%'`),
          patient,
          type: 'allergy',
        },
        relations: ['patient', 'drugGeneric'],
        take: options.limit,
        skip: page * options.limit,
      });
    } else {
      [result, total] = await this.patientNoteRepository.findAndCount({
        where: { patient, type: 'allergy' },
        relations: ['patient', 'drugGeneric'],
        take: options.limit,
        skip: page * options.limit,
      });
    }

    return {
      result,
      lastPage: Math.ceil(total / options.limit),
      itemsPerPage: options.limit,
      totalPages: total,
      currentPage: options.page,
    };
  }

  async doSaveAllergies(param: PatientAllergyDto, createdBy): Promise<any> {
    try {
      const { category, allergy, severity, reaction, patient_id, generic_id } = param;

      const patient = await this.patientRepository.findOne(patient_id);

      const generic = generic_id ? await this.drugGenericRepository.findOne(generic_id) : null;

      const admission = await this.admissionRepository.findOne({ where: { patient, status: 0 } });

      const nicu = await this.nicuRepository.findOne({ where: { patient, status: 0 } });

      const patientAllergen = new PatientNote();
      patientAllergen.category = category;
      patientAllergen.allergy = allergy;
      patientAllergen.drugGeneric = generic;
      patientAllergen.severity = severity;
      patientAllergen.admission = admission;
      patientAllergen.nicu = nicu;
      patientAllergen.reaction = reaction;
      patientAllergen.patient = patient;
      patientAllergen.type = 'allergy';
      patientAllergen.createdBy = createdBy;
      await patientAllergen.save();

      return { success: true, allergy };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async doUpdateAllergy(id, param: PatientAllergyDto, updatedBy): Promise<any> {
    try {
      const { category, allergy, severity, reaction, generic_id } = param;

      const generic = generic_id ? await this.drugGenericRepository.findOne(generic_id) : null;

      const patientAllergen = await this.patientNoteRepository.findOne(id);
      patientAllergen.category = category;
      patientAllergen.allergy = allergy;
      patientAllergen.drugGeneric = generic;
      patientAllergen.severity = severity;
      patientAllergen.reaction = reaction;
      patientAllergen.lastChangedBy = updatedBy;
      const rs = await patientAllergen.save();

      return { success: true, allergy: rs };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  async deleteAllergen(id: number, username) {
    const allergen = await this.patientNoteRepository.findOne(id);

    if (!allergen) {
      throw new NotFoundException(`Patient allergen with ID '${id}' not found`);
    }

    allergen.deletedBy = username;
    await allergen.save();

    return allergen.softRemove();
  }
}
