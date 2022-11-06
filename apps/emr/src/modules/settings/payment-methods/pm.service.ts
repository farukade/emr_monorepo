import { Injectable, NotFoundException, Delete } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { slugify } from '../../../common/utils/utils';
import { PaymentMethodRepository } from './pm.repository';
import { PaymentMethodDto } from './dto/pm.dto';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodService {
  constructor(
    @InjectRepository(PaymentMethodRepository)
    private paymentMethodRepository: PaymentMethodRepository,
  ) {}

  async getMethods(): Promise<any> {
    return this.paymentMethodRepository.find();
  }

  async saveMethod(createDto: PaymentMethodDto, createdBy): Promise<PaymentMethod> {
    try {
      const { name, status } = createDto;

      let method = await this.paymentMethodRepository.findOne({ where: { slug: slugify(name) } });

      if (!method || (method && method.slug !== slugify(name))) {
        method = new PaymentMethod();
        method.name = name;
        method.slug = slugify(name);
        method.status = status;
        method.createdBy = createdBy;

        return await this.paymentMethodRepository.save(method);
      }

      return method;
    } catch (e) {
      console.log(e);
      throw new Error('failed to create payment method');
    }
  }

  async updateMethod(id, updateDto: PaymentMethodDto, updatedBy) {
    try {
      const { name, status } = updateDto;

      const method = await this.paymentMethodRepository.findOne(id);

      method.name = name;
      method.slug = slugify(name);
      method.status = status;
      method.lastChangedBy = updatedBy;
      await method.save();

      return method;
    } catch (e) {
      console.log(e);
      throw new Error('failed to update payment method');
    }
  }

  async deleteMethod(id: number, username) {
    const method = await this.paymentMethodRepository.findOne(id);

    if (!method) {
      throw new NotFoundException(`Payment Method with ID '${id}' not found`);
    }

    method.deletedBy = username;
    await method.save();

    return method.softRemove();
  }
}
