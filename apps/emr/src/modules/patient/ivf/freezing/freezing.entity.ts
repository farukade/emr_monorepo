import { CustomBaseEntity } from 'apps/emr/src/common/entities/custom-base.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { OocyteEntity } from './entities/oocyte.entity';
import { SpermEntity } from './entities/sperm.entity';

@Entity({ name: 'emb_freezing' })
export class EmbFreezingEntity extends CustomBaseEntity {
  @OneToOne(() => SpermEntity)
  @JoinColumn({ name: 'sperm_entity' })
  sperm: SpermEntity;

  @OneToOne(() => OocyteEntity)
  @JoinColumn({ name: 'oocyte_entity' })
  oocyte: OocyteEntity;
}
