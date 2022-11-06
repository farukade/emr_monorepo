import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RosterRepository } from './roster.repository';
import { DepartmentRepository } from '../../settings/departments/department.repository';
import { StaffRepository } from '../staff/staff.repository';
import * as moment from 'moment';
import { Roster } from './entities/roster.entity';
import { Department } from '../../settings/entities/department.entity';
import { StaffDetails } from '../staff/entities/staff_details.entity';
import { UploadRosterDto } from './dto/upload-roster.dto';
import * as path from 'path';
import { slugify } from '../../../common/utils/utils';

@Injectable()
export class HousekeepingService {
  constructor(
    @InjectRepository(RosterRepository)
    private rosterRepository: RosterRepository,
    @InjectRepository(DepartmentRepository)
    private departmentRepository: DepartmentRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository,
  ) {}

  async listRoster(params): Promise<Roster[]> {
    const { department_id, period, staff_id } = params;

    const query = this.rosterRepository
      .createQueryBuilder('r')
      .leftJoin(Department, 'dept', 'r.department_id = dept.id')
      .innerJoin(StaffDetails, 'staff', 'r.staff_id = staff.id')
      .select(['period, r.id, schedule'])
      .addSelect('dept.name as deptName, staff.first_name, staff.last_name')
      .where('r.period = :period', { period });

    if (department_id !== '') {
      query.andWhere('r.department_id = :department_id', { department_id });
    }

    if (staff_id && staff_id !== '') {
      query.andWhere('r.staff = :staff_id', { staff_id });
    }

    return await query.getRawMany();
  }

  async downloadEmptyRoster(query): Promise<any> {
    try {
      const { department_id, period } = query;

      const department = await this.departmentRepository.findOne(department_id);

      const month = moment().format('MM');
      const year = moment().format('yyyy');
      const filename = `${slugify(department.name)}-${month}.${year}.roster.csv`;
      const filepath = path.resolve(__dirname, `../../../../public/downloads/${filename}`);
      const noOfDays = moment(period, 'YYYY-MM').daysInMonth();

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const createCsvWriter = require('csv-writer').createObjectCsvWriter;
      const csvWriter = createCsvWriter({
        path: filepath,
        header: [
          { id: 'sn', title: 'S/N' },
          { id: 'staff_id', title: 'Staff ID' },
          { id: 'name', title: 'NAME' },
        ],
      });

      for (let index = 1; index <= noOfDays; index++) {
        csvWriter.csvStringifier.header.push({ id: `day${index}`, title: `Day${index}` });
      }

      // find staffs
      const staffs = await this.staffRepository.find({ where: { department } });
      if (staffs.length > 0) {
        let sn = 1;
        for (const staff of staffs) {
          const data = [{ sn, staff_id: staff.id, name: `${staff.first_name} ${staff.last_name}` }];
          await csvWriter.writeRecords(data);
          sn++;
        }

        const url = `${process.env.ENDPOINT}/downloads/${filename}`;

        return { success: true, url };
      }

      return { success: false, message: 'no staff(s) found' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  async doUploadRoster(file: any, uploadRosterDto: UploadRosterDto, username: string) {
    const { period, department_id } = uploadRosterDto;

    const department = await this.departmentRepository.findOne(department_id);

    const noOfDays = moment(period, 'YYYY-MM').daysInMonth();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const csv = require('csv-parser');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const content = [];

    try {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (row) => {
          const data = {
            staff_id: row['Staff ID'],
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
            const staff = await this.staffRepository.findOne(item.staff_id);
            const checkRoster = await this.rosterRepository.findOne({ staff, department, period });
            if (checkRoster) {
              checkRoster.schedule = item.schedule;
              checkRoster.lastChangedBy = username;
              await checkRoster.save();
            } else {
              const data = {
                staff,
                department,
                period,
                schedule: item.schedule,
                createdBy: username,
              };
              await this.rosterRepository.save(data);
            }
          }
        });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }
}
