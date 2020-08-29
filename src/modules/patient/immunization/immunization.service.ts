import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';

import { PatientRepository } from '../repositories/patient.repository';
import { ImmunizationRepository } from './repositories/immunization.repository';
import { StaffRepository } from '../../hr/staff/staff.repository';
import { Immunization } from './entities/immunization.entity';

@Injectable()
export class ImmunizationService {
  constructor(
    @InjectRepository(ImmunizationRepository)
    private immunizationRepository: ImmunizationRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
  ) {

  }

  async fetch(id: string): Promise<Immunization[]> {
    const records = await this.immunizationRepository.find({
      where: { patient_id: id },
      relations: ['patient'],
      order: { id: 'ASC' },
    });

    return records;
  }

  async enroll(param, createdBy): Promise<any> {
    const { patient_id } = param;
    try {

      const patient = await this.patientRepository.findOne(patient_id);
      if (patient) {
        const staff = await this.staffRepository.findOne({ where: { username: createdBy } });

        const immunizations = await this.immunizationRepository.find({ where: { patient_id: patient.id } });
        if (immunizations.length === 0) {
          const vaccines = [
            {
              name: 'BCG',
              slug: 'bcg',
              description: 'Bacille Calmette Guerin',
              weeks: [{ time: 0, type: 'w' }],
            },
            {
              name: 'OPV',
              slug: 'opv',
              description: 'Oral Polio Vaccine',
              weeks: [{ time: 0, type: 'w' }, { time: 2, type: 'w' }, { time: 4, type: 'w' }, {
                time: 6,
                type: 'w',
              }, { time: 12, type: 'w' }],
            },
            {
              name: 'HBV',
              slug: 'hbv',
              description: 'Hepatitis B Vaccine',
              weeks: [{ time: 0, type: 'w' }],
            },
            {
              name: 'Pentavales Vaccine',
              slug: 'pentavales',
              description: 'DTP, HiB, Hepatitis B',
              weeks: [{ time: 2, type: 'w' }, { time: 4, type: 'w' }, { time: 6, type: 'w' }],
            },
            {
              name: 'Rotavirus',
              slug: 'rotavirus',
              description: 'Diarrhoea x Vomiting',
              weeks: [{ time: 2, type: 'w' }, { time: 4, type: 'w' }],
            },
            {
              name: 'PCV',
              slug: 'pcv',
              description: 'Pneumococcal Conjugate',
              weeks: [{ time: 2, type: 'w' }, { time: 4, type: 'w' }, { time: 6, type: 'w' }, { time: 12, type: 'w' }],
            },
            {
              name: 'IPV',
              slug: 'ipv',
              description: 'Inactivated Polio Vaccine',
              weeks: [{ time: 6, type: 'w' }],
            },
            {
              name: 'Vit A',
              slug: 'vita',
              description: 'Vitamin A',
              weeks: [{ time: 8, type: 'w' }],
            },
            {
              name: 'Measles',
              slug: 'measles',
              description: 'Measles',
              weeks: [{ time: 10, type: 'w' }],
            },
            {
              name: 'Yellow Fever',
              slug: 'yellow_fever',
              description: 'Yellow Fever',
              weeks: [{ time: 10, type: 'w' }],
            },
            {
              name: 'Meningococcal Conjugate',
              slug: 'meningococcal',
              description: 'Meningococcal',
              weeks: [{ time: 12, type: 'w' }],
            },
            {
              name: 'DTP/PTO Vitamin A',
              slug: 'dtp_pto',
              description: 'Vitamin A',
              weeks: [{ time: 12, type: 'w' }],
            },
            {
              name: 'MMR Chicken Pox',
              slug: 'chicken_pox',
              description: 'Measles, Mumps, Rubella',
              weeks: [{ time: 14, type: 'w' }, { time: 16, type: 'w' }],
            },
            {
              name: 'Hep A',
              slug: 'hepa',
              description: 'Hepatitis A',
              weeks: [{ time: 16, type: 'w' }, { time: 6, type: 'M' }],
            },
            {
              name: 'Typhoid Fever',
              slug: 'typhoid_fever',
              description: 'Typhoid Fever',
              weeks: [{ time: 6, type: 'M' }],
            },
          ];

          let records = [];

          for (const vaccine of vaccines) {
            for (let i = 0; i < vaccine.weeks.length; i++) {
              const unit = vaccine.weeks[i].type === 'w' ? 'w' : 'M';
              const type = vaccine.weeks[i].type === 'w' ? 'wks' : 'months';
              const data = {
                patient,
                name_of_vaccine: vaccine.name,
                slug: vaccine.slug,
                description: vaccine.description,
                date_due: moment(new Date(patient.date_of_birth)).add(vaccine.weeks[i].time, unit).format('YYYY-MM-DD'),
                period: vaccine.weeks[i].time === 0 ? 'Birth' : `${vaccine.weeks[i].time} ${type}`,
                createdBy: staff,
              };

              const record = await this.immunizationRepository.save(data);
              records = [...records, record];
            }
          }

          return { success: true, records };
        }

        return { success: false, message: 'Patient already enrolled on immunization' };
      } else {
        return { success: false, message: 'Patient record was not found' };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
