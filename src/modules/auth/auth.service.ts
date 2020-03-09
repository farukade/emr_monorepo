import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { JWTHelper } from '../../common/utils/JWTHelper';
import { StaffDetails } from '../hr/staff/entities/staff_details.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from '../hr/entities/user.entity';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  private saltRounds = 10;

  constructor(
    @InjectRepository(AuthRepository)
    private readonly authRepository: AuthRepository,
  ) {}

  async getUsers(): Promise<User[]> {
    return await this.authRepository.find();
  }

  async getUser(user_id: string): Promise<User> {
    return await this.authRepository.findOne(user_id);
  }

  async getUserByUsername(username: string): Promise<User> {
    return await this.authRepository.findOne({ username });
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.getUserByUsername(loginUserDto.username);

    if (user) {
      if (this.compareHash(loginUserDto.password, user.password)) {
        user.lastLogin = new Date().toString();
        await user.save();
        const { expires_in, token } = await JWTHelper.createToken(
          user.username,
        );
        const newUser = JSON.parse(JSON.stringify(user));
        newUser.token = token;
        newUser.expires_in = expires_in;
        delete newUser.password;
        return newUser;
      }
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
}
