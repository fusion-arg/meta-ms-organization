import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Stakeholder } from '../../stakeholder/entities/stakeholder.entity';

@Entity()
export class ProjectRole extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Stakeholder, (stakeholder) => stakeholder.projectRole)
  stakeholders: Stakeholder[];
}
