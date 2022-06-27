import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRepository } from './repositories/attendance.repository';
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { Attendance } from './entities/attendance.entity';
import { Brackets } from 'typeorm';
import { DeviceRepository } from './repositories/device.repositories';
import { AttendanceStaffRepository } from './repositories/attendance-staff.repository';
import { AttendanceDepartmentRepository } from './repositories/attendance-department.repository';
import { DeviceUserDto } from './dto/user.dto';
import { DeviceDto } from './dto/device.dto';
import { AttendanceDepartmentDto } from './dto/attendance-department.dto';
import { AttendanceStaff } from './entities/attendance-staff.entity';
config();
const port = process.env.BIO_PORT;
const ip = process.env.BIO_IP;
let zkInstance = new ZKLib(ip, parseInt(port), 5200, 5000);

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRepository)
    private attendanceRepository: AttendanceRepository,
    @InjectRepository(DeviceRepository)
    private deviceRepository: DeviceRepository,
    @InjectRepository(AttendanceStaffRepository)
    private staffRepository: AttendanceStaffRepository,
    @InjectRepository(AttendanceDepartmentRepository)
    private departmentRepository: AttendanceDepartmentRepository,
  ) { }

  // this will filter attendance already on emr either by date or staff or (staff & date);
  async emrFilter(params) {
    try {
      const { date, page, limit, term } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const query = this.attendanceRepository
        .createQueryBuilder('q')
        .leftJoinAndSelect('q.staff', 'staff')
        .leftJoinAndSelect('staff.department', 'department');

      //separate digits from alphabets
      let nums;
      let chars;
      if (term && term !== '') {
        nums = term.match(/(\d+)/g);
        chars = term.replace(/[^a-z]+/gi, '');
      }

      if (date) {
        query.andWhere(`Date(q.date) = :date`, { date });
      }

      if (nums) {
        const digits = parseInt(nums[0]);
        query.andWhere('staff.staffNum = :staffNum', { staffNum: digits });
      }

      if (chars && chars !== '') {
        console.log(chars);
        query.andWhere(
          new Brackets((qb) => {
            qb.where('staff.name iLike :name', { name: `%${chars}%` })
              .orWhere('department.name iLike :name', { name: `%${chars}%` });
          }),
        );
      }

      query.orderBy('q.updated_at', 'DESC').take(limit).skip(offset);

      const total = await query.getCount();

      const attendance = await query.getMany();

      if (!attendance) return { success: false, message: 'record not found' };

      return {
        success: true,
        result: attendance,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: parseInt(params.page),
      };
    } catch (error) {
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // this will get attendance from biometric device local database and save on emr database;
  // NOTE: if there are not logs, it throws error and crashes the server;
  async saveAttendance(params, res) {
    try {

      const { device_id } = params;

      const device = await this.deviceRepository.findOne(device_id);
      if (!device) return { success: false, message: "device not found" };

      const zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();

      // Get general info like logCapacity, user counts, logs count
      // It's really useful to check the status of device

      console.log(await zkInstance.getInfo());
      await zkInstance
        .getAttendances()
        .then(async (logs) => {
          if (!logs) {
            console.log({
              success: false,
              message: 'no data in logs or bio-devive not connected to network',
            });
            return;
          }
          const attendanceArr = await logs.data;

          let dataArr = [];
          for (const item of await attendanceArr) {
            dataArr = [
              {
                staff_id: item.deviceUserId,
                ip: item.ip,
                date: item.recordTime,
                userDeviceId: item.userSn,
              },
              ...dataArr,
            ];
          }
          const rs = await this.attendanceRepository
            .createQueryBuilder()
            .insert()
            .into(Attendance)
            .values(dataArr)
            .execute();

          zkInstance.clearAttendanceLog();

          await zkInstance.disconnect();

          return res.status(200).send({
            success: true,
            message: "attendance saved",
            result: rs
          });
        })
        .catch(async (error) => {
          console.log('error', error);
          await zkInstance.disconnect();
          return res.status(400).send({
            success: false,
            message: "failed"
          });
        });
    } catch (error) {
      console.log({ success: false, error });
      return res.status(400).send({
        success: false,
        message: error.message || "an error occured"
      });
    }
  };

  // this will add users to biometric device database;
  // "uid" and "userId" on device must be unique for this to work;
  async createUser(data) {
    try {

      const device = await this.deviceRepository.findOne(data.deviceId);
      if (!device) return { success: false, message: "device not found" };


      let zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();
      console.log(await zkInstance.getInfo());

      if (!data.name || !data.staffId || !data.departmentId || !data.deviceId) {
        await zkInstance.disconnect();
        return { success: false, message: 'please provide all parameters' };
      };

      const department = await this.departmentRepository.findOne(data.departmentId);
      if (!department) return { success: false, message: "department not found" };

      let staff = await this.staffRepository.findOne({
        where: {
          staffNum: data.staffId
        }
      });
      if (!staff) {
        staff = this.staffRepository.create({
          staffNum: data.staffId,
          name: data.name,
          device,
          department
        });
      };

      const user = await zkInstance.setUser(data.staffId, `${data.staffId}`, data.name, '123456', 0, 0);
      await zkInstance.disconnect();

      await this.staffRepository.save(staff);

      return { success: true, message: 'user creation success', user };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // this will fetch users from a biometric device local database;
  async getAllLiveUsers(params) {
    try {
      const { device_id } = params;
      const device = await this.deviceRepository.findOne(device_id);
      if (!device) return { success: false, message: "device not found" };


      let zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();
      console.log(await zkInstance.getInfo());

      const users = await zkInstance.getUsers();
      if (!users) {
        await zkInstance.disconnect();
        return { success: false, message: 'could not get users' };
      }
      await zkInstance.disconnect();
      return { success: true, message: 'user creation success', users: users.data };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // this will fetch users from emr database;
  async getAllUsers(params) {
    try {
      const { page, limit } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);

      const query = this.staffRepository.createQueryBuilder('q')
        .leftJoinAndSelect('q.department', 'department')
        .leftJoinAndSelect('q.device', 'device');


      query.orderBy('q.updated_at', 'DESC').take(limit).skip(offset);

      const total = await query.getCount();

      const users = await query.getMany();

      if (!users) return { success: false, message: 'record not found' };

      return {
        success: true,
        result: users,
        lastPage: Math.ceil(total / limit),
        itemsPerPage: limit,
        totalItems: total,
        currentPage: parseInt(params.page),
      };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // this gets logs directly from the biometrics device;
  // NOTE: if there are not logs, it throws error and crashes the server;
  async getLiveLogs(params) {
    try {
      const { device_id } = params;
      const device = await this.deviceRepository.findOne(device_id);
      if (!device) return { success: false, message: "device not found" };

      let zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();
      console.log(await zkInstance.getInfo());

      const logs = await zkInstance.getAttendances(function (data, err) {
        if (err) throw err;
      });
      if (logs) {
        await zkInstance.disconnect();
        return { success: true, logs };
      }
      await zkInstance.disconnect();
      return { success: false, message: 'no logs found' };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  async addDevice(data: DeviceDto) {
    try {
      const result = this.deviceRepository.create(data);
      await this.deviceRepository.save(result);
      return {
        success: true,
        result
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  };

  async addDepartment(data: AttendanceDepartmentDto) {
    try {
      const result = this.departmentRepository.create(data);
      await this.departmentRepository.save(result);
      return {
        success: true,
        result
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  };

  async getDevice(params) {
    try {
      const { device_id } = params;

      let result;
      if (device_id) {
        result = await this.deviceRepository.findOne(device_id);
      } else {
        result = await this.deviceRepository.find();
      };

      return { success: true, result };

    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  };

  async bulkCreateUsers(data) {
    try {

      const device = await this.deviceRepository.findOne(data.deviceId);
      if (!device) return { success: false, message: "device not found" };


      let zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();
      console.log(await zkInstance.getInfo());

      const department = await this.departmentRepository.findOne(data.departmentId);
      if (!department) return { success: false, message: "department not found" };

      let staffArr = [];

      for (const item of data.data) {

        staffArr.push({
          staffNum: item.staffId,
          name: item.name,
          device,
          department
        });

        await zkInstance.setUser(item.staffId, `${item.staffId}`, item.name, '123456', 0, 0);

      };

      await zkInstance.disconnect();

      await this.attendanceRepository
        .createQueryBuilder()
        .insert()
        .into(AttendanceStaff)
        .values(staffArr)
        .execute();

      return { success: true, message: 'user creation success', users: staffArr };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };
}
