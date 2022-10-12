import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttendanceRepository } from './repositories/attendance.repository';
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { Attendance } from './entities/attendance.entity';
import { Brackets, ILike } from 'typeorm';
import { DeviceRepository } from './repositories/device.repositories';
import { DeviceDto } from './dto/device.dto';
import { DeviceIps } from './entities/device.entity';
import { getNewUserData, updateBioDeviceUser } from 'src/common/utils/utils';
import { BioUserRepository } from './repositories/device-user.repository';
import { BioDeviceUser } from './entities/bio-device-user.entity';
import * as moment from 'moment';
import { PatientRepository } from 'src/modules/patient/repositories/patient.repository';
import { DepartmentRepository } from 'src/modules/settings/departments/department.repository';
config();
const port = process.env.BIO_PORT;
const ip = process.env.BIO_IP;
const zkInstance = new ZKLib(ip, parseInt(port), 5200, 5000);
const { log } = console;

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRepository)
    private attendanceRepository: AttendanceRepository,
    @InjectRepository(DeviceRepository)
    private deviceRepository: DeviceRepository,
    @InjectRepository(BioUserRepository)
    private userRepository: BioUserRepository,
    @InjectRepository(PatientRepository)
    private patientRepository: PatientRepository,
    @InjectRepository(DepartmentRepository)
    private departmentRepository: DepartmentRepository,
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
      }

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
  }

  // this will get attendance from biometric device local database and save on emr database;
  // NOTE: if there are not logs, it throws error and crashes the server;
  async saveAttendance() {
    try {
      let zkInstance;
      let dataArr = [];
      const devices = await this.deviceRepository.find();

      for (const device of devices) {
        let attendanceArr = [];
        let isClinical = false;
        if (device.name == 'clinical') {
          isClinical = true;
        };

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
          let user: BioDeviceUser;
          if (isClinical) {
            user = await this.userRepository.findOne(+`9${item.deviceUserId}`);
          } else {
            user = await this.userRepository.findOne(+`1${item.deviceUserId}`);
          };

          let date = new Date(item.recordTime);

          dataArr = [
            {
              user,
              ip: item.ip,
              date: moment(date.toLocaleString("en-US", {
                timeZone: "Africa/Lagos",
              })).toDate(),
              device,
              device_id: device?.id,
              user_id: user?.id
            },
            ...dataArr,
          ];
        }

        // zkInstance.clearAttendanceLog();
        await zkInstance.disconnect();
      };

      const rs = await this.attendanceRepository.createQueryBuilder().insert().into(Attendance).values(dataArr).execute();

      return {
        success: true,
        message: 'attendance saved',
        dataArr,
      };
    } catch (error) {
      console.log({ success: false, error });
      return {
        success: false,
        message: error.message || 'an error occured',
      };
    }
  }

  // this will add users to biometric device database;
  // "uid" and "userId" on device must be unique for this to work;
  async createUser(data) {
    try {
      let zkInstance;
      const {
        user_id,
        first_name,
        patient_id,
        last_name,
        clinical,
        isOnDevice,
        department_id
      } = data;

      const id = clinical ? +`9${user_id}` : +`1${user_id}`;
      const device = clinical
        ? await this.deviceRepository.find({ where: { name: ILike('clinical') } })
        : await this.deviceRepository.find({ where: { name: ILike('non_clinical') } });

      if (!isOnDevice) {
        zkInstance = new ZKLib(device[0].ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        await zkInstance.setUser(user_id, `${user_id}`, `${first_name} ${last_name}`, '123456', 0, 0);

        await zkInstance.disconnect();
      }

      let staff = await this.userRepository.findOne(id);
      const patient = await this.patientRepository.findOne(patient_id);
      const department = await this.departmentRepository.findOne(department_id);
      if (staff) return { success: false, message: 'user exists' };

      staff = this.userRepository.create({
        id,
        first_name,
        last_name,
        device: device[0],
        patient,
        department
      });
      await this.userRepository.save(staff);


      return {
        success: true,
        message: first_name + ' ' + last_name + ' was added successfully',
      };
    } catch (error) {
      console.log({ success: false, error });
      if (zkInstance) await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  }

  // add users
  // async addUsers() {
  //   try {

  //     let zkInstance;

  //     const staffs = await this.userRepository.find();
  //     const devices = await this.deviceRepository.find();

  //     for (const device of devices) {
  //       zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

  //       // Create socket to machine
  //       await zkInstance.createSocket();
  //       console.log(await zkInstance.getInfo());

  //       for (const staff of staffs) {

  //         // Create socket to machine
  //         await zkInstance.createSocket();
  //         console.log(await zkInstance.getInfo());

  //         await zkInstance.setUser(staff.id, `${staff.id}`, `${staff.first_name} ${staff.last_name} ${staff.other_names}`, '123456', 0, 0);

  //         staff.isOnDevice = true;
  //         await this.staffRepository.save(staff);

  //       };
  //       await zkInstance.disconnect();
  //     };

  //     return { success: true, message: "success" };

  //   } catch (error) {
  //     console.log({ success: false, error });
  //     if (zkInstance) await zkInstance.disconnect();
  //     return { success: false, message: error.message || 'an error occured' };
  //   }
  // };

  // this will fetch users from a biometric device local database;
  async getAllLiveUsers() {
    try {
      let zkInstance;

      const devices = await this.deviceRepository.find();
      if (!devices) return { success: false, message: 'devices not found' };

      let result = [];

      for (const device of devices) {
        zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        const users = await zkInstance.getUsers();
        result = [users, ...result];
        await zkInstance.disconnect();
      }

      if (!result.length) return { success: false, message: 'not found' };

      return { success: true, message: 'user creation success', result };
    } catch (error) {
      console.log({ success: false, error });
      if (zkInstance) await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  }

  // this gets logs directly from the biometrics device;
  // NOTE: if there are not logs, it throws error and crashes the server;
  async getLiveLogs(params) {
    try {
      const { type } = params;
      const page = params.page && params.page != "" ? +params.page : 1;
      const limit = params.limit && params.limit != "" ? +params.limit : 10;
      const offset = (+page - 1) * limit;
      const stop = offset + limit;

      let where = null;
      if (type && type != "") {
        where = { where: { name: ILike(type) } };
      }
      const devices = await this.deviceRepository.find(where);

      let logs = [];
      for (const device of devices) {

        let zkInstance = new ZKLib(device.ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        let rs = await zkInstance.getAttendances(function (data, err) {
          if (err) {
            log(err);
            return;
          }
        });
        logs = [...logs, ...rs.data];
      };

      if (logs) {
        let result = [];
        for (const log of logs) {
          let date = new Date(log.recordTime);
          result = [...result, {
            date: moment(date.toLocaleString("en-US", {
              timeZone: "Africa/Lagos",
            })).toDate(), ...log
          }];
        };
        result = result.sort((a, b) => b.date - a.date);
        const total = result.length;
        result = result.slice(offset, stop);
        let user;
        for (let item of result) {
          if (type == 'clinical') {
            user = await this.userRepository.findOne(+`9${item?.deviceUserId}`);
            result = [...result, { user: await user, ...item }];
          }
          if (type == 'non-clinical') {
            user = await this.userRepository.findOne(+`1${item?.deviceUserId}`);
            result = [...result, { user: await user, ...item }];
          }
        };

        return {
          success: true,
          lastPage: Math.ceil(total / limit),
          itemsPerPage: limit,
          totalItems: total,
          currentPage: +page,
          result,

        };
      }
      await zkInstance.disconnect();
      return { success: false, message: 'no logs found' };
    } catch (error) {
      console.log({ success: false, error });
      await zkInstance.disconnect();
      return { success: false, message: error.message || 'an error occured' };
    }
  }

  async addDevice(data: DeviceDto) {
    try {
      const result = this.deviceRepository.create(data);
      await this.deviceRepository.save(result);
      return {
        success: true,
        result,
      };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || 'an error occured' };
    }
  }

  async getDevice() {
    try {
      const result = await this.deviceRepository.find();

      if (!result) return { success: false, message: 'device(s) not found' };
      return { success: true, result };
    } catch (error) {
      console.log(error);
      return { success: false, message: error.message || 'an error occured' };
    }
  }

  async removeDevice(id: number) {
    try {
      const res = await this.deviceRepository
        .createQueryBuilder()
        .delete()
        .from(DeviceIps)
        .where('id = :id', { id })
        .execute();

      if (res.affected) {
        return {
          success: true,
          message: 'Device deleted successfully',
        };
      }

      return { success: false, message: 'Device could not be deleted' };
    } catch (error) {
      log(error);
      return { success: false, message: error.message || 'an error occurred' };
    }
  }

  async syncUsers() {
    try {

      const devices = await this.deviceRepository.find();

      const clinical_device = await this.deviceRepository.find({
        where: { name: ILike('clinical') },
      });

      const non_clinical_device = await this.deviceRepository.find({
        where: { ip: ILike('non-clinical') },
      });

      let clinical;
      let non_clinical;
      let zkInstance;

      for (let i = 0; i < devices.length; i++) {
        let isClinical = devices[i].name == 'clinical' ? true : false;
        zkInstance = new ZKLib(devices[i].ip, parseInt(port), 5200, 5000);

        // Create socket to machine
        await zkInstance.createSocket();
        console.log(await zkInstance.getInfo());

        const users = await zkInstance.getUsers();

        if (isClinical) {
          clinical = await users.data;
        } else {
          non_clinical = await users.data;
        }
      };

      let formattedClinic;
      let formattedNonClinic;
      if (await clinical) {
        formattedClinic = getNewUserData(await clinical, clinical_device);

        for (const item of await formattedClinic) {
          const user = await this.userRepository.findOne({
            where: { id: item.id }
          });
          if (!user) {
            const newUser = this.userRepository.create(item);
            await this.userRepository.save(newUser);
          }
        }
      };

      if (await non_clinical) {
        formattedNonClinic = getNewUserData(await non_clinical, non_clinical_device);

        for (const item of await formattedNonClinic) {
          const user = await this.userRepository.findOne({
            where: { id: item.id }
          });
          if (!user) {
            const newUser = this.userRepository.create(item);
            await this.userRepository.save(newUser);
          }
        }
      };

      return {
        success: true,
        formattedClinic,
        formattedNonClinic,
      };
    } catch (error) {
      log(error);
      return { success: false, message: error.message || 'an error occurred' };
    }
  }

  async updateLogs() {
    try {
      const logs = await this.attendanceRepository.find({
        relations: ['staff'],
      });

      const newLogs = updateBioDeviceUser(logs);

      for (const log of newLogs) {
        if (log?.user_id) {
          const user = await this.userRepository.findOne(log?.user_id);
          await this.attendanceRepository.update({ id: log.id }, { user });
        }
      }
      return { success: true };
    } catch (error) {
      log(error);
      return { success: true, message: error.message || 'an error occurred' };
    }
  }

  async updateUser(id, data) {
    try {
      const { patient_id, department_id, ...restData } = data;
      let patient;
      if (patient_id) {
        patient = await this.patientRepository.findOne(data.patient_id);
      }

      let department;
      if (department_id) {
        department = await this.departmentRepository.findOne(department_id);
      };

      let response;
      if (await patient && await department) {
        response = await this.userRepository.update({ id }, { ...restData, patient, department });
      } else if (await patient) {
        response = await this.userRepository.update({ id }, { ...restData, patient });
      } else if (await department) {
        response = await this.userRepository.update({ id }, { ...restData, department });
      } else {
        response = await this.userRepository.update({ id }, { ...data, });
      };

      if (await response.affected) {
        const result = await this.userRepository.findOne({ id });

        return {
          success: true,
          result,
        };
      } else {
        return {
          success: false,
          message: "nothing to update"
        }
      }
    } catch (error) {
      log(error);
      return { success: true, message: error.message || 'an error occurred' };
    }
  }

  async getUsers(params) {
    try {
      const { page, limit } = params;
      const skip = (+page - 1) * +limit;
      const take = +limit;
      const [result, total] = await this.userRepository.findAndCount({
        take,
        skip
      });

      return {
        success: true,
        result,
        lastPage: Math.ceil(total / +limit),
        itemsPerPage: +limit,
        totalItems: total,
        currentPage: +params.page,
      }
    } catch (error) {
      log(error);
      return { success: true, message: error.message || "an error occurred" };
    }
  }
}
