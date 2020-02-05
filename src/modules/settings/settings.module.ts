import { Module } from '@nestjs/common';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { ServicesModule } from './services/services.module';
import { RoomsModule } from './room/room.module';
import { LabModule } from './lab/lab.module';
import { DepartmentModule } from './department/department.module';

@Module({
    imports: [
        RolesPermissionsModule,
        ServicesModule,
        RoomsModule,
        LabModule,
        DepartmentModule,
    ],
})
export class SettingsModule {}
