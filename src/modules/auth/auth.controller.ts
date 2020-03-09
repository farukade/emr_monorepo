import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { User } from '../hr/entities/user.entity';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getUsers(): Promise<User[]> {
    return this.authService.getUsers();
  }

    @Get('/:userName')
    getUser(@Param('userName') userName: string): Promise<User> {
        return this.authService.getUserByUsername(userName);
    }

  @Put()
  @UsePipes(ValidationPipe)
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }
}
