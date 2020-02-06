import { Module } from '@nestjs/common';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { ServicesModule } from './services/services.module';
import { RoomsModule } from './room/room.module';
import { LabModule } from './lab/lab.module';
import { DepartmentModule } from './departments/department.module';
import { LeaveCategoryModule } from './leave-category/leave-category.module';

@Module({
    imports: [
        RolesPermissionsModule,
        ServicesModule,
        RoomsModule,
        LabModule,
        DepartmentModule,
        LeaveCategoryModule,
    ],
})
export class SettingsModule {}
