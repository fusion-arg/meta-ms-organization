import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { Stakeholder } from './stakeholder.entity';
import { BaseEntity } from '../../../entities/base.entity';

@Entity()
export class StakeholderUser extends BaseEntity {
  @OneToOne(() => Stakeholder)
  @JoinColumn({ name: 'stakeholder' })
  stakeholder: Stakeholder;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'is_user', type: 'boolean', default: false })
  isUser: boolean;
}
