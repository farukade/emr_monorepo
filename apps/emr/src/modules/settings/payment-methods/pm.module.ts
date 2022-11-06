import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethodRepository } from './pm.repository';
import { PaymentMethodController } from './pm.controller';
import { PaymentMethodService } from './pm.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethodRepository])],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService],
})
export class PaymentMethodModule {}
