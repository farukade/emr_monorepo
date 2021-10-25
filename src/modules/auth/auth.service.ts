import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from '../../common/utils/JWTHelper';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from './entities/user.entity';
import { AuthRepository } from './auth.repository';
import { StaffRepository } from '../hr/staff/staff.repository';
import * as moment from 'moment';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
    private saltRounds = 10;

    constructor(
        @InjectRepository(AuthRepository)
        private readonly authRepository: AuthRepository,
        @InjectRepository(StaffRepository)
        private readonly staffRepository: StaffRepository,
    ) {
    }

    async getUsers(): Promise<User[]> {
        return await this.authRepository.find();
    }

    async getUser(username: string): Promise<User> {
        const user = await this.getUserByUsername(username);

        const staff = await this.staffRepository.findOne({ where: { user }, relations: ['department', 'room', 'specialization'] });
        const newUser = JSON.parse(JSON.stringify(user));
        newUser.details = staff;
        newUser.permissions = await this.setPermissions(newUser.role.permissions);
        delete newUser.role.permissions;
        delete newUser.password;
        return newUser;
    }

    async getUserByUsername(username: string): Promise<User> {
        return await this.authRepository.findOne({ where: { username }, relations: ['role', 'role.permissions'] });
    }

    async loginUser(loginUserDto: LoginUserDto) {
        console.log(loginUserDto);
        const user = await this.getUserByUsername(loginUserDto.username);

        if (user) {
            const isSame = await this.compareHash(loginUserDto.password, user.password);
            if (isSame) {

                if (loginUserDto.bypass === 1) {
                    // logout previous user
                } else {
                    const rs = await this.authRepository.findOne({ where: { isLoggedIn: true } });
                    if (rs) {
                        // return { error: 'already logged in' };
                    }
                }

                user.lastLogin = moment().format('YYYY-MM-DD HH:mm:ss');
                user.isLoggedIn = true;
                user.macAddress = loginUserDto.address;
                await user.save();
                const { expires_in, token } = await JWTHelper.createToken(
                    { username: user.username, userId: user.id },
                );
                const staff = await this.staffRepository.findOne({ where: { user }, relations: ['department', 'room', 'specialization'] });
                if (staff && !staff.isActive) {
                    // tslint:disable-next-line:no-shadowed-variable
                    const error = 'This account is disabled. Please Contact ICT.';
                    throw new BadRequestException(error);
                }

                const newUser = JSON.parse(JSON.stringify(user));
                newUser.token = token;
                newUser.expires_in = expires_in;
                newUser.details = staff;
                newUser.permissions = await this.setPermissions(newUser.role.permissions);
                delete newUser.role.permissions;
                delete newUser.password;
                return newUser;
            }
        }
        const error = 'Invalid Username or password';
        throw new BadRequestException(error);
    }

    async changePassword(id: number, changePswdDto: ChangePasswordDto) {
        const user = await this.authRepository.findOne(id, { relations: ['role', 'role.permissions'] });

        if (changePswdDto.repassword !== changePswdDto.password) {
            const pswdError = 'Passwords are not the same';
            throw new BadRequestException(pswdError);
        }

        if (user) {
            user.password = await this.getHash(changePswdDto.repassword);
            user.passwordChanged = true;
            user.macAddress = changePswdDto.address;
            await user.save();

            const { expires_in, token } = await JWTHelper.createToken(
                { username: user.username, userId: user.id },
            );
            const staff = await this.staffRepository.findOne({ where: { user }, relations: ['department', 'room', 'specialization'] });
            if (staff && !staff.isActive) {
                // tslint:disable-next-line:no-shadowed-variable
                const error = 'This account is disabled. Please Contact ICT.';
                throw new BadRequestException(error);
            }

            const newUser = JSON.parse(JSON.stringify(user));
            newUser.token = token;
            newUser.expires_in = expires_in;
            newUser.details = staff;
            newUser.permissions = await this.setPermissions(newUser.role.permissions);
            delete newUser.role.permissions;
            delete newUser.password;
            return newUser;
        }

        const error = 'User not found!';
        throw new BadRequestException(error);
    }

    async resetPassword(id: number) {
        const user = await this.authRepository.findOne(id, { relations: ['role', 'role.permissions'] });

        if (user) {
            user.password = await this.getHash('password');
            await user.save();

            return JSON.parse(JSON.stringify(user));
        }

        const error = 'User not found!';
        throw new BadRequestException(error);
    }

    async logoutUser(username: string) {
        const user = await this.getUserByUsername(username);

        if (user) {
            user.isLoggedIn = false;
            await user.save();
            return user;
        }
        const error = 'Invalid Username or password';
        throw new BadRequestException(error);
    }

    async getHash(password: string | undefined): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compareHash(
        password: string | undefined,
        hash: string | undefined,
    ): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    async validateUser(signedUser): Promise<boolean> {
        if (signedUser && signedUser.username) {
            return Boolean(this.getUserByUsername(signedUser.username));
        }

        return false;
    }

    async setPermissions(permissions) {
        const data = [];
        for (const permission of permissions) {
            await data.push(permission.name);
        }
        return data;
    }
}
