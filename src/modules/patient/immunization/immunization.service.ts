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
        return await this.immunizationRepository.createQueryBuilder('i')
            .where('i.patient_id = :id', { id })
            .leftJoinAndSelect('i.administeredBy', 'staff')
            .orderBy('i.id', 'ASC')
            .getMany();
    }

    async enroll(param, createdBy): Promise<any> {
        const { patient_id } = param;
        try {

            const patient = await this.patientRepository.findOne(patient_id);
            if (patient) {
                const immunizations = await this.immunizationRepository.createQueryBuilder('i')
                    .where('i.patient_id = :patient_id', { patient_id })
                    .getMany();

                if (immunizations.length === 0) {
                    const vaccines = [
                        {
                            name: 'BCG',
                            slug: 'bcg',
                            description: 'Bacille Calmette Guerin',
                            weeks: [{ time: 0, type: 'w', gender: 'all' }],
                        },
                        {
                            name: 'OPV',
                            slug: 'opv',
                            description: 'Oral Polio Vaccine',
                            // tslint:disable-next-line:max-line-length
                            weeks: [{ time: 0, type: 'w', gender: 'all' }, { time: 6, type: 'w', gender: 'all' }, { time: 10, type: 'w', gender: 'all' }, { time: 14, type: 'w', gender: 'all' }, { time: 5, type: 'y', gender: 'male' }],
                        },
                        {
                            name: 'HBV',
                            slug: 'hbv',
                            description: 'Hepatitis B Vaccine',
                            weeks: [{ time: 0, type: 'w', gender: 'all' }, { time: 18, type: 'M', gender: 'male' }, { time: 2, type: 'y', gender: 'male' }],
                        },
                        {
                            name: 'Pentavalent Vaccine',
                            slug: 'pentavalent',
                            description: 'Pentavalent Vaccine',
                            weeks: [{ time: 6, type: 'w', gender: 'all' }, { time: 10, type: 'w', gender: 'all' }, { time: 14, type: 'w', gender: 'all' }],
                        },
                        {
                            name: 'Rotavirus',
                            slug: 'rotavirus',
                            description: 'Rotavirus Vaccine',
                            weeks: [{ time: 6, type: 'w', gender: 'all' }, { time: 10, type: 'w', gender: 'all' }],
                        },
                        {
                            name: 'PCV',
                            slug: 'pcv',
                            description: 'Pneumococcal Conjugate',
                            weeks: [{ time: 6, type: 'w', gender: 'all' }, { time: 10, type: 'w', gender: 'all' }, { time: 14, type: 'w', gender: 'all' }],
                        },
                        {
                            name: 'IPV',
                            slug: 'ipv',
                            description: 'Inactivated Polio Vaccine',
                            weeks: [{ time: 14, type: 'w', gender: 'all' }],
                        },
                        {
                            name: 'Vit A',
                            slug: 'vita',
                            description: 'Vitamin A',
                            weeks: [{ time: 6, type: 'M', gender: 'all' }, { time: 12, type: 'M', gender: 'all' }],
                        },
                        {
                            name: 'Measles',
                            slug: 'measles',
                            description: 'Measles Vaccine',
                            weeks: [{ time: 9, type: 'M', gender: 'all' }],
                        },
                        {
                            name: 'Yellow Fever',
                            slug: 'yellow_fever',
                            description: 'Yellow Fever Vaccine',
                            weeks: [{ time: 9, type: 'M', gender: 'all' }, { time: 10, type: 'y', gender: 'all' }],
                        },
                        {
                            name: 'Meningococcal Conjugate',
                            slug: 'meningococcal',
                            description: 'Meningococcal',
                            weeks: [{ time: 10, type: 'w', gender: 'male' }, { time: 18, type: 'w', gender: 'male' }, { time: 9, type: 'M', gender: 'female' }, { time: 12, type: 'M', gender: 'all' }],
                        },
                        {
                            name: 'MMR',
                            slug: 'mmr',
                            description: 'Measles, Mumps, Rubella',
                            weeks: [{ time: 12, type: 'M', gender: 'all' }, { time: 13, type: 'M', gender: 'all' }, { time: 5, type: 'y', gender: 'male' }],
                        },
                        {
                            name: 'Hep A',
                            slug: 'hepa',
                            description: 'Hepatitis A Vaccine',
                            weeks: [{ time: 18, type: 'M', gender: 'all' }, { time: 2, type: 'y', gender: 'all' }],
                        },
                        {
                            name: 'Typhoid Fever',
                            slug: 'typhoid_fever',
                            description: 'Typhoid Fever Vaccine',
                            weeks: [{ time: 2, type: 'y', gender: 'all' }, { time: 5, type: 'y', gender: 'all' }],
                        },
                        {
                            name: 'Varicella',
                            slug: 'varicella',
                            description: 'Varicella',
                            weeks: [{ time: 12, type: 'M', gender: 'all' }, { time: 13, type: 'M', gender: 'all' }],
                        },
                        {
                            name: 'DTAP Booster',
                            slug: 'dtap_booster',
                            description: 'DTAP Booster',
                            weeks: [{ time: 18, type: 'M', gender: 'male' }, { time: 5, type: 'y', gender: 'male' }],
                        },
                        {
                            name: 'Tetanus Toxoid',
                            slug: 'tetanus',
                            description: 'Tetanus Toxoid',
                            weeks: [{ time: 10, type: 'y', gender: 'female' }],
                        },
                        {
                            name: 'HPV',
                            slug: 'hpv',
                            description: 'Human Papillomavirus',
                            // tslint:disable-next-line:max-line-length
                            weeks: [{ time: 9, type: 'y', gender: 'female' }, { time: 9, type: 'y', extra: 1, gender: 'female' }, { time: 9, type: 'y', gender: 'female', extra: 6 }],
                        },
                    ];

                    let records = [];

                    for (const vaccine of vaccines) {
                        // tslint:disable-next-line:prefer-for-of
                        for (let i = 0; i < vaccine.weeks.length; i++) {
                            const unit = vaccine.weeks[i].type;
                            let type = 'wks';
                            if (vaccine.weeks[i].type === 'M') {
                                type = 'months';
                            } else if (vaccine.weeks[i].type === 'y') {
                                type = 'years';
                            }
                            const time = vaccine.weeks[i].time;
                            const extra = vaccine.weeks[i]?.extra;

                            let dateDue = moment(new Date(patient.date_of_birth)).add(time, unit as moment.DurationInputArg2);
                            if (extra) {
                                dateDue = dateDue.add(extra, 'months');
                            }

                            const extras = extra ? ` + ${extra}` : '';

                            const gender = vaccine.weeks[i].gender;
                            if (gender === 'all' || patient.gender.toLowerCase() === gender) {
                                const data = {
                                    patient,
                                    name_of_vaccine: vaccine.name,
                                    slug: vaccine.slug,
                                    description: vaccine.description,
                                    date_due: dateDue.format('YYYY-MM-DD'),
                                    period: vaccine.weeks[i].time === 0 ? 'Birth' : `${vaccine.weeks[i].time} ${type}${extras}`,
                                    createdBy,
                                };

                                const record = await this.immunizationRepository.save(data);
                                records = [...records, record];
                            }
                        }
                    }

                    patient.immunization = await this.immunizationRepository.find({ where: { patient } });

                    return { success: true, patient };
                }

                return { success: false, message: 'Patient already enrolled on immunization' };
            } else {
                return { success: false, message: 'Patient record was not found' };
            }
        } catch (error) {
            console.log(error);
            return { success: false, message: error.message };
        }
    }
}
