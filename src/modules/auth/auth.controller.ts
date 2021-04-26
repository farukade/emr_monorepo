import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Param,
    Post,
    Request,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { User } from '../hr/entities/user.entity';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Get()
    getUsers(): Promise<User[]> {
        return this.authService.getUsers();
    }

    @Get('/:userName')
    getUser(@Param('userName') userName: string): Promise<User> {
        return this.authService.getUser(userName);
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginUser(loginUserDto);
    }

    @Post('logout')
    @UsePipes(ValidationPipe)
    logoutUser(
        @Request() req,
    ) {
        return this.authService.logoutUser(req.user.username);
    }
}
