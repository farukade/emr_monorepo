import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoasterRepository } from './roaster.repository';
import { RoasterItemRepository } from './roaster.item.repository';
import { DownloadRoasterDto } from './dto/download-roaster.dto';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { StaffRepository } from '../staff/staff.repository';
import * as moment from 'moment';

@Injectable()
export class HousekeepingService {
    constructor(
        @InjectRepository(RoasterRepository)
        private roasterRepository: RoasterRepository,
        @InjectRepository(RoasterItemRepository)
        private roasterItemRepository: RoasterItemRepository,
        @InjectRepository(DepartmentRepository)
        private departmentRepository: DepartmentRepository,
        @InjectRepository(StaffRepository)
        private staffRepository: StaffRepository,
    ) {}

    async downloadEmtpyRoaster(downloadRoasterDto: DownloadRoasterDto) {
        const { department_id, period } = downloadRoasterDto;
        // find department
        const department = await this.departmentRepository.findOne(downloadRoasterDto.department_id);
        const filename = `${this.slugify(department.name)}-${this.slugify(period)}-roaster.csv`;
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
        return {message: 'Completed', filename};
    }

    async doUploadRoaster(file: any, uploadRoasterDto: DownloadRoasterDto) {
        const { period, department_id } = uploadRoasterDto;
        // find department
        const department = await this.departmentRepository.findOne(department_id);
        // save roaster
        const roaster = await this.roasterRepository.save({ department, period });
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
                    data.schedule.push({duty: row[`Day${index}`]});
                }
                content.push(data);
            })
            .on('end', async () => {
                for (const item of content) {
                    // find staff
                    const staff = await this.staffRepository.findOne({where: {emp_code: item.emp_code}});
                    const data = {
                        staff,
                        roaster,
                        schedule: item.schedule,
                    };
                    await this.roasterItemRepository.save(data);
                }
            });
            return {success: true};
        } catch (err) {
            return {success: false, message: err.message};
        }
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
