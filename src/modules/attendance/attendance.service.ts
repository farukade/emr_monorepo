import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AttendanceRepository } from "./attendance.repository";
import * as ZKLib from 'zklib-js';
import { config } from 'dotenv';
import { Attendance } from "./entities/attendance.entity";
import { AttendanceDto } from "./dto/attendance.dto";
import { DeviceUserDto } from "./dto/user.dto";
config();
const port = process.env.BIO_PORT;
const ip = process.env.BIO_IP;
let zkInstance = new ZKLib(ip, parseInt(port), 5200, 5000);

@Injectable()
export class AttendanceService {
    constructor(
        @InjectRepository(AttendanceRepository)
        private attendanceRepository: AttendanceRepository
    ) { };

    // this will filter attendance already on emr either by date or staff or (staff & date);
    async emrFilter(params) {
        try {
            const { date, page, limit, staff_id } = params;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const query = this.attendanceRepository
                .createQueryBuilder('q');

            if (date && !staff_id) {
                query.where(`Date(q.date) = :date`, { date });
            } else if (staff_id && !date) {
                query.where('q.staff_id = :staff_id', { staff_id });
            };

            if (date && staff_id) {
                query.where(`Date(q.date) = :date`, { date })
                    .andWhere('q.staff_id = :staff_id', { staff_id });
            };

            query.orderBy('q.updated_at', 'DESC')
                .take(limit)
                .skip(offset)


            const total = await query.getCount();

            const attendance = await query.getMany();

            if (!attendance) return { success: false, message: "record not found" };

            return {
                success: true,
                result: attendance,
                lastPage: Math.ceil(total / limit),
                itemsPerPage: limit,
                totalItems: total,
                currentPage: parseInt(params.page)
            };

        } catch (error) {
            return { success: false, message: error.message || "an error occured" };
        }
    };

    // this will get attendance from biometric device local database and save on emr database;
    // NOTE: if there are not logs, it throws error and crashes the server;
    async saveAttendance() {
        try {
            // Create socket to machine
            await zkInstance.createSocket();

            // Get general info like logCapacity, user counts, logs count
            // It's really useful to check the status of device

            console.log(await zkInstance.getInfo())
            await zkInstance.getAttendances()
                .then(async (logs) => {
                    if (logs === "error") {
                        console.log({
                            success: false,
                            message: "no data in logs or bio-devive not connected to network"
                        });
                        return;
                    };
                    const attendanceArr = await logs.data;
                    console.log(await logs.data);
                    let dataArr = [];
                    for (const item of await attendanceArr) {
                        dataArr = [{
                            staff_id: item.deviceUserId,
                            ip: item.ip,
                            date: item.recordTime,
                            userDeviceId: item.userSn
                        }, ...dataArr];
                    };
                    const rs = await this.attendanceRepository
                        .createQueryBuilder()
                        .insert()
                        .into(Attendance)
                        .values(dataArr)
                        .execute();

                    zkInstance.clearAttendanceLog();
                    console.log({
                        success: true,
                        message: "attendance saved to database",
                        rs
                    });
                    await zkInstance.disconnect();
                    return;
                })
                .catch(async error => {
                    console.log('error', error);
                    await zkInstance.disconnect();
                    return;
                });
        } catch (error) {
            console.log({ success: false, error });
            return;
        }
    };

    // this will add users to biometric device database;
    // "uid" and "userId" on device must be unique for this to work;
    async createUser(data: DeviceUserDto) {
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            console.log(await zkInstance.getInfo());
            if (!data.deviceId || !data.name || !data.password || !data.staffId) {
                await zkInstance.disconnect();
                return { success: false, message: "please provide all parameters" };
            }

            const user = await zkInstance.setUser(data.deviceId, data.staffId, data.name, data.password, 0, 0);
            await zkInstance.disconnect();
            return { success: true, message: "user creation success", user };

        } catch (error) {
            console.log({ success: false, error });
            await zkInstance.disconnect()
            return { success: false, message: error.message || "an error occured" };
        }
    };

    // this will fetch users from biometric device local database;
    async getAllUsers() {
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            console.log(await zkInstance.getInfo());

            const users = await zkInstance.getUsers();
            if (!users) {
                await zkInstance.disconnect();
                return { success: false, message: "could not get users" };
            };
            await zkInstance.disconnect();
            return { success: true, message: "user creation success", users: users.data };
        } catch (error) {
            console.log({ success: false, error });
            await zkInstance.disconnect();
            return { success: false, message: error.message || "an error occured" };
        }
    };

    // this gets logs directly from the biometrics device;
    // NOTE: if there are not logs, it throws error and crashes the server;
    async getLiveLogs() {
        try {
            // Create socket to machine
            await zkInstance.createSocket();
            console.log(await zkInstance.getInfo());

            const logs = await zkInstance.getAttendances(function (data, err) {
                if (err) throw err;
            });
            if (logs) {
                await zkInstance.disconnect();
                return { success: false, logs };
            };
            await zkInstance.disconnect();
            return { success: false, message: "no logs found" };
        } catch (error) {
            console.log({ success: false, error });
            await zkInstance.disconnect();
            return { success: false, message: error.message || "an error occured" };
        }
    }
}