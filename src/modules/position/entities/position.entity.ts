import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { StakeholderDepartmentPosition } from '../../stakeholder/entities/stakeholder-department-position.entity';

@Entity()
export class Position extends BaseEntity {
  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'external_id', nullable: false })
  externalId: number;

  @OneToMany(
    () => StakeholderDepartmentPosition,
    (stakeholderDepartmentPosition) => stakeholderDepartmentPosition.position,
  )
  stakeholderDepartmentPositions: StakeholderDepartmentPosition[];
}
