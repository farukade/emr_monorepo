import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRepository } from './repositories/attendance.repository';
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { Attendance } from './entities/attendance.entity';
import { Brackets, ILike } from 'typeorm';
import { DeviceRepository } from './repositories/device.repositories';
import { DeviceDto } from './dto/device.dto';
import { StaffRepository } from '../staff/staff.repository';
import { DeviceIps } from './entities/device.entity';
import { getNewUserData, updateBioDeviceUser } from 'src/common/utils/utils';
import { BioUserRepository } from './repositories/device-user.repository';
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
    private staffRepository: StaffRepository,
    @InjectRepository(BioUserRepository)
    private userRepository: BioUserRepository
  ) { }

  // this will filter attendance already on emr either by date or staff or (staff & date);
  async emrFilter(params) {
    try {
      const { date, page, limit, term } = params;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const query = this.attendanceRepository
        .createQueryBuilder('q')
        .leftJoinAndSelect('q.user', 'staff')
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

      query.orderBy('q.date', 'DESC').take(limit).skip(offset);

      const total = await query.getCount();

      const attendance = await query.getMany();

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

          let user = await this.userRepository.findOne(item.deviceUserId);

          dataArr = [
            {
              user,
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
  async createUser(data) {
    try {

      let zkInstance;
      const { user_id, first_name, last_name, clinical } = data;

      const id = clinical ? +`9${user_id}` : +`1${user_id}`;
      const device = clinical ?
        await this.deviceRepository.find({ where: { name: ILike('clinical') } }) :
        await this.deviceRepository.find({ where: { name: ILike('non_clinical') } });

      zkInstance = new ZKLib(device[0].ip, parseInt(port), 5200, 5000);

      // Create socket to machine
      await zkInstance.createSocket();
      console.log(await zkInstance.getInfo());

      await zkInstance.setUser(user_id, `${user_id}`, `${first_name} ${last_name}`, '123456', 0, 0);

      let staff = await this.userRepository.findOne(id);
      if (staff) return { success: false, message: "user exists" };
      staff = this.userRepository.create({
        id,
        first_name,
        last_name,
        device: device[0]
      });

      await zkInstance.disconnect();

      return {
        success: true,
        message: first_name + " " + last_name + ' was added successfully'
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
        if (err) {
          log(err);
          return;
        }
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

  async syncUsers() {
    try {
      let ips = ["192.168.1.209", "192.168.1.201"];

      const clinical_device = await this.deviceRepository.find({
        where: { ip: ips[0] }
      });

      const non_clinical_device = await this.deviceRepository.find({
        where: { ip: ips[1] }
      });

      let clinical;
      let non_clinical;
      let zkInstance;

      for (let i = 0; i < ips.length; i++) {

        zkInstance = new ZKLib(ips[i], parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        let users = await zkInstance.getUsers();

        if (i == 0) {
          clinical = await users.data;
        }
        if (i == 1) {
          non_clinical = await users.data;
        }
      };

      let formattedClinic = getNewUserData(await clinical, clinical_device[0]);
      let formattedNonClinic = getNewUserData(await non_clinical, non_clinical_device[0]);


      for (const item of formattedClinic) {
        let user = await this.userRepository.findOne(item.id);
        if (!user) {
          let newUser = this.userRepository.create(item);
          await this.userRepository.save(newUser);
        }
      };

      for (const item of formattedNonClinic) {
        let user = await this.userRepository.findOne(item.id);
        if (!user) {
          let newUser = this.userRepository.create(item);
          await this.userRepository.save(newUser);
        }
      }

      return {
        success: true,
        formattedClinic,
        formattedNonClinic
      }


    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" };
    }
  };

  async updateLogs() {
    try {
      let logs = await this.attendanceRepository.find({
        relations: ['staff']
      });

      const newLogs = updateBioDeviceUser(logs);

      for (const log of newLogs) {
        if (log?.user_id) {
          let user = await this.userRepository.findOne(log?.user_id);
          await this.attendanceRepository.update({ id: log.id }, { user });
        }
      }
      return { success: true };
    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" };
    }
  }

  async updateUser(id, data) {
    try {
      const response = await this.userRepository.update({ id }, { ...data });
      if (response.affected) {
        const result = await this.userRepository.findOne({ id });

        return {
          success: true,
          result
        };
      }
    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" };
    }
  }
}
