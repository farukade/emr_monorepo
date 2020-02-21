import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoasterRepository } from './roaster.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { StaffRepository } from '../staff/staff.repository';
import * as moment from 'moment';
import { ListRoasterDto } from './dto/list-roaster.dto';
import { Roaster } from './entities/roaster.entity';
import { Department } from '../../settings/entities/department.entity';
import { StaffDetails } from '../staff/entities/staff_details.entity';
import { UploadRoasterDto } from './dto/upload-roaster.dto';

@Injectable()
export class HousekeepingService {
    constructor(
        @InjectRepository(RoasterRepository)
        private roasterRepository: RoasterRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
    ) {}

    async downloadEmtpyRoaster(query) {
        const { department_id, period } = query;
        // find department
        const department = await this.departmentRepository.findOne(department_id);
        const filename = `roaster.csv`;
        const noOfDays = moment(period, 'YYYY-MM').daysInMonth();
        const fs = require('fs');
        const createCsvWriter = require('csv-writer').createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: filename,
            header: [
                {id: 'sn', title: 'S/N'},
                {id: 'emp_code', title: 'EMP CODE'},
                {id: 'name', title: 'NAME'},
            ],
        });

        for (let index = 1; index <= noOfDays; index++) {
            csvWriter.csvStringifier.header.push({id: `day${index}`, title: `Day${index}`});
        }

        // find staffs
        const staffs = await this.staffRepository.find({where: {department}});
        if (staffs) {
            let sn = 1;
            for (const staff of staffs) {
                const data = [
                    {
                        sn,
                        emp_code: staff.emp_code,
                        name: `${staff.last_name}, ${staff.first_name}`,
                    },
                ];

                await csvWriter.writeRecords(data);
                sn++;
            }
        } else {
            const data = [
                {
                    sn: '',
                    emp_code: '',
                    name: '',
                },
            ];
            await csvWriter.writeRecords({data});
        }
        return {message: 'Completed', filename};
    }

    async doUploadRoaster(file: any, uploadRoasterDto: UploadRoasterDto) {
        const { period, department_id } = uploadRoasterDto;
        // find department
        const department = await this.departmentRepository.findOne(department_id);

        const noOfDays = moment(period, 'YYYY-MM').daysInMonth();

        const csv = require('csv-parser');
        const fs = require('fs');
        const content = [];
        try {
            // read uploaded file
            fs.createReadStream(file.path)
            .pipe(csv())
            .on('data', (row) => {
                const data = {
                    emp_code: row['EMP CODE'],
                    schedule: [],
                };
                for (let index = 1; index <= noOfDays; index++) {
                    data.schedule.push({
                        date: index,
                        duty: row[`Day${index}`],
                    });
                }
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    // find staff
                    const staff = await this.staffRepository.findOne({where: {emp_code: item.emp_code}});
                    const data = {
                        staff,
                        department,
                        period,
                        schedule: item.schedule,
                    };
                    await this.roasterRepository.save(data);
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
    }

    async listRoaster(listRoasterDto: ListRoasterDto): Promise<Roaster[]> {
        const { department_id, period} = listRoasterDto;

        const query = this.roasterRepository.createQueryBuilder('roaster')
                        .leftJoin(Department, 'dept', 'roaster.department_id = dept.id')
                        .innerJoin(StaffDetails, 'staff', 'roaster.staff_id = staff.id')
                        .select(['period, roaster.id, schedule'])
                        .addSelect('dept.name as deptName, staff.first_name, staff.last_name')
                        .where('roaster.period = :period', { period });
        if (department_id !== '') {
            // const department = await this.departmentRepository.findOne(department_id);
            query.andWhere('roaster.department_id = :department_id', {department_id});
        }
        const results = await query.getRawMany();

        return results;
    }

    slugify(text) {
        return text
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '-') // Replace spaces with -
          .replace(/[^\w\-]+/g, '') // Remove all non-word chars
          .replace(/\-\-+/g, '-') // Replace multiple - with single -
          .replace(/^-+/, '') // Trim - from start of text
          .replace(/-+$/, ''); // Trim - from end of text
    }
}
