import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../entities/base.entity';
import { Department } from '../../department/entities/department.entity';
import { Stakeholder } from './stakeholder.entity';
import { Position } from '../../position/entities/position.entity';

@Entity()
export class StakeholderDepartmentPosition extends BaseEntity {
  @ManyToOne(() => Stakeholder)
  @JoinColumn({ name: 'stakeholder_id' })
  stakeholder: Stakeholder;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Position)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @Column({ name: 'project_id', nullable: false })
  projectId: string;
}
