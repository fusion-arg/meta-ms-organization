import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Influencer } from './influencer.entity';

@Entity()
export class Influence extends BaseEntity {
  @Column({ name: 'type' })
  type: string;

  @ManyToOne(() => Influencer, (influencer) => influencer.influences)
  influencer: Influencer;
}
