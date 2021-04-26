import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from '../../common/utils/JWTHelper';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../hr/entities/user.entity';
import { AuthRepository } from './auth.repository';
import { StaffRepository } from '../hr/staff/staff.repository';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
    @InjectRepository(StaffRepository)
    private readonly staffRepository: StaffRepository,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.authRepository.find();
  }

  async getUser(username: string): Promise<User> {
    const user = await this.getUserByUsername(username);

    const staff = await this.staffRepository.findOne({where: {user}, relations: ['department', 'room']});
    const newUser = JSON.parse(JSON.stringify(user));
    newUser.details = staff;
    newUser.permissions = await this.setPermissions(newUser.role.permissions);
    delete newUser.role.permissions;
    delete newUser.password;
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.authRepository.findOne({ where: {username}, relations: ['role', 'role.permissions',]});
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.getUserByUsername(loginUserDto.username);

    if (user) {
      const isSame = await this.compareHash(loginUserDto.password, user.password);
      if (isSame) {
        user.lastLogin = new Date().toString();
        await user.save();
        const { expires_in, token } = await JWTHelper.createToken(
          {username: user.username, userId: user.id},
        );
        const staff = await this.staffRepository.findOne({where: {user}, relations: ['department', 'room']});
        if (staff && !staff.isActive) {
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

  async logoutUser(username: string) {
    const user = await this.getUserByUsername(username);

    if (user) {
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

  generateVeridicationCode() {
    const min = 10000;
    const max = 910000;
    const code = Math.round(Math.random() * (max - min) + min);
    return code.toString();
  }

  static validateToken() {}

  async setPermissions(permissions) {
    const data = [];
    for (const permission of permissions) {
      await data.push(permission.name);
    }
    return data;
  }
}
