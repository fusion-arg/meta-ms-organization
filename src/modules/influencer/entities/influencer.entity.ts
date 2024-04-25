import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Influence } from './influence.entity';
import { Stakeholder } from '../../stakeholder/entities/stakeholder.entity';

@Entity()
export class Influencer extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Stakeholder, (stakeholder) => stakeholder.id)
  @JoinColumn({ name: 'stakeholder_id' })
  stakeholder: Stakeholder;

  @Column({ name: 'is_excluded' })
  isExcluded: boolean;

  @Column({ name: 'selected_future_process' })
  selectedFutureProcess: string;

  @OneToMany(() => Influence, (influence) => influence.influencer)
  influences: Influence[];
}
