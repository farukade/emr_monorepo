import {
    Controller,
    Post,
    Body,
    Patch,
    Param,
    Get,
    Delete,
    UsePipes,
    ValidationPipe,
    Query,
    Request,
    UseInterceptors, UploadedFile, UseGuards,
} from '@nestjs/common';
import { StaffDto } from './dto/staff.dto';
import { StaffDetails } from './entities/staff_details.entity';
import { StaffService } from './staff.service';
import {FileInterceptor} from '@nestjs/platform-express';
import { extname, join } from 'path';
import { diskStorage } from 'multer';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('hr/staffs')
export class StaffController {
    constructor( private staffService: StaffService) {}

    @Get()
    listStaffs() {
        return this.staffService.getStaffs();
    }

    @Get('all-staffs')
    listAllStaffs() {
        return this.staffService.getAllStaffs();
    }

    @Get('find')
    findStaffDetails(
        @Query() param,
    ): Promise<StaffDetails[]> {
        return this.staffService.findStaffs(param);
    }

    @Patch('enable')
    enableStaff(
        @Request() req,
    ) {
        return this.staffService.enableStaff(req.query.id);
    }

    @Post()
    @UsePipes(ValidationPipe)
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    createNewStaff(
        @Request() req,
        @Body() staffDto: StaffDto,
        @UploadedFile() pic,
    ): Promise<StaffDetails> {
        return this.staffService.addNewStaff(staffDto, pic, req.user.username);
    }

    @Patch(':id/update')
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads/avatars',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    updateStaffDetails(
        @Param('id') id: string,
        @Body() staffDto: StaffDto,
        @UploadedFile() pic,
    ): Promise <any> {
        return this.staffService.updateStaffDetails(id, staffDto, pic);
    }

    @Post('set-consulting-room')
    setConsultingRoom(
        @Body() param,
    ) {
        return this.staffService.setConsultingRoom(param);
    }

    @Get('unset-room/:staffId')
    unSetConsultingRoom(
        @Param('staffId') staffId: string,
    ) {
        return this.staffService.unSetConsultingRoom(staffId);
    }

    @Delete(':id')
    deleteStaff(
        @Param('id') id: number,
    ) {
        return this.staffService.deleteStaff(id);
    }
}
