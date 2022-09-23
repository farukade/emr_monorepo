import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRepository } from './repositories/attendance.repository';
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { Attendance } from './entities/attendance.entity';
import { Brackets } from 'typeorm';
import { DeviceRepository } from './repositories/device.repositories';
import { DeviceDto } from './dto/device.dto';
import { StaffRepository } from '../staff/staff.repository';
import { DeviceIps } from './entities/device.entity';
config();
const port = process.env.BIO_PORT;
const ip = process.env.BIO_IP;
let zkInstance = new ZKLib(ip, parseInt(port), 5200, 5000);
const { log } = console;


@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRepository)
    private attendanceRepository: AttendanceRepository,
    @InjectRepository(DeviceRepository)
    private deviceRepository: DeviceRepository,
    @InjectRepository(StaffRepository)
    private staffRepository: StaffRepository
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
        query.andWhere('staff.id = :id', { id: digits });
      }

      if (chars && chars !== '') {
        console.log(chars);
        query.andWhere(
          new Brackets((qb) => {
            qb.where('staff.first_name iLike :first_name', { first_name: `%${chars}%` })
              .orWhere('staff.last_name iLike :last_name', { last_name: `%${chars}%` })
              .orWhere('staff.other_names iLike :other_names', { other_names: `%${chars}%` })
              .orWhere('department.name iLike :name', { name: `%${chars}%` });
          }),
        );
      };

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
  async saveAttendance() {
    try {

      let zkInstance;
      let dataArr = [];
      const devices = await this.deviceRepository.find();

      for (const device of devices) {
        let attendanceArr = [];
        zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();

        // Get general info like logCapacity, user counts, logs count
        // It's really useful to check the status of device

        console.log(await zkInstance.getInfo());
        const logs = await zkInstance.getAttendances();

        if (!logs) {
          console.log({
            success: false,
            message: 'no data in logs or bio-devive not connected to network',
          });
          return {
            success: false,
            message: 'no data in logs or bio-devive not connected to network',
          };
        };
        attendanceArr = await logs.data;


        for (const item of attendanceArr) {

          let staff = await this.staffRepository.findOne(item.deviceUserId);

          dataArr = [
            {
              staff,
              ip: item.ip,
              date: item.recordTime,
              device
            },
            ...dataArr,
          ];
        };

        zkInstance.clearAttendanceLog();
        await zkInstance.disconnect();
      };

      const rs = await this.attendanceRepository
        .createQueryBuilder()
        .insert()
        .into(Attendance)
        .values(dataArr)
        .execute();

      return {
        success: true,
        message: "attendance saved",
        result: rs
      };
    } catch (error) {
      console.log({ success: false, error });
      return {
        success: false,
        message: error.message || "an error occured"
      };
    }
  };

  // this will add users to biometric device database;
  // "uid" and "userId" on device must be unique for this to work;
  async createUser(params) {
    try {

      let zkInstance;
      const { staff_id } = params;

      const staff = await this.staffRepository.findOne(staff_id);
      if (!staff) return { success: false, message: "staff not found" };

      const devices = await this.deviceRepository.find();
      if (!devices.length) return { success: false, message: "device not found" };

      for (const device of devices) {

        zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        await zkInstance.setUser(staff.id, `${staff.id}`, `${staff.first_name} ${staff.last_name} ${staff.other_names}`, '123456', 0, 0);

        await zkInstance.disconnect();

        staff.isOnDevice = true;
        await this.staffRepository.save(staff);
      };

      return {
        success: true,
        message: staff.first_name + " " + staff.last_name + ' was added successfully'
      };
    } catch (error) {
      console.log({ success: false, error });
      if (zkInstance) await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // add users
  async addUsers() {
    try {

      let zkInstance;

      const staffs = await this.staffRepository.find();
      const devices = await this.deviceRepository.find();

      for (const device of devices) {
        zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        for (const staff of staffs) {

          // Create socket to machine
          await zkInstance.createSocket();
          console.log(await zkInstance.getInfo());

          await zkInstance.setUser(staff.id, `${staff.id}`, `${staff.first_name} ${staff.last_name} ${staff.other_names}`, '123456', 0, 0);

          staff.isOnDevice = true;
          await this.staffRepository.save(staff);

        };
        await zkInstance.disconnect();
      };

      return { success: true, message: "success" };

    } catch (error) {
      console.log({ success: false, error });
      if (zkInstance) await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  };

  // this will fetch users from a biometric device local database;
  async getAllLiveUsers() {
    try {

      let zkInstance;

      const devices = await this.deviceRepository.find();
      if (!devices) return { success: false, message: "devices not found" };

      let result = [];


      for (const device of devices) {

        zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        const users = await zkInstance.getUsers();
        result = [users, ...result];
        await zkInstance.disconnect();

      };

      if (!result.length) return { success: false, message: "not found" };

      return { success: true, message: 'user creation success', result };

    } catch (error) {
      console.log({ success: false, error });
      if (zkInstance) await zkInstance.disconnect();
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

  async getDevice() {
    try {
      let result = await this.deviceRepository.find();

      if (!result) return { success: false, message: "device(s) not found" }
      return { success: true, result };

    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || "an error occured" };
    }
  };

  async removeDevice(id: number) {
    try {
      let res = await this.deviceRepository
        .createQueryBuilder()
        .delete()
        .from(DeviceIps)
        .where('id = :id', { id })
        .execute();

      if (res.affected) {
        return {
          success: true,
          message: "Device deleted successfully"
        };
      }

      return { success: false, message: "Device could not be deleted" }
    } catch (error) {
      log(error);
      return { success: false, message: error.message || "an error occurred" };
    }
  }
}
