import { Module } from '@nestjs/common';
import { RolesPermissionsModule } from './roles-permissions/roles-permissions.module';
import { ConsultingRoomModule } from './consulting-room/consulting-room.module';
import { ServicesModule } from './services/services.module';
import { RoomsModule } from './room/room.module';
import { LabModule } from './lab/lab.module';
import { DepartmentModule } from './departments/department.module';
import { LeaveCategoryModule } from './leave-category/leave-category.module';
import { SpecializationModule } from './specialization/specialization.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { ConsumableModule } from './consumable/consumable.module';
import { AntenatalPackageModule } from './antenatal-packages/antenatal-package.module';

@Module({
    imports: [
        ConsultingRoomModule,
        RolesPermissionsModule,
        ServicesModule,
        RoomsModule,
        LabModule,
        DepartmentModule,
        LeaveCategoryModule,
        SpecializationModule,
        DiagnosisModule,
        ConsumableModule,
        AntenatalPackageModule,
    ],
})
export class SettingsModule {}
