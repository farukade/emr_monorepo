import { Body, Controller, Get, Param, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Get('')
    getUsers(): Promise<User[]> {
        return this.authService.getUsers();
    }

    @Get(':username')
    getUser(@Param('username') username: string): Promise<User> {
        return this.authService.getUser(username);
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    loginUser(@Body() loginUserDto: LoginUserDto) {
        return this.authService.loginUser(loginUserDto);
    }

    @Post(':id/change-password')
    @UsePipes(ValidationPipe)
    changePassword(
        @Param('id') id: number,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        return this.authService.changePassword(id, changePasswordDto);
    }

    @Post(':id/reset-password')
    @UsePipes(ValidationPipe)
    resetPassword(
        @Param('id') id: number,
    ) {
        return this.authService.resetPassword(id);
    }

    @Post('logout')
    @UsePipes(ValidationPipe)
    logoutUser(
        @Request() req,
    ) {
        return this.authService.logoutUser(req.user.username);
    }
}
